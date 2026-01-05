<template>
  <div class="statistics-usage">
    <!-- 顶部统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="color: #409EFF;">
              <el-icon><Van /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalTrips }}</div>
              <div class="stat-label">总出车次数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="color: #67C23A;">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalHours }}</div>
              <div class="stat-label">总出车时长(小时)</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="color: #E6A23C;">
              <el-icon><Odometer /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalMileage }}</div>
              <div class="stat-label">总行驶里程(km)</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="color: #F56C6C;">
              <el-icon><Money /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalCost }}</div>
              <div class="stat-label">总费用(元)</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>月度出车趋势</span>
              <el-radio-group v-model="chartPeriod" size="small" @change="handlePeriodChange">
                <el-radio-button value="year">年度</el-radio-button>
                <el-radio-button value="quarter">季度</el-radio-button>
                <el-radio-button value="month">月度</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div id="trend-chart" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>车辆使用排行</span>
            </div>
          </template>
          <div id="ranking-chart" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>用车类型分布</span>
            </div>
          </template>
          <div id="type-chart" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>部门用车统计</span>
            </div>
          </template>
          <div id="dept-chart" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { Van, Clock, Odometer, Money } from '@element-plus/icons-vue'

defineOptions({
  name: 'StatisticsUsage'
})

// 统计数据
const stats = ref({
  totalTrips: 0,
  totalHours: 0,
  totalMileage: 0,
  totalCost: 0
})

// 图表周期
const chartPeriod = ref('year')

// 图表实例
let trendChart = null
let rankingChart = null
let typeChart = null
let deptChart = null

// 加载统计数据
const loadStats = () => {
  // 模拟数据，实际应从API获取
  stats.value = {
    totalTrips: 1256,
    totalHours: 3845,
    totalMileage: 85632,
    totalCost: 125680
  }
}

// 初始化趋势图
const initTrendChart = () => {
  trendChart = echarts.init(document.getElementById('trend-chart'))
  updateTrendChart()
}

// 更新趋势图
const updateTrendChart = () => {
  if (!trendChart) return

  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  const data = [120, 132, 101, 134, 90, 230, 210, 182, 191, 234, 290, 330]

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: months
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '出车次数',
        type: 'line',
        data: data,
        smooth: true,
        areaStyle: {
          opacity: 0.3
        }
      }
    ]
  }

  trendChart.setOption(option)
}

// 初始化排行榜图
const initRankingChart = () => {
  rankingChart = echarts.init(document.getElementById('ranking-chart'))
  updateRankingChart()
}

// 更新排行榜图
const updateRankingChart = () => {
  if (!rankingChart) return

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'value'
    },
    yAxis: {
      type: 'category',
      data: ['车辆1', '车辆2', '车辆3', '车辆4', '车辆5', '车辆6', '车辆7', '车辆8', '车辆9', '车辆10']
    },
    series: [
      {
        name: '出车次数',
        type: 'bar',
        data: [193, 234, 310, 285, 235, 210, 187, 165, 143, 120]
      }
    ]
  }

  rankingChart.setOption(option)
}

// 初始化类型分布图
const initTypeChart = () => {
  typeChart = echarts.init(document.getElementById('type-chart'))
  updateTypeChart()
}

// 更新类型分布图
const updateTypeChart = () => {
  if (!typeChart) return

  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '用车类型',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 735, name: '公务用车' },
          { value: 310, name: '通勤用车' },
          { value: 234, name: '接待用车' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }

  typeChart.setOption(option)
}

// 初始化部门统计图
const initDeptChart = () => {
  deptChart = echarts.init(document.getElementById('dept-chart'))
  updateDeptChart()
}

// 更新部门统计图
const updateDeptChart = () => {
  if (!deptChart) return

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['行政部', '销售部', '技术部', '市场部', '财务部']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '出车次数',
        type: 'bar',
        data: [320, 302, 301, 334, 290]
      }
    ]
  }

  deptChart.setOption(option)
}

// 周期变化处理
const handlePeriodChange = () => {
  updateTrendChart()
}

// 窗口大小变化处理
const handleResize = () => {
  trendChart?.resize()
  rankingChart?.resize()
  typeChart?.resize()
  deptChart?.resize()
}

// 组件挂载
onMounted(() => {
  loadStats()
  initTrendChart()
  initRankingChart()
  initTypeChart()
  initDeptChart()

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

// 组件卸载
onUnmounted(() => {
  trendChart?.dispose()
  rankingChart?.dispose()
  typeChart?.dispose()
  deptChart?.dispose()

  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.statistics-usage {
  padding: 20px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  cursor: pointer;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  font-size: 36px;
  margin-right: 20px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-label {
  color: #909399;
  font-size: 14px;
}

.chart-row {
  margin-bottom: 20px;
}

.chart-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  height: 300px;
  width: 100%;
}
</style>