<template>
  <view class="lc-page sport-page">
    <text class="page-title">选择今天的运动</text>
    <text class="page-sub">按实际时长和当前体重估算热量消耗</text>

    <view v-if="active" class="timer-card">
      <view class="timer-head"><text>{{ active.name }}</text><text :class="['status',active.status]">{{ active.status==='running'?'进行中':'已暂停' }}</text></view>
      <text class="timer">{{ formatTimer(displaySeconds) }}</text>
      <text class="calorie-preview">预计消耗 {{ previewCalories }} 千卡</text>
      <view class="timer-actions">
        <button class="discard" @click="discard">放弃</button>
        <button v-if="active.status==='running'" class="pause" @click="pause">暂停</button>
        <button v-else class="pause" @click="resume">继续</button>
        <button class="finish" :loading="saving" @click="finish">结束并保存</button>
      </view>
    </view>

    <view v-else class="tip"><text>◷</text><text>选择运动后点击开始，切到后台也会继续计时</text></view>

    <view class="sports-grid">
      <view v-for="sport in sports" :key="sport.activity_key" :class="['sport-card',{selected:selected&&selected.activity_key===sport.activity_key}]" @click="selected=sport">
        <view class="sport-icon">{{ iconFor(sport.activity_key) }}</view>
        <text class="sport-name">{{ sport.name }}</text>
        <text class="sport-met">强度 MET {{ sport.met }}</text>
      </view>
    </view>
    <button v-if="!active" class="start" :disabled="!selected" @click="start">{{ selected ? `开始${selected.name}` : '请先选择运动' }}</button>
    <text class="notice">消耗数值为估算结果，运动时请量力而行。</text>
  </view>
</template>

<script>
import { getSports, getProfilePlan, createSportRecord } from '../../api/mvp';

const STORAGE_KEY='litecal_active_workout';

export default {
  data(){return{sports:[],selected:null,active:null,displaySeconds:0,weight:60,timerId:null,saving:false};},
  computed:{previewCalories(){if(!this.active)return 0;return Math.round(Number(this.active.met)*3.5*Number(this.weight)/200*(this.displaySeconds/60));}},
  async onLoad(){
    try{const [catalog,profile]=await Promise.all([getSports(),getProfilePlan()]);this.sports=catalog.data||[];this.weight=Number(profile.data.currentWeight||profile.data.plan.start_weight||60);this.selected=this.sports[0]||null;}catch(error){uni.showToast({title:error.message,icon:'none'});}
  },
  onShow(){this.restore();this.beginTicker();},
  onHide(){this.persist();this.stopTicker();},
  onUnload(){this.persist();this.stopTicker();},
  methods:{
    iconFor(key){return({walk:'走',brisk_walk:'快',jog:'跑',swim:'泳',cycling:'骑',rope:'绳',tennis:'球',strength:'力'})[key]||'动';},
    elapsedMs(){if(!this.active)return 0;return Number(this.active.accumulatedMs||0)+(this.active.status==='running'?Date.now()-Number(this.active.runningSince):0);},
    refresh(){this.displaySeconds=Math.max(0,Math.floor(this.elapsedMs()/1000));},
    beginTicker(){this.stopTicker();this.refresh();this.timerId=setInterval(()=>this.refresh(),500);},
    stopTicker(){if(this.timerId){clearInterval(this.timerId);this.timerId=null;}},
    persist(){if(this.active)uni.setStorageSync(STORAGE_KEY,this.active);else uni.removeStorageSync(STORAGE_KEY);},
    restore(){const stored=uni.getStorageSync(STORAGE_KEY);if(stored&&stored.activityKey)this.active=stored;this.refresh();},
    start(){if(!this.selected)return;const now=Date.now();this.active={activityKey:this.selected.activity_key,name:this.selected.name,met:Number(this.selected.met),sessionStartedAt:now,runningSince:now,accumulatedMs:0,status:'running'};this.persist();this.refresh();},
    pause(){if(!this.active||this.active.status!=='running')return;this.active.accumulatedMs=this.elapsedMs();this.active.runningSince=null;this.active.status='paused';this.persist();this.refresh();},
    resume(){if(!this.active||this.active.status!=='paused')return;this.active.runningSince=Date.now();this.active.status='running';this.persist();},
    discard(){uni.showModal({title:'放弃本次运动？',content:'本次计时不会保存。',success:result=>{if(result.confirm){this.active=null;this.displaySeconds=0;this.persist();}}});},
    async finish(){
      const seconds=Math.round(this.elapsedMs()/1000);if(seconds<10){uni.showToast({title:'运动满10秒后再保存',icon:'none'});return;}
      this.saving=true;
      try{await createSportRecord({activityKey:this.active.activityKey,durationSeconds:seconds,startedAt:new Date(this.active.sessionStartedAt).toISOString(),endedAt:new Date().toISOString()});uni.showToast({title:'运动已记入账单',icon:'success'});this.active=null;this.displaySeconds=0;this.persist();}
      catch(error){uni.showToast({title:error.message,icon:'none'});}finally{this.saving=false;}
    },
    formatTimer(seconds){const h=Math.floor(seconds/3600);const m=Math.floor(seconds%3600/60);const s=seconds%60;return [h,m,s].map(value=>String(value).padStart(2,'0')).join(':');},
  },
};
</script>

<style>
.page-title,.page-sub{display:block;}.page-title{font-size:42rpx;font-weight:700;}.page-sub{margin-top:10rpx;color:#84928D;font-size:25rpx;}.tip{display:flex;align-items:center;gap:16rpx;margin:32rpx 0 24rpx;padding:22rpx;border-radius:22rpx;background:#E8F5FF;color:#567786;font-size:23rpx;}.tip text:first-child{font-size:35rpx;color:#418FC5;}
.timer-card{margin-top:34rpx;padding:34rpx;border-radius:34rpx;color:#fff;background:linear-gradient(145deg,#408FC6,#276F9F);box-shadow:0 20rpx 40rpx rgba(50,121,169,.24);}.timer-head{display:flex;justify-content:space-between;align-items:center;font-size:29rpx;font-weight:600;}.status{padding:8rpx 16rpx;border-radius:16rpx;font-size:20rpx;background:rgba(255,255,255,.18);}.status.paused{color:#FFE1D4;}.timer{display:block;margin:32rpx 0 10rpx;text-align:center;font-size:76rpx;font-weight:700;letter-spacing:4rpx;}.calorie-preview{display:block;text-align:center;opacity:.84;font-size:24rpx;}.timer-actions{display:flex;gap:12rpx;margin-top:32rpx;}.timer-actions button{height:72rpx;line-height:72rpx;border-radius:20rpx;font-size:23rpx;}.discard{width:120rpx;background:rgba(255,255,255,.15);color:#fff;}.pause{width:120rpx;background:#EAF5FC;color:#337BAA;}.finish{flex:1;background:#fff;color:#337BAA;font-weight:600;}
.sports-grid{display:flex;flex-wrap:wrap;justify-content:space-between;margin-top:30rpx;}.sport-card{width:48.5%;box-sizing:border-box;margin-bottom:18rpx;padding:26rpx;border:2rpx solid transparent;border-radius:26rpx;background:#fff;box-shadow:0 10rpx 28rpx rgba(47,91,75,.06);}.sport-card.selected{border-color:#27B786;background:#EDFAF5;}.sport-icon{width:70rpx;height:70rpx;line-height:70rpx;text-align:center;border-radius:22rpx;background:#E7F8F1;color:#16805D;font-size:29rpx;font-weight:700;}.sport-name,.sport-met{display:block;}.sport-name{margin-top:18rpx;font-size:28rpx;font-weight:600;}.sport-met{margin-top:7rpx;color:#8C9994;font-size:21rpx;}.start{margin-top:14rpx;height:96rpx;line-height:96rpx;border-radius:28rpx;background:#27B786;color:#fff;font-weight:600;box-shadow:0 16rpx 30rpx rgba(39,183,134,.24);}.start[disabled]{background:#C7D4CF;color:#fff;}.notice{display:block;margin:22rpx 0;text-align:center;color:#9AA6A1;font-size:21rpx;}
</style>
