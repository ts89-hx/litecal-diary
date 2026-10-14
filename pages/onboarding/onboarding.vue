<template>
  <view class="lc-page onboarding">
    <view class="steps">
      <view v-for="item in 3" :key="item" :class="['step-dot', { active: item <= step }]">{{ item }}</view>
      <view class="step-line"></view>
    </view>

    <view v-if="step === 1" class="panel">
      <text class="eyebrow">STEP 1 · 身体信息</text>
      <text class="title">先认识一下你</text>
      <text class="subtitle">用于估算每日基础热量消耗</text>
      <text class="label">性别</text>
      <view class="choice-row">
        <view :class="['choice', { selected: form.gender === 'female' }]" @click="form.gender = 'female'">女性</view>
        <view :class="['choice', { selected: form.gender === 'male' }]" @click="form.gender = 'male'">男性</view>
      </view>
      <view class="field"><text>年龄</text><view><input v-model.number="form.age" type="number"/><text>岁</text></view></view>
      <view class="field"><text>身高</text><view><input v-model.number="form.height" type="digit"/><text>cm</text></view></view>
      <view class="field"><text>当前体重</text><view><input v-model.number="form.currentWeight" type="digit"/><text>kg</text></view></view>
    </view>

    <view v-if="step === 2" class="panel">
      <text class="eyebrow">STEP 2 · 减脂目标</text>
      <text class="title">设定可坚持的节奏</text>
      <text class="subtitle">计划过快时，我们会给出温和提醒</text>
      <view class="field"><text>目标体重</text><view><input v-model.number="form.targetWeight" type="digit"/><text>kg</text></view></view>
      <view class="field"><text>计划周期</text><view><input v-model.number="form.planDays" type="number"/><text>天</text></view></view>
      <text class="label">日常活动（不含专项运动）</text>
      <view v-for="item in activities" :key="item.value" :class="['activity', { selected: form.activityLevel === item.value }]" @click="form.activityLevel = item.value">
        <view><text class="activity-name">{{ item.name }}</text><text class="activity-desc">{{ item.desc }}</text></view><text>{{ form.activityLevel === item.value ? '✓' : '' }}</text>
      </view>
    </view>

    <view v-if="step === 3" class="panel result-panel">
      <text class="eyebrow">STEP 3 · 你的轻卡计划</text>
      <text class="title">从今天开始，稳稳靠近目标</text>
      <view class="budget-card">
        <text>每日计划摄入</text>
        <view><text class="budget">{{ result.dailyCalorieTarget }}</text><text> 千卡</text></view>
        <text class="budget-note">维持消耗约 {{ result.maintenanceCalories }} 千卡/天</text>
      </view>
      <view class="result-grid">
        <view><text class="result-value">{{ result.bmi }}</text><text class="result-label">当前 BMI</text></view>
        <view><text class="result-value">{{ result.weeklyLoss }}</text><text class="result-label">计划每周 kg</text></view>
      </view>
      <view v-if="result.warnings && result.warnings.length" class="warning">
        <text v-for="warning in result.warnings" :key="warning">• {{ warning }}</text>
      </view>
      <text class="disclaimer">结果用于健康趋势参考，不替代医生或营养师建议。</text>
    </view>

    <text v-if="error" class="form-error">{{ error }}</text>
    <view class="actions">
      <button v-if="step > 1 && step < 3" class="back" @click="step -= 1">上一步</button>
      <button v-if="step < 2" class="next" @click="nextFromBody">下一步</button>
      <button v-if="step === 2" class="next" :loading="saving" @click="createPlan">生成我的计划</button>
      <button v-if="step === 3" class="next" @click="finish">进入轻卡日记</button>
    </view>
  </view>
</template>

<script>
import { getProfilePlan, saveProfilePlan } from '../../api/mvp';

export default {
  data() {
    return {
      step: 1, saving: false, error: '', result: {},
      form: { gender: 'female', age: 26, height: 165, currentWeight: 60, targetWeight: 55, planDays: 90, activityLevel: 'light' },
      activities: [
        { value: 'sedentary', name: '久坐为主', desc: '办公、学习，日常走动较少' },
        { value: 'light', name: '日常走动', desc: '通勤或工作中有一定走动' },
        { value: 'regular', name: '活动较多', desc: '体力工作或日常活动量较高' },
      ],
    };
  },
  async onLoad(query) {
    if (query.edit) {
      try {
        const response = await getProfilePlan();
        const { user, plan, currentWeight } = response.data;
        if (plan) this.form = {
          gender: user.gender, age: user.age, height: Number(user.height), currentWeight: Number(currentWeight || plan.start_weight),
          targetWeight: Number(plan.target_weight), planDays: Number(plan.plan_days), activityLevel: user.activity_level || 'light',
        };
      } catch (_error) {}
    }
  },
  methods: {
    nextFromBody() {
      this.error = '';
      if (this.form.age < 18 || this.form.height < 120 || this.form.currentWeight < 30) { this.error = '请填写有效的年龄、身高和体重'; return; }
      this.step = 2;
    },
    async createPlan() {
      this.error = '';
      if (this.form.targetWeight >= this.form.currentWeight || this.form.planDays < 7) { this.error = '目标体重需低于当前体重，计划至少为7天'; return; }
      this.saving = true;
      try {
        const response = await saveProfilePlan(this.form);
        this.result = response.data.calculation;
        this.step = 3;
      } catch (error) { this.error = error.message; }
      finally { this.saving = false; }
    },
    finish() { uni.switchTab({ url: '/pages/home/home' }); },
  },
};
</script>

<style>
.onboarding { padding-top: 44rpx; }
.steps { margin: 0 76rpx 50rpx; display: flex; justify-content: space-between; position: relative; }
.step-line { position: absolute; top: 25rpx; left: 28rpx; right: 28rpx; height: 4rpx; background: #DDE8E3; z-index: 0; }
.step-dot { width: 52rpx; height: 52rpx; line-height: 52rpx; text-align: center; border-radius: 50%; color: #9BA8A3; background: #E7EEEA; z-index: 1; }
.step-dot.active { color: #fff; background: #27B786; box-shadow: 0 8rpx 18rpx rgba(39,183,134,.25); }
.panel { background: #fff; border-radius: 34rpx; padding: 44rpx 36rpx; box-shadow: 0 16rpx 38rpx rgba(47,91,75,.08); }
.eyebrow { display: block; color: #27B786; font-size: 23rpx; font-weight: 600; letter-spacing: 2rpx; }
.title { display: block; margin-top: 16rpx; font-size: 44rpx; font-weight: 700; }
.subtitle { display: block; margin: 12rpx 0 42rpx; color: #87958F; font-size: 26rpx; }
.label { display: block; margin: 26rpx 0 16rpx; font-size: 25rpx; color: #63726D; }
.choice-row { display: flex; gap: 20rpx; margin-bottom: 20rpx; }
.choice { flex: 1; padding: 25rpx; text-align: center; border: 2rpx solid #E4EAE7; border-radius: 22rpx; }
.choice.selected, .activity.selected { border-color: #27B786; background: #EAF9F3; color: #167858; }
.field { min-height: 100rpx; display: flex; align-items: center; justify-content: space-between; border-bottom: 2rpx solid #EEF2F0; }
.field > view { display: flex; align-items: center; color: #8A9792; }
.field input { width: 170rpx; text-align: right; font-size: 34rpx; font-weight: 600; color: #20312C; margin-right: 12rpx; }
.activity { display: flex; justify-content: space-between; align-items: center; padding: 24rpx; margin: 14rpx 0; border: 2rpx solid #E4EAE7; border-radius: 22rpx; }
.activity-name, .activity-desc { display: block; }.activity-name { font-weight: 600; }.activity-desc { margin-top: 6rpx; color: #899791; font-size: 23rpx; }
.budget-card { margin-top: 40rpx; padding: 36rpx; border-radius: 28rpx; background: linear-gradient(135deg, #DDF7EC, #F5FBF7); }
.budget { font-size: 70rpx; line-height: 1.5; font-weight: 700; color: #159A6D; }.budget-note { display: block; color: #71817B; font-size: 24rpx; }
.result-grid { display: flex; gap: 20rpx; margin: 24rpx 0; }.result-grid > view { flex: 1; padding: 28rpx; border-radius: 24rpx; background: #F7F9F4; }.result-value, .result-label { display: block; }.result-value { font-size: 38rpx; font-weight: 700; }.result-label { margin-top: 8rpx; color: #87958F; font-size: 23rpx; }
.warning { padding: 24rpx; border-radius: 22rpx; color: #B0583C; background: #FFF1EA; }.warning text { display: block; margin: 6rpx 0; font-size: 24rpx; }
.disclaimer { display: block; margin-top: 24rpx; color: #9AA5A1; font-size: 22rpx; }
.form-error { display: block; color: #DC5E48; text-align: center; margin: 24rpx 0 0; }
.actions { display: flex; gap: 20rpx; margin-top: 34rpx; }.actions button { height: 96rpx; line-height: 96rpx; border-radius: 26rpx; }.back { width: 190rpx; color: #4A5B55; background: #E8EFEB; }.next { flex: 1; color: #fff; background: #27B786; box-shadow: 0 14rpx 30rpx rgba(39,183,134,.2); }
</style>
