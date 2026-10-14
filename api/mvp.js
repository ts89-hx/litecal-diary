import request, { BASE_URL } from '../utils/http';

export const demoLogin = () => request({ url: '/auth/demo', method: 'POST' });
export const wechatLogin = code => request({ url: '/auth/wechat', method: 'POST', data: { code } });
export const getProfilePlan = () => request({ url: '/profile/plan' });
export const saveProfilePlan = data => request({ url: '/profile/plan', method: 'PUT', data });
export const clearDemoData = () => request({ url: '/profile/demo-data', method: 'DELETE' });
export const getDashboard = date => request({ url: `/dashboard/daily?date=${date}` });
export const getFoods = (query = '', mealType = '') => request({ url: `/catalog/foods?query=${encodeURIComponent(query)}&mealType=${encodeURIComponent(mealType)}` });
export const getSports = () => request({ url: '/catalog/sports' });
export const getDietRecords = date => request({ url: `/diet-records?date=${date}` });
export const createDietRecord = data => request({ url: '/diet-records', method: 'POST', data });
export const updateDietRecord = (id, data) => request({ url: `/diet-records/${id}`, method: 'PATCH', data });
export const deleteDietRecord = id => request({ url: `/diet-records/${id}`, method: 'DELETE' });
export const getSportRecords = date => request({ url: `/sport-records?date=${date}` });
export const createSportRecord = data => request({ url: '/sport-records', method: 'POST', data });
export const deleteSportRecord = id => request({ url: `/sport-records/${id}`, method: 'DELETE' });
export const saveWeight = currentWeight => request({ url: '/weights', method: 'POST', data: { currentWeight } });

export const recognizeFood = filePath => new Promise((resolve, reject) => {
  const token = uni.getStorageSync('accessToken');
  uni.uploadFile({
    url: `${BASE_URL}/recognition/food`,
    filePath,
    name: 'image',
    timeout: 150000,
    header: token ? { Authorization: `Bearer ${token}` } : {},
    success(response) {
      let payload;
      try { payload = JSON.parse(response.data); } catch (_error) { return reject(new Error('识别服务返回异常')); }
      if (response.statusCode >= 200 && response.statusCode < 300) resolve(payload);
      else reject(new Error(payload.msg || '识别失败，请改用手动搜索'));
    },
    fail(error) {
      reject(new Error(error.errMsg && error.errMsg.includes('timeout') ? '识别超时，请重试' : '图片上传失败'));
    },
  });
});
