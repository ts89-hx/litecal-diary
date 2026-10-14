const BREAKFAST = [
  {
    id: 'autumn-pear-oats', meal: 'breakfast', mealName: '早餐', name: '秋梨燕麦酸奶杯',
    calories: 330, portion: 300, duration: 8, feature: '高纤轻甜',
    ingredientsText: '秋梨 · 燕麦 · 无糖酸奶', art: '/static/discover/recipe-breakfast.svg',
    ingredients: [{ name: '秋梨', amount: '120g', icon: 'pear' }, { name: '无糖酸奶', amount: '150g', icon: 'yogurt' }, { name: '即食燕麦', amount: '25g', icon: 'oats' }, { name: '原味坚果', amount: '10g', icon: 'nuts' }],
    steps: [{ title: '处理秋梨', detail: '洗净后切成小块，保留果皮增加膳食纤维。', time: '约 3 分钟' }, { title: '组合装杯', detail: '依次加入酸奶、燕麦和秋梨，撒上坚果。', time: '约 5 分钟' }],
  },
  {
    id: 'pumpkin-millet-porridge', meal: 'breakfast', mealName: '早餐', name: '南瓜小米粥配鸡蛋',
    calories: 345, portion: 360, duration: 25, feature: '温暖饱腹',
    ingredientsText: '南瓜 · 小米 · 鸡蛋', art: '/static/discover/recipe-breakfast.svg',
    ingredients: [{ name: '贝贝南瓜', amount: '100g', icon: 'pumpkin' }, { name: '小米', amount: '45g', icon: 'oats' }, { name: '鸡蛋', amount: '1个', icon: 'egg' }, { name: '清水', amount: '适量', icon: 'water' }],
    steps: [{ title: '熬煮小米粥', detail: '小米洗净，与南瓜块一同加水煮至软糯。', time: '约 20 分钟' }, { title: '搭配鸡蛋', detail: '鸡蛋煮熟切开，与南瓜小米粥一同食用。', time: '约 5 分钟' }],
  },
  {
    id: 'apple-toast', meal: 'breakfast', mealName: '早餐', name: '苹果肉桂全麦吐司',
    calories: 318, portion: 240, duration: 12, feature: '清甜快手',
    ingredientsText: '苹果 · 全麦吐司 · 鸡蛋', art: '/static/discover/recipe-breakfast.svg',
    ingredients: [{ name: '苹果', amount: '100g', icon: 'pear' }, { name: '全麦吐司', amount: '2片', icon: 'oats' }, { name: '鸡蛋', amount: '1个', icon: 'egg' }, { name: '肉桂粉', amount: '少量', icon: 'nuts' }],
    steps: [{ title: '煎软苹果', detail: '苹果切薄片，小火加热并撒少量肉桂粉。', time: '约 6 分钟' }, { title: '组合吐司', detail: '吐司烘热，铺上苹果片并搭配水煮蛋。', time: '约 6 分钟' }],
  },
];

const LUNCH = [
  {
    id: 'lotus-shrimp-quinoa', meal: 'lunch', mealName: '午餐', name: '莲藕虾仁藜麦碗',
    calories: 460, portion: 380, duration: 22, feature: '均衡主食',
    ingredientsText: '莲藕 · 虾仁 · 藜麦', art: '/static/discover/recipe-lunch.svg',
    ingredients: [{ name: '莲藕', amount: '100g', icon: 'lotus' }, { name: '虾仁', amount: '120g', icon: 'shrimp' }, { name: '熟藜麦', amount: '120g', icon: 'oats' }, { name: '时蔬', amount: '80g', icon: 'spinach' }],
    steps: [{ title: '煮熟主食', detail: '藜麦煮熟沥水，莲藕切片后焯熟。', time: '约 14 分钟' }, { title: '炒虾仁装碗', detail: '虾仁少油炒熟，与藜麦、莲藕和时蔬组合。', time: '约 8 分钟' }],
  },
  {
    id: 'mushroom-chicken-rice', meal: 'lunch', mealName: '午餐', name: '菌菇鸡胸糙米饭',
    calories: 472, portion: 400, duration: 25, feature: '高蛋白',
    ingredientsText: '菌菇 · 鸡胸 · 糙米', art: '/static/discover/recipe-lunch.svg',
    ingredients: [{ name: '菌菇', amount: '120g', icon: 'mushroom' }, { name: '鸡胸肉', amount: '120g', icon: 'chicken' }, { name: '熟糙米', amount: '140g', icon: 'oats' }, { name: '西兰花', amount: '80g', icon: 'spinach' }],
    steps: [{ title: '准备食材', detail: '鸡胸肉切块腌制，菌菇和西兰花洗净。', time: '约 8 分钟' }, { title: '炒熟组合', detail: '少油炒熟鸡胸和菌菇，搭配糙米与西兰花。', time: '约 17 分钟' }],
  },
  {
    id: 'sweet-potato-beef-bowl', meal: 'lunch', mealName: '午餐', name: '红薯牛肉暖食碗',
    calories: 485, portion: 410, duration: 28, feature: '铁元素丰富',
    ingredientsText: '红薯 · 牛肉 · 羽衣甘蓝', art: '/static/discover/recipe-lunch.svg',
    ingredients: [{ name: '红薯', amount: '150g', icon: 'pumpkin' }, { name: '瘦牛肉', amount: '110g', icon: 'chicken' }, { name: '羽衣甘蓝', amount: '80g', icon: 'spinach' }, { name: '玉米粒', amount: '50g', icon: 'oats' }],
    steps: [{ title: '蒸熟红薯', detail: '红薯切块蒸熟，蔬菜洗净后焯水。', time: '约 18 分钟' }, { title: '煎牛肉装碗', detail: '牛肉煎熟切片，与红薯和蔬菜组合。', time: '约 10 分钟' }],
  },
];

const DINNER = [
  {
    id: 'pumpkin-chicken-salad', meal: 'dinner', mealName: '晚餐', name: '南瓜鸡胸温沙拉',
    calories: 390, portion: 350, duration: 20, feature: '高蛋白',
    ingredientsText: '南瓜 · 鸡胸 · 菠菜 · 菌菇', art: '/static/discover/recipe-dinner.svg',
    ingredients: [{ name: '贝贝南瓜', amount: '150g', icon: 'pumpkin' }, { name: '鸡胸肉', amount: '120g', icon: 'chicken' }, { name: '菠菜', amount: '80g', icon: 'spinach' }, { name: '菌菇与调味料', amount: '适量', icon: 'mushroom' }],
    steps: [{ title: '蒸南瓜、煎鸡胸', detail: '南瓜切块蒸熟；鸡胸肉煎熟后切片。', time: '约 12 分钟' }, { title: '焯蔬菜、混合调味', detail: '菠菜、菌菇焯熟，与其他食材混合。', time: '约 8 分钟' }],
  },
  {
    id: 'tofu-mushroom-soup', meal: 'dinner', mealName: '晚餐', name: '菌菇豆腐蔬菜汤',
    calories: 342, portion: 430, duration: 18, feature: '清爽暖胃',
    ingredientsText: '豆腐 · 菌菇 · 青菜', art: '/static/discover/recipe-dinner.svg',
    ingredients: [{ name: '北豆腐', amount: '150g', icon: 'tofu' }, { name: '菌菇', amount: '120g', icon: 'mushroom' }, { name: '青菜', amount: '100g', icon: 'spinach' }, { name: '玉米', amount: '60g', icon: 'oats' }],
    steps: [{ title: '煮菌菇豆腐', detail: '水开后放入菌菇和豆腐，中火煮熟。', time: '约 12 分钟' }, { title: '加入蔬菜', detail: '加入青菜和玉米，调味后再煮片刻。', time: '约 6 分钟' }],
  },
  {
    id: 'salmon-buckwheat-salad', meal: 'dinner', mealName: '晚餐', name: '三文鱼荞麦沙拉',
    calories: 405, portion: 360, duration: 20, feature: '优质脂肪',
    ingredientsText: '三文鱼 · 荞麦 · 西兰花', art: '/static/discover/recipe-dinner.svg',
    ingredients: [{ name: '三文鱼', amount: '100g', icon: 'fish' }, { name: '熟荞麦', amount: '100g', icon: 'oats' }, { name: '西兰花', amount: '100g', icon: 'spinach' }, { name: '小番茄', amount: '60g', icon: 'tomato' }],
    steps: [{ title: '煎三文鱼', detail: '三文鱼擦干水分，小火煎至完全熟透。', time: '约 10 分钟' }, { title: '组合沙拉', detail: '荞麦和西兰花煮熟，加入番茄与三文鱼。', time: '约 10 分钟' }],
  },
];

export const discoverRecipes = [...BREAKFAST, ...LUNCH, ...DINNER];

export const knowledgeArticles = [
  { id: 'dinner-balance', category: '搭配', title: '减脂期晚餐越少越好吗？', summary: '学会用“蛋白质 + 蔬菜 + 主食”搭配', minutes: 3, icon: '/static/discover/knowledge-meal.svg', tone: 'orange', tips: ['晚餐无需完全避开主食，重点是控制全天总量。', '优先保证蛋白质和蔬菜，主食可选择粗粮或薯类。', '距离睡眠至少留出约两小时，避免临睡前大量进食。'] },
  { id: 'fruit-plan', category: '常识', title: '水果怎样安排更合适？', summary: '选择完整水果，并关注全天总量', minutes: 4, icon: '/static/discover/knowledge-fruit.svg', tone: 'green', tips: ['优先选择完整水果，而不是果汁。', '水果可以放在早餐、加餐或运动后，按全天饮食灵活安排。', '不同水果热量不同，不必迷信单一“减脂水果”。'] },
  { id: 'food-label', category: '选购技巧', title: '读懂配料表的 3 个位置', summary: '配料顺序、营养成分与每份重量', minutes: 5, icon: '/static/discover/knowledge-label.svg', tone: 'blue', tips: ['配料通常按添加量从高到低排列。', '比较热量时先确认标示的是每100克还是每份。', '同时关注蛋白质、脂肪、糖和钠，不只看一个数字。'] },
  { id: 'protein-distribution', category: '基础营养', title: '蛋白质如何分配到三餐？', summary: '平均分配，比集中在一餐更容易坚持', minutes: 4, icon: '/static/discover/knowledge-protein.svg', tone: 'purple', tips: ['每餐都安排一种蛋白质来源。', '鸡蛋、奶、豆制品、鱼虾和瘦肉可以轮换。', '具体需要量会因体重、运动量和健康状况而不同。'] },
];

const SEASONS = [
  { months: [3, 4, 5], name: '春日时令', ingredients: '春笋 · 菠菜 · 草莓' },
  { months: [6, 7, 8], name: '夏日时令', ingredients: '番茄 · 黄瓜 · 玉米' },
  { months: [9, 10, 11], name: '秋日时令', ingredients: '南瓜 · 莲藕 · 秋梨' },
  { months: [12, 1, 2], name: '冬日时令', ingredients: '萝卜 · 白菜 · 柑橘' },
];

function dayIndex(date) {
  const value = date instanceof Date ? date : new Date(date || Date.now());
  return Math.floor(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()) / 86400000);
}

export function getSeason(date = new Date()) {
  const month = date.getMonth() + 1;
  return SEASONS.find(item => item.months.includes(month)) || SEASONS[2];
}

export function getDailyRecommendations(date = new Date()) {
  const index = Math.abs(dayIndex(date));
  return [BREAKFAST[index % BREAKFAST.length], LUNCH[(index + 1) % LUNCH.length], DINNER[(index + 2) % DINNER.length]];
}

export function findDiscoverRecipe(id) {
  return discoverRecipes.find(item => item.id === id);
}

export function findKnowledgeArticle(id) {
  return knowledgeArticles.find(item => item.id === id);
}
