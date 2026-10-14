<template>
  <div class="sport-management">
    <el-page-header content="运动选项管理" />
    <el-button type="primary" @click="openCreateSportForm" style="margin-bottom: 16px; float: right;">
      添加运动选项
    </el-button>
    <el-dialog
      :title="isEditing ? '编辑运动选项' : '创建新运动选项'"
      :visible.sync="showSportForm"
      @close="resetForm"
    >
      <el-form :model="newSport">
        <el-form-item label="名称">
          <el-input v-model="newSport.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="卡路里">
          <el-input-number v-model="newSport.calories" :min="0" />
        </el-form-item>
        <el-form-item label="类别">
          <el-select v-model="newSport.category" placeholder="请选择类别">
            <el-option label="有氧运动" value="aerobic"></el-option>
            <el-option label="力量训练" value="strength"></el-option>
            <el-option label="柔韧性" value="flexibility"></el-option>
            <el-option label="平衡" value="balance"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetForm">取消</el-button>
        <el-button type="primary" @click="isEditing ? updateSport() : createSport()">
          {{ isEditing ? '更新' : '创建' }}
        </el-button>
      </div>
    </el-dialog>
    <el-table :data="sports" style="width: 100%">
      <el-table-column prop="id" label="ID" width="50" />
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="calories" label="卡路里" />
      <el-table-column prop="category" label="类别" />
      <el-table-column label="操作" width="150">
        <template slot-scope="scope">
          <el-button size="mini" @click="openEditSportForm(scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="deleteSport(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { getAllSportRecords, createSportRecord, updateSportRecord, deleteSportRecord } from '../api/sport';

export default {
  data() {
    return {
      sports: [],
      newSport: {
        name: '',
        calories: 0,
        category: ''
      },
      showSportForm: false,
      isEditing: false
    };
  },
  created() {
    this.fetchSports();
  },
  methods: {
    async fetchSports() {
      try {
        const response = await getAllSportRecords();
        this.sports = response.data;
      } catch (error) {
        console.error('Error fetching sport records:', error);
      }
    },
    openCreateSportForm() {
      this.isEditing = false;
      this.showSportForm = true;
    },
    async createSport() {
      try {
        await createSportRecord(this.newSport);
        this.fetchSports();
        this.resetForm();
      } catch (error) {
        console.error('Error creating sport record:', error);
      }
    },
    openEditSportForm(sport) {
      this.newSport = { ...sport };
      this.isEditing = true;
      this.showSportForm = true;
    },
    async updateSport() {
      try {
        await updateSportRecord(this.newSport.id, this.newSport);
        this.fetchSports();
        this.resetForm();
      } catch (error) {
        console.error('Error updating sport record:', error);
      }
    },
    async deleteSport(id) {
      if (confirm('确定要删除这个运动选项吗？')) {
        try {
          await deleteSportRecord(id);
          this.fetchSports();
        } catch (error) {
          console.error('Error deleting sport record:', error);
        }
      }
    },
    resetForm() {
      this.newSport = {
        name: '',
        calories: 0,
        category: ''
      };
      this.showSportForm = false;
    }
  }
};
</script>

<style scoped>
.sport-management {
  padding: 20px;
  /* height: calc(100vh - 40px); */
}
</style> 