const mockProvider = require('./mockProvider');
const baiduProvider = require('./baiduProvider');
const localProvider = require('./localProvider');

function getProvider() {
    const mode=process.env.RECOGNITION_PROVIDER||'local';
    if(mode==='local')return localProvider;
    if(mode==='mock')return mockProvider;
    if(mode==='baidu')return baiduProvider;
    throw new Error('识别模式配置无效，请使用local本地模式');
}

async function recognizeFood(imageBuffer) {
    if (!Buffer.isBuffer(imageBuffer) || !imageBuffer.length) throw new Error('图片内容为空');
    const candidates = await getProvider().recognize(imageBuffer);
    if (!candidates.length) throw new Error('未识别到菜品，请改用手动搜索');
    return candidates;
}

module.exports = { recognizeFood, getProvider };
