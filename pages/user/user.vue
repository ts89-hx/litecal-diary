<template>
  <view class="lc-page user-page">
    <view class="profile-head">
      <view class="avatar">轻</view>
      <view><text class="username">{{ profile.user ? profile.user.username : '轻卡用户' }}</text><text class="profile-sub">健康改变，从看见数据开始</text></view>
    </view>

    <view v-if="profile.plan" class="plan-card">
      <view class="plan-head"><view><text class="plan-label">当前减脂计划</text><text class="plan-target">{{ currentWeight }} → {{ profile.plan.target_weight }} kg</text></view><text class="edit" @click="editPlan">编辑</text></view>
      <view class="plan-stats">
        <view><text>{{ profile.plan.plan_days }}</text><text>计划天数</text></view>
        <view><text>{{ Math.round(profile.plan.daily_calorie_target) }}</text><text>每日目标千卡</text></view>
        <view><text>{{ targetDate }}</text><text>目标日期</text></view>
      </view>
    </view>

    <view class="lc-card info-card">
      <view class="section-head"><text>身体信息</text><text @click="editPlan">修改</text></view>
      <view class="info-grid" v-if="profile.user">
        <view><text>{{ profile.user.height || '--' }}</text><text>身高 cm</text></view>
        <view><text>{{ profile.user.age || '--' }}</text><text>年龄</text></view>
        <view><text>{{ profile.user.gender==='male'?'男':'女' }}</text><text>性别</text></view>
        <view @click="showWeight=true"><text>{{ currentWeight || '--' }}</text><text>当前体重 kg ›</text></view>
      </view>
    </view>

    <view class="lc-card menu-card">
      <view class="menu-row" @click="showWeight=true"><view><text class="menu-icon mint">秤</text><text>记录最新体重</text></view><text>›</text></view>
      <view class="menu-row" @click="showAbout=true"><view><text class="menu-icon orange">i</text><text>关于轻卡日记</text></view><text>›</text></view>
      <view class="menu-row danger" @click="clearAll"><view><text class="menu-icon red">清</text><text>清除演示数据</text></view><text>›</text></view>
    </view>

    <button class="exit" @click="exitDemo">退出登录</button>

    <view v-if="showWeight" class="modal-mask" @click="showWeight=false"><view class="modal" @click.stop><text class="modal-title">记录最新体重</text><view class="weight-input"><input v-model.number="weightInput" type="digit"/><text>kg</text></view><button class="save" @click="submitWeight">保存体重</button></view></view>
    <view v-if="showAbout" class="modal-mask" @click="showAbout=false"><view class="modal" @click.stop><text class="modal-title">关于轻卡日记</text><text class="about">轻卡日记通过饮食、运动与体重记录，帮助你看见每日热量差和目标趋势。所有热量均为估算结果，本产品不提供医疗诊断。</text><button class="close" @click="showAbout=false">知道了</button></view></view>
  </view>
</template>

<script>
import { getProfilePlan, saveWeight, clearDemoData } from '../../api/mvp';

export default {
  data(){return{profile:{},showWeight:false,showAbout:false,weightInput:0};},
  computed:{
    currentWeight(){return Number(this.profile.currentWeight||0);},
    targetDate(){if(!this.profile.plan)return'--';const value=new Date(this.profile.plan.start_date);value.setDate(value.getDate()+Number(this.profile.plan.plan_days));return `${value.getMonth()+1}/${value.getDate()}`;},
  },
  onShow(){this.load();},
  methods:{
    async load(){try{const response=await getProfilePlan();this.profile=response.data||{};this.weightInput=this.currentWeight;}catch(error){uni.showToast({title:error.message,icon:'none'});}},
    editPlan(){uni.navigateTo({url:'/pages/onboarding/onboarding?edit=1'});},
    async submitWeight(){if(this.weightInput<30||this.weightInput>300){uni.showToast({title:'请输入有效体重',icon:'none'});return;}try{await saveWeight(this.weightInput);this.showWeight=false;await this.load();uni.showToast({title:'体重已更新',icon:'success'});}catch(error){uni.showToast({title:error.message,icon:'none'});}},
    clearAll(){uni.showModal({title:'清除演示数据',content:'饮食、运动、体重和计划将被清除，确定继续吗？',success:async result=>{if(!result.confirm)return;try{await clearDemoData();uni.removeStorageSync('litecal_active_workout');uni.reLaunch({url:'/pages/onboarding/onboarding'});}catch(error){uni.showToast({title:error.message,icon:'none'});}}});},
    exitDemo(){uni.removeStorageSync('accessToken');uni.removeStorageSync('userId');uni.removeStorageSync('litecal_active_workout');uni.reLaunch({url:'/pages/index/index'});},
  },
};
</script>

<style>
.profile-head{display:flex;align-items:center;padding:16rpx 8rpx 36rpx;}.avatar{width:108rpx;height:108rpx;line-height:108rpx;text-align:center;border-radius:34rpx;margin-right:24rpx;color:#fff;font-size:48rpx;font-weight:700;background:linear-gradient(145deg,#3ACB98,#1DA777);transform:rotate(-4deg);}.username,.profile-sub{display:block;}.username{font-size:36rpx;font-weight:700;}.profile-sub{margin-top:8rpx;color:#87948F;font-size:23rpx;}
.plan-card{padding:34rpx;border-radius:32rpx;color:#fff;background:linear-gradient(145deg,#27B786,#188F68);box-shadow:0 18rpx 38rpx rgba(39,183,134,.22);}.plan-head{display:flex;justify-content:space-between;}.plan-label,.plan-target{display:block;}.plan-label{opacity:.8;font-size:23rpx;}.plan-target{margin-top:10rpx;font-size:38rpx;font-weight:700;}.edit{padding:10rpx 20rpx;height:30rpx;line-height:30rpx;border-radius:18rpx;background:rgba(255,255,255,.18);font-size:22rpx;}.plan-stats{display:flex;margin-top:34rpx;padding-top:28rpx;border-top:2rpx solid rgba(255,255,255,.16);}.plan-stats view{flex:1;text-align:center;}.plan-stats text{display:block;}.plan-stats text:first-child{font-size:30rpx;font-weight:600;}.plan-stats text:last-child{margin-top:8rpx;opacity:.75;font-size:20rpx;}
.info-card,.menu-card{margin-top:24rpx;padding:30rpx;}.section-head{display:flex;justify-content:space-between;font-size:29rpx;font-weight:700;}.section-head text:last-child{color:#27B786;font-size:23rpx;font-weight:400;}.info-grid{display:flex;flex-wrap:wrap;justify-content:space-between;margin-top:26rpx;}.info-grid view{width:48.5%;box-sizing:border-box;margin-bottom:18rpx;padding:22rpx;border-radius:20rpx;background:#F5F8F5;}.info-grid text{display:block;}.info-grid text:first-child{font-size:31rpx;font-weight:700;}.info-grid text:last-child{margin-top:6rpx;color:#8B9792;font-size:21rpx;}
.menu-card{padding:0 28rpx;}.menu-row{min-height:104rpx;display:flex;align-items:center;justify-content:space-between;border-bottom:2rpx solid #EEF2F0;}.menu-row:last-child{border-bottom:0;}.menu-row>view{display:flex;align-items:center;gap:20rpx;}.menu-row>text{font-size:40rpx;color:#A0AAA6;}.menu-icon{width:58rpx;height:58rpx;line-height:58rpx;text-align:center;border-radius:18rpx;font-size:22rpx;font-weight:600;}.menu-icon.mint{background:#E6F8F1;color:#16805D;}.menu-icon.orange{background:#FFF0E8;color:#DF704F;}.menu-icon.red{background:#FFECE8;color:#D65C48;}.danger>view>text:last-child{color:#C85544;}.exit{margin-top:28rpx;height:88rpx;line-height:88rpx;border-radius:24rpx;background:#E9EFEC;color:#66756F;}
.modal-mask{position:fixed;top:0;right:0;bottom:0;left:0;z-index:30;display:flex;align-items:center;padding:40rpx;background:rgba(28,45,39,.45);}.modal{width:100%;padding:36rpx;border-radius:30rpx;background:#fff;box-sizing:border-box;}.modal-title{display:block;font-size:34rpx;font-weight:700;}.weight-input{display:flex;align-items:center;margin:32rpx 0;padding:24rpx;border-radius:22rpx;background:#F3F7F4;}.weight-input input{flex:1;text-align:center;font-size:46rpx;font-weight:700;}.save,.close{height:88rpx;line-height:88rpx;border-radius:24rpx;background:#27B786;color:#fff;}.about{display:block;margin:28rpx 0;color:#66756F;line-height:1.8;font-size:25rpx;}
</style>
