<template>
  <view class="lc-page records-page">
    <view class="date-switcher">
      <view @click="moveDate(-1)">‹</view><text>{{ dateLabel }}</text><view :class="{ disabled: isToday }" @click="moveDate(1)">›</view>
    </view>

    <view class="summary-row">
      <view class="summary diet"><text>{{ dietTotal }}</text><text>饮食摄入</text></view>
      <view class="summary sport"><text>{{ sportTotal }}</text><text>运动消耗</text></view>
    </view>

    <view class="section-title"><text>饮食记录</text><button @click="goDiet">＋ 添加</button></view>
    <view class="lc-card list-card">
      <view v-if="!diets.length" class="lc-empty">还没有饮食记录</view>
      <view v-for="item in diets" :key="item.id" class="record-item">
        <view class="record-icon food-icon">餐</view>
        <view class="record-main"><text class="record-name">{{ item.food_name }}</text><text class="record-meta">{{ mealName(item.meal_type) }} · 实际食用 {{ item.portion_g }}克</text><text v-if="item.plate_portion_g" class="record-meta">整份 {{ item.plate_portion_g }}克 · 吃了 {{ item.consumed_percent }}%{{ item.portion_basis==='reference' ? ' · 参考重量' : '' }}</text></view>
        <view class="record-value"><text>约 {{ Math.round(item.calories) }} 千卡</text><view><text @click="openEdit(item)">编辑</text><text class="delete" @click="removeDiet(item.id)">删除</text></view></view>
      </view>
    </view>

    <view class="section-title"><text>运动记录</text><button @click="goSport">＋ 添加</button></view>
    <view class="lc-card list-card">
      <view v-if="!sports.length" class="lc-empty">还没有运动记录</view>
      <view v-for="item in sports" :key="item.id" class="record-item">
        <view class="record-icon sport-icon">动</view>
        <view class="record-main"><text class="record-name">{{ item.activity_name }}</text><text class="record-meta">{{ formatDuration(item.duration_seconds || item.duration * 60) }}</text></view>
        <view class="record-value"><text>{{ Math.round(item.calories) }} 千卡</text><view><text class="delete" @click="removeSport(item.id)">删除</text></view></view>
      </view>
    </view>

    <view v-if="editing" class="modal-mask" @click="closeEdit">
      <view class="modal" @click.stop>
        <text class="modal-title">调整饮食记录</text>
        <view class="edit-field"><text>食物</text><text>{{ editForm.foodName }}</text></view>
        <view class="edit-field"><text>整份重量</text><view><input v-model.number="editForm.platePortionG" type="digit" @input="editForm.portionBasis='entered'"/><text>克</text></view></view>
        <view class="edit-field"><text>实际吃了</text><view><input v-model.number="editForm.consumedPercent" type="digit"/><text>%</text></view></view>
        <text class="calorie-preview">{{ editValid ? '实际食用 '+editGrams+'克 · 约 '+editCalories+' 千卡' : '请输入10–3000克、1%–100%的有效分量' }}</text>
        <view class="modal-actions"><button :disabled="savingEdit" @click="closeEdit">取消</button><button class="save" :disabled="!editValid || savingEdit" :loading="savingEdit" @click="saveEdit">确认保存</button></view>
      </view>
    </view>
  </view>
</template>

<script>
import { getDietRecords, getSportRecords, updateDietRecord, deleteDietRecord, deleteSportRecord } from '../../api/mvp';

function dateText(date) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }

export default {
  data() { return { date: dateText(new Date()), diets: [], sports: [], editing: null, savingEdit:false, editForm: { foodName: '', platePortionG: 100, consumedPercent:100, caloriesPer100g: 0, portionBasis:'entered' } }; },
  computed: {
    isToday() { return this.date === dateText(new Date()); },
    dateLabel() { if (this.isToday) return '今天'; const value = new Date(`${this.date}T00:00:00`); return `${value.getMonth()+1}月${value.getDate()}日`; },
    dietTotal() { return Math.round(this.diets.reduce((sum,item)=>sum+Number(item.calories||0),0)); },
    sportTotal() { return Math.round(this.sports.reduce((sum,item)=>sum+Number(item.calories||0),0)); },
    editValid() { const grams=Number(this.editForm.platePortionG),percent=Number(this.editForm.consumedPercent);return Number.isFinite(grams)&&grams>=10&&grams<=3000&&Number.isFinite(percent)&&percent>=1&&percent<=100; },
    editGrams() { return Math.round(Number(this.editForm.platePortionG)*Number(this.editForm.consumedPercent))/100; },
    editCalories() { return Math.round(Number(this.editForm.caloriesPer100g) * this.editGrams / 100); },
  },
  onShow() { this.load(); },
  methods: {
    async load() {
      try {
        const [diet, sport] = await Promise.all([getDietRecords(this.date), getSportRecords(this.date)]);
        this.diets = diet.data || []; this.sports = sport.data || [];
      } catch (error) { uni.showToast({ title: error.message, icon: 'none' }); }
    },
    moveDate(offset) { if (offset > 0 && this.isToday) return; const value = new Date(`${this.date}T00:00:00`); value.setDate(value.getDate()+offset); this.date=dateText(value); this.load(); },
    mealName(value) { return ({breakfast:'早餐',lunch:'午餐',dinner:'晚餐',snack:'加餐'})[value] || value; },
    formatDuration(seconds) { const minutes=Math.floor(seconds/60); const remain=Math.round(seconds%60); return minutes ? `${minutes}分${remain}秒` : `${remain}秒`; },
    goDiet() { uni.navigateTo({ url:'/pages/diet_records/diet_records' }); },
    goSport() { uni.navigateTo({ url:'/pages/sport_records/sport_records' }); },
    openEdit(item) { this.editing=item; this.editForm={ foodName:item.food_name, platePortionG:Number(item.plate_portion_g==null?item.portion_g:item.plate_portion_g), consumedPercent:Number(item.consumed_percent==null?100:item.consumed_percent), caloriesPer100g:Number(item.calories_per_100g==null?Number(item.calories)*100/Number(item.portion_g):item.calories_per_100g), portionBasis:item.portion_basis||'entered' }; },
    closeEdit(){if(!this.savingEdit)this.editing=null;},
    async saveEdit() { if(!this.editValid||this.savingEdit)return;this.savingEdit=true;try { await updateDietRecord(this.editing.id,this.editForm); this.editing=null; await this.load(); } catch(error){ uni.showToast({title:error.message,icon:'none'}); }finally{this.savingEdit=false;} },
    confirmDelete(action) { return new Promise(resolve=>uni.showModal({title:'删除记录',content:'删除后当日热量会重新计算，确定继续吗？',success:r=>resolve(r.confirm)})).then(ok=>ok?action():null); },
    removeDiet(id) { this.confirmDelete(async()=>{ await deleteDietRecord(id); await this.load(); }); },
    removeSport(id) { this.confirmDelete(async()=>{ await deleteSportRecord(id); await this.load(); }); },
  },
};
</script>

<style>
.date-switcher { display:flex; align-items:center; justify-content:center; gap:42rpx; margin:4rpx 0 28rpx; }.date-switcher view { width:58rpx; height:58rpx; line-height:52rpx; text-align:center; border-radius:18rpx; background:#fff; color:#27B786; font-size:50rpx; }.date-switcher text { font-size:32rpx; font-weight:700; }.date-switcher .disabled { opacity:.3; }
.summary-row { display:flex; gap:20rpx; }.summary { flex:1; padding:28rpx; border-radius:26rpx; }.summary text { display:block; }.summary text:first-child { font-size:42rpx; font-weight:700; }.summary text:last-child { margin-top:8rpx; font-size:22rpx; color:#75847E; }.summary.diet { background:#FFF0E8; }.summary.diet text:first-child { color:#E9704E; }.summary.sport { background:#E4F3FF; }.summary.sport text:first-child { color:#408EC5; }
.section-title { display:flex; justify-content:space-between; align-items:center; margin:38rpx 4rpx 18rpx; font-size:30rpx; font-weight:700; }.section-title button { margin:0; padding:0 20rpx; height:56rpx; line-height:56rpx; border-radius:18rpx; background:#E4F7EF; color:#16805D; font-size:23rpx; }
.list-card { overflow:hidden; }.record-item { display:flex; align-items:center; padding:26rpx; border-bottom:2rpx solid #F0F3F1; }.record-item:last-child { border-bottom:0; }.record-icon { width:68rpx; height:68rpx; line-height:68rpx; text-align:center; border-radius:22rpx; margin-right:20rpx; font-size:23rpx; font-weight:600; }.food-icon { background:#FFF0E8;color:#E9704E; }.sport-icon{background:#E4F3FF;color:#408EC5;}.record-main{flex:1;min-width:0;}.record-name,.record-meta{display:block;}.record-name{font-weight:600;}.record-meta{margin-top:8rpx;color:#8C9994;font-size:22rpx;}.record-value{text-align:right;font-size:24rpx;font-weight:600;}.record-value view{margin-top:10rpx;color:#27B786;font-size:21rpx;font-weight:400;}.record-value .delete{margin-left:18rpx;color:#D97862;}
.modal-mask { position:fixed;inset:0;background:rgba(25,42,36,.4);display:flex;align-items:flex-end;z-index:20;}.modal{width:100%;padding:38rpx 34rpx 54rpx;border-radius:36rpx 36rpx 0 0;background:#fff;box-sizing:border-box;}.modal-title{display:block;font-size:34rpx;font-weight:700;margin-bottom:26rpx;}.edit-field{min-height:94rpx;display:flex;justify-content:space-between;align-items:center;border-bottom:2rpx solid #EEF2F0;}.edit-field>view{display:flex;align-items:center;}.edit-field input{width:280rpx;text-align:right;font-size:30rpx;}.calorie-preview{display:block;margin:24rpx 0;color:#27B786;text-align:right;}.modal-actions{display:flex;gap:20rpx;}.modal-actions button{flex:1;border-radius:22rpx;background:#EEF2F0;}.modal-actions .save{background:#27B786;color:#fff;}
</style>
