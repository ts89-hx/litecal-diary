<template>
  <view :class="['discover-page', { 'is-compact': compact }]" :style="pageStyle">
    <view class="discover-nav" :style="navStyle">
      <text class="page-title">发现</text>
      <view class="nav-icon" @click="goKnowledge()"><image src="/static/discover/search.svg" mode="aspectFit" /></view>
    </view>

    <view class="season-banner">
      <view class="season-top">
        <view class="season-tag"><image src="/static/discover/leaf.svg" mode="aspectFit"/><text>{{ season.name }}</text></view>
        <text>{{ dateLabel }} · 每日更新</text>
      </view>
      <text class="season-title">今天的三餐，吃得轻也吃得应季</text>
      <text class="season-foods">{{ season.ingredients }}</text>
    </view>

    <view class="section-head">
      <text>今日轻食推荐</text>
      <text>早餐 · 午餐 · 晚餐</text>
    </view>
    <view class="recipe-list">
      <view v-for="recipe in recommendations" :key="recipe.id" class="recipe-card" @click="goRecipe(recipe)">
        <view :class="['recipe-art', recipe.meal]"><image :src="recipe.art" mode="aspectFit" /></view>
        <view class="recipe-copy">
          <view :class="['meal-tag', recipe.meal]"><image :src="mealIcon(recipe.meal)" mode="aspectFit"/><text>{{ recipe.mealName }}</text></view>
          <text class="recipe-name">{{ recipe.name }}</text>
          <text class="recipe-ingredients">{{ recipe.ingredientsText }}</text>
          <text class="recipe-energy">{{ recipe.calories }} <text>千卡 / 份</text></text>
        </view>
        <text class="recipe-arrow">›</text>
      </view>
    </view>

    <view class="section-head knowledge-head" @click="goKnowledge()">
      <text>健康知识</text>
      <text>全部 ›</text>
    </view>
    <view class="knowledge-grid">
      <view v-for="article in featuredArticles" :key="article.id" class="knowledge-card" @click="goKnowledge(article.id)">
        <view class="knowledge-top"><image :src="article.icon" mode="aspectFit"/><text :class="['knowledge-tag', article.tone]">{{ article.category }}</text></view>
        <text class="knowledge-title">{{ article.title }}</text>
        <text class="knowledge-summary">{{ article.summary }}</text>
        <text class="read-time">{{ article.minutes }} 分钟阅读　›</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getDailyRecommendations, getSeason, knowledgeArticles } from '../../data/discovery';

export default {
  data() {
    return { recommendations: [], season: {}, dateLabel: '', featuredArticles: knowledgeArticles.slice(0, 2), pageStyle: '', navStyle: '', compact: false };
  },
  onShow() { this.updateLayout(); this.refresh(); },
  onResize() { this.updateLayout(); },
  methods: {
    updateLayout() {
      const info = uni.getSystemInfoSync();
      const status = info.statusBarHeight || 0;
      let navHeight = 44;
      let rightSpace = 0;
      // Reserve the actual WeChat menu area, including its top/bottom spacing.
      // #ifdef MP-WEIXIN
      const menu = uni.getMenuButtonBoundingClientRect();
      if (menu && menu.height && menu.top >= status) {
        navHeight = menu.height + (menu.top - status) * 2;
        rightSpace = info.windowWidth - menu.left + 12;
      }
      // #endif
      // The fixed container follows the rendered viewport, not a cached API height.
      this.pageStyle = `padding-top:${status}px;`;
      this.navStyle = `height:${navHeight}px;padding-right:${rightSpace}px;`;
      this.compact = info.windowHeight - status - navHeight < 540;
    },
    refresh() {
      const now = new Date();
      this.recommendations = getDailyRecommendations(now);
      this.season = getSeason(now);
      this.dateLabel = `${now.getMonth() + 1}月${now.getDate()}日`;
    },
    mealIcon(meal) {
      const icons = {
        breakfast: '/static/discover/meal-breakfast.svg',
        lunch: '/static/discover/meal-lunch.svg',
        dinner: '/static/discover/meal-dinner.svg',
      };
      return icons[meal] || icons.breakfast;
    },
    goRecipe(recipe) { uni.navigateTo({ url: `/pages/recipe_detail/recipe_detail?id=${encodeURIComponent(recipe.id)}` }); },
    goKnowledge(id) { uni.navigateTo({ url: `/pages/knowledge/knowledge${id ? `?id=${encodeURIComponent(id)}` : ''}` }); },
  },
};
</script>

<style scoped>
.discover-page{height:100vh;box-sizing:border-box;overflow:hidden;padding:calc(var(--status-bar-height, 0px) + 18rpx) 28rpx 18rpx;background:#F7F9F4;color:#20312C;}
.discover-nav{height:72rpx;display:flex;align-items:center;justify-content:space-between;}.page-title{font-size:42rpx;font-weight:700;}.nav-icon{width:64rpx;height:64rpx;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#fff;box-shadow:0 10rpx 24rpx rgba(47,91,75,.09);}.nav-icon image{width:34rpx;height:34rpx;}
.season-banner{height:126rpx;box-sizing:border-box;padding:18rpx 22rpx;border-radius:26rpx;color:#fff;background:linear-gradient(145deg,#31BE8C,#16986D);box-shadow:0 14rpx 30rpx rgba(39,183,134,.2);}.season-top{display:flex;align-items:center;justify-content:space-between;font-size:19rpx;color:#DFF7EE;}.season-tag{height:38rpx;padding:0 14rpx 0 10rpx;border-radius:20rpx;display:flex;align-items:center;gap:7rpx;background:rgba(255,255,255,.18);color:#fff;font-weight:600;}.season-tag image{width:22rpx;height:22rpx;}.season-title{display:block;margin-top:12rpx;font-size:28rpx;font-weight:700;}.season-foods{display:block;margin-top:5rpx;font-size:19rpx;color:#DFF7EE;}
.section-head{height:64rpx;display:flex;align-items:flex-end;justify-content:space-between;padding-bottom:12rpx;box-sizing:border-box;}.section-head text:first-child{font-size:28rpx;font-weight:700;}.section-head text:last-child{font-size:19rpx;color:#75857F;}
.recipe-list{display:flex;flex-direction:column;gap:14rpx;}.recipe-card{height:132rpx;box-sizing:border-box;padding:12rpx;display:flex;align-items:center;border-radius:24rpx;background:#fff;box-shadow:0 10rpx 26rpx rgba(47,91,75,.07);}.recipe-art{width:106rpx;height:108rpx;flex-shrink:0;border-radius:19rpx;overflow:hidden;}.recipe-art image{width:100%;height:100%;}.recipe-copy{flex:1;min-width:0;margin-left:18rpx;}.meal-tag{height:29rpx;padding:0 12rpx 0 7rpx;display:inline-flex;align-items:center;gap:4rpx;border-radius:15rpx;font-size:18rpx;font-weight:600;}.meal-tag image{width:20rpx;height:20rpx;}.meal-tag.breakfast{background:#FFF0E6;color:#D86F27;}.meal-tag.lunch{background:#E4F7EF;color:#16805D;}.meal-tag.dinner{background:#EAF1FF;color:#4B6FA9;}.recipe-name,.recipe-ingredients{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}.recipe-name{margin-top:7rpx;font-size:25rpx;font-weight:700;}.recipe-ingredients{margin-top:4rpx;font-size:18rpx;color:#87958F;}.recipe-side{height:100%;display:flex;align-items:flex-end;padding-bottom:12rpx;gap:10rpx;color:#75857F;font-size:19rpx;}.recipe-side text:last-child{font-size:30rpx;color:#A0ACA7;}
.knowledge-head{height:58rpx;}.knowledge-grid{height:232rpx;display:flex;gap:14rpx;}.knowledge-card{flex:1;min-width:0;box-sizing:border-box;padding:16rpx;border-radius:24rpx;background:#fff;box-shadow:0 10rpx 26rpx rgba(47,91,75,.07);}.knowledge-top{display:flex;align-items:center;gap:10rpx;}.knowledge-top image{width:44rpx;height:44rpx;}.knowledge-tag{padding:5rpx 13rpx;border-radius:14rpx;font-size:17rpx;font-weight:600;}.knowledge-tag.orange{background:#FFF0E6;color:#D86F27;}.knowledge-tag.green{background:#E4F7EF;color:#16805D;}.knowledge-title{display:block;height:66rpx;margin-top:9rpx;font-size:24rpx;line-height:1.4;font-weight:700;}.knowledge-summary{display:block;height:28rpx;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:17rpx;color:#87958F;}.read-time{display:block;margin-top:7rpx;font-size:17rpx;color:#75857F;}
/* Distribute the available window height; native tabBar is already excluded
   from windowHeight. Only the custom status/navigation area is reserved here. */
.discover-page{display:flex;flex-direction:column;padding:0 28rpx 24rpx;}
.discover-nav{flex-shrink:0;box-sizing:border-box;position:relative;margin-bottom:14rpx;}
.nav-icon{width:56rpx;height:56rpx;flex-shrink:0;}
.season-banner{height:auto;flex-shrink:0;padding:20rpx 22rpx;}
.season-title{line-height:1.4;}
.season-foods{line-height:1.4;}
.section-head{flex-shrink:0;height:66rpx;}
.recipe-list{flex:1;min-height:0;gap:16rpx;}
.recipe-card{flex:1;height:auto;min-height:0;padding:18rpx;}
.recipe-art{width:124rpx;height:100%;max-height:158rpx;}
.recipe-copy{margin-left:16rpx;}
.recipe-name{font-size:27rpx;line-height:1.4;margin-top:10rpx;}
.recipe-ingredients{font-size:20rpx;line-height:1.4;margin-top:8rpx;}
.recipe-side{flex-shrink:0;margin-left:8rpx;font-size:18rpx;box-sizing:border-box;}
.knowledge-head{height:66rpx;}
.knowledge-grid{height:260rpx;flex-shrink:0;gap:16rpx;}
.knowledge-card{display:flex;flex-direction:column;padding:20rpx;}
.knowledge-title{height:auto;flex:1;min-height:0;font-size:25rpx;line-height:1.4;}
.knowledge-summary{height:auto;line-height:1.5;}
.read-time{line-height:1.5;margin-top:10rpx;}
.is-compact.discover-page{padding-bottom:16rpx;}
.is-compact .discover-nav{margin-bottom:8rpx;}
.is-compact .season-banner{padding:14rpx 20rpx;}
.is-compact .season-tag{height:30rpx;}
.is-compact .season-title{font-size:26rpx;margin-top:6rpx;}
.is-compact .section-head{height:52rpx;padding-bottom:8rpx;}
.is-compact .recipe-list{gap:12rpx;}
.is-compact .recipe-card{padding:10rpx;}
.is-compact .recipe-art{width:96rpx;max-height:110rpx;}
.is-compact .recipe-name{font-size:24rpx;margin-top:4rpx;}
.is-compact .recipe-ingredients{font-size:18rpx;margin-top:3rpx;}
.is-compact .knowledge-grid{height:206rpx;}
.is-compact .knowledge-card{padding:14rpx;}
.is-compact .knowledge-top image{width:34rpx;height:34rpx;}
.is-compact .knowledge-title{font-size:22rpx;margin-top:6rpx;}
.is-compact .read-time{margin-top:4rpx;}
/* Definite grid tracks prevent percentage-height children from stretching flex rows. */
.discover-page{position:fixed;top:0;right:0;bottom:0;left:0;height:auto;display:grid;grid-template-rows:auto auto 60rpx minmax(0,1fr) 60rpx minmax(210rpx,26%);padding-right:28rpx;padding-left:28rpx;padding-bottom:20rpx;}
.discover-nav{margin-bottom:12rpx;}
.season-banner{padding:18rpx 22rpx;box-shadow:0 8rpx 20rpx rgba(39,183,134,.12);}
.section-head,.knowledge-head{height:auto;align-items:center;padding:0;}
.recipe-list{display:grid;grid-template-rows:repeat(3,minmax(0,1fr));gap:14rpx;min-height:0;}
.recipe-card{position:relative;min-height:0;height:100%;padding:14rpx;overflow:hidden;box-shadow:0 6rpx 18rpx rgba(47,91,75,.05);}
.recipe-art{width:146rpx;height:100%;max-height:170rpx;flex-shrink:0;}
.recipe-copy{margin-left:18rpx;}
.recipe-name{font-size:27rpx;line-height:1.3;margin-top:6rpx;}
.recipe-ingredients{font-size:19rpx;margin-top:5rpx;line-height:1.3;}
.recipe-energy{display:block;margin-top:8rpx;color:#228764;font-size:24rpx;font-weight:600;line-height:1.2;}
.recipe-energy text{font-size:18rpx;color:#82918B;font-weight:400;}
.recipe-arrow{font-size:34rpx;color:#A0ACA7;margin:0 6rpx 0 12rpx;}
.knowledge-grid{height:auto;min-height:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14rpx;}
.knowledge-card{min-height:0;padding:20rpx;overflow:hidden;}
.knowledge-title{flex:0 0 auto;font-size:25rpx;line-height:1.4;margin-top:10rpx;}
.knowledge-summary{white-space:normal;line-height:1.5;font-size:19rpx;margin-top:10rpx;}
.read-time{margin-top:auto;padding-top:10rpx;font-size:18rpx;}
.is-compact.discover-page{grid-template-rows:auto auto 48rpx minmax(0,1fr) 48rpx minmax(190rpx,24%);padding-bottom:14rpx;}
.is-compact .section-head,.is-compact .knowledge-head{height:auto;padding:0;}
.is-compact .recipe-art{width:116rpx;height:100%;max-height:138rpx;}
.is-compact .recipe-card{padding:10rpx;}
.is-compact .recipe-name{font-size:23rpx;margin-top:3rpx;}
.is-compact .recipe-energy{font-size:21rpx;margin-top:4rpx;}
.is-compact .meal-tag{height:25rpx;font-size:17rpx;}
.is-compact .knowledge-grid{height:auto;}
.is-compact .knowledge-title{font-size:22rpx;}
.is-compact .knowledge-summary{font-size:17rpx;margin-top:6rpx;}
.is-compact .read-time{margin-top:auto;padding-top:6rpx;font-size:16rpx;}
</style>
