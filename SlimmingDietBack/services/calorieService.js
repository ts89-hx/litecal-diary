const ACTIVITY_FACTORS = {
    sedentary: 1.2,
    light: 1.375,
    regular: 1.55,
    intense: 1.725,
};

function round(value, digits = 0) {
    const factor = 10 ** digits;
    return Math.round(Number(value) * factor) / factor;
}

function calculateBmr({ gender, age, height, weight }) {
    const numericAge = Number(age);
    const numericHeight = Number(height);
    const numericWeight = Number(weight);
    if (![numericAge, numericHeight, numericWeight].every(Number.isFinite)) {
        throw new Error('身体数据不完整');
    }
    const bmr = gender === 'male'
        ? 88.36 + 13.4 * numericWeight + 4.8 * numericHeight - 5.7 * numericAge
        : 447.6 + 9.2 * numericWeight + 3.1 * numericHeight - 4.3 * numericAge;
    return round(bmr);
}

function calculateBmi(weight, height) {
    return round(Number(weight) / ((Number(height) / 100) ** 2), 1);
}

function buildPlan({ gender, age, height, currentWeight, targetWeight, planDays, activityLevel }) {
    const startWeight = Number(currentWeight);
    const goalWeight = Number(targetWeight);
    const days = Number(planDays);
    if (age < 18 || age > 80 || height < 120 || height > 230 || startWeight < 30 || startWeight > 300) {
        throw new Error('身体数据超出支持范围');
    }
    if (goalWeight <= 0 || goalWeight >= startWeight || days < 7 || days > 730) {
        throw new Error('请填写合理的减脂目标与计划天数');
    }

    const bmr = calculateBmr({ gender, age, height, weight: startWeight });
    const maintenanceCalories = round(bmr * (ACTIVITY_FACTORS[activityLevel] || ACTIVITY_FACTORS.sedentary));
    const rawDeficit = round(((startWeight - goalWeight) * 7700) / days);
    const plannedDailyDeficit = Math.max(0, Math.min(rawDeficit, Math.max(maintenanceCalories - bmr, 0)));
    const dailyCalorieTarget = round(maintenanceCalories - plannedDailyDeficit);
    const weeklyLoss = round(((startWeight - goalWeight) / days) * 7, 2);
    const targetBmi = calculateBmi(goalWeight, height);
    const warnings = [];
    if (weeklyLoss > 0.5) warnings.push('当前计划节奏偏快，建议延长计划周期');
    if (targetBmi < 18.5) warnings.push('目标体重低于正常BMI范围，请重新评估');
    if (rawDeficit > plannedDailyDeficit) warnings.push('已按保守热量预算调整，不建议过度节食');

    return {
        bmr,
        bmi: calculateBmi(startWeight, height),
        targetBmi,
        maintenanceCalories,
        dailyCalorieTarget,
        plannedDailyDeficit,
        weeklyLoss,
        warnings,
    };
}

function calculatePortionCalories(caloriesPer100g, portionG) {
    return round((Number(caloriesPer100g) * Number(portionG)) / 100);
}

function calculateExerciseCalories(met, weightKg, durationSeconds) {
    const minutes = Number(durationSeconds) / 60;
    return round(Number(met) * 3.5 * Number(weightKg) / 200 * minutes);
}

function calculateDailySummary({ maintenanceCalories, dailyCalorieTarget, intakeCalories, exerciseCalories }) {
    const maintenance = Number(maintenanceCalories || 0);
    const target = Number(dailyCalorieTarget || maintenance);
    const intake = Number(intakeCalories || 0);
    const exercise = Number(exerciseCalories || 0);
    return {
        intakeCalories: round(intake),
        exerciseCalories: round(exercise),
        remainingCalories: round(target + exercise - intake),
        calorieGap: round(maintenance + exercise - intake),
    };
}

function estimateRemainingDays(remainingWeightKg, dailyGaps, fallbackDays) {
    if (Number(remainingWeightKg) <= 0) return { days: 0, basis: 'achieved' };
    const usable = (dailyGaps || []).map(Number).filter(Number.isFinite);
    if (usable.length < 3) return Number(fallbackDays) > 0
        ? { days: Number(fallbackDays), basis: 'plan' }
        : { days: null, basis: 'insufficient' };
    const averageGap = usable.reduce((sum, value) => sum + value, 0) / usable.length;
    if (averageGap <= 0) return { days: null, basis: 'no-deficit' };
    return {
        days: Math.max(0, Math.ceil(Number(remainingWeightKg) * 7700 / averageGap)),
        basis: 'recent',
    };
}

module.exports = {
    ACTIVITY_FACTORS,
    calculateBmr,
    calculateBmi,
    buildPlan,
    calculatePortionCalories,
    calculateExerciseCalories,
    calculateDailySummary,
    estimateRemainingDays,
};
