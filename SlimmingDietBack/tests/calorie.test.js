const test = require('node:test');
const assert = require('node:assert/strict');
const {
    calculateBmr,
    buildPlan,
    calculatePortionCalories,
    calculateExerciseCalories,
    calculateDailySummary,
    estimateRemainingDays,
} = require('../services/calorieService');

test('预测计入盈余日，并区分达标、过期及无缺口', () => {
    assert.equal(estimateRemainingDays(1, [500, 500, -400], 30).days, 39);
    assert.equal(estimateRemainingDays(1, [-100, 0, 100], 30).days, null);
    assert.deepEqual(estimateRemainingDays(0, [], 30), { days: 0, basis: 'achieved' });
    assert.equal(estimateRemainingDays(1, [], -1).days, null);
});

test('基础代谢计算返回合理整数', () => {
    assert.equal(calculateBmr({ gender: 'female', age: 28, height: 165, weight: 60 }), 1391);
});

test('饮食分量按每100克热量换算', () => {
    assert.equal(calculatePortionCalories(118, 150), 177);
});

test('运动热量按MET、体重与秒数计算', () => {
    assert.equal(calculateExerciseCalories(7, 60, 1800), 221);
});

test('每日热量口径一致', () => {
    assert.deepEqual(calculateDailySummary({
        maintenanceCalories: 1900,
        dailyCalorieTarget: 1600,
        intakeCalories: 1200,
        exerciseCalories: 200,
    }), {
        intakeCalories: 1200,
        exerciseCalories: 200,
        remainingCalories: 600,
        calorieGap: 900,
    });
});

test('目标节奏过快时给出警告并保护热量预算', () => {
    const plan = buildPlan({
        gender: 'female', age: 26, height: 165, currentWeight: 65,
        targetWeight: 55, planDays: 30, activityLevel: 'light',
    });
    assert.ok(plan.warnings.some(item => item.includes('偏快')));
    assert.ok(plan.dailyCalorieTarget >= plan.bmr);
});

test('少于3天使用计划预测，足够数据后使用近期热量差', () => {
    assert.deepEqual(estimateRemainingDays(5, [400, 450], 60), { days: 60, basis: 'plan' });
    const recent = estimateRemainingDays(5, [500, 500, 500], 60);
    assert.equal(recent.basis, 'recent');
    assert.equal(recent.days, 77);
});
