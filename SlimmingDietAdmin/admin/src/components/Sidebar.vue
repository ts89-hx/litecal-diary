<template>
  <div class="sidebar">
    <ul>
      <li v-for="item in menuItems" :key="item.name">
        <router-link :to="item.path">
          <i :class="item.icon" class="icon"></i>
          {{ item.name }}
        </router-link>
      </li>
    </ul>
    <button class="logout-button" @click="logout">
      <i class="el-icon-switch-button icon"></i>
      退出
    </button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      menuItems: [
        { name: '首页', path: '/', icon: 'el-icon-s-home' },
        { name: '用户管理', path: '/users', icon: 'el-icon-user-solid' },
        { name: '饮食选项管理', path: '/diet', icon: 'el-icon-food' },
        { name: '运动选项管理', path: '/sport', icon: 'el-icon-bicycle' },
        { name: '关于', path: '/about', icon: 'el-icon-info' },
      ]
    };
  },
  methods: {
    logout() {
      // 清空本地存储的 token
      localStorage.removeItem('token');
      // 导航到登录页面
      this.$router.push('/login');
    }
  }
};
</script>

<style scoped>
.sidebar {
  width: 200px;
  background-color: #f4f4f4;
  height: calc(100vh - 40px);
  padding: 20px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  margin: 10px 0;
  display: flex;
  align-items: center;
}

a {
  text-decoration: none;
  color: #333;
  display: flex;
  align-items: center;
}

a.router-link-exact-active {
  font-weight: bold;
  color: #42b983;
}

.icon {
  margin-right: 10px;
  font-size: 18px;
}

.logout-button {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 10px;
  margin-top: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logout-button:hover {
  background-color: #369f6b;
}
</style> 