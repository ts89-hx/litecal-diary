const { calculatePortionCalories } = require('./calorieService');

// portion_g always means the amount eaten. The plate and percentage are saved
// separately so neither the dashboard nor later edits apply the percentage twice.
function resolveDietPortion(body) {
    const hasPlate = body.platePortionG != null;
    const platePortionG = Number(hasPlate ? body.platePortionG : body.portionG);
    const consumedPercent = Number(body.consumedPercent == null ? 100 : body.consumedPercent);
    const caloriesPer100g = Number(body.caloriesPer100g);
    if (!Number.isFinite(platePortionG) || platePortionG < 10 || platePortionG > 3000) {
        throw new Error('请填写10至3000克的整份重量');
    }
    if (!Number.isFinite(consumedPercent) || consumedPercent < 1 || consumedPercent > 100) {
        throw new Error('请填写1%至100%的食用比例');
    }
    if (body.caloriesPer100g == null || body.caloriesPer100g === '' ||
        !Number.isFinite(caloriesPer100g) || caloriesPer100g < 0 || caloriesPer100g > 1000) {
        throw new Error('缺少有效营养数据，请重新选择食物');
    }
    const portionG = Math.round(platePortionG * consumedPercent) / 100;
    const referencePortionG = body.referencePortionG == null ? null : Number(body.referencePortionG);
    if (referencePortionG != null && (!Number.isFinite(referencePortionG) || referencePortionG < 10 || referencePortionG > 3000)) {
        throw new Error('参考分量无效，请重新选择食物');
    }
    return {
        portion_g: portionG,
        plate_portion_g: platePortionG,
        consumed_percent: consumedPercent,
        reference_portion_g: referencePortionG,
        portion_basis: ['reference', 'entered'].includes(body.portionBasis) ? body.portionBasis : 'entered',
        calories_per_100g: caloriesPer100g,
        calories: calculatePortionCalories(caloriesPer100g, portionG),
    };
}

module.exports = { resolveDietPortion };
