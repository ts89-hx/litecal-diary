<template>
  <div class="about-view">
    <h1>关于轻卡日记</h1>
    <p>欢迎使用轻卡日记后台管理系统！</p>
    <p>我们的系统旨在帮助用户通过科学的饮食和运动管理实现健康的生活方式。</p>
  </div>
</template>

<script>
export default {
  name: 'AboutView'
};
</script>

<style scoped>
.about-view {
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  color: #42b983;
  text-align: center;
  margin-bottom: 20px;
}

h2 {
  color: #333;
  margin-top: 20px;
}

p {
  color: #666;
  line-height: 1.6;
}

.features, .contact {
  margin-top: 20px;
}

ul {
  list-style-type: disc;
  padding-left: 20px;
}

li {
  margin-bottom: 10px;
  color: #555;
}
</style> 
