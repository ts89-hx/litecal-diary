<template>
  <view v-if="recipe" class="recipe-page">
    <view class="custom-nav"><view class="nav-button" @click="goBack"><image src="/static/discover/back.svg" mode="aspectFit"/></view><text>{{ recipe.mealName }}菜谱</text><view class="nav-button favorite" @click="toggleFavorite"><image :src="favorite ? '/static/discover/heart-filled.svg' : '/static/discover/heart.svg'" mode="aspectFit"/></view></view>
    <view class="hero"><view class="season-tag"><image src="/static/discover/leaf.svg" mode="aspectFit"/><text>{{ season.name }}</text></view><image class="hero-art" :src="heroArt" mode="aspectFit"/></view>
    <text class="recipe-title">{{ recipe.name }}</text><text class="recipe-sub">{{ recipe.ingredientsText }}</text>
    <view class="stats-card"><view><text>{{ recipe.calories }}</text><text>千卡</text></view><view><text>{{ recipe.duration }}</text><text>分钟</text></view><view><text>{{ recipe.feature }}</text><text>营养特点</text></view></view>
    <text class="section-title">所需食材</text>
    <view class="ingredient-grid"><view v-for="item in recipe.ingredients" :key="item.name" class="ingredient-card"><view :class="['ingredient-icon',item.icon]">{{ item.name.slice(0,1) }}</view><view><text>{{ item.name }}</text><text>{{ item.amount }}</text></view></view></view>
    <text class="section-title steps-title">做法</text>
    <view class="steps"><view v-for="(step,index) in recipe.steps" :key="step.title" class="step-card"><text class="step-number">{{ index+1 }}</text><view><text>{{ step.title }}</text><text>{{ step.detail }} · {{ step.time }}</text></view></view></view>
    <view class="bottom-actions"><button class="collect" @click="toggleFavorite"><image :src="favorite ? '/static/discover/heart-filled.svg' : '/static/discover/heart.svg'" mode="aspectFit"/><text>{{ favorite ? '已收藏' : '收藏' }}</text></button><button class="record" @click="recordRecipe">＋　记入今日饮食</button></view>
  </view>
</template>

<script>
import { findDiscoverRecipe, getSeason } from '../../data/discovery';

export default {
  data() { return { recipe: null, season: getSeason(new Date()), favorite: false }; },
  computed: { heroArt() { return this.recipe.meal === 'dinner' ? '/static/discover/recipe-hero.svg' : this.recipe.art; } },
  onLoad(query) {
    this.recipe = findDiscoverRecipe(query.id);
    if (!this.recipe) { uni.showToast({ title: '未找到菜谱', icon: 'none' }); setTimeout(() => this.goBack(), 500); return; }
    this.favorite = (uni.getStorageSync('discover_recipe_favorites') || []).includes(this.recipe.id);
  },
  methods: {
    goBack() { uni.navigateBack({ delta: 1, fail: () => uni.switchTab({ url: '/pages/discover/discover' }) }); },
    toggleFavorite() {
      const ids = uni.getStorageSync('discover_recipe_favorites') || [];
      const next = this.favorite ? ids.filter(id => id !== this.recipe.id) : [...new Set([...ids, this.recipe.id])];
      uni.setStorageSync('discover_recipe_favorites', next); this.favorite = !this.favorite;
      uni.showToast({ title: this.favorite ? '已收藏' : '已取消收藏', icon: 'none' });
    },
    recordRecipe() { uni.navigateTo({ url: `/pages/diet_records/diet_records?recipe=${encodeURIComponent(this.recipe.id)}` }); },
  },
};
</script>

<style>
.recipe-page{position:relative;height:100vh;box-sizing:border-box;overflow:hidden;padding:calc(var(--status-bar-height, 0px) + 12rpx) 28rpx 112rpx;background:#F7F9F4;color:#20312C;}.custom-nav{height:72rpx;display:flex;align-items:center;justify-content:space-between;font-size:34rpx;font-weight:700;}.nav-button{width:58rpx;height:58rpx;display:flex;align-items:center;justify-content:center;border-radius:50%;}.nav-button.favorite{background:#fff;box-shadow:0 8rpx 20rpx rgba(47,91,75,.08);}.nav-button image{width:40rpx;height:40rpx;}
.hero{position:relative;height:238rpx;border-radius:28rpx;overflow:hidden;background:linear-gradient(145deg,#FFF1E8,#E9F7EF);box-shadow:0 14rpx 30rpx rgba(47,91,75,.08);}.hero-art{width:100%;height:100%;}.season-tag{position:absolute;left:18rpx;top:18rpx;z-index:2;height:40rpx;padding:0 16rpx 0 10rpx;display:flex;align-items:center;gap:7rpx;border-radius:20rpx;background:#27B786;color:#fff;font-size:18rpx;font-weight:600;}.season-tag image{width:22rpx;height:22rpx;}.recipe-title{display:block;margin-top:20rpx;font-size:36rpx;font-weight:700;}.recipe-sub{display:block;margin-top:7rpx;color:#75857F;font-size:20rpx;}.stats-card{height:92rpx;margin-top:18rpx;display:flex;align-items:center;border-radius:22rpx;background:#fff;box-shadow:0 10rpx 24rpx rgba(47,91,75,.07);}.stats-card view{flex:1;text-align:center;border-right:1px solid #E6ECE8;}.stats-card view:last-child{border:0}.stats-card text{display:block}.stats-card text:first-child{font-size:26rpx;font-weight:700}.stats-card text:last-child{margin-top:5rpx;font-size:17rpx;color:#87958F}.section-title{display:block;margin:22rpx 0 13rpx;font-size:27rpx;font-weight:700;}.ingredient-grid{display:grid;grid-template-columns:1fr 1fr;gap:12rpx;}.ingredient-card{height:76rpx;box-sizing:border-box;padding:10rpx 14rpx;display:flex;align-items:center;border-radius:18rpx;background:#fff;}.ingredient-icon{width:44rpx;height:44rpx;line-height:44rpx;flex-shrink:0;margin-right:12rpx;text-align:center;border-radius:50%;background:#FFF0E6;color:#D86F27;font-size:19rpx;font-weight:700;}.ingredient-icon.spinach{background:#E4F7EF;color:#16805D}.ingredient-icon.mushroom{background:#F1EDE7;color:#9A7656}.ingredient-card text{display:block}.ingredient-card view:last-child text:first-child{font-size:21rpx}.ingredient-card view:last-child text:last-child{margin-top:3rpx;font-size:16rpx;color:#87958F}.steps-title{margin-top:18rpx}.steps{display:flex;flex-direction:column;gap:12rpx}.step-card{height:84rpx;box-sizing:border-box;padding:12rpx;display:flex;align-items:center;border-radius:20rpx;background:#fff;box-shadow:0 8rpx 20rpx rgba(47,91,75,.06);}.step-number{width:46rpx;height:46rpx;line-height:46rpx;flex-shrink:0;margin-right:14rpx;text-align:center;border-radius:50%;background:#E4F7EF;color:#16805D;font-size:21rpx;font-weight:700}.step-card view text{display:block}.step-card view text:first-child{font-size:22rpx;font-weight:700}.step-card view text:last-child{margin-top:5rpx;font-size:16rpx;color:#75857F;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:590rpx}.bottom-actions{position:absolute;left:0;right:0;bottom:0;height:104rpx;box-sizing:border-box;padding:13rpx 28rpx calc(13rpx + env(safe-area-inset-bottom));display:flex;gap:16rpx;background:#fff;border-top:1px solid #E6ECE8}.bottom-actions button{height:76rpx;line-height:76rpx;border-radius:38rpx;font-size:22rpx}.collect{width:188rpx;display:flex;align-items:center;justify-content:center;gap:10rpx;background:#EEF3F0;color:#536760}.collect image{width:34rpx;height:34rpx}.record{flex:1;background:linear-gradient(145deg,#31BE8C,#16986D);color:#fff;font-weight:700}
@media screen and (max-height:700px){.hero{height:190rpx}.recipe-title{margin-top:12rpx}.stats-card{height:78rpx;margin-top:12rpx}.section-title{margin:14rpx 0 9rpx}.ingredient-card{height:66rpx}.step-card{height:70rpx}.recipe-page{padding-bottom:100rpx}.bottom-actions{height:94rpx}}
</style>
