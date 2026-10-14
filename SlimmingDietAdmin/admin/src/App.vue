<template>
  <div id="app">
    <div class="layout">
      <Sidebar v-if="!isLoginPage" />
      <div class="content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from './components/Sidebar.vue';

export default {
  components: {
    Sidebar
  },
  computed: {
    isLoginPage() {
      return this.$route.path === '/login';
    }
  }
};
</script>

<style>
body {
  margin: 0;
  padding: 0;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin: 0;
  padding: 0;
}

.layout {
  display: flex;
}

.content {
  flex: 1;
  padding: 20px;
  height: calc(100vh - 40px);
  overflow: auto;
}
</style> 