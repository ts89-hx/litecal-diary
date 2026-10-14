// Curated recipes. Calories are estimates for the listed prepared portions.
export const recipes = [
  { id: 'salad', name: '鸡胸肉蔬菜沙拉', meal: 'lunch', portion: 300, calories: 354, image: '/static/11/sala.png', ingredients: '熟鸡胸肉100克、生菜80克、番茄80克、玉米30克、油醋汁10克', steps: ['鸡胸肉充分煮熟后切片。', '蔬菜洗净沥干，番茄切块，玉米煮熟。', '拌匀食材和油醋汁，按实际食用分量记录。'] },
  { id: 'egg-rice', name: '番茄鸡蛋配米饭', meal: 'lunch', portion: 350, calories: 455, image: '', ingredients: '熟米饭150克、番茄120克、鸡蛋70克、食用油5克及少量调味料', steps: ['番茄切块，鸡蛋打散。', '少油炒熟鸡蛋，加入番茄炒软。', '搭配称重后的熟米饭食用。'] },
  { id: 'oats', name: '牛奶燕麦早餐', meal: 'breakfast', portion: 300, calories: 330, image: '', ingredients: '燕麦40克、牛奶200克、香蕉60克', steps: ['将燕麦与牛奶混合，小火煮至软糯。', '香蕉切片，待燕麦稍凉后加入。', '不额外加糖，按成品实际重量调整记录。'] },
  { id: 'tofu', name: '菌菇豆腐配杂粮饭', meal: 'dinner', portion: 400, calories: 420, image: '', ingredients: '豆腐150克、菌菇100克、熟杂粮饭140克、油及调味料10克', steps: ['豆腐切块，菌菇清洗切片。', '少油炒香菌菇，加豆腐与少量水焖熟。', '搭配熟杂粮饭，调味后食用。'] },
];

export function dailyRecipes(date) {
  const day = Math.floor(new Date(date + 'T00:00:00Z').getTime() / 86400000);
  return [recipes[2], recipes[Math.abs(day) % 2], recipes[3]];
}
