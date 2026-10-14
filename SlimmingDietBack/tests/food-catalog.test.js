const test=require('node:test');
const assert=require('node:assert/strict');
const catalog=require('../data/nutrition/catalog.json');
const source=require('../data/nutrition/tfda-source-foods.json');
const {filterFoods}=require('../services/foodCatalogService');
const {attachCatalogNutrition}=require('../services/recognition/catalogNutrition');
test('成品库覆盖四餐，每个数字均保留来源与数据类型',()=>{
    assert.ok(catalog.length>=150);
    assert.equal(new Set(catalog.map(food=>food.catalog_key)).size,catalog.length);
    for(const meal of ['breakfast','lunch','dinner','snack'])assert.ok(filterFoods(catalog,{mealType:meal}).length>=30);
    for(const food of catalog){
        assert.ok(food.source_url&&food.nutrition_evidence&&food.nutrition_note);
        assert.ok(Number.isFinite(food.calories));
        assert.ok(['official_sample','recipe_estimate'].includes(food.nutrition_method));
        if(food.nutrition_method==='official_sample')assert.equal(food.calories,source[food.source_food_id].nutrients.calories);
        else{
            const evidence=food.nutrition_evidence;
            const total=evidence.ingredients.reduce((sum,item)=>sum+item.grams*item.per100g.calories/100,0);
            assert.ok(Math.abs(food.calories-total/evidence.finishedGrams*100)<=0.00501,food.name);
        }
    }
});
test('早餐筛选不混入盖饭，搜索支持别名并跨餐次，旧原料不再展示',()=>{
    const breakfast=filterFoods(catalog,{mealType:'breakfast'});
    assert.ok(!breakfast.some(food=>food.category==='盖饭套餐'));
    const matches=filterFoods(catalog,{query:'西红柿炒鸡蛋',mealType:'breakfast'});
    assert.equal(matches[0].name,'番茄炒蛋');
    assert.equal(filterFoods([{name:'生猪肉',is_ready_to_eat:false}],{query:'猪肉'}).length,0);
});
test('相同菜名按稳定目录ID匹配，糖度变体不会串用营养',()=>{
    const variants=catalog.filter(food=>food.name.startsWith('乌龙奶茶'));
    assert.equal(variants.length,3);
    const candidates=variants.map(food=>({catalogKey:food.catalog_key,name:'乌龙奶茶',provider:'local'}));
    const enriched=attachCatalogNutrition(candidates,variants.map((food,index)=>({...food,id:index+1})));
    assert.deepEqual(enriched.map(food=>food.caloriesPer100g),variants.map(food=>food.calories));
    assert.ok(enriched.every(food=>food.nutritionMatched));
});
test('缺失营养素保留null；茶汤每100克不伪装成每100毫升',()=>{
    const tea=catalog.find(food=>food.source_food_id==='O0700501');
    assert.equal(tea.fats,null);
    assert.equal(tea.nutrition_evidence.unit,'g');
    assert.match(tea.nutrition_note,/克不等于毫升/);
    const milkTea=catalog.filter(food=>food.name.includes('珍珠'));
    assert.ok(milkTea.every(food=>food.nutrition_method==='recipe_estimate'));
});
