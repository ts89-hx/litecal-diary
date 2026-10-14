<template>
  <div class="user-management">
    <el-page-header content="用户管理" />
    <el-button type="primary" @click="openCreateUserForm" style="margin-bottom: 16px; float: right;">
      添加用户
    </el-button>
    <el-dialog
      :title="isEditing ? '编辑用户' : '创建新用户'"
      :visible.sync="showUserForm"
      @close="resetForm"
    >
      <el-form :model="newUser">
        <el-form-item label="用户名">
          <el-input v-model="newUser.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input type="password" v-model="newUser.password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="性别">
          <el-select v-model="newUser.gender" placeholder="请选择性别">
            <el-option label="男" value="male"></el-option>
            <el-option label="女" value="female"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="年龄">
          <el-input-number v-model="newUser.age" :min="0" />
        </el-form-item>
        <el-form-item label="身高">
          <el-input-number v-model="newUser.height" :min="0" />
        </el-form-item>
        <el-form-item label="活动水平">
          <el-select v-model="newUser.activity_level" placeholder="请选择活动水平">
            <el-option label="久坐" value="sedentary"></el-option>
            <el-option label="轻度" value="light"></el-option>
            <el-option label="中度" value="regular"></el-option>
            <el-option label="高强度" value="intense"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="目标">
          <el-select v-model="newUser.target" placeholder="请选择目标">
            <el-option label="减重" value="lose_weight"></el-option>
            <el-option label="增重" value="gain_weight"></el-option>
            <el-option label="减脂" value="lose_fat"></el-option>
            <el-option label="增肌" value="gain_muscle"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetForm">取消</el-button>
        <el-button type="primary" @click="isEditing ? updateUser() : createUser()">
          {{ isEditing ? '更新' : '创建' }}
        </el-button>
      </div>
    </el-dialog>
    <el-table :data="users" style="width: 100%">
      <el-table-column prop="id" label="ID" width="50" />
      <el-table-column prop="username" label="用户名" />
      <el-table-column label="性别">
        <template slot-scope="scope">
          <span>{{ genderMap[scope.row.gender] }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="age" label="年龄" />
      <el-table-column prop="height" label="身高" />
      <el-table-column label="活动水平">
        <template slot-scope="scope">
          <span>{{ activityLevelMap[scope.row.activity_level] }}</span>
        </template>
      </el-table-column>
      <el-table-column label="目标">
        <template slot-scope="scope">
          <span>{{ targetMap[scope.row.target] }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="avatar" label="头像">
        <template slot-scope="scope">
          <img :src="`http://localhost:3000${scope.row.avatar}`" alt="avatar" style="width: 50px; height: 50px;" />
        </template>
      </el-table-column>
      <el-table-column label="登录方式">
        <template slot-scope="scope">
          <span>{{ scope.row.wechat_open_id ? '微信登录' : '手机登录' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template slot-scope="scope">
          <el-button size="mini" @click="openEditUserForm(scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="deleteUser(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { getAllUsers, createUser, updateUser, deleteUser } from '../api/user';

export default {
  data() {
    return {
      users: [],
      newUser: {
        username: '',
        password: '',
        gender: '',
        age: null,
        height: null,
        activity_level: '',
        target: '',
        avatar: ''
      },
      showUserForm: false,
      isEditing: false,
      genderMap: {
        male: '男',
        female: '女'
      },
      activityLevelMap: {
        sedentary: '久坐',
        light: '轻度',
        regular: '中度',
        intense: '高强度'
      },
      targetMap: {
        lose_weight: '减重',
        gain_weight: '增重',
        lose_fat: '减脂',
        gain_muscle: '增肌'
      }
    };
  },
  created() {
    this.fetchUsers();
  },
  methods: {
    async fetchUsers() {
      try {
        const response = await getAllUsers();
        this.users = response.data;
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    },
    openCreateUserForm() {
      this.isEditing = false;
      this.showUserForm = true;
    },
    async createUser() {
      try {
        await createUser(this.newUser);
        this.fetchUsers();
        this.resetForm();
      } catch (error) {
        console.error('Error creating user:', error);
      }
    },
    openEditUserForm(user) {
      this.newUser = { ...user };
      this.isEditing = true;
      this.showUserForm = true;
    },
    async updateUser() {
      try {
        await updateUser(this.newUser.id, this.newUser);
        this.fetchUsers();
        this.resetForm();
      } catch (error) {
        console.error('Error updating user:', error);
      }
    },
    async deleteUser(id) {
      if (confirm('确定要删除这个用户吗？')) {
        try {
          await deleteUser(id);
          this.fetchUsers();
        } catch (error) {
          console.error('Error deleting user:', error);
        }
      }
    },
    resetForm() {
      this.newUser = {
        username: '',
        password: '',
        gender: '',
        age: null,
        height: null,
        activity_level: '',
        target: '',
        avatar: ''
      };
      this.showUserForm = false;
    }
  }
};
</script>

<style scoped>
.user-management {
  padding: 20px;
  /* height: calc(100vh - 40px); */
}
</style> 