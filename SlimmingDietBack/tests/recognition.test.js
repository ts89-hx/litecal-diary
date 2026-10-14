const test = require('node:test');
const assert = require('node:assert/strict');
const mockProvider = require('../services/recognition/mockProvider');

test('模拟识餐对同一图片返回稳定的标准化候选', async () => {
    const image = Buffer.from('lite-calorie-demo-image');
    const first = await mockProvider.recognize(image);
    const second = await mockProvider.recognize(image);
    assert.deepEqual(first, second);
    assert.equal(first.length, 3);
    assert.equal(first[0].provider, 'mock');
    assert.equal(typeof first[0].caloriesPer100g, 'number');
});
