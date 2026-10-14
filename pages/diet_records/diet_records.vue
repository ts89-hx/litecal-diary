<template>
  <view class="lc-page diet-page">
    <text class="page-title">这一餐吃了什么？</text>
    <text class="page-sub">先看参考热量，确认吃了多少再记录</text>

    <view class="meal-tabs">
      <view v-for="meal in meals" :key="meal.value" :class="{ active: mealType===meal.value }" @click="mealType=meal.value">{{ meal.name }}</view>
    </view>

    <view class="camera-card" @click="choosePhoto">
      <view class="camera-icon">⌁</view>
      <view><text class="camera-title">拍照识别食物</text><text class="camera-sub">支持相机或相册，单图识别一道菜</text></view>
      <text class="arrow">›</text>
    </view>
    <view v-if="recognizing" class="recognizing">正在本地分析照片并匹配菜品…<text class="field-note">首次加载模型可能需要约一分钟</text></view>
    <text v-if="recognitionError" class="error">{{ recognitionError }}</text>

    <view class="divider"><text>或手动搜索</text></view>
    <view class="search"><text>⌕</text><input v-model="query" placeholder="搜索食物名称" confirm-type="search" @confirm="loadFoods"/><text v-if="query" @click="query='';loadFoods()">×</text></view>
    <view class="catalog-heading"><text>{{ query ? '搜索全部餐次' : mealName+'常见食物' }}</text><text>{{ foods.length }}项 · 点击确认份量</text></view>
    <scroll-view scroll-x class="category-scroll"><view class="category-tabs"><text :class="{active:!selectedCategory}" @click="selectedCategory=''">全部</text><text v-for="category in foodCategories" :key="category" :class="{active:selectedCategory===category}" @click="selectedCategory=category">{{ category }}</text></view></scroll-view>
    <view class="food-list lc-card">
      <view v-if="foodLoading" class="lc-empty">正在加载食物库…</view>
      <view v-else-if="!visibleFoods.length" class="lc-empty">{{ foodError || '没有找到对应食物，请尝试其他菜名' }}</view>
      <view v-for="food in visibleFoods" :key="food.id" class="food-row" @click="selectManual(food)">
        <view><text class="food-name">{{ food.name }}</text><text class="food-category">{{ food.category }} · {{ food.nutrition_method==='official_sample' ? '官方样品参考' : '配方估算' }}</text></view>
        <view class="food-reference"><text class="food-calorie">约 {{ Math.round(food.calories*food.default_portion_g/100) }} 千卡</text><text class="food-category">{{ food.serving_label || '参考1份' }} · {{ food.default_portion_g }}克</text></view>
      </view>
    </view>

    <view v-if="showEditor" class="modal-mask" @click="closeEditor">
      <view class="editor" @click.stop>
        <view class="editor-head"><text>确认这一餐</text><text @click="closeEditor">×</text></view>
        <text v-if="isDemo" class="demo-tag">{{ draft.provider==='mock' ? '演示模式：菜品是模拟结果，照片尚未经过真实模型识别。请手动选择实际食物。' : '照片返回的是演示结果；本次将按你手动选择的食物记录。' }}</text>
        <view class="dish-summary">
          <image v-if="photoPath" :src="photoPath" mode="aspectFill" class="preview"></image>
          <view><text class="dish-name">{{ draft.name }}</text><text class="dish-hint">{{ draft.provider === 'manual' ? '已选择食物' : '请核对菜品是否正确' }}</text></view>
          <text class="change-food" @click="openFoodPicker">更换菜品</text>
        </view>
        <view v-if="hasNutrition" class="reference-card">
          <text class="reference-label">参考{{ draft.servingLabel || '1份' }} · {{ draft.referencePortionG }}克</text>
          <view class="reference-total">约 <text>{{ referenceCalories }}</text> 千卡 / 份</view>
          <text class="reference-detail">{{ draft.caloriesPer100g }} 千卡/100克 × {{ draft.referencePortionG }}克</text>
          <text class="reference-note">参考重量来自食物库，不是照片测量结果</text>
          <text v-if="draft.nutritionNote" class="reference-note">{{ draft.nutritionNote }}</text>
          <text v-if="draft.sourceUrl" class="source-link" @click="copySource">查看数据来源（复制链接）</text>
        </view>
        <view v-else class="nutrition-missing">该菜品尚未匹配完整的营养和参考分量数据，请更换为食物库中的对应菜品后记录。</view>
        <view v-if="candidates.length > 1 && !pickingFood" class="candidate-list">
          <text class="section-label">确认菜品及做法 · 照片不能判断糖度和用油量</text>
          <view v-for="(candidate,index) in candidates" :key="index" :class="['candidate',{active:selectedIndex===index}]" @click="selectCandidate(index)">
            <text>{{ candidate.name }}</text><text>{{ selectedIndex===index ? '已选择' : '选择' }}</text>
          </view>
        </view>
        <view v-if="pickingFood" class="food-picker">
          <view class="search"><input v-model="pickerQuery" placeholder="搜索实际菜品，如番茄炒蛋" confirm-type="search" @confirm="searchPicker"/><text @click="searchPicker">搜索</text></view>
          <text v-if="pickerLoading" class="dish-hint">正在查询食物库…</text>
          <text v-else-if="!pickerFoods.length" class="dish-hint">未找到食物，请尝试其他名称</text>
          <view v-for="food in pickerFoods" :key="food.id" class="picker-row" @click="replaceFood(food)"><text>{{ food.name }}</text><text>{{ food.calories }} 千卡/100克</text></view>
          <text class="change-food" @click="pickingFood=false">收起搜索</text>
        </view>
        <view v-if="hasNutrition">
          <view class="editor-field"><text>这整份有多重？</text><view><input v-model.number="draft.platePortionG" type="digit" @input="changeWeight"/><text>克</text></view></view>
          <view class="portion-options">
            <view v-for="option in portionOptions" :key="option.name" :class="{active: draft.platePortionG===option.grams && draft.portionBasis==='reference'}" @click="setPortion(option.grams)"><text>{{ option.name }}</text><text>{{ option.grams }}克</text></view>
          </view>
          <text class="field-note">{{ draft.portionBasis==='reference' ? '当前使用参考重量；可按称重结果修改克数' : '当前使用你输入的重量' }}</text>
          <view class="editor-field"><text>实际吃了多少？</text><view><input v-model.number="draft.consumedPercent" type="digit" @input="confirmed=false"/><text>%</text></view></view>
          <view class="portion-options ratio-options">
            <view v-for="option in ratios" :key="option.value" :class="{active:draft.consumedPercent===option.value}" @click="setRatio(option.value)">{{ option.name }}</view>
          </view>
          <view class="calorie-result"><view><text class="result-label">本次预计摄入</text><text class="result-weight">实际食用 {{ validPortion ? eatenGrams : '—' }}克</text></view><view class="result-number">约 <text>{{ validPortion ? draftCalories : '—' }}</text> 千卡</view></view>
          <text class="field-note">{{ draft.nutritionSource }}。油、糖和食材比例不同，实际热量会有差异。</text>
          <text v-if="!validPortion" class="error">整份重量需为10–3000克，食用比例需为1%–100%</text>
          <view class="confirmation" role="checkbox" :aria-checked="confirmed" @click="confirmed=!confirmed"><text :class="['check-box',{checked:confirmed}]">{{ confirmed ? '✓' : '' }}</text><text>我已核对菜品、整份重量和食用比例</text></view>
        </view>
        <button class="save-button" :disabled="!canSave || saving" :loading="saving" @click="save">{{ saving ? '正在保存…' : '确认记录到'+mealName }}</button>
      </view>
    </view>
  </view>
</template>

<script>
import { getFoods, recognizeFood, createDietRecord } from '../../api/mvp';
import { recipes } from '../../data/recipes';
import { findDiscoverRecipe } from '../../data/discovery';

export default {
  data() {
    return {
      meals:[{name:'早餐',value:'breakfast'},{name:'午餐',value:'lunch'},{name:'晚餐',value:'dinner'},{name:'加餐',value:'snack'}],
      mealType:'breakfast', query:'', foods:[], foodLoading:false,foodError:'',foodRequestId:0,selectedCategory:'',recognizing:false, recognitionError:'', photoPath:'', candidates:[], selectedIndex:0,
      showEditor:false, saving:false, confirmed:false, isDemo:false, pickingFood:false, pickerQuery:'', pickerFoods:[], pickerLoading:false,
      ratios:[{name:'全部',value:100},{name:'一半',value:50},{name:'四分之一',value:25}],
      draft:{name:'',foodId:null,platePortionG:null,referencePortionG:null,consumedPercent:100,portionBasis:'reference',caloriesPer100g:null,provider:'manual',confidence:null,nutritionSource:''},
    };
  },
  computed: {
    foodCategories(){return [...new Set(this.foods.map(food=>food.category))];},
    visibleFoods(){return this.selectedCategory?this.foods.filter(food=>food.category===this.selectedCategory):this.foods;},
    mealName(){ return this.meals.find(item=>item.value===this.mealType).name; },
    hasNutrition(){ const d=this.draft; return d.caloriesPer100g!==null && Number.isFinite(Number(d.caloriesPer100g)) && Number(d.caloriesPer100g)>=0 && Number(d.caloriesPer100g)<=1000 && Number(d.referencePortionG)>=10 && Number(d.referencePortionG)<=3000; },
    validPortion(){ const grams=Number(this.draft.platePortionG),percent=Number(this.draft.consumedPercent); return Number.isFinite(grams)&&grams>=10&&grams<=3000&&Number.isFinite(percent)&&percent>=1&&percent<=100; },
    eatenGrams(){ return Math.round(Number(this.draft.platePortionG)*Number(this.draft.consumedPercent))/100; },
    referenceCalories(){ return Math.round(Number(this.draft.caloriesPer100g)*Number(this.draft.referencePortionG)/100); },
    draftCalories(){ return Math.round(Number(this.draft.caloriesPer100g)*this.eatenGrams/100); },
    portionOptions(){ const reference=Number(this.draft.referencePortionG);return [{name:'小份参考',grams:Math.max(10,Math.round(reference*0.6))},{name:'标准参考',grams:reference},{name:'大份参考',grams:Math.min(3000,Math.round(reference*1.4))}]; },
    canSave(){return this.hasNutrition&&this.validPortion&&this.confirmed&&!this.pickingFood&&this.draft.provider!=='mock';},
  },
  watch:{mealType(){this.selectedCategory='';this.loadFoods();}},
  onLoad(query){
    this.loadFoods();
    const recipe = recipes.find(item => item.id === query.recipe) || findDiscoverRecipe(query.recipe);
    if (recipe) { this.mealType=recipe.meal; this.selectManual({name:recipe.name,default_portion_g:recipe.portion,calories:recipe.calories / recipe.portion * 100,nutritionSource:'当前菜谱配方估算值'}); }
  },
  methods:{
    async loadFoods(){ const requestId=++this.foodRequestId;this.foodLoading=true;this.foodError='';try{ const response=await getFoods(this.query,this.mealType);if(requestId!==this.foodRequestId)return;this.foods=response.data||[];this.selectedCategory=''; }catch(error){if(requestId===this.foodRequestId){this.foods=[];this.foodError=error.message;}}finally{if(requestId===this.foodRequestId)this.foodLoading=false;} },
    choosePhoto(){
      if(this.recognizing||this.saving)return;
      this.recognitionError='';
      uni.chooseImage({count:1,sizeType:['compressed'],sourceType:['camera','album'],success:result=>this.runRecognition(result.tempFilePaths[0]),fail:error=>{if(!error.errMsg.includes('cancel'))this.recognitionError='无法读取图片';}});
    },
    async runRecognition(path){
      if(this.recognizing)return;
      this.recognizing=true; this.recognitionError=''; this.photoPath=path; this.candidates=[];this.pickingFood=false;
      try{ const response=await recognizeFood(path); this.candidates=response.data.candidates||[]; if(!this.candidates.length)throw new Error('未识别到菜品');this.isDemo=Boolean(response.data.isDemo)||this.candidates.some(item=>item.provider==='mock');this.selectedIndex=0; this.applyCandidate(this.candidates[0]); this.showEditor=true; }
      catch(error){ this.recognitionError=`${error.message}，你也可以手动搜索添加`; }
      finally{ this.recognizing=false; }
    },
    applyCandidate(candidate){ if(!candidate||this.saving)return; this.confirmed=false; this.draft={name:candidate.name,foodId:candidate.foodId,platePortionG:candidate.referencePortionG,referencePortionG:candidate.referencePortionG,consumedPercent:100,portionBasis:'reference',caloriesPer100g:candidate.caloriesPer100g==null?null:Number(candidate.caloriesPer100g),provider:candidate.provider,confidence:candidate.confidence,nutritionSource:candidate.nutritionSource||'',nutritionNote:candidate.nutritionNote||'',sourceUrl:candidate.sourceUrl||'',servingLabel:candidate.servingLabel||''}; },
    selectCandidate(index){ if(this.saving)return;this.selectedIndex=index; this.applyCandidate(this.candidates[index]); },
    selectManual(food){ if(this.saving)return;this.photoPath='';this.isDemo=false;this.replaceFood(food);this.showEditor=true; },
    replaceFood(food){if(this.saving)return;this.candidates=[];this.pickingFood=false;this.applyCandidate({name:food.name,foodId:food.id,referencePortionG:food.default_portion_g==null?null:Number(food.default_portion_g),caloriesPer100g:food.calories==null?null:Number(food.calories),provider:'manual',confidence:null,nutritionSource:food.nutritionSource||food.nutrition_source||'本地食物库参考值（来源待核验）',nutritionNote:food.nutrition_note,sourceUrl:food.source_url,servingLabel:food.serving_label});},
    copySource(){if(this.draft.sourceUrl)uni.setClipboardData({data:this.draft.sourceUrl});},
    openFoodPicker(){if(this.saving)return;this.pickingFood=true;this.confirmed=false;this.pickerQuery='';this.searchPicker();},
    async searchPicker(){const query=this.pickerQuery;this.pickerLoading=true;try{const response=await getFoods(query);if(this.pickerQuery===query)this.pickerFoods=response.data||[];}catch(error){this.pickerFoods=[];uni.showToast({title:error.message,icon:'none'});}finally{this.pickerLoading=false;}},
    changeWeight(){this.draft.portionBasis='entered';this.confirmed=false;},
    setPortion(grams){if(this.saving)return;this.draft.platePortionG=grams;this.draft.portionBasis='reference';this.confirmed=false;},
    setRatio(percent){if(this.saving)return;this.draft.consumedPercent=percent;this.confirmed=false;},
    closeEditor(){if(!this.saving)this.showEditor=false;},
    async save(){
      if(this.saving)return;
      if(!this.canSave){uni.showToast({title:this.draft.provider==='mock'?'请手动选择实际食物':'请核对菜品、重量及食用比例',icon:'none'});return;}
      this.saving=true;
      try{
        await createDietRecord({mealType:this.mealType,foodId:this.draft.foodId,foodName:this.draft.name,platePortionG:this.draft.platePortionG,consumedPercent:this.draft.consumedPercent,referencePortionG:this.draft.referencePortionG,portionBasis:this.draft.portionBasis,caloriesPer100g:this.draft.caloriesPer100g,nutritionSource:this.draft.nutritionSource,source:this.draft.provider,confidence:this.draft.confidence,recordTime:new Date().toISOString()});
        uni.showToast({title:'已记入轻卡账单',icon:'success'});this.showEditor=false;this.photoPath='';this.candidates=[];
      }catch(error){uni.showToast({title:error.message,icon:'none'});}finally{this.saving=false;}
    },
  },
};
</script>

<style>
.page-title,.page-sub{display:block;}.page-title{font-size:42rpx;font-weight:700;}.page-sub{margin-top:10rpx;color:#84928D;font-size:25rpx;}.meal-tabs{display:flex;gap:12rpx;margin:34rpx 0;}.meal-tabs view{flex:1;padding:18rpx 0;text-align:center;border-radius:18rpx;background:#E9EFEC;color:#75837E;font-size:24rpx;}.meal-tabs .active{background:#27B786;color:#fff;font-weight:600;}
.camera-card{display:flex;align-items:center;padding:30rpx;border-radius:28rpx;background:linear-gradient(135deg,#DDF7EC,#F2FBF6);border:2rpx dashed #86D8B9;}.camera-icon{width:76rpx;height:76rpx;line-height:76rpx;text-align:center;border-radius:24rpx;background:#27B786;color:#fff;font-size:45rpx;margin-right:22rpx;}.camera-card>view:nth-child(2){flex:1;}.camera-title,.camera-sub{display:block;}.camera-title{font-size:29rpx;font-weight:600;}.camera-sub{margin-top:8rpx;color:#77877F;font-size:22rpx;}.arrow{font-size:48rpx;color:#27B786;}.recognizing{margin-top:18rpx;padding:20rpx;text-align:center;color:#16805D;background:#EAF9F3;border-radius:18rpx;}.error{display:block;margin-top:16rpx;color:#D9674F;font-size:24rpx;}
.divider{margin:34rpx 0 20rpx;display:flex;align-items:center;color:#98A39F;font-size:22rpx;}.divider:before,.divider:after{content:'';flex:1;height:2rpx;background:#E3E9E6;}.divider text{padding:0 20rpx;}.search{display:flex;align-items:center;padding:0 22rpx;height:84rpx;border-radius:24rpx;background:#fff;box-shadow:0 10rpx 25rpx rgba(47,91,75,.06);}.search input{flex:1;margin:0 16rpx;font-size:26rpx;}.food-list{margin-top:20rpx;overflow:hidden;}.food-row{display:flex;justify-content:space-between;align-items:center;padding:24rpx 26rpx;border-bottom:2rpx solid #F0F3F1;}.food-row:last-child{border-bottom:0;}.food-name,.food-category{display:block;}.food-name{font-weight:600;}.food-category{margin-top:6rpx;color:#94A09B;font-size:21rpx;}.food-row>view:last-child{color:#8A9792;font-size:21rpx;}.food-calorie{color:#E9704E;font-size:28rpx;font-weight:700;}.plus{margin-left:14rpx;color:#27B786;font-size:32rpx;}
.modal-mask{position:fixed;top:0;right:0;bottom:0;left:0;z-index:30;display:flex;align-items:flex-end;background:rgba(28,45,39,.45);}.editor{width:100%;max-height:88vh;overflow:auto;padding:36rpx 30rpx 54rpx;box-sizing:border-box;border-radius:38rpx 38rpx 0 0;background:#fff;}.editor-head{display:flex;justify-content:space-between;font-size:33rpx;font-weight:700;}.editor-head text:last-child{font-size:42rpx;color:#8B9793;}.preview{width:100%;height:230rpx;margin:24rpx 0;border-radius:24rpx;}.candidate-list{margin-bottom:18rpx;}.candidate{display:flex;justify-content:space-between;align-items:center;padding:20rpx;border:2rpx solid #E5EAE8;border-radius:18rpx;margin:10rpx 0;font-size:23rpx;}.candidate.active{border-color:#27B786;background:#EAF9F3;}.candidate view text{display:block;}.candidate view text:last-child{margin-top:5rpx;color:#8B9792;font-size:20rpx;}.editor-field{min-height:92rpx;display:flex;justify-content:space-between;align-items:center;border-bottom:2rpx solid #EDF1EF;}.editor-field>view{display:flex;align-items:center;}.editor-field input{width:310rpx;text-align:right;font-size:29rpx;}.calorie-result{display:flex;justify-content:space-between;align-items:center;margin:28rpx 0;padding:26rpx;border-radius:22rpx;background:#FFF2EB;}.calorie-result view text{font-size:42rpx;font-weight:700;color:#E9704E;}.demo-tag{display:block;margin-bottom:20rpx;color:#8A9792;font-size:22rpx;}.save-button{height:94rpx;line-height:94rpx;border-radius:26rpx;background:#27B786;color:#fff;font-weight:600;}
</style>

<style scoped>
.catalog-heading{display:flex;justify-content:space-between;gap:16rpx;margin:26rpx 4rpx 14rpx;font-size:26rpx;font-weight:600;}.catalog-heading>text:last-child{font-size:21rpx;color:#82928A;font-weight:400;}.category-scroll{width:100%;white-space:nowrap;}.category-tabs{display:inline-flex;gap:12rpx;padding-bottom:8rpx;}.category-tabs>text{padding:14rpx 22rpx;border-radius:28rpx;background:#E8EFEB;color:#708477;font-size:23rpx;}.category-tabs>.active{background:#27B786;color:#fff;}.food-row{gap:20rpx;}.food-row>view:first-child{flex:1;min-width:0;}.food-reference{text-align:right;flex-shrink:0;}.food-reference .food-calorie{font-size:26rpx;}.food-reference .food-category{font-size:20rpx;}.source-link{display:block;color:#16805D;font-size:22rpx;margin-top:12rpx;}
.dish-summary{display:flex;align-items:center;gap:18rpx;margin:26rpx 0;}.dish-summary>view{flex:1;min-width:0;}.dish-summary .preview{width:100rpx;height:100rpx;margin:0;border-radius:20rpx;flex-shrink:0;}.dish-name{display:block;font-size:32rpx;font-weight:700;}.dish-hint{display:block;font-size:23rpx;color:#74827C;margin-top:8rpx;}.change-food{display:block;color:#16805D;font-size:24rpx;padding:12rpx 0;flex-shrink:0;}
.reference-card{padding:28rpx;border-radius:24rpx;background:#EAF8F1;margin-bottom:24rpx;}.reference-label{color:#33765E;font-size:24rpx;}.reference-total{margin:12rpx 0;color:#16805D;font-size:26rpx;}.reference-total text{font-size:58rpx;font-weight:700;}.reference-detail,.reference-note{display:block;color:#5D786B;font-size:22rpx;line-height:1.7;}.reference-note{margin-top:8rpx;}.nutrition-missing,.demo-tag{display:block;padding:22rpx;background:#FFF4E6;color:#91612B;font-size:23rpx;line-height:1.6;border-radius:18rpx;margin:16rpx 0;}
.section-label{font-size:24rpx;color:#74827C;}.candidate-list{margin:20rpx 0;}.candidate>text:last-child{color:#16805D;flex-shrink:0;margin-left:12rpx;}.editor-field input{width:140rpx;margin-right:10rpx;}.portion-options{display:flex;gap:14rpx;margin:20rpx 0 12rpx;}.portion-options>view{flex:1;padding:18rpx 8rpx;text-align:center;border:2rpx solid #E3EBE6;border-radius:18rpx;color:#62766A;font-size:24rpx;}.portion-options .active{background:#EAF8F1;border-color:#27B786;color:#16805D;}.portion-options text{display:block;}.portion-options text+text{font-size:22rpx;margin-top:6rpx;}.field-note{display:block;font-size:22rpx;line-height:1.6;color:#74827C;}.ratio-options{margin-bottom:24rpx;}
.calorie-result{gap:16rpx;margin:24rpx 0 16rpx;padding:24rpx;}.calorie-result .result-label{display:block;font-size:25rpx;color:#674839;font-weight:600;}.calorie-result .result-weight{display:block;margin-top:8rpx;font-size:22rpx;color:#9A7865;font-weight:400;}.result-number{font-size:23rpx;white-space:nowrap;}.confirmation{display:flex;align-items:center;gap:14rpx;margin:24rpx 0;font-size:23rpx;color:#52665B;min-height:60rpx;}.check-box{width:34rpx;height:34rpx;border:2rpx solid #AFC5B9;border-radius:9rpx;flex-shrink:0;text-align:center;line-height:34rpx;}.check-box.checked{background:#27B786;border-color:#27B786;color:#fff;}.save-button[disabled]{background:#DCE6E0;color:#83968A;}.food-picker{background:#F5F9F6;border-radius:20rpx;padding:20rpx;margin:20rpx 0;}.food-picker .search{box-shadow:none;padding:0 12rpx;}.food-picker .search input{min-width:0;width:100%;margin:0 10rpx 0 0;}.food-picker .search>text{white-space:nowrap;color:#16805D;font-size:24rpx;}.picker-row{display:flex;justify-content:space-between;gap:14rpx;padding:22rpx 0;border-bottom:2rpx solid #E4ECE6;font-size:24rpx;}.picker-row text:last-child{color:#74827C;font-size:21rpx;white-space:nowrap;}.editor{padding-bottom:calc(40rpx + env(safe-area-inset-bottom));}
</style>
