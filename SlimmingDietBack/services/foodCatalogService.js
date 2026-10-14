const normalize=value=>String(value||'').toLowerCase().replace(/西红柿/g,'番茄').replace(/炒鸡蛋/g,'炒蛋').replace(/[\s（）()·、]/g,'');
function filterFoods(foods,{query='',mealType='',category=''}={}) {
    const needle=normalize(query);
    return foods.filter(food=>{
        if(!food.is_ready_to_eat)return false;
        if(category&&food.category!==category)return false;
        // Search spans meal types; an empty search shows the selected meal.
        if(!needle&&mealType&&!(food.meal_types||[]).includes(mealType))return false;
        return !needle||[food.name,...(food.aliases||[])].some(name=>normalize(name).includes(needle));
    }).sort((a,b)=>{
        const rank=food=>normalize(food.name)===needle?0:(food.aliases||[]).some(alias=>normalize(alias)===needle)?1:2;
        return rank(a)-rank(b)||a.category.localeCompare(b.category,'zh-CN')||a.name.localeCompare(b.name,'zh-CN');
    });
}
module.exports={filterFoods};
