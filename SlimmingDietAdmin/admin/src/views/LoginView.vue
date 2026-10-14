<template>
    <div class="login-container-bg">
        <div class="login-container">
            <h1>轻卡日记后台管理登录</h1>
            <form @submit.prevent="handleLogin">
            <div class="form-group">
                <label for="username">用户名</label>
                <input type="text" id="username" v-model="username" required />
            </div>
            <div class="form-group">
                <label for="password">密码</label>
                <input type="password" id="password" v-model="password" required />
            </div>
            <button type="submit">登录</button>
            </form>
        </div>
    </div>
</template>

<script>
import { login } from '../api/admin';

export default {
  data() {
    return {
      username: '',
      password: ''
    };
  },
  methods: {
    async handleLogin() {
      try {
        const response = await login(this.username, this.password);
        if (response.data.success) {
          console.log('登录成功，Token:', response.data.token);
          // 存储 token 到本地存储
          localStorage.setItem('authToken', response.data.token);
          // 跳转到首页
          this.$router.push('/');
        } else {
          alert('登录失败：' + response.data.message);
        }
      } catch (error) {
        console.error('登录请求失败:', error);
        alert('登录请求失败');
      }
    }
  }
};
</script>

<style scoped>
.login-container-bg {
  background-image: url('@/static/bg-admin.jpg');
  background-size: cover;
  background-position: center;
  height: 100vh;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.login-container {
  max-width: 400px;
  margin: 15% 10%;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  /* background-image: url('@/static/bg-admin.jpg'); */
  /* height: calc(100vh - 40px); */
}

h1 {
  text-align: center;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background-color: #36a372;
}
</style> 
