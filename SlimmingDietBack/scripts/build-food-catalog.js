const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const root = path.join(__dirname, '../data/nutrition');
const sources = require('../data/nutrition/tfda-source-foods.json');
const selection = require('../data/nutrition/selection');
const { ingredients, recipes } = require('../data/nutrition/recipes');
const manifest = require('../data/nutrition/source-manifest.json');
const fields = ['calories','proteins','fats','carbs'];
const precision = value => Math.round(value * 100) / 100;
const sourceUrl = 'https://data.gov.tw/dataset/8543';
function nutrientValues(source) {
    if (!source) throw new Error('Unknown source food');
    for (const field of fields) {
        if (field==='calories' && !Number.isFinite(source.nutrients[field])) throw new Error(`Missing energy: ${source.id}`);
        if (source.nutrients[field] != null && (!Number.isFinite(source.nutrients[field]) || source.nutrients[field]<0)) throw new Error(`Invalid ${field}: ${source.id}`);
    }
    return Object.fromEntries(fields.map(field => [field, source.nutrients[field] ?? null]));
}
const catalog = selection.map(item => {
    const source = sources[item.sourceId];
    const drink = item.category==='奶茶饮品';
    return {
        catalog_key: item.key, name:item.name, category:item.category, aliases:item.aliases,
        meal_types:item.meals, default_portion_g:item.grams, serving_label:item.serving,
        recognition_label:item.recognitionLabel, is_ready_to_eat:true,
        ...nutrientValues(source), nutrition_method:'official_sample',
        nutrition_source:'TFDA官方样品参考值', source_url:sourceUrl, source_food_id:source.id,
        nutrition_note:`样品原名：${source.name}。${source.description || ''}。数据为该样品每100克含量，店铺或品牌配方可能不同。参考份量是产品设定，非实测。${drink?'按可饮用部分净重计算；克不等于毫升，杯型不能直接换算净重。':''}`,
        nutrition_evidence:{publisher:manifest.publisher,sourceId:source.id,sourceName:source.name,description:source.description,unit:'g',energyField:'熱量',retrievedAt:manifest.retrievedAt,rawSha256:manifest.rawSha256},
    };
});
const recipeResults = new Map();
for (const recipe of recipes) {
    const totals = Object.fromEntries(fields.map(field=>[field,0]));
    const evidence = recipe.items.map(([key,grams]) => {
        let item;
        if (key==='water') item={name:'水',...Object.fromEntries(fields.map(field=>[field,0])),sourceId:'water:zero-energy'};
        else if (key.startsWith('@')) {
            const dependency=recipeResults.get(`recipe:${key.slice(1)}`);
            if (!dependency) throw new Error(`Recipe dependency missing: ${key}`);
            item={...dependency,sourceId:dependency.catalog_key};
        } else {
            const spec=ingredients[key];
            if (!spec) throw new Error(`Ingredient missing: ${key}`);
            const source=sources[spec[0]];
            item={...nutrientValues(source),name:spec[1],sourceId:source.id,sourceName:source.name,description:source.description};
        }
        for (const field of fields) totals[field]=totals[field]==null||item[field]==null?null:totals[field]+item[field]*grams/100;
        return {name:item.name,grams,sourceId:item.sourceId,sourceName:item.sourceName,description:item.description,per100g:Object.fromEntries(fields.map(field=>[field,item[field]]))};
    });
    const result={
        catalog_key:recipe.key,name:recipe.name,category:recipe.category,aliases:recipe.aliases,meal_types:recipe.meals,
        default_portion_g:recipe.grams,serving_label:recipe.serving,
        recognition_label:recipe.name.replace(/（.*?）/g,''),is_ready_to_eat:true,
        ...Object.fromEntries(fields.map(field=>[field,totals[field]==null?null:precision(totals[field]/recipe.grams*100)])),
        nutrition_method:'recipe_estimate',nutrition_source:'参考配方估算（TFDA原料数据）',source_url:sourceUrl,source_food_id:recipe.key,
        nutrition_note:`配方：${evidence.map(item=>`${item.name}${item.grams}克`).join('、')}；假设成品${recipe.grams}克。默认原料热量全部留在成品，未校正弃汤、吸油及烹调损耗；并非成品实测。`,
        nutrition_evidence:{method:'sum(ingredient kcal/100g × grams/100) / assumed finished grams × 100',finishedGrams:recipe.grams,ingredients:evidence,energyRetentionAssumption:1,rawSha256:manifest.rawSha256},
    };
    recipeResults.set(recipe.key,result);
    catalog.push(result);
}
const keys=new Set(),names=new Set();
for (const item of catalog) {
    if(keys.has(item.catalog_key)||names.has(item.name))throw new Error(`Duplicate: ${item.name}`);
    keys.add(item.catalog_key);names.add(item.name);
    if(item.calories<0||item.calories>1000||item.default_portion_g<10||item.default_portion_g>3000)throw new Error(`Invalid nutrition/portion: ${item.name}`);
    if(!item.source_url||!item.nutrition_evidence)throw new Error(`Missing provenance: ${item.name}`);
}
const json=JSON.stringify(catalog,null,2)+'\n';
fs.writeFileSync(path.join(root,'catalog.json'),json);
const report={version:1,foodCount:catalog.length,officialSamples:selection.length,referenceRecipes:recipes.length,
    mealCounts:Object.fromEntries(['breakfast','lunch','dinner','snack'].map(meal=>[meal,catalog.filter(item=>item.meal_types.includes(meal)).length])),
    categoryCounts:catalog.reduce((result,item)=>({...result,[item.category]:(result[item.category]||0)+1}),{}),
    catalogSha256:crypto.createHash('sha256').update(json).digest('hex'),sourceManifest:manifest,
    exclusions:['未将生肉、生米、干面、冷冻生饺直接当成即食菜品','珍珠奶茶官方数据分析的是上层澄清液，未直接当作含珍珠整杯；使用明确原料配方估算','无可核验品牌规格的商品未冠以品牌名称']};
fs.writeFileSync(path.join(root,'catalog-audit.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
