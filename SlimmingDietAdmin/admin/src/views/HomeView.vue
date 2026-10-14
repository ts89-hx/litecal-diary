<template>
  <div class="home-view">
    <h1>首页</h1>
    <p>欢迎来到轻卡日记后台管理系统首页</p>
    <div class="charts">
      <div ref="genderChart" class="chart-container"></div>
      <div ref="ageChart" class="chart-container"></div>
      <div ref="activityChart" class="chart-container"></div>
      <div ref="targetChart" class="chart-container"></div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import { getAllUsers } from '../api/user';

export default {
  data() {
    return {
      users: [],
      genderMap: {
        male: '男',
        female: '女'
      },
      activityLevelMap: {
        light: '轻度',
        sedentary: '久坐',
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
  mounted() {
    this.fetchUserData();
  },
  methods: {
    async fetchUserData() {
      try {
        const response = await getAllUsers();
        console.log(response);
        console.log(response.data);
        this.users = response.data;
        this.initCharts();
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    },
    initCharts() {
      this.initGenderChart();
      this.initAgeChart();
      this.initActivityChart();
      this.initTargetChart();
    },
    initGenderChart() {
      const chart = echarts.init(this.$refs.genderChart);
      const genderData = this.analyzeGenderData();
      const option = {
        title: {
          text: '用户性别分布',
          left: 'center'
        },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            name: '性别',
            type: 'pie',
            radius: '50%',
            data: genderData,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      };
      chart.setOption(option);
    },
    initAgeChart() {
      const chart = echarts.init(this.$refs.ageChart);
      const ageData = this.analyzeAgeData();
      const option = {
        title: {
          text: '用户年龄分布',
          left: 'center'
        },
        xAxis: {
          type: 'category',
          data: ageData.categories
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: ageData.values,
            type: 'bar'
          }
        ]
      };
      chart.setOption(option);
    },
    initActivityChart() {
      const chart = echarts.init(this.$refs.activityChart);
      const activityData = this.analyzeActivityData();
      const option = {
        title: {
          text: '用户活动水平',
          left: 'center'
        },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            name: '活动水平',
            type: 'pie',
            radius: '50%',
            data: activityData,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      };
      chart.setOption(option);
    },
    initTargetChart() {
      const chart = echarts.init(this.$refs.targetChart);
      const targetData = this.analyzeTargetData();
      const option = {
        title: {
          text: '用户目标分布',
          left: 'center'
        },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            name: '目标',
            type: 'pie',
            radius: '50%',
            data: targetData,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      };
      chart.setOption(option);
    },
    analyzeGenderData() {
      const genderCount = { 男: 0, 女: 0 };
      this.users.forEach(user => {
        const gender = this.genderMap[user.gender];
        if (gender) {
          genderCount[gender]++;
        }
      });
      return [
        { value: genderCount['男'], name: '男' },
        { value: genderCount['女'], name: '女' }
      ];
    },
    analyzeAgeData() {
      const ageGroups = { '0-18': 0, '19-35': 0, '36-50': 0, '51+': 0 };
      this.users.forEach(user => {
        if (user.age <= 18) {
          ageGroups['0-18']++;
        } else if (user.age <= 35) {
          ageGroups['19-35']++;
        } else if (user.age <= 50) {
          ageGroups['36-50']++;
        } else {
          ageGroups['51+']++;
        }
      });
      return {
        categories: Object.keys(ageGroups),
        values: Object.values(ageGroups)
      };
    },
    analyzeActivityData() {
      const activityCount = { 轻度: 0, 久坐: 0, 中度: 0, 高强度: 0 };
      this.users.forEach(user => {
        const activity = this.activityLevelMap[user.activity_level];
        if (activity) {
          activityCount[activity]++;
        }
      });
      return Object.keys(activityCount).map(key => ({
        value: activityCount[key],
        name: key
      }));
    },
    analyzeTargetData() {
      const targetCount = { 减重: 0, 增重: 0, 减脂: 0, 增肌: 0 };
      this.users.forEach(user => {
        const target = this.targetMap[user.target];
        if (target) {
          targetCount[target]++;
        }
      });
      return Object.keys(targetCount).map(key => ({
        value: targetCount[key],
        name: key
      }));
    }
  }
};
</script>

<style scoped>
.home-view {
  padding: 20px;
  background-color: #f5f5f5;
  /* height: calc(100vh - 40px); */
}

.charts {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.chart-container {
  width: 45%;
  height: 340px;
  margin: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style> 
