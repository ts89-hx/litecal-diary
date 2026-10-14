<template>
  <view class="splash">
    <view class="orb orb-one"></view>
    <view class="orb orb-two"></view>
    <view class="brand-mark">轻</view>
    <text class="brand">轻卡日记</text>
    <text class="slogan">记录每一餐，量化每一步</text>
    <view class="feature-row">
      <view class="feature"><text class="feature-icon">◎</text><text>看见热量差</text></view>
      <view class="feature"><text class="feature-icon">◷</text><text>记录真实运动</text></view>
      <view class="feature"><text class="feature-icon">↗</text><text>追踪目标进度</text></view>
    </view>
    <button class="start-button" :loading="loading" :disabled="loading" @click="startWechat">微信登录</button>
    <button class="demo-button" :disabled="loading" @click="startDemo">演示体验（共享数据）</button>
    <text v-if="error" class="error">{{ error }}</text>
    <text class="notice">健康数据仅用于趋势估算，不替代医疗建议</text>
  </view>
</template>

<script>
import { demoLogin, wechatLogin, getProfilePlan } from '../../api/mvp';

export default {
  data() { return { loading: false, error: '' }; },
  onLoad() {
    if (uni.getStorageSync('accessToken')) this.continueExisting();
  },
  methods: {
    async startWechat() {
      if (this.loading) return;
      this.loading = true; this.error = '';
      try {
        const result = await new Promise((resolve,reject) => uni.login({provider:'weixin',success:resolve,fail:reject}));
        const response = await wechatLogin(result.code);
        uni.setStorageSync('accessToken',response.accessToken);
        uni.setStorageSync('userId',response.userId);
        uni.removeStorageSync('litecal_active_workout');
        const profile = await getProfilePlan();
        if (profile.data.plan) uni.switchTab({url:'/pages/home/home'});
        else uni.reLaunch({url:'/pages/onboarding/onboarding'});
      } catch(error) { this.error=error.message || error.errMsg || '微信登录失败，请重试'; }
      finally { this.loading=false; }
    },
    async continueExisting() {
      try {
        const response = await getProfilePlan();
        if (response.data && response.data.plan) uni.switchTab({ url: '/pages/home/home' });
      } catch (_error) {
        uni.removeStorageSync('accessToken');
      }
    },
    async startDemo() {
      if (this.loading) return;
      this.loading = true;
      this.error = '';
      try {
        const response = await demoLogin();
        uni.setStorageSync('accessToken', response.data.accessToken);
        uni.setStorageSync('userId', response.data.user.id);
        if (response.data.needsOnboarding) uni.reLaunch({ url: '/pages/onboarding/onboarding' });
        else uni.switchTab({ url: '/pages/home/home' });
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style>
.demo-button{margin-top:20rpx;background:transparent;color:#61736B;font-size:24rpx;}
.splash { min-height: 100vh; padding: 150rpx 56rpx 70rpx; box-sizing: border-box; background: linear-gradient(155deg, #F4FBF6 0%, #FFF8F0 100%); text-align: center; position: relative; overflow: hidden; }
.orb { position: absolute; border-radius: 50%; opacity: .55; }
.orb-one { width: 360rpx; height: 360rpx; background: #CFF4E3; right: -150rpx; top: -80rpx; }
.orb-two { width: 240rpx; height: 240rpx; background: #FFE0D2; left: -120rpx; bottom: 180rpx; }
.brand-mark { margin: 0 auto 34rpx; width: 150rpx; height: 150rpx; line-height: 150rpx; border-radius: 48rpx; color: #fff; font-size: 72rpx; font-weight: 700; background: linear-gradient(145deg, #39CA98, #1DA979); box-shadow: 0 24rpx 46rpx rgba(39,183,134,.28); transform: rotate(-5deg); }
.brand { display: block; font-size: 64rpx; font-weight: 700; letter-spacing: 4rpx; }
.slogan { display: block; margin-top: 20rpx; color: #6F807A; font-size: 30rpx; }
.feature-row { margin: 110rpx 0 80rpx; display: flex; justify-content: space-between; gap: 14rpx; }
.feature { flex: 1; display: flex; flex-direction: column; gap: 14rpx; color: #53645E; font-size: 22rpx; }
.feature-icon { margin: auto; width: 80rpx; height: 80rpx; line-height: 80rpx; border-radius: 26rpx; background: rgba(255,255,255,.9); color: #27B786; font-size: 40rpx; box-shadow: 0 10rpx 28rpx rgba(45,83,70,.08); }
.start-button { height: 104rpx; line-height: 104rpx; border-radius: 30rpx; background: #27B786; color: #fff; font-size: 34rpx; font-weight: 600; box-shadow: 0 18rpx 36rpx rgba(39,183,134,.24); }
.error { display: block; color: #E25E4A; margin-top: 24rpx; font-size: 26rpx; }
.notice { position: absolute; bottom: 42rpx; left: 0; right: 0; color: #9AA7A2; font-size: 22rpx; }
</style>
