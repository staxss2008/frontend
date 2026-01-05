<template>
  <div class="statistics-maintenance">
    <!-- 顶部统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="color: #409EFF;">
              <el-icon><Tools /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalMaintenances }}</div>
              <div class="stat-label">总维修次数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="color: #67C23A;">
              <el-icon><DocumentChecked /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalInspections }}</div>
              <div class="stat-label">总年检次数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="color: #E6A23C;">
              <el-icon><Wallet /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalMaintenanceCost }}</div>
              <div class="stat-label">总维修费用(元)</div>
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
              <div class="stat-value">{{ stats.totalInsuranceCost }}</div>
              <div class="stat-label">总保险费用(元)</div>
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
              <span>月度维修趋势</span>
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
              <span>维修类型分布</span>
            </div>
          </template>
          <div id="type-chart" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>车辆维修费用排行</span>
            </div>
          </template>
          <div id="ranking-chart" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>维修厂使用统计</span>
            </div>
          </template>
          <div id="provider-chart" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { Tools, DocumentChecked, Wallet, Money } from '@element-plus/icons-vue'

defineOptions({
  name: 'StatisticsMaintenance'
})

// 统计数据
const stats = ref({
  totalMaintenances: 0,
  totalInspections: 0,
  totalMaintenanceCost: 0,
  totalInsuranceCost: 0
})

// 图表周期
const chartPeriod = ref('year')

// 图表实例
let trendChart = null
let typeChart = null
let rankingChart = null
let providerChart = null

// 加载统计数据
const loadStats = () => {
  // 模拟数据，实际应从API获取
  stats.value = {
    totalMaintenances: 156,
    totalInspections: 24,
    totalMaintenanceCost: 85630,
    totalInsuranceCost: 125600
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
  const data = [12, 14, 10, 13, 9, 23, 21, 18, 19, 23, 29, 33]

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
        name: '维修次数',
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
        name: '维修类型',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 735, name: '常规保养' },
          { value: 310, name: '故障维修' },
          { value: 234, name: '事故维修' }
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
        name: '维修费用',
        type: 'bar',
        data: [19300, 23400, 31000, 28500, 23500, 21000, 18700, 16500, 14300, 12000]
      }
    ]
  }

  rankingChart.setOption(option)
}

// 初始化维修厂统计图
const initProviderChart = () => {
  providerChart = echarts.init(document.getElementById('provider-chart'))
  updateProviderChart()
}

// 更新维修厂统计图
const updateProviderChart = () => {
  if (!providerChart) return

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['维修厂A', '维修厂B', '维修厂C', '维修厂D', '维修厂E']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '维修次数',
        type: 'bar',
        data: [32, 30, 28, 26, 24]
      }
    ]
  }

  providerChart.setOption(option)
}

// 周期变化处理
const handlePeriodChange = () => {
  updateTrendChart()
}

// 窗口大小变化处理
const handleResize = () => {
  trendChart?.resize()
  typeChart?.resize()
  rankingChart?.resize()
  providerChart?.resize()
}

// 组件挂载
onMounted(() => {
  loadStats()
  initTrendChart()
  initTypeChart()
  initRankingChart()
  initProviderChart()

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

// 组件卸载
onUnmounted(() => {
  trendChart?.dispose()
  typeChart?.dispose()
  rankingChart?.dispose()
  providerChart?.dispose()

  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.statistics-maintenance {
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