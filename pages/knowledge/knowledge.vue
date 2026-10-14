<template>
  <view class="knowledge-page">
    <view class="custom-nav"><view class="back" @click="goBack"><image src="/static/discover/back.svg" mode="aspectFit"/></view><text>健康知识</text><view class="nav-space"></view></view>
    <view class="search-box"><image src="/static/discover/search.svg" mode="aspectFit"/><input v-model.trim="query" placeholder="搜索营养、减脂、食材知识"/></view>
    <scroll-view scroll-x class="category-scroll" :show-scrollbar="false"><view class="categories"><text v-for="item in categories" :key="item" :class="{active:category===item}" @click="category=item">{{ item }}</text></view></scroll-view>
    <view class="section-head"><text>今日精选</text><text>{{ visibleArticles.length }} 篇 · 全部显示</text></view>
    <view class="article-list">
      <view v-for="article in visibleArticles" :key="article.id" class="article-card" @click="selectedArticle=article">
        <view :class="['article-icon',article.tone]"><image :src="article.icon" mode="aspectFit"/></view>
        <view class="article-copy"><text class="article-title">{{ article.title }}</text><text class="article-summary">{{ article.summary }}</text><view class="article-meta"><image src="/static/discover/clock.svg" mode="aspectFit"/><text>{{ article.minutes }} 分钟 · {{ article.category }}</text></view></view>
        <text class="chevron">›</text>
      </view>
      <view v-if="!visibleArticles.length" class="empty">没有找到相关内容</view>
    </view>

    <view v-if="selectedArticle" class="article-mask" @click="selectedArticle=null">
      <view class="article-sheet" @click.stop>
        <view class="sheet-head"><view :class="['article-icon',selectedArticle.tone]"><image :src="selectedArticle.icon" mode="aspectFit"/></view><view><text>{{ selectedArticle.title }}</text><text>{{ selectedArticle.minutes }} 分钟 · {{ selectedArticle.category }}</text></view><text class="close" @click="selectedArticle=null">×</text></view>
        <text class="sheet-summary">{{ selectedArticle.summary }}</text>
        <view v-for="(tip,index) in selectedArticle.tips" :key="tip" class="tip-row"><text>{{ index+1 }}</text><text>{{ tip }}</text></view>
        <text class="medical-note">内容仅用于一般健康知识分享，不替代医生或营养师的个体化建议。</text>
        <button @click="selectedArticle=null">知道了</button>
      </view>
    </view>
  </view>
</template>

<script>
import { knowledgeArticles, findKnowledgeArticle } from '../../data/discovery';

export default {
  data() { return { articles: knowledgeArticles, query: '', category: '精选', categories: ['精选', '搭配', '常识', '选购技巧', '基础营养'], selectedArticle: null }; },
  computed: {
    visibleArticles() {
      const keyword = this.query.toLowerCase();
      return this.articles.filter(item => (this.category === '精选' || item.category === this.category) && (!keyword || `${item.title}${item.summary}${item.category}`.toLowerCase().includes(keyword)));
    },
  },
  onLoad(query) { if (query.id) this.selectedArticle = findKnowledgeArticle(query.id) || null; },
  methods: { goBack() { uni.navigateBack({ delta: 1, fail: () => uni.switchTab({ url: '/pages/discover/discover' }) }); } },
};
</script>

<style>
.knowledge-page{height:100vh;box-sizing:border-box;overflow:hidden;padding:calc(var(--status-bar-height, 0px) + 12rpx) 28rpx 22rpx;background:#F7F9F4;color:#20312C;}.custom-nav{height:72rpx;display:flex;align-items:center;justify-content:space-between;font-size:36rpx;font-weight:700;}.back,.nav-space{width:54rpx;height:54rpx;display:flex;align-items:center;justify-content:center;}.back image{width:42rpx;height:42rpx;}.search-box{height:72rpx;display:flex;align-items:center;gap:14rpx;padding:0 22rpx;border-radius:36rpx;background:#fff;box-shadow:0 10rpx 24rpx rgba(47,91,75,.07);}.search-box image{width:32rpx;height:32rpx;}.search-box input{flex:1;font-size:23rpx;}.category-scroll{height:78rpx;white-space:nowrap;}.categories{height:78rpx;display:flex;align-items:center;gap:12rpx;}.categories text{padding:11rpx 22rpx;border-radius:23rpx;background:#fff;color:#75857F;font-size:21rpx;}.categories text.active{background:#27B786;color:#fff;font-weight:600;}.section-head{height:56rpx;display:flex;align-items:flex-start;justify-content:space-between;}.section-head text:first-child{font-size:29rpx;font-weight:700;}.section-head text:last-child{font-size:19rpx;color:#75857F;}.article-list{display:flex;flex-direction:column;gap:14rpx;}.article-card{height:150rpx;box-sizing:border-box;padding:14rpx;display:flex;align-items:center;border-radius:24rpx;background:#fff;box-shadow:0 10rpx 26rpx rgba(47,91,75,.07);}.article-icon{width:116rpx;height:122rpx;flex-shrink:0;display:flex;align-items:center;justify-content:center;border-radius:20rpx;}.article-icon image{width:92rpx;height:92rpx;}.article-icon.orange{background:#FFF3E8}.article-icon.green{background:#EAF8F2}.article-icon.blue{background:#EEF2FB}.article-icon.purple{background:#F4EFFB}.article-copy{flex:1;min-width:0;margin-left:20rpx;}.article-title,.article-summary{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}.article-title{font-size:25rpx;font-weight:700;}.article-summary{margin-top:12rpx;font-size:19rpx;color:#75857F;}.article-meta{margin-top:16rpx;display:flex;align-items:center;gap:7rpx;color:#87958F;font-size:18rpx;}.article-meta image{width:22rpx;height:22rpx;}.chevron{font-size:34rpx;color:#9EAAA5;}.empty{padding:100rpx 0;text-align:center;color:#87958F;}
.article-mask{position:fixed;inset:0;z-index:20;display:flex;align-items:flex-end;background:rgba(25,45,37,.42);}.article-sheet{width:100%;box-sizing:border-box;padding:34rpx 30rpx calc(38rpx + env(safe-area-inset-bottom));border-radius:36rpx 36rpx 0 0;background:#fff;}.sheet-head{display:flex;align-items:center;position:relative;}.sheet-head .article-icon{width:86rpx;height:86rpx}.sheet-head .article-icon image{width:68rpx;height:68rpx}.sheet-head>view:nth-child(2){flex:1;margin-left:18rpx}.sheet-head text{display:block}.sheet-head>view:nth-child(2)>text:first-child{font-size:31rpx;font-weight:700}.sheet-head>view:nth-child(2)>text:last-child{margin-top:7rpx;color:#87958F;font-size:20rpx}.close{font-size:44rpx;color:#8A9892}.sheet-summary{display:block;margin:28rpx 0 18rpx;color:#536760;font-size:24rpx}.tip-row{display:flex;gap:18rpx;padding:18rpx 0;border-bottom:1px solid #EEF2F0;font-size:23rpx;line-height:1.55}.tip-row text:first-child{width:42rpx;height:42rpx;line-height:42rpx;flex-shrink:0;text-align:center;border-radius:50%;background:#E4F7EF;color:#16805D;font-weight:700}.medical-note{display:block;margin:22rpx 0;color:#87958F;font-size:19rpx;line-height:1.55}.article-sheet button{height:82rpx;line-height:82rpx;border-radius:24rpx;background:#27B786;color:#fff;font-size:25rpx;font-weight:600;}
@media screen and (max-height:700px){.article-card{height:132rpx}.article-icon{height:104rpx}.article-icon image{width:78rpx;height:78rpx}.article-list{gap:10rpx}.category-scroll,.categories{height:66rpx}}
</style>
