require('dotenv').config();
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const DietSelection = require('../models/dietSelection');
const catalog = require('../data/nutrition/catalog.json');

async function migrateFoodCatalog() {
    const qi=sequelize.getQueryInterface();
    const existing=await qi.describeTable('diet_selections');
    const definitions={
        catalog_key:{type:DataTypes.STRING,allowNull:true,unique:true},
        is_ready_to_eat:{type:DataTypes.BOOLEAN,allowNull:false,defaultValue:false},
        meal_types:{type:DataTypes.JSON,allowNull:true},aliases:{type:DataTypes.JSON,allowNull:true},
        serving_label:{type:DataTypes.STRING,allowNull:true},recognition_label:{type:DataTypes.STRING,allowNull:true},
        nutrition_method:{type:DataTypes.STRING,allowNull:true},source_url:{type:DataTypes.STRING(1024),allowNull:true},
        source_food_id:{type:DataTypes.STRING,allowNull:true},nutrition_evidence:{type:DataTypes.JSON,allowNull:true},
    };
    for(const [name,definition] of Object.entries(definitions))if(!existing[name])await qi.addColumn('diet_selections',name,definition);
    if(!/FLOAT/i.test(existing.calories.type))await qi.changeColumn('diet_selections','calories',{type:DataTypes.FLOAT,allowNull:false});
    for(const name of ['carbs','fats','proteins'])if(!existing[name].allowNull)await qi.changeColumn('diet_selections',name,{type:DataTypes.FLOAT,allowNull:true});
    await sequelize.transaction(async transaction=>{
        for(const item of catalog) {
            const [row,created]=await DietSelection.findOrCreate({where:{catalog_key:item.catalog_key},defaults:item,transaction});
            if(!created)await row.update(item,{transaction});
        }
    });
    console.log(`成品食物库已同步：${catalog.length}项；旧食材条目保留在底库，历史记录不变。`);
}
module.exports={migrateFoodCatalog};
