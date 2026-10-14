const { WeightRecord, DietRecord, SportRecord, User, MetabolicCalculation, HealthyHabit, DietGoal, DietData } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');
const fs = require('fs');
const path = require('path');

exports.saveWeightRecord = async (req, res) => {
    console.log('saveWeightRecord params:', req.body);
    const { userId, currentWeight, initialWeight, targetWeight, recordTime } = req.body;
    try {
        await WeightRecord.create({ user_id: userId, current_weight: currentWeight, initial_weight: initialWeight, target_weight: targetWeight, record_time: recordTime });
        return res.json(successResponse(null, '体重记录已保存'));
    } catch (err) {
        console.error('保存体重记录错误:', err.message);
        return res.status(500).json(errorResponse('保存体重记录失败'));
    }
};

exports.saveDietRecord = async (req, res) => {
    console.log('saveDietRecord params:', req.body);
    const { userId, mealType, foodName, calories, carbs, fats, proteins, recordTime } = req.body;
    try {
        await DietRecord.create({ user_id: userId, meal_type: mealType, food_name: foodName, calories, carbs, fats, proteins, record_time: recordTime });
        return res.json(successResponse(null, '饮食记录已保存'));
    } catch (err) {
        console.error('保存饮食记录错误:', err.message);
        return res.status(500).json(errorResponse('保存饮食记录失败'));
    }
};

exports.saveSportRecord = async (req, res) => {
    const { userId, activityName, calories, duration, timeOfDay, recordTime } = req.body;
    try {
        await SportRecord.create({
            user_id: userId,
            activity_name: activityName,
            calories,
            duration,
            time_of_day: timeOfDay,
            record_time: recordTime
        });
        return res.json(successResponse(null, '运动记录已保存'));
    } catch (err) {
        console.error('保存运动记录错误:', err.message);
        return res.status(500).json(errorResponse('保存运动记录失败'));
    }
};

exports.saveMetabolicCalculation = async (req, res) => {
    console.log('saveMetabolicCalculation params:', req.body);
    const { userId, bmr, bmi, bodyFatPercentage, recommendedCalories, recommendedCarbs, recommendedProteins, recommendedFats, calculationTime } = req.body;
    try {
        await MetabolicCalculation.create({
            user_id: userId,
            bmr,
            bmi,
            body_fat_percentage: bodyFatPercentage,
            recommended_calories: recommendedCalories,
            recommended_carbs: recommendedCarbs,
            recommended_proteins: recommendedProteins,
            recommended_fats: recommendedFats,
            calculation_time: calculationTime
        });
        return res.json(successResponse(null, '代谢计算结果已保存'));
    } catch (err) {
        console.error('保存代谢计算结果错误:', err.message);
        return res.status(500).json(errorResponse('保存代谢计算结果失败'));
    }
};

exports.getMetabolicCalculation = async (req, res) => {
    console.log('getMetabolicCalculation params:', req.params);
    const { userId } = req.params;
    try {
        const calculation = await MetabolicCalculation.findOne({ where: { user_id: userId }, order: [['calculation_time', 'DESC']] });
        if (!calculation) {
            return res.json(successResponse(null, '未找到代谢计算结果'));
        }
        return res.json(successResponse(calculation, '代谢计算结果获取成功'));
    } catch (err) {
        console.error('获取代谢计算结果错误:', err.message);
        return res.status(500).json(errorResponse('获取代谢计算结果失败'));
    }
};

exports.getUserData = async (req, res) => {
    console.log('getUserData params:', req.params);
    const { userId } = req.params;
    try {
        const user = await User.findByPk(userId, {
            attributes: ['username', 'height', 'gender', 'age', 'target', 'activity_level', 'avatar']
        });
        if (!user) {
            return res.json(successResponse(null, '用户未找到'));
        }
        return res.json(successResponse(user, '用户数据获取成功'));
    } catch (err) {
        console.error('获取用户数据错误:', err.message);
        return res.status(500).json(errorResponse('获取用户数据失败'));
    }
};

exports.updateUserAge = async (req, res) => {
    console.log('updateUserAge params:', req.body);
    const { userId, age } = req.body;
    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json(errorResponse('用户未找到'));
        }
        user.age = age;
        await user.save();
        return res.json(successResponse(null, '年龄更新成功'));
    } catch (err) {
        console.error('更新年龄错误:', err.message);
        return res.status(500).json(errorResponse('更新年龄失败'));
    }
};

exports.updateUserGender = async (req, res) => {
    console.log('updateUserGender params:', req.body);
    const { userId, gender } = req.body;
    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json(errorResponse('用户未找到'));
        }
        user.gender = gender;
        await user.save();
        return res.json(successResponse(null, '性别更新成功'));
    } catch (err) {
        console.error('更新性别错误:', err.message);
        return res.status(500).json(errorResponse('更新性别失败'));
    }
};

exports.updateUserHeight = async (req, res) => {
    console.log('updateUserHeight params:', req.body);
    const { userId, height } = req.body;
    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json(errorResponse('用户未找到'));
        }
        user.height = height;
        await user.save();
        return res.json(successResponse(null, '身高更新成功'));
    } catch (err) {
        console.error('更新身高错误:', err.message);
        return res.status(500).json(errorResponse('更新身高失败'));
    }
};

exports.updateUserActivityLevel = async (req, res) => {
    console.log('updateUserActivityLevel params:', req.body);
    const { userId, activityLevel } = req.body;
    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json(errorResponse('用户未找到'));
        }
        user.activity_level = activityLevel;
        await user.save();
        return res.json(successResponse(null, '运动水平更新成功'));
    } catch (err) {
        console.error('更新运动水平错误:', err.message);
        return res.status(500).json(errorResponse('更新运动水平失败'));
    }
};

exports.updateUserTarget = async (req, res) => {
    console.log('updateUserTarget params:', req.body);
    const { userId, target } = req.body;
    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json(errorResponse('用户未找到'));
        }
        user.target = target;
        await user.save();
        return res.json(successResponse(null, '目标更新成功'));
    } catch (err) {
        console.error('更新目标错误:', err.message);
        return res.status(500).json(errorResponse('更新目标失败'));
    }
};

exports.saveOrUpdateHabit = async (req, res) => {
    console.log('saveOrUpdateHabit params:', req.body);
    const { userId, habitName, days, active } = req.body;
    try {
        const [habit, created] = await HealthyHabit.findOrCreate({
            where: { user_id: userId, habit_name: habitName },
            defaults: { days, active }
        });

        if (!created) {
            habit.days = days;
            habit.active = active;
            await habit.save();
        }

        return res.json(successResponse(null, '健康习惯已更新'));
    } catch (err) {
        console.error('保存或更新健康习惯错误:', err.message);
        return res.status(500).json(errorResponse('保存或更新健康习惯失败'));
    }
};

exports.getHabits = async (req, res) => {
    console.log('getHabits params:', req.params);
    const { userId } = req.params;
    try {
        const habits = await HealthyHabit.findAll({ where: { user_id: userId } });
        return res.json(successResponse(habits, '健康习惯获取成功'));
    } catch (err) {
        console.error('获取健康习惯错误:', err.message);
        return res.status(500).json(errorResponse('获取健康习惯失败'));
    }
};

exports.saveDietGoals = async (req, res) => {
    console.log('saveDietGoals params:', req.body);
    const { userId, carbsGoal, fatsGoal, proteinsGoal } = req.body;
    try {
        const [goal, created] = await DietGoal.findOrCreate({
            where: { user_id: userId },
            defaults: { carbs_goal: carbsGoal, fats_goal: fatsGoal, proteins_goal: proteinsGoal }
        });

        if (!created) {
            goal.carbs_goal = carbsGoal;
            goal.fats_goal = fatsGoal;
            goal.proteins_goal = proteinsGoal;
            await goal.save();
        }

        return res.json(successResponse(null, '饮食目标已保存'));
    } catch (err) {
        console.error('保存饮食目标错误:', err.message);
        return res.status(500).json(errorResponse('保存饮食目标失败'));
    }
};

exports.getDietGoals = async (req, res) => {
    console.log('getDietGoals params:', req.params);
    const { userId } = req.params;
    if (!userId) {
        return res.status(400).json(errorResponse('用户ID未定义'));
    }
    try {
        const goals = await DietGoal.findOne({ where: { user_id: userId } });
        if (!goals) {
            return res.json(successResponse(null, '未找到饮食目标'));
        }
        return res.json(successResponse(goals, '饮食目标获取成功'));
    } catch (err) {
        console.error('获取饮食目标错误:', err.message);
        return res.status(500).json(errorResponse('获取饮食目标失败'));
    }
};

exports.saveSelectedFoods = async (req, res) => {
    console.log('saveSelectedFoods params:', req.body);
    const { userId, foods } = req.body;
    try {
        await SelectedFood.destroy({ where: { user_id: userId } }); // 清除旧数据
        await SelectedFood.bulkCreate(foods.map(food => ({ ...food, user_id: userId })));
        return res.json(successResponse(null, '选择的食物已保存'));
    } catch (err) {
        console.error('保存选择的食物错误:', err.message);
        return res.status(500).json(errorResponse('保存选择的食物失败'));
    }
};

exports.getSelectedFoods = async (req, res) => {
    console.log('getSelectedFoods params:', req.params);
    const { userId } = req.params;
    try {
        const foods = await SelectedFood.findAll({ where: { user_id: userId } });
        return res.json(successResponse(foods, '选择的食物获取成功'));
    } catch (err) {
        console.error('获取选择的食物错误:', err.message);
        return res.status(500).json(errorResponse('获取选择的食物失败'));
    }
};

exports.getWeightRecords = async (req, res) => {
    const { userId } = req.params;
    try {
        const records = await WeightRecord.findAll({ where: { user_id: userId }, order: [['record_time', 'DESC']] });
        return res.json(successResponse(records, '体重记录获取成功'));
    } catch (err) {
        console.error('获取体重记录错误:', err.message);
        return res.status(500).json(errorResponse('获取体重记录失败'));
    }
};

exports.getDietRecords = async (req, res) => {
    const { userId } = req.params;
    try {
        const records = await DietRecord.findAll({ where: { user_id: userId }, order: [['record_time', 'DESC']] });
        return res.json(successResponse(records, '饮食记录获取成功'));
    } catch (err) {
        console.error('获取饮食记录错误:', err.message);
        return res.status(500).json(errorResponse('获取饮食记录失败'));
    }
};

exports.getSportRecords = async (req, res) => {
    const { userId } = req.params;
    try {
        const records = await SportRecord.findAll({ where: { user_id: userId } });
        return res.json(successResponse(records, '运动记录获取成功'));
    } catch (err) {
        console.error('获取运动记录错误:', err.message);
        return res.status(500).json(errorResponse('获取运动记录失败'));
    }
};

exports.getDietData = async (req, res) => {
    const { userId } = req.params;
    console.log('getDietData params:', req.params);
    try {
        const dietData = await DietData.findOne({ where: { user_id: userId }, order: [['record_time', 'DESC']] });
        if (!dietData) {
            return res.json(successResponse(null, '未找到饮食数据'));
        }
        return res.json(successResponse(dietData, '饮食数据获取成功'));
    } catch (err) {
        console.error('获取饮食数据错误:', err.message);
        return res.status(500).json(errorResponse('获取饮食数据失败'));
    }
};

exports.saveDietData = async (req, res) => {
    const { userId, totalCalories, remainingCalories } = req.body;
    console.log('saveDietData params:', req.body);
    try {
        await DietData.upsert({
            user_id: userId,
            total_calories: totalCalories,
            remaining_calories: remainingCalories,
            record_time: new Date() // 确保记录时间更新
        });
        return res.json(successResponse(null, '饮食数据已保存或更新'));
    } catch (err) {
        console.error('保存或更新饮食数据错误:', err.message);
        return res.status(500).json(errorResponse('保存或更新饮食数据失败'));
    }
};

exports.clearSportRecords = async (req, res) => {
    const { userId } = req.params;
    try {
        await SportRecord.destroy({ where: { user_id: userId } });
        return res.json(successResponse(null, '运动记录已清空'));
    } catch (err) {
        console.error('清空运动记录错误:', err.message);
        return res.status(500).json(errorResponse('清空运动记录失败'));
    }
};

exports.clearDietRecords = async (req, res) => {
    const { userId } = req.params;
    try {
        await DietRecord.destroy({ where: { user_id: userId } });
        return res.json(successResponse(null, '饮食记录已清空'));
    } catch (err) {
        console.error('清空饮食记录错误:', err.message);
        return res.status(500).json(errorResponse('清空饮食记录失败'));
    }
};

exports.updateAccountInfo = async (req, res) => {
    const { userId } = req.params;
    const { username } = req.body;
    const avatar = req.files?.avatar;

    console.log('updateAccountInfo params:', req.body); 

    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: '用户未找到' });
        }

        if (username) {
            user.username = username;
        }

        if (avatar) {
            const avatarDir = path.join(__dirname, '../avatar');
            if (!fs.existsSync(avatarDir)) {
                fs.mkdirSync(avatarDir);
            }
            const avatarPath = path.join(avatarDir, `${userId}_${avatar.name}`);
            avatar.mv(avatarPath, (err) => {
                if (err) {
                    console.error('文件保存错误:', err);
                    return res.status(500).json({ success: false, message: '文件保存失败' });
                }
            });
            user.avatar = `/avatar/${userId}_${avatar.name}`;
        }

        await user.save();
        return res.json({ success: true, message: '账号信息更新成功' });
    } catch (err) {
        console.error('更新账号信息错误:', err.message);
        return res.status(500).json({ success: false, message: '更新账号信息失败' });
    }
};
