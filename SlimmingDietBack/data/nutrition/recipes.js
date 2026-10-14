// Every quantity below is an explicit reference recipe assumption, not a
// photographed weight. Raw/cooked ingredient states come from the source IDs.
const ingredients = {
    rice: ['A05002','生大米'], millet:['A0200101','生小米'], oats:['A0810201','即食燕麦片（干）'],
    noodles:['R2000101','干面条'], flour:['A0320301','中筋面粉'],
    tomato:['E74001','生番茄'], egg:['K01001','生鸡蛋可食部分'],
    chicken:['I0402402','生去皮鸡胸肉'], thigh:['I0404501','生去皮去骨鸡腿肉'],
    pork:['I0306101','生猪里脊肉'], mince:['I0310402','生猪绞肉（90%瘦肉率）'],
    belly:['I0308201','生带皮五花肉'], beef:['I0108101','生牛后腿肉'],
    shrimp:['J2200401','生虾仁'], fish:['J0412003','生罗非鱼片'],
    tofu:['R4700902','传统豆腐'], softTofu:['R4701201','嫩豆腐'],
    potato:['B0700202','生土豆'], carrot:['E02001','生胡萝卜'], pepper:['E7500101','生青椒'],
    eggplant:['E7300101','生茄子'], broccoli:['E5800402','生西兰花'],
    spinach:['E5000101','生菠菜'], cabbage:['E30001','生包菜'], cucumber:['E6400101','生黄瓜'],
    onion:['E2400101','生洋葱'], pumpkin:['E6300102','生南瓜'],
    mushroom:['G08001','鲜香菇'], buttonMushroom:['G2000101','鲜蘑菇'],
    woodEar:['G0100101','鲜木耳'], beanSprout:['E7700701','绿豆芽'],
    oil:['M1100101','大豆油'], sesameOil:['M1500101','芝麻油'],
    soy:['P0700101','酱油'], sugar:['N0100301','红砂糖'], vinegar:['P0600101','米醋'],
    garlic:['E2100101','蒜'], ginger:['E1900103','姜'], starch:['B0720101','土豆淀粉'],
    beanPaste:['P1004201','辣豆瓣酱'], ketchup:['P1003501','番茄酱'],
    peanut:['R7101501','熟花生仁'], peanutButter:['P1300901','花生酱'],
    milk:['L01021','全脂牛奶'], soyMilk:['H1150201','无糖豆浆'],
    tea:['O0700501','无糖红茶汤'], pearls:['R4100201','粉圆（未煮）'],
    banana:['D08001','去皮香蕉'], redBean:['H0405101','干红豆'], greenBean:['H0705102','干绿豆'],
    corn:['R1600101','玉米粒罐头'], bread:['Q1000101','白吐司'],
    burgerBun:['Q1001001','汉堡面包'],
};
const recipes = [];
function add(key, name, grams, items, category='家常菜', meals=['lunch','dinner'], aliases=[]) {
    recipes.push({key:`recipe:${key}`,name,grams,items,category,meals,aliases,serving:category==='盖饭套餐'?'1碗':'1份',recognitionLabel:name});
}
add('rice','米饭（参考配方）',150,[['rice',60],['water',90]],'主食面点',['breakfast','lunch','dinner'],['米饭','白米饭']);
add('congee','白粥（参考配方）',350,[['rice',35],['water',315]],'早餐粥品',['breakfast','dinner'],['白粥','大米粥']);
add('millet-congee','小米粥',350,[['millet',35],['water',315]],'早餐粥品',['breakfast','dinner']);
add('pumpkin-congee','南瓜小米粥',400,[['millet',30],['pumpkin',100],['water',280]],'早餐粥品',['breakfast','dinner']);
add('pork-congee','香菇瘦肉粥',400,[['rice',35],['pork',60],['mushroom',30],['ginger',3],['oil',3],['water',300]],'早餐粥品',['breakfast','lunch','dinner']);
add('chicken-congee','鸡丝粥',400,[['rice',35],['chicken',70],['ginger',3],['sesameOil',3],['water',310]],'早餐粥品',['breakfast','lunch','dinner']);
add('milk-oats','牛奶燕麦粥',300,[['oats',40],['milk',200],['water',60]],'早餐粥品',['breakfast','snack']);
add('banana-oats','香蕉牛奶燕麦',350,[['oats',40],['milk',200],['banana',100],['water',10]],'早餐粥品',['breakfast','snack']);
add('egg-pancake','鸡蛋饼',160,[['flour',50],['egg',50],['oil',5],['water',70]],'早餐点心',['breakfast','snack']);
add('egg-toast','鸡蛋三明治（无沙拉酱）',150,[['bread',60],['egg',50],['cucumber',40],['oil',3]],'早餐点心',['breakfast','snack']);
add('beef-burger','牛肉汉堡（番茄酱、无芝士）',220,[['burgerBun',80],['beef',120],['tomato',30],['cucumber',20],['ketchup',15],['oil',5]],'主食面点',['lunch','dinner','snack'],['汉堡','牛肉汉堡']);
add('tomato-egg','番茄炒蛋',280,[['tomato',200],['egg',100],['oil',10],['soy',3]],'家常菜',['lunch','dinner'],['西红柿炒蛋','西红柿炒鸡蛋','番茄炒鸡蛋']);
add('pepper-pork','青椒肉丝',250,[['pork',120],['pepper',130],['oil',10],['soy',8],['starch',4]]);
add('yuxiang-pork','鱼香肉丝',300,[['pork',100],['carrot',60],['woodEar',50],['pepper',50],['oil',12],['soy',8],['sugar',10],['vinegar',10],['beanPaste',10],['starch',5]]);
add('kungpao','宫保鸡丁',300,[['chicken',150],['cucumber',80],['peanut',25],['oil',12],['soy',10],['sugar',10],['vinegar',10],['starch',5]]);
add('mushroom-chicken','香菇滑鸡',300,[['thigh',180],['mushroom',100],['oil',8],['soy',10],['ginger',5],['starch',5]]);
add('braised-chicken','黄焖鸡（去骨）',350,[['thigh',180],['potato',100],['mushroom',60],['pepper',40],['oil',10],['soy',12],['sugar',5]],'家常菜',['lunch','dinner'],['黄焖鸡']);
add('milk-chicken','牛奶炖鸡肉土豆',350,[['chicken',150],['potato',120],['carrot',60],['onion',50],['oil',12],['milk',50]],'家常菜',['lunch','dinner']);
add('broccoli-beef','西兰花炒牛肉',300,[['beef',120],['broccoli',180],['oil',10],['soy',8],['garlic',5],['starch',4]]);
add('onion-beef','洋葱炒牛肉',280,[['beef',150],['onion',130],['oil',12],['soy',10],['starch',5]]);
add('tomato-beef','番茄炖牛肉',400,[['beef',150],['tomato',200],['onion',50],['oil',8],['soy',8],['water',80]]);
add('potato-beef','土豆炖牛肉',400,[['beef',150],['potato',150],['carrot',60],['oil',10],['soy',10],['water',100]]);
add('braised-pork','红烧肉',250,[['belly',250],['oil',5],['soy',15],['sugar',15],['ginger',5],['water',60]]);
add('twice-pork','回锅肉',280,[['belly',180],['pepper',80],['cabbage',60],['oil',5],['beanPaste',15],['soy',5]]);
add('sweet-sour-pork','糖醋里脊',250,[['pork',180],['starch',30],['oil',25],['ketchup',25],['sugar',15],['vinegar',15]]);
add('mapo-tofu','麻婆豆腐（肉末）',350,[['tofu',250],['mince',50],['oil',12],['beanPaste',15],['soy',5],['starch',5],['water',40]]);
add('homestyle-tofu','家常豆腐',350,[['tofu',250],['carrot',40],['pepper',50],['woodEar',30],['oil',15],['soy',10]]);
add('mince-tofu','肉末蒸豆腐',350,[['softTofu',280],['mince',60],['soy',8],['sesameOil',3]]);
add('tomato-tofu','番茄豆腐',350,[['tofu',180],['tomato',180],['oil',8],['soy',5]]);
add('eggplant','鱼香茄子',300,[['eggplant',300],['oil',20],['beanPaste',15],['soy',8],['sugar',10],['vinegar',10],['garlic',5]]);
add('disanxian','地三鲜',300,[['potato',130],['eggplant',130],['pepper',60],['oil',25],['soy',10],['starch',5]]);
add('potato-shreds','酸辣土豆丝',250,[['potato',250],['pepper',20],['oil',10],['vinegar',10],['garlic',3]]);
add('stir-cabbage','手撕包菜',250,[['cabbage',300],['oil',10],['soy',8],['vinegar',5],['garlic',5]]);
add('garlic-broccoli','蒜蓉西兰花',250,[['broccoli',280],['oil',8],['garlic',8]]);
add('spinach','清炒菠菜',200,[['spinach',280],['oil',8],['garlic',5]]);
add('sprouts','清炒豆芽',250,[['beanSprout',280],['oil',8],['vinegar',5]]);
add('mushrooms','清炒蘑菇',250,[['buttonMushroom',300],['oil',8],['soy',5],['garlic',5]]);
add('cucumber','拍黄瓜',250,[['cucumber',240],['garlic',5],['soy',5],['vinegar',10],['sesameOil',5]]);
add('wood-ear','凉拌木耳',200,[['woodEar',180],['garlic',5],['soy',8],['vinegar',10],['sesameOil',5]]);
add('shrimp-egg','虾仁炒蛋',250,[['shrimp',120],['egg',150],['oil',10]]);
add('steamed-egg','蒸鸡蛋羹',250,[['egg',100],['water',150],['soy',5],['sesameOil',3]]);
add('steamed-fish','清蒸罗非鱼片',200,[['fish',220],['soy',10],['ginger',5],['oil',5]]);
add('tomato-egg-soup','番茄蛋花汤',400,[['tomato',100],['egg',50],['oil',3],['water',260]],'汤羹',['lunch','dinner']);
add('mushroom-tofu-soup','菌菇豆腐汤',400,[['softTofu',100],['buttonMushroom',80],['oil',3],['water',230]],'汤羹',['lunch','dinner']);
add('chicken-salad','鸡胸肉蔬菜沙拉（油醋汁）',350,[['chicken',150],['cucumber',80],['tomato',80],['corn',40],['oil',8],['vinegar',10]],'轻食沙拉',['lunch','dinner'],['鸡胸肉沙拉','鸡肉沙拉']);
add('tofu-salad','豆腐蔬菜沙拉（油醋汁）',350,[['tofu',150],['cucumber',100],['tomato',80],['oil',8],['vinegar',10]],'轻食沙拉',['lunch','dinner']);
add('egg-rice','蛋炒饭',300,[['@rice',230],['egg',50],['carrot',30],['oil',10],['soy',5]],'主食面点');
add('shrimp-rice','虾仁炒饭',350,[['@rice',230],['shrimp',80],['egg',50],['carrot',30],['oil',10],['soy',5]],'主食面点');
add('vegetable-noodles','鸡蛋蔬菜炒面',350,[['noodles',90],['egg',50],['cabbage',100],['carrot',30],['oil',12],['soy',10],['water',120]],'面食粉面');
add('tomato-noodles','番茄鸡蛋汤面',550,[['noodles',80],['tomato',150],['egg',50],['oil',6],['water',300]],'面食粉面');
add('beef-noodles','牛肉汤面',600,[['noodles',90],['beef',100],['cabbage',70],['oil',5],['soy',10],['water',400]],'面食粉面');
add('mince-noodles','肉末拌面',350,[['noodles',90],['mince',60],['cucumber',80],['beanPaste',15],['oil',8],['water',120]],'面食粉面');
add('peanut-noodles','花生酱拌面',300,[['noodles',90],['peanutButter',25],['cucumber',60],['soy',8],['sesameOil',5],['water',120]],'面食粉面');
for (const [key,name,dish,amount] of [
    ['tomato-egg-rice','番茄炒蛋盖饭','tomato-egg',200], ['pepper-pork-rice','青椒肉丝盖饭','pepper-pork',200],
    ['kungpao-rice','宫保鸡丁盖饭','kungpao',200], ['mapo-rice','麻婆豆腐盖饭','mapo-tofu',250],
    ['chicken-rice','黄焖鸡米饭（去骨）','braised-chicken',300], ['braised-pork-rice','红烧肉盖饭','braised-pork',150],
    ['yuxiang-rice','鱼香肉丝盖饭','yuxiang-pork',200], ['beef-rice','洋葱牛肉盖饭','onion-beef',200],
    ['mushroom-rice','香菇鸡肉盖饭','mushroom-chicken',250], ['shrimp-egg-rice','虾仁炒蛋盖饭','shrimp-egg',200],
]) add(key,name,200+amount,[['@rice',200],[`@${dish}`,amount]],'盖饭套餐');
add('redbean-soup','红豆汤（加糖）',300,[['redBean',35],['sugar',15],['water',260]],'零食甜点',['snack']);
add('greenbean-soup','绿豆汤（加糖）',300,[['greenBean',35],['sugar',15],['water',260]],'零食甜点',['snack']);
add('milk-tea','鲜奶红茶（参考配方·加糖）',500,[['milk',200],['tea',280],['sugar',20]],'奶茶饮品',['snack']);
add('bubble-tea','珍珠鲜奶茶（参考配方·加糖）',500,[['milk',200],['tea',180],['sugar',25],['pearls',30],['water',65]],'奶茶饮品',['snack'],['珍珠奶茶']);
add('bubble-tea-less-sugar','珍珠鲜奶茶（参考配方·少糖）',500,[['milk',200],['tea',195],['sugar',10],['pearls',30],['water',65]],'奶茶饮品',['snack']);

module.exports = { ingredients, recipes };
