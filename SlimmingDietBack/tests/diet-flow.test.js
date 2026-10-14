const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { resolveDietPortion } = require('../services/dietPortionService');
const { attachCatalogNutrition } = require('../services/recognition/catalogNutrition');

// These numbers describe a synthetic fixture, not a real recipe.
const food = { id: 1, name: '番茄炒蛋', calories: 120, default_portion_g: 250 };
const input = { platePortionG: 250, consumedPercent: 50, caloriesPer100g: 120, referencePortionG: 250, portionBasis: 'reference' };

test('250克吃一半只保存125克、150千卡，并保留整份依据', () => {
    const result = resolveDietPortion(input);
    assert.equal(result.portion_g, 125);
    assert.equal(result.calories, 150);
    assert.equal(result.plate_portion_g, 250);
    assert.equal(result.consumed_percent, 50);
    assert.equal(result.reference_portion_g, 250);
});

test('旧客户端分量按实际食用处理，小份食用不足10克也可保存', () => {
    assert.equal(resolveDietPortion({ portionG: 125, caloriesPer100g: 120 }).calories, 150);
    assert.equal(resolveDietPortion({ ...input, platePortionG: 10, consumedPercent: 25 }).portion_g, 2.5);
    assert.equal(resolveDietPortion({ ...input, caloriesPer100g: 0 }).calories, 0);
});

test('拦截空值、NaN、无穷大、负值和越界输入，不能把未知热量变为零', () => {
    for (const value of [undefined, null, '', 'wrong', Infinity, -1, 1001]) {
        assert.throws(() => resolveDietPortion({ ...input, caloriesPer100g: value }));
    }
    for (const value of [undefined, '', 'wrong', Infinity, 0, 9, 3001]) {
        assert.throws(() => resolveDietPortion({ ...input, platePortionG: value }));
    }
    for (const value of ['', 'wrong', Infinity, 0, -50, 101]) {
        assert.throws(() => resolveDietPortion({ ...input, consumedPercent: value }));
    }
});

test('匹配明确菜名别名后使用本地营养值，而非识别服务自带热量', () => {
    const [result] = attachCatalogNutrition([{ name: '西红柿炒蛋', caloriesPer100g: 999 }], [food]);
    assert.equal(result.foodId, 1);
    assert.equal(result.caloriesPer100g, 120);
    assert.equal(result.referencePortionG, 250);
    assert.equal(result.nutritionMatched, true);
});

test('不存在的成品菜不能匹配生食材，也不能使用供应商热量兜底', () => {
    const [result] = attachCatalogNutrition([{ name: '番茄炒蛋', caloriesPer100g: 999 }], [{ ...food, name: '番茄' }]);
    assert.equal(result.nutritionMatched, false);
    assert.equal(result.caloriesPer100g, null);
    assert.equal(result.referencePortionG, null);
});

function loadPage(relativePath, api = {}) {
    const source = fs.readFileSync(path.join(__dirname, '../..', relativePath), 'utf8');
    const script = source.match(/<script>([\s\S]*?)<\/script>/)[1]
        .replace(/^import .*;\s*$/gm, '').replace('export default', 'module.exports =');
    const context = { module: { exports: {} }, uni: { showToast() {} }, recipes: [], ...api };
    vm.runInNewContext(script, context);
    const component = context.module.exports;
    const page = component.data();
    for (const [key, method] of Object.entries(component.methods)) page[key] = method.bind(page);
    for (const [key, getter] of Object.entries(component.computed)) Object.defineProperty(page, key, { get: getter.bind(page) });
    return page;
}

test('页面先显示参考整份；调整吃一半、重量后再确认，提交整份和比例', async () => {
    let payload;
    const page = loadPage('pages/diet_records/diet_records.vue', { createDietRecord: async body => { payload = body; } });
    page.selectManual(food);
    assert.equal(page.referenceCalories, 300);
    assert.equal(page.draftCalories, 300);
    assert.equal(page.canSave, false);
    page.setRatio(50);
    assert.equal(page.eatenGrams, 125);
    assert.equal(page.draftCalories, 150);
    page.confirmed = true;
    assert.equal(page.canSave, true);
    page.draft.platePortionG = 200;
    page.changeWeight();
    assert.equal(page.canSave, false);
    assert.equal(page.referenceCalories, 300);
    assert.equal(page.draftCalories, 120);
    await page.save();
    assert.equal(payload, undefined);
    page.confirmed = true;
    await page.save();
    assert.equal(payload.platePortionG, 200);
    assert.equal(payload.consumedPercent, 50);
    assert.equal(payload.portionG, undefined);
    assert.equal(resolveDietPortion(payload).calories, page.draftCalories);
});

test('更换菜品会同时替换营养、参考分量并重置食用比例与确认', () => {
    const page = loadPage('pages/diet_records/diet_records.vue');
    page.selectManual(food);
    page.setRatio(50);
    page.confirmed = true;
    page.replaceFood({ id: 2, name: '米饭', calories: 116, default_portion_g: 150 });
    assert.equal(page.draft.foodId, 2);
    assert.equal(page.draftCalories, 174);
    assert.equal(page.draft.consumedPercent, 100);
    assert.equal(page.canSave, false);
});

test('模拟结果、缺失营养、识别空结果都不能直接保存', async () => {
    const page = loadPage('pages/diet_records/diet_records.vue', { recognizeFood: async () => ({ data: { candidates: [] } }) });
    page.applyCandidate({ name: '番茄炒蛋', caloriesPer100g: 120, referencePortionG: 250, provider: 'mock' });
    page.confirmed = true;
    assert.equal(page.canSave, false);
    page.applyCandidate({ name: '未知菜', caloriesPer100g: null, referencePortionG: null, provider: 'local' });
    assert.equal(page.hasNutrition, false);
    assert.equal(page.canSave, false);
    await page.runRecognition('empty-result.jpg');
    assert.match(page.recognitionError, /未识别到菜品/);
    assert.equal(page.showEditor, false);
});

test('编辑已有半份记录不再次减半，零热量记录不回退到总热量', () => {
    const page = loadPage('pages/record/record.vue');
    page.openEdit({ id: 1, food_name: '番茄炒蛋', portion_g: 125, plate_portion_g: 250, consumed_percent: 50, calories_per_100g: 120, calories: 150 });
    assert.equal(page.editGrams, 125);
    assert.equal(page.editCalories, 150);
    assert.equal(resolveDietPortion(page.editForm).calories, 150);
    page.openEdit({ id: 2, food_name: '测试', portion_g: 100, calories_per_100g: 0, calories: 50 });
    assert.equal(page.editCalories, 0);
});
