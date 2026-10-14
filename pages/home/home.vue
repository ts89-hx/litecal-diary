<template>
  <view class="lc-page home">
    <view class="greeting"><view><text class="hello">今天也要轻松一点</text><text class="date">{{ dateLabel }}</text></view><view class="mini-logo">轻</view></view>

    <view v-if="loading" class="lc-card lc-empty">正在计算今天的轻卡账单…</view>
    <view v-else-if="error" class="lc-card lc-empty"><text>{{ error }}</text><button class="retry" @click="load">重新加载</button></view>
    <template v-else>
      <view class="balance-card">
        <text class="balance-label">今日还可摄入</text>
        <view><text class="balance-number">{{ Math.max(0, data.remainingCalories) }}</text><text class="balance-unit"> 千卡</text></view>
        <text :class="['gap', { surplus: data.calorieGap < 0 }]">{{ gapText }}</text>
        <view class="meter"><view class="meter-fill" :style="{ width: intakeProgress + '%' }"></view></view>
        <view class="budget-row"><text>已摄入 {{ data.intakeCalories }}</text><text>目标 {{ data.dailyCalorieTarget }}</text></view>
      </view>

      <view class="quick-row">
        <view class="quick food" @click="goDiet"><text class="quick-icon">◉</text><view><text class="quick-title">拍照记饮食</text><text class="quick-sub">识别后校正分量</text></view></view>
        <view class="quick sport" @click="goSport"><text class="quick-icon">▶</text><view><text class="quick-title">开始运动</text><text class="quick-sub">计时估算消耗</text></view></view>
      </view>

      <view class="lc-card stats-card">
        <view class="section-head"><text>今日热量账单</text><text class="section-note">估算值</text></view>
        <view class="stats">
          <view><text class="stat-number mint">{{ data.maintenanceCalories }}</text><text>维持消耗</text></view>
          <view><text class="stat-number orange">{{ data.intakeCalories }}</text><text>饮食摄入</text></view>
          <view><text class="stat-number blue">{{ data.exerciseCalories }}</text><text>运动消耗</text></view>
        </view>
      </view>

      <view class="lc-card goal-card">
        <view class="section-head"><text>目标进度</text><text class="section-note">趋势估算</text></view>
        <view class="weight-line"><view><text class="current-weight">{{ data.currentWeight }}</text><text> kg</text></view><text>目标 {{ data.targetWeight }} kg</text></view>
        <view class="goal-meter"><view :style="{ width: data.progress + '%' }"></view></view>
        <view class="goal-footer"><text>已完成 {{ data.progress }}%</text><text>{{ estimateText }}</text></view>
      </view>
    </template>
  </view>
</template>

<script>
import { getDashboard } from '../../api/mvp';

function today() { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`; }

export default {
  data() { return { loading: true, error: '', data: {}, date: today() }; },
  computed: {
    estimateText() {
      if (this.data.progress >= 100) return '目标已达成';
      if (this.data.estimatedDays == null) return '暂无法预计达成时间';
      return `${this.data.estimateBasis === 'plan' ? '按计划' : '按近期记录'}还需 ${this.data.estimatedDays} 天`;
    },
    dateLabel() { return `${new Date().getMonth()+1}月${new Date().getDate()}日`; },
    intakeProgress() { return Math.min(100, Math.round((this.data.intakeCalories || 0) / Math.max(this.data.dailyCalorieTarget || 1, 1) * 100)); },
    gapText() { if (!this.data.hasRecords) return '今日尚未记录饮食与运动'; return this.data.calorieGap >= 0 ? `按当前记录估算缺口 ${this.data.calorieGap} 千卡` : `今日热量盈余 ${Math.abs(this.data.calorieGap)} 千卡`; },
  },
  onShow() { if (uni.getStorageSync('accessToken')) this.load(); else uni.reLaunch({ url: '/pages/index/index' }); },
  onPullDownRefresh() { this.load().finally(() => uni.stopPullDownRefresh()); },
  methods: {
    async load() {
      this.loading = true; this.error = '';
      this.date = today();
      try { const response = await getDashboard(this.date); this.data = response.data; }
      catch (error) {
        if (error.statusCode === 409) { uni.reLaunch({ url: '/pages/onboarding/onboarding' }); return; }
        this.error = error.message;
      } finally { this.loading = false; }
    },
    goDiet() { uni.navigateTo({ url: '/pages/diet_records/diet_records' }); },
    goSport() { uni.navigateTo({ url: '/pages/sport_records/sport_records' }); },
  },
};
</script>

<style>
.home { padding-top: 32rpx; }.greeting { display: flex; justify-content: space-between; align-items: center; margin-bottom: 34rpx; }.hello,.date { display:block; }.hello { font-size: 38rpx; font-weight: 700; }.date { margin-top: 8rpx; color: #88958F; font-size: 25rpx; }.mini-logo { width: 72rpx; height: 72rpx; line-height: 72rpx; text-align: center; border-radius: 24rpx; color: #fff; font-size: 34rpx; font-weight: 700; background: #27B786; transform: rotate(-5deg); }
.balance-card { padding: 40rpx; border-radius: 34rpx; color: #fff; background: linear-gradient(145deg,#27B786,#16986D); box-shadow: 0 20rpx 40rpx rgba(34,157,113,.25); }.balance-label { font-size: 26rpx; opacity: .85; }.balance-number { font-size: 78rpx; line-height: 1.45; font-weight: 700; }.balance-unit { font-size: 25rpx; }.gap { display:block; font-size: 24rpx; }.gap.surplus { color:#FFE0D1; }.meter { height: 12rpx; margin-top: 34rpx; border-radius: 10rpx; background: rgba(255,255,255,.25); overflow:hidden; }.meter-fill { height:100%; background:#FFF; border-radius:10rpx; }.budget-row { display:flex; justify-content:space-between; margin-top:14rpx; font-size:22rpx; opacity:.82; }
.quick-row { display:flex; gap:20rpx; margin:24rpx 0; }.quick { flex:1; min-width:0; padding:26rpx 22rpx; display:flex; align-items:center; gap:18rpx; border-radius:26rpx; }.quick.food { background:#FFF0E8; }.quick.sport { background:#E4F3FF; }.quick-icon { width:56rpx; height:56rpx; line-height:56rpx; text-align:center; border-radius:18rpx; background:rgba(255,255,255,.8); }.quick-title,.quick-sub { display:block; white-space:nowrap; }.quick-title { font-size:26rpx; font-weight:600; }.quick-sub { margin-top:6rpx; color:#7F8C87; font-size:20rpx; }
.stats-card,.goal-card { padding:32rpx; margin-top:24rpx; }.section-head { display:flex; justify-content:space-between; align-items:center; font-size:29rpx; font-weight:600; }.section-note { color:#96A29D; font-size:22rpx; font-weight:400; }.stats { display:flex; margin-top:32rpx; }.stats view { flex:1; text-align:center; color:#82908B; font-size:22rpx; }.stat-number { display:block; margin-bottom:10rpx; font-size:34rpx; font-weight:700; }.mint { color:#27B786; }.orange { color:#FF8A65; }.blue { color:#4A9FDC; }
.weight-line,.goal-footer { display:flex; justify-content:space-between; align-items:flex-end; color:#73817C; }.weight-line { margin-top:30rpx; }.current-weight { color:#20312C; font-size:48rpx; font-weight:700; }.goal-meter { height:16rpx; margin:24rpx 0 14rpx; overflow:hidden; border-radius:10rpx; background:#E5ECE8; }.goal-meter view { height:100%; border-radius:10rpx; background:linear-gradient(90deg,#27B786,#7ADAB7); }.goal-footer { font-size:22rpx; }.retry { width:220rpx; margin-top:24rpx; color:#fff; background:#27B786; border-radius:22rpx; }
</style>
