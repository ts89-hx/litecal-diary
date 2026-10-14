let cachedToken = null;
let tokenExpiresAt = 0;

async function getAccessToken() {
    if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken;
    const apiKey = process.env.BAIDU_API_KEY;
    const secretKey = process.env.BAIDU_SECRET_KEY;
    if (!apiKey || !secretKey) throw new Error('百度识餐凭证未配置');

    const url = new URL('https://aip.baidubce.com/oauth/2.0/token');
    url.searchParams.set('grant_type', 'client_credentials');
    url.searchParams.set('client_id', apiKey);
    url.searchParams.set('client_secret', secretKey);
    const response = await fetch(url, { method: 'POST' });
    const payload = await response.json();
    if (!response.ok || !payload.access_token) throw new Error(payload.error_description || '获取百度访问令牌失败');
    cachedToken = payload.access_token;
    tokenExpiresAt = Date.now() + Math.max(Number(payload.expires_in || 2592000) - 300, 60) * 1000;
    return cachedToken;
}

async function recognize(imageBuffer) {
    const token = await getAccessToken();
    const body = new URLSearchParams({
        image: imageBuffer.toString('base64'),
        top_num: '3',
        filter_threshold: '0.6',
    });
    const response = await fetch(`https://aip.baidubce.com/rest/2.0/image-classify/v2/dish?access_token=${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
    });
    const payload = await response.json();
    if (!response.ok || payload.error_code) throw new Error(payload.error_msg || '菜品识别失败');
    return (payload.result || []).map(item => ({
        name: item.name,
        caloriesPer100g: Number(item.calorie || 0),
        confidence: Number(item.probability || 0),
        provider: 'baidu',
    }));
}

module.exports = { recognize };
