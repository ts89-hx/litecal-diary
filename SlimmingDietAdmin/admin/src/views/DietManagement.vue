<template>
  <div class="diet-management">
    <el-page-header content="饮食选项管理" />
    <el-button type="primary" @click="openCreateDietForm" style="margin-bottom: 16px; float: right;">
      添加饮食选项
    </el-button>
    <el-dialog
      :title="isEditing ? '编辑饮食选项' : '创建新饮食选项'"
      :visible.sync="showDietForm"
      @close="resetForm"
    >
      <el-form :model="newDiet">
        <el-form-item label="名称">
          <el-input v-model="newDiet.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="卡路里">
          <el-input-number v-model="newDiet.calories" :min="0" />
        </el-form-item>
        <el-form-item label="碳水化合物">
          <el-input-number v-model="newDiet.carbs" :min="0" />
        </el-form-item>
        <el-form-item label="脂肪">
          <el-input-number v-model="newDiet.fats" :min="0" />
        </el-form-item>
        <el-form-item label="蛋白质">
          <el-input-number v-model="newDiet.proteins" :min="0" />
        </el-form-item>
        <el-form-item label="类别">
          <el-select v-model="newDiet.category" placeholder="请选择类别">
            <el-option label="常见" value="common"></el-option>
            <el-option label="主食" value="staple"></el-option>
            <el-option label="蛋肉" value="protein"></el-option>
            <el-option label="豆类" value="legume"></el-option>
            <el-option label="蔬菜" value="vegetable"></el-option>
            <el-option label="水果" value="fruit"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetForm">取消</el-button>
        <el-button type="primary" @click="isEditing ? updateDiet() : createDiet()">
          {{ isEditing ? '更新' : '创建' }}
        </el-button>
      </div>
    </el-dialog>
    <el-table :data="diets" style="width: 100%">
      <el-table-column prop="id" label="ID" width="50" />
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="calories" label="卡路里" />
      <el-table-column prop="carbs" label="碳水化合物" />
      <el-table-column prop="fats" label="脂肪" />
      <el-table-column prop="proteins" label="蛋白质" />
      <el-table-column prop="category" label="类别" />
      <el-table-column label="操作" width="150">
        <template slot-scope="scope">
          <el-button size="mini" @click="openEditDietForm(scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="deleteDiet(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { getAllDietRecords, createDietRecord, updateDietRecord, deleteDietRecord } from '../api/diet';

export default {
  data() {
    return {
      diets: [],
      newDiet: {
        name: '',
        calories: 0,
        carbs: 0,
        fats: 0,
        proteins: 0,
        category: ''
      },
      showDietForm: false,
      isEditing: false
    };
  },
  created() {
    this.fetchDiets();
  },
  methods: {
    async fetchDiets() {
      try {
        const response = await getAllDietRecords();
        this.diets = response.data;
      } catch (error) {
        console.error('Error fetching diet records:', error);
      }
    },
    openCreateDietForm() {
      this.isEditing = false;
      this.showDietForm = true;
    },
    async createDiet() {
      try {
        await createDietRecord(this.newDiet);
        this.fetchDiets();
        this.resetForm();
      } catch (error) {
        console.error('Error creating diet record:', error);
      }
    },
    openEditDietForm(diet) {
      this.newDiet = { ...diet };
      this.isEditing = true;
      this.showDietForm = true;
    },
    async updateDiet() {
      try {
        await updateDietRecord(this.newDiet.id, this.newDiet);
        this.fetchDiets();
        this.resetForm();
      } catch (error) {
        console.error('Error updating diet record:', error);
      }
    },
    async deleteDiet(id) {
      if (confirm('确定要删除这个饮食选项吗？')) {
        try {
          await deleteDietRecord(id);
          this.fetchDiets();
        } catch (error) {
          console.error('Error deleting diet record:', error);
        }
      }
    },
    resetForm() {
      this.newDiet = {
        name: '',
        calories: 0,
        carbs: 0,
        fats: 0,
        proteins: 0,
        category: ''
      };
      this.showDietForm = false;
    }
  }
};
</script>

<style scoped>
.diet-management {
  padding: 20px;
  /* height: calc(100vh - 40px); */
}
</style> 