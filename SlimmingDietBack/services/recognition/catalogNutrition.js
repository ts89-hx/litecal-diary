// Only explicit synonyms are merged. Similar names can have different recipes.
const ALIASES = { '西红柿炒蛋': '番茄炒蛋', '西红柿炒鸡蛋': '番茄炒蛋', '番茄炒鸡蛋': '番茄炒蛋' };
const canonicalName = name => {
    const clean = String(name || '').trim();
    return ALIASES[clean] || clean;
};

function attachCatalogNutrition(candidates, foods) {
    return candidates.map(candidate => {
        const matches = foods.filter(food => candidate.catalogKey ? food.catalog_key === candidate.catalogKey : canonicalName(food.name) === canonicalName(candidate.name));
        // Prefer an exact match; ambiguous aliases need manual selection.
        const food = matches.find(item => item.name === candidate.name) || (matches.length === 1 ? matches[0] : null);
        const validNutrition = food && food.calories != null && food.calories !== '' &&
            Number.isFinite(Number(food.calories)) && Number(food.calories) >= 0 && Number(food.calories) <= 1000;
        const reference = food && Number(food.default_portion_g);
        const validPortion = Number.isFinite(reference) && reference >= 10 && reference <= 3000;
        return {
            ...candidate,
            foodId: food ? food.id : null,
            name: food ? food.name : candidate.name,
            caloriesPer100g: validNutrition ? Number(food.calories) : null,
            referencePortionG: validPortion ? reference : null,
            nutritionSource: validNutrition ? (food.nutrition_source || '本地食物库参考值（来源待核验）') : null,
            nutritionNote: food ? food.nutrition_note : null,
            sourceUrl: food ? food.source_url : null,
            nutritionMethod: food ? food.nutrition_method : null,
            servingLabel: food ? food.serving_label : null,
            nutritionMatched: Boolean(validNutrition && validPortion),
        };
    });
}

module.exports = { attachCatalogNutrition };
