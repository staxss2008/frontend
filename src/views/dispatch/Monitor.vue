<template>
  <div class="dispatch-monitor">
    <!-- 顶部统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="color: #409EFF;">
              <el-icon><Van /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalVehicles }}</div>
              <div class="stat-label">总车辆数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="color: #67C23A;">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.idleVehicles }}</div>
              <div class="stat-label">空闲车辆</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="color: #E6A23C;">
              <el-icon><Position /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.busyVehicles }}</div>
              <div class="stat-label">使用中</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="color: #909399;">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.offlineVehicles }}</div>
              <div class="stat-label">离线车辆</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 地图展示区域 -->
    <el-row :gutter="20" class="main-row">
      <el-col :span="16">
        <el-card class="map-card">
          <template #header>
            <div class="card-header">
              <span>车辆实时位置</span>
              <el-button-group>
                <el-button size="small" @click="refreshMap">刷新</el-button>
                <el-button size="small" @click="showAllVehicles">全部显示</el-button>
              </el-button-group>
            </div>
          </template>
          <div id="vehicle-map" class="map-container" v-loading="mapLoading">
            <p v-if="!mapLoaded" class="map-placeholder">正在加载地图...</p>
          </div>
        </el-card>
      </el-col>
      
      <!-- 车辆状态列表 -->
      <el-col :span="8">
        <el-card class="status-card">
          <template #header>
            <span>车辆状态列表</span>
          </template>
          <el-table
            :data="vehicleList"
            height="400"
            @row-click="handleVehicleClick"
            v-loading="listLoading"
          >
            <el-table-column prop="plateNo" label="车牌号" />
            <el-table-column prop="driverName" label="驾驶员" />
            <el-table-column prop="status" label="状态">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="scope">
                <el-button
                  size="small"
                  @click.stop="dispatchVehicle(scope.row)"
                  :disabled="scope.row.status !== 'IDLE'"
                >
                  派车
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 调度统计图表 -->
    <el-card class="chart-card">
      <template #header>
        <span>调度统计</span>
      </template>
      <div class="chart-container">
        <div id="dispatch-chart" style="width: 100%; height: 300px;"></div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { getVehicleStats, getVehicleList, getRealTimeLocation } from '@/api/dispatch'
import { Van, CircleCheck, Position, Warning } from '@element-plus/icons-vue'

defineOptions({
  name: 'DispatchMonitor'
})

// 响应式数据
const stats = ref({
  totalVehicles: 0,
  idleVehicles: 0,
  busyVehicles: 0,
  offlineVehicles: 0
})

const vehicleList = ref([])
const mapLoading = ref(false)
const listLoading = ref(false)
const mapLoaded = ref(false)
let chartInstance = null

// 状态类型映射
const getStatusType = (status) => {
  const map = {
    'IDLE': 'success',
    'BUSY': 'warning',
    'OFFLINE': 'info',
    'MAINTENANCE': 'danger'
  }
  return map[status] || 'info'
}

// 状态文本映射
const getStatusText = (status) => {
  const map = {
    'IDLE': '空闲',
    'BUSY': '使用中',
    'OFFLINE': '离线',
    'MAINTENANCE': '维修中'
  }
  return map[status] || '未知'
}

// 车辆点击事件
const handleVehicleClick = (row) => {
  // 这里可以添加点击车辆后的操作
  console.log('点击车辆:', row)
}

// 派车操作
const dispatchVehicle = (row) => {
  ElMessage.success(`已选择车辆 ${row.plateNo} 进行派车`)
  // 这里可以添加派车逻辑
}

// 刷新地图
const refreshMap = () => {
  ElMessage.success('地图已刷新')
  loadData()
}

// 显示全部车辆
const showAllVehicles = () => {
  ElMessage.success('已显示全部车辆')
  // 重置地图视图到初始状态
  if (mapInstance) {
    mapInstance.setZoom(12)
    mapInstance.setCenter([116.397428, 39.90923])
  }
}

// 加载数据
const loadData = async () => {
  try {
    // 获取监控数据
    const monitorData = await getVehicleStats()
    stats.value = monitorData.data

    // 获取车辆列表
    const vehicles = await getVehicleList(1, 100)
    vehicleList.value = vehicles.data.list

    // 获取实时位置
    const locations = await getRealTimeLocation()
    updateMap(locations.data)

    // 更新图表
    updateChart()
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败')
  }
}

// 地图实例
let mapInstance = null

// 初始化地图
const initMap = () => {
  // 这里使用百度地图API，需要先在index.html中引入百度地图API
  // 实际项目中应使用真实的地图API
  if (typeof BMap !== 'undefined') {
    mapInstance = new BMap.Map('vehicle-map')
    const point = new BMap.Point(116.397428, 39.90923)
    mapInstance.centerAndZoom(point, 12)
    mapInstance.enableScrollWheelZoom(true)

    // 添加控件
    mapInstance.addControl(new BMap.NavigationControl())
    mapInstance.addControl(new BMap.ScaleControl())
    mapLoaded.value = true
  } else {
    // 模拟地图加载完成
    setTimeout(() => {
      mapLoaded.value = true
      updateMap(vehicleList.value.map(v => ({
        vehicleId: v.id,
        plateNo: v.plateNo,
        status: v.status,
        longitude: 116.397428 + (Math.random() - 0.5) * 0.1,
        latitude: 39.90923 + (Math.random() - 0.5) * 0.1
      })))
    }, 1000)
  }
}

// 更新地图标记
const updateMap = (locations) => {
  if (!mapLoaded.value) return

  // 清除所有标记
  if (typeof BMap !== 'undefined' && mapInstance) {
    mapInstance.clearOverlays()

    // 添加车辆标记
    locations.forEach(loc => {
      const point = new BMap.Point(loc.longitude, loc.latitude)
      const marker = new BMap.Marker(point)

      // 根据车辆状态设置不同颜色的标记
      const statusColor = {
        'IDLE': '#67C23A',
        'BUSY': '#E6A23C',
        'OFFLINE': '#909399',
        'MAINTENANCE': '#F56C6C'
      }[loc.status] || '#409EFF'

      // 添加标记点击事件
      marker.addEventListener('click', () => {
        const vehicle = vehicleList.value.find(v => v.id === loc.vehicleId)
        if (vehicle) {
          ElMessage.success(`车辆: ${vehicle.plateNo}, 状态: ${getStatusText(vehicle.status)}`)
        }
      })

      mapInstance.addOverlay(marker)

      // 添加信息窗口
      const infoWindow = new BMap.InfoWindow(`
        <div style="padding: 5px;">
          <h4 style="margin: 0 0 5px 0;">${loc.plateNo}</h4>
          <p style="margin: 0;">状态: ${getStatusText(loc.status)}</p>
        </div>
      `)
      marker.addEventListener('click', () => {
        mapInstance.openInfoWindow(infoWindow, point)
      })
    })
  }
}

// 初始化图表
const initChart = () => {
  chartInstance = echarts.init(document.getElementById('dispatch-chart'))
  updateChart()
}

// 更新图表
const updateChart = () => {
  if (!chartInstance) return

  const option = {
    title: {
      text: '车辆使用统计',
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
        name: '车辆状态',
        type: 'pie',
        radius: '50%',
        data: [
          { value: stats.value.idleVehicles, name: '空闲' },
          { value: stats.value.busyVehicles, name: '使用中' },
          { value: stats.value.offlineVehicles, name: '离线' }
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

  chartInstance.setOption(option)
}

// 定时刷新
let timer = null
onMounted(() => {
  nextTick(() => {
    initMap()
    initChart()
    loadData()
    // 每30秒刷新一次数据
    timer = setInterval(() => {
      loadData()
    }, 30000)
  })
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  if (mapInstance) {
    mapInstance.clearOverlays()
    mapInstance = null
  }
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }

  // 监听窗口大小变化，调整图表大小
  window.removeEventListener('resize', handleResize)
})

// 监听窗口大小变化
const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
  if (mapInstance) {
    mapInstance.reset()
  }
}

// 添加窗口大小变化监听
window.addEventListener('resize', handleResize)
</script>

<style scoped>
.dispatch-monitor {
  padding: 20px;
}

.page-title {
  margin-bottom: 20px;
  color: #1f2d3d;
  font-size: 24px;
  font-weight: 500;
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

.map-card, .status-card, .chart-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.map-container {
  height: 500px;
  width: 100%;
  position: relative;
}

.map-placeholder {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #909399;
  font-size: 16px;
}

.chart-container {
  padding: 10px;
}
</style>