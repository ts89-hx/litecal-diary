const crypto = require('crypto');

const FIXTURES = [
    [
        { name: '鸡胸肉沙拉', caloriesPer100g: 118, confidence: 0.92 },
        { name: '蔬菜沙拉', caloriesPer100g: 68, confidence: 0.84 },
        { name: '轻食拼盘', caloriesPer100g: 126, confidence: 0.72 },
    ],
    [
        { name: '番茄炒蛋', caloriesPer100g: 105, confidence: 0.9 },
        { name: '西红柿鸡蛋', caloriesPer100g: 102, confidence: 0.83 },
        { name: '家常炒蛋', caloriesPer100g: 144, confidence: 0.7 },
    ],
    [
        { name: '牛肉饭', caloriesPer100g: 158, confidence: 0.88 },
        { name: '杂粮饭套餐', caloriesPer100g: 132, confidence: 0.78 },
        { name: '牛肉盖饭', caloriesPer100g: 171, confidence: 0.69 },
    ],
];

async function recognize(imageBuffer) {
    const hash = crypto.createHash('sha1').update(imageBuffer).digest();
    return FIXTURES[hash[0] % FIXTURES.length].map(item => ({ ...item, provider: 'mock' }));
}

module.exports = { recognize };
