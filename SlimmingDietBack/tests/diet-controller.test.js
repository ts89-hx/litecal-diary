const test = require('node:test');
const assert = require('node:assert/strict');
const { DietSelection, DietRecord } = require('../models');
const controller = require('../controllers/mvpController');

function response() {
    return { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
}

test('保存时从数据库读取营养，忽略客户端伪造密度，保存实际摄入和计算依据', async t => {
    t.mock.method(DietSelection, 'findByPk', async () => ({ name: '番茄炒蛋', calories: 120, default_portion_g: 250 }));
    let saved;
    t.mock.method(DietRecord, 'create', async value => { saved = value; return value; });
    const res = response();
    await controller.createDietRecord({ user: { userId: 1 }, body: {
        foodId: 1, foodName: '番茄炒蛋', mealType: 'lunch', platePortionG: 250,
        consumedPercent: 50, caloriesPer100g: 999, referencePortionG: 999, portionBasis: 'reference', source: 'manual',
    } }, res);
    assert.equal(res.statusCode, 200);
    assert.equal(saved.calories, 150);
    assert.equal(saved.portion_g, 125);
    assert.equal(saved.plate_portion_g, 250);
    assert.equal(saved.consumed_percent, 50);
    assert.equal(saved.reference_portion_g, 250);
});

test('服务端阻止模拟结果和菜名与食物ID错配', async t => {
    t.mock.method(DietSelection, 'findByPk', async () => ({ name: '米饭', calories: 116, default_portion_g: 150 }));
    const save = t.mock.method(DietRecord, 'create', async () => { throw new Error('不应该保存'); });
    for (const source of ['manual', 'mock']) {
        const res = response();
        await controller.createDietRecord({ user: { userId: 1 }, body: {
            foodId: 1, foodName: '番茄炒蛋', mealType: 'lunch', platePortionG: 250, source,
        } }, res);
        assert.equal(res.statusCode, 400);
    }
    assert.equal(save.mock.callCount(), 0);
});

test('编辑已保存半份记录保持原比例，旧客户端克数按新实际摄入处理', async t => {
    const record = { food_name: '番茄炒蛋', meal_type: 'lunch', portion_g: 125, plate_portion_g: 250,
        consumed_percent: 50, calories_per_100g: 120, reference_portion_g: 250, async update(value) { Object.assign(this, value); } };
    t.mock.method(DietRecord, 'findOne', async () => record);
    const req = { user: { userId: 1 }, params: { id: 1 }, body: { platePortionG: 250, consumedPercent: 50 } };
    let res = response();
    await controller.updateDietRecord(req, res);
    assert.equal(res.statusCode, 200);
    assert.equal(record.calories, 150);
    req.body = { portionG: 200 };
    res = response();
    await controller.updateDietRecord(req, res);
    assert.equal(res.statusCode, 200);
    assert.equal(record.consumed_percent, 100);
    assert.equal(record.calories, 240);
    req.body = { platePortionG: 'bad' };
    res = response();
    await controller.updateDietRecord(req, res);
    assert.equal(res.statusCode, 400);
});
