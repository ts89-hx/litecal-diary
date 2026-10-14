const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const {
    User,
    UserPlan,
    DietRecord,
    SportRecord,
    WeightRecord,
    DietSelection,
    SportSelection,
} = require('../models');
const { successResponse, errorResponse } = require('../utils/response');
const {
    buildPlan,
    calculateBmr,
    ACTIVITY_FACTORS,
    calculateExerciseCalories,
    calculateDailySummary,
    estimateRemainingDays,
} = require('../services/calorieService');
const { recognizeFood } = require('../services/recognition');
const { attachCatalogNutrition } = require('../services/recognition/catalogNutrition');
const { resolveDietPortion } = require('../services/dietPortionService');
const { filterFoods } = require('../services/foodCatalogService');

const MEAL_TO_DB = {
    breakfast: 'breakfast', lunch: 'lunch', dinner: 'dinner', snack: 'snack',
    早餐: 'breakfast', 午餐: 'lunch', 晚餐: 'dinner', 加餐: 'snack',
};

function getUserId(req) {
    return Number(req.user && req.user.userId);
}

function shanghaiDate(value = new Date()) {
    const parts = new Intl.DateTimeFormat('zh-CN', {
        timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit',
    }).formatToParts(new Date(value));
    const part = type => parts.find(item => item.type === type).value;
    return `${part('year')}-${part('month')}-${part('day')}`;
}

function dateRange(dateText) {
    const safeDate = /^\d{4}-\d{2}-\d{2}$/.test(dateText || '')
        ? dateText
        : shanghaiDate();
    const start = new Date(`${safeDate}T00:00:00+08:00`);
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    return { safeDate, start, end };
}

async function latestWeight(userId) {
    return WeightRecord.findOne({ where: { user_id: userId }, order: [['record_time', 'DESC']] });
}

exports.demoLogin = async (_req, res) => {
    try {
        const [user] = await User.findOrCreate({
            where: { username: '轻卡体验用户' },
            defaults: { username: '轻卡体验用户', password: '', target: 'lose_weight' },
        });
        const plan = await UserPlan.findOne({ where: { user_id: user.id } });
        const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'litecal-demo-secret', { expiresIn: '30d' });
        return res.json(successResponse({ user: { id: user.id, username: user.username }, accessToken, needsOnboarding: !plan }, '欢迎体验轻卡日记'));
    } catch (error) {
        console.error('demoLogin:', error);
        return res.status(500).json(errorResponse('一键体验初始化失败', 500));
    }
};

exports.getProfilePlan = async (req, res) => {
    try {
        const userId = getUserId(req);
        const [user, plan, weight] = await Promise.all([
            User.findByPk(userId, { attributes: ['id', 'username', 'height', 'gender', 'age', 'activity_level'] }),
            UserPlan.findOne({ where: { user_id: userId } }),
            latestWeight(userId),
        ]);
        if (!user) return res.status(404).json(errorResponse('用户不存在', 404));
        return res.json(successResponse({ user, plan, currentWeight: weight ? Number(weight.current_weight) : null }));
    } catch (error) {
        console.error('getProfilePlan:', error);
        return res.status(500).json(errorResponse('获取计划失败', 500));
    }
};

exports.saveProfilePlan = async (req, res) => {
    try {
        const userId = getUserId(req);
        const body = req.body;
        const planResult = buildPlan(body);
        await User.update({
            gender: body.gender,
            age: Number(body.age),
            height: Number(body.height),
            activity_level: body.activityLevel || 'sedentary',
            target: 'lose_weight',
        }, { where: { id: userId } });
        const [plan] = await UserPlan.upsert({
            user_id: userId,
            start_weight: Number(body.currentWeight),
            target_weight: Number(body.targetWeight),
            plan_days: Number(body.planDays),
            start_date: new Date().toISOString().slice(0, 10),
            bmr: planResult.bmr,
            maintenance_calories: planResult.maintenanceCalories,
            daily_calorie_target: planResult.dailyCalorieTarget,
            planned_daily_deficit: planResult.plannedDailyDeficit,
        });
        const weight = await latestWeight(userId);
        if (!weight || Number(weight.current_weight) !== Number(body.currentWeight)) {
            await WeightRecord.create({
                user_id: userId,
                current_weight: Number(body.currentWeight),
                initial_weight: Number(body.currentWeight),
                target_weight: Number(body.targetWeight),
                record_time: new Date(),
            });
        }
        return res.json(successResponse({ plan, calculation: planResult }, '减脂计划已保存'));
    } catch (error) {
        return res.status(400).json(errorResponse(error.message || '保存计划失败', 400));
    }
};

exports.recognizeFood = async (req, res) => {
    try {
        const image = req.files && req.files.image;
        if (!image) return res.status(400).json(errorResponse('请选择食物图片', 400));
        const allowed = ['image/jpeg', 'image/png', 'image/bmp', 'image/webp'];
        if (!allowed.includes(image.mimetype)) return res.status(415).json(errorResponse('仅支持JPG、PNG、BMP或WebP图片', 415));
        if (image.size > 4 * 1024 * 1024) return res.status(413).json(errorResponse('图片不能超过4MB', 413));
        const detected = await recognizeFood(image.data);
        const foods = await DietSelection.findAll({where:{is_ready_to_eat:true}});
        const candidates = attachCatalogNutrition(detected, foods);
        if (!candidates.length) return res.status(422).json(errorResponse('未识别到可用菜品，请重新拍摄或手动搜索添加', 422));
        return res.json(successResponse({ candidates, isDemo: candidates[0].provider === 'mock' }, '识别完成'));
    } catch (error) {
        return res.status(502).json(errorResponse(error.message || '识别服务暂不可用', 502));
    }
};

exports.getFoodCatalog = async (req, res) => {
    try {
        const rows = await DietSelection.findAll({where:{is_ready_to_eat:true}});
        const foods = filterFoods(rows.map(row=>row.toJSON()),req.query);
        return res.json(successResponse(foods));
    } catch (error) {
        return res.status(500).json(errorResponse('获取食物库失败', 500));
    }
};

exports.getSportCatalog = async (_req, res) => {
    try {
        const sports = await SportSelection.findAll({
            where: { activity_key: { [Op.ne]: null } },
            order: [['category', 'ASC'], ['id', 'ASC']],
        });
        return res.json(successResponse(sports));
    } catch (error) {
        return res.status(500).json(errorResponse('获取运动库失败', 500));
    }
};

exports.getDietRecords = async (req, res) => {
    try {
        const { start, end } = dateRange(req.query.date);
        const records = await DietRecord.findAll({
            where: { user_id: getUserId(req), record_time: { [Op.gte]: start, [Op.lt]: end } },
            order: [['record_time', 'DESC']],
        });
        return res.json(successResponse(records));
    } catch (error) {
        return res.status(500).json(errorResponse('获取饮食记录失败', 500));
    }
};

exports.createDietRecord = async (req, res) => {
    try {
        const mealType = MEAL_TO_DB[req.body.mealType];
        if (!mealType || !String(req.body.foodName || '').trim()) {
            return res.status(400).json(errorResponse('饮食记录信息不完整', 400));
        }
        if (req.body.source === 'mock') return res.status(400).json(errorResponse('演示识别结果不能直接记账，请手动选择实际食物', 400));
        let nutritionSource = String(req.body.nutritionSource || '手动录入参考值').slice(0, 100);
        let nutritionSnapshot = null;
        const portionInput = { ...req.body };
        if (req.body.foodId != null) {
            const food = await DietSelection.findByPk(req.body.foodId);
            if (!food || food.name !== req.body.foodName) return res.status(400).json(errorResponse('菜品与营养数据不一致，请重新选择', 400));
            portionInput.caloriesPer100g = food.calories;
            portionInput.referencePortionG = food.default_portion_g;
            nutritionSource = food.nutrition_source || '本地食物库参考值（来源待核验）';
            nutritionSnapshot={catalogKey:food.catalog_key,method:food.nutrition_method,sourceUrl:food.source_url,sourceId:food.source_food_id,note:food.nutrition_note,evidence:food.nutrition_evidence,per100g:{calories:Number(food.calories),carbs:food.carbs,fats:food.fats,proteins:food.proteins}};
        }
        let portion;
        try { portion = resolveDietPortion(portionInput); }
        catch (error) { return res.status(400).json(errorResponse(error.message, 400)); }
        const record = await DietRecord.create({
            user_id: getUserId(req),
            meal_type: mealType,
            food_name: String(req.body.foodName).slice(0, 100),
            ...portion,
            nutrition_source: nutritionSource,
            nutrition_snapshot: nutritionSnapshot,
            source: req.body.source || 'manual',
            confidence: req.body.confidence == null ? null : Number(req.body.confidence),
            ...Object.fromEntries(['carbs','fats','proteins'].map(key=>[key,
                nutritionSnapshot&&nutritionSnapshot.per100g[key]!=null ? Math.round(Number(nutritionSnapshot.per100g[key])*portion.portion_g)/100 : null])),
            record_time: req.body.recordTime ? new Date(req.body.recordTime) : new Date(),
        });
        return res.json(successResponse(record, '饮食记录已保存'));
    } catch (error) {
        console.error('createDietRecord:', error);
        return res.status(500).json(errorResponse('保存饮食记录失败', 500));
    }
};

exports.updateDietRecord = async (req, res) => {
    try {
        const record = await DietRecord.findOne({ where: { id: req.params.id, user_id: getUserId(req) } });
        if (!record) return res.status(404).json(errorResponse('记录不存在', 404));
        let portion;
        try {
            // A legacy client editing consumed grams starts a new 100% portion.
            const legacyEdit = req.body.platePortionG == null && req.body.portionG != null;
            portion = resolveDietPortion({
                platePortionG: legacyEdit ? req.body.portionG : (req.body.platePortionG ?? record.plate_portion_g ?? record.portion_g),
                consumedPercent: legacyEdit ? 100 : (req.body.consumedPercent ?? record.consumed_percent ?? 100),
                caloriesPer100g: record.calories_per_100g,
                referencePortionG: record.reference_portion_g,
                portionBasis: req.body.portionBasis || 'entered',
            });
        } catch (error) { return res.status(400).json(errorResponse(error.message, 400)); }
        if (req.body.foodName != null && req.body.foodName !== record.food_name) {
            return res.status(400).json(errorResponse('更换菜品请重新添加，以匹配对应营养数据', 400));
        }
        await record.update({
            food_name: req.body.foodName || record.food_name,
            meal_type: MEAL_TO_DB[req.body.mealType] || record.meal_type,
            ...portion,
            ...(record.nutrition_snapshot&&record.nutrition_snapshot.per100g ? Object.fromEntries(['carbs','fats','proteins'].map(key=>[key,
                record.nutrition_snapshot.per100g[key]==null ? null : Math.round(Number(record.nutrition_snapshot.per100g[key])*portion.portion_g)/100])) : {}),
        });
        return res.json(successResponse(record, '记录已更新'));
    } catch (error) {
        return res.status(500).json(errorResponse('更新记录失败', 500));
    }
};

exports.deleteDietRecord = async (req, res) => {
    const deleted = await DietRecord.destroy({ where: { id: req.params.id, user_id: getUserId(req) } });
    return deleted ? res.json(successResponse(null, '记录已删除')) : res.status(404).json(errorResponse('记录不存在', 404));
};

exports.getSportRecords = async (req, res) => {
    try {
        const { start, end } = dateRange(req.query.date);
        const records = await SportRecord.findAll({
            where: { user_id: getUserId(req), record_time: { [Op.gte]: start, [Op.lt]: end } },
            order: [['record_time', 'DESC']],
        });
        return res.json(successResponse(records));
    } catch (error) {
        return res.status(500).json(errorResponse('获取运动记录失败', 500));
    }
};

exports.createSportRecord = async (req, res) => {
    try {
        const durationSeconds = Number(req.body.durationSeconds);
        if (durationSeconds < 10 || durationSeconds > 86400) return res.status(400).json(errorResponse('运动时长需在10秒至24小时之间', 400));
        const [sport, weight] = await Promise.all([
            SportSelection.findOne({ where: { activity_key: req.body.activityKey } }),
            latestWeight(getUserId(req)),
        ]);
        if (!sport || !weight) return res.status(400).json(errorResponse('请先完成身体建档并选择运动', 400));
        const calories = calculateExerciseCalories(sport.met, weight.current_weight, durationSeconds);
        const startedAt = req.body.startedAt ? new Date(req.body.startedAt) : new Date(Date.now() - durationSeconds * 1000);
        const endedAt = req.body.endedAt ? new Date(req.body.endedAt) : new Date();
        const record = await SportRecord.create({
            user_id: getUserId(req),
            activity_name: sport.name,
            activity_key: sport.activity_key,
            met: sport.met,
            calories,
            duration: Math.max(1, Math.round(durationSeconds / 60)),
            duration_seconds: Math.round(durationSeconds),
            started_at: startedAt,
            ended_at: endedAt,
            record_time: endedAt,
            time_of_day: req.body.timeOfDay || 'day',
        });
        return res.json(successResponse(record, '运动记录已保存'));
    } catch (error) {
        console.error('createSportRecord:', error);
        return res.status(500).json(errorResponse('保存运动记录失败', 500));
    }
};

exports.deleteSportRecord = async (req, res) => {
    const deleted = await SportRecord.destroy({ where: { id: req.params.id, user_id: getUserId(req) } });
    return deleted ? res.json(successResponse(null, '记录已删除')) : res.status(404).json(errorResponse('记录不存在', 404));
};

exports.saveWeight = async (req, res) => {
    try {
        const userId = getUserId(req);
        const currentWeight = Number(req.body.currentWeight);
        const plan = await UserPlan.findOne({ where: { user_id: userId } });
        if (!plan || currentWeight < 30 || currentWeight > 300) return res.status(400).json(errorResponse('体重数据无效', 400));
        const record = await WeightRecord.create({
            user_id: userId,
            current_weight: currentWeight,
            initial_weight: plan.start_weight,
            target_weight: plan.target_weight,
            record_time: new Date(),
        });
        return res.json(successResponse(record, '体重已记录'));
    } catch (error) {
        return res.status(500).json(errorResponse('记录体重失败', 500));
    }
};

exports.getDailyDashboard = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { safeDate, start, end } = dateRange(req.query.date);
        const [plan, weight, diets, sports] = await Promise.all([
            UserPlan.findOne({ where: { user_id: userId } }),
            latestWeight(userId),
            DietRecord.findAll({ where: { user_id: userId, record_time: { [Op.gte]: start, [Op.lt]: end } } }),
            SportRecord.findAll({ where: { user_id: userId, record_time: { [Op.gte]: start, [Op.lt]: end } } }),
        ]);
        if (!plan) return res.status(409).json(errorResponse('请先完成身体建档', 409));
        const intake = diets.reduce((sum, item) => sum + Number(item.calories || 0), 0);
        const exercise = sports.reduce((sum, item) => sum + Number(item.calories || 0), 0);
        const user = await User.findByPk(userId);
        const currentWeight = weight ? Number(weight.current_weight) : Number(plan.start_weight);
        const bmr = calculateBmr({ gender: user.gender, age: user.age, height: user.height, weight: currentWeight });
        const maintenance = Math.round(bmr * (ACTIVITY_FACTORS[user.activity_level] || ACTIVITY_FACTORS.sedentary));
        const target = Math.max(bmr, maintenance - Number(plan.planned_daily_deficit));
        const summary = calculateDailySummary({
            maintenanceCalories: maintenance,
            dailyCalorieTarget: target,
            intakeCalories: intake,
            exerciseCalories: exercise,
        });

        const sevenDaysAgo = new Date(start.getTime() - 6 * 86400000);
        const [recentDiets, recentSports] = await Promise.all([
            DietRecord.findAll({ where: { user_id: userId, record_time: { [Op.gte]: sevenDaysAgo, [Op.lt]: end } } }),
            SportRecord.findAll({ where: { user_id: userId, record_time: { [Op.gte]: sevenDaysAgo, [Op.lt]: end } } }),
        ]);
        const byDay = {};
        const dayKey = value => shanghaiDate(value);
        recentDiets.forEach(item => {
            const key = dayKey(item.record_time);
            byDay[key] = byDay[key] || { intake: 0, exercise: 0 };
            byDay[key].intake += Number(item.calories || 0);
        });
        recentSports.forEach(item => {
            const key = dayKey(item.record_time);
            byDay[key] = byDay[key] || { intake: 0, exercise: 0 };
            byDay[key].exercise += Number(item.calories || 0);
        });
        // Exclude the unfinished current day and days with no recorded intake.
        const dailyGaps = Object.entries(byDay).filter(([day, item]) => day < shanghaiDate() && item.intake > 0)
            .map(([, item]) => maintenance + item.exercise - item.intake);
        const elapsedDays = Math.max(0, Math.floor((Date.now() - new Date(plan.start_date).getTime()) / 86400000));
        const estimate = estimateRemainingDays(Math.max(0, currentWeight - Number(plan.target_weight)), dailyGaps, Number(plan.plan_days) - elapsedDays);
        const denominator = Number(plan.start_weight) - Number(plan.target_weight);
        const progress = denominator > 0 ? Math.max(0, Math.min(100, ((Number(plan.start_weight) - currentWeight) / denominator) * 100)) : 0;

        return res.json(successResponse({
            date: safeDate,
            ...summary,
            maintenanceCalories: maintenance,
            dailyCalorieTarget: Math.round(target),
            currentWeight,
            startWeight: Number(plan.start_weight),
            targetWeight: Number(plan.target_weight),
            progress: Math.round(progress),
            estimatedDays: estimate.days,
            estimateBasis: estimate.basis,
            hasRecords: diets.length + sports.length > 0,
        }));
    } catch (error) {
        console.error('getDailyDashboard:', error);
        return res.status(500).json(errorResponse('获取今日数据失败', 500));
    }
};

exports.clearDemoData = async (req, res) => {
    try {
        const userId = getUserId(req);
        await Promise.all([
            DietRecord.destroy({ where: { user_id: userId } }),
            SportRecord.destroy({ where: { user_id: userId } }),
            WeightRecord.destroy({ where: { user_id: userId } }),
            UserPlan.destroy({ where: { user_id: userId } }),
        ]);
        await User.update({ height: null, gender: null, age: null, activity_level: null }, { where: { id: userId } });
        return res.json(successResponse(null, '演示数据已清除'));
    } catch (error) {
        return res.status(500).json(errorResponse('清除数据失败', 500));
    }
};
