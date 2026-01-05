<template>
  <div class="dashboard">
    <h2>仪表板</h2>
    <p>欢迎使用车辆管理系统</p>
    
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon" style="background-color: #409EFF;">
              <el-icon><Van /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ vehicleCount }}</div>
              <div class="stat-label">车辆总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon" style="background-color: #67C23A;">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ driverCount }}</div>
              <div class="stat-label">驾驶员总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon" style="background-color: #E6A23C;">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ applicationCount }}</div>
              <div class="stat-label">待审批申请</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon" style="background-color: #F56C6C;">
              <el-icon><Position /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ dispatchCount }}</div>
              <div class="stat-label">今日调度</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" class="quick-actions">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>快捷操作</span>
            </div>
          </template>
          <div class="action-buttons">
            <el-button type="primary" @click="navigateTo('/application/create')">
              <el-icon><Edit /></el-icon>
              申请用车
            </el-button>
            <el-button type="success" @click="navigateTo('/vehicle/list')">
              <el-icon><Van /></el-icon>
              查看车辆
            </el-button>
            <el-button type="warning" @click="navigateTo('/dispatch/monitor')">
              <el-icon><Odometer /></el-icon>
              实时监控
            </el-button>
            <el-button type="danger" @click="navigateTo('/statistics/usage')">
              <el-icon><TrendCharts /></el-icon>
              数据统计
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" class="recent-activities">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最近用车申请</span>
              <el-button class="button" text @click="navigateTo('/application/list')">查看全部</el-button>
            </div>
          </template>
          <el-table :data="recentApplications" style="width: 100%">
            <el-table-column prop="applicationNo" label="申请单号" width="150"></el-table-column>
            <el-table-column prop="applicantName" label="申请人" width="100"></el-table-column>
            <el-table-column prop="endLocation" label="目的地" show-overflow-tooltip></el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">{{ getStatusText(scope.row.status) }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>今日调度任务</span>
              <el-button class="button" text @click="navigateTo('/dispatch/list')">查看全部</el-button>
            </div>
          </template>
          <el-table :data="todayDispatches" style="width: 100%">
            <el-table-column prop="id" label="调度编号" width="100"></el-table-column>
            <el-table-column prop="driver" label="驾驶员" width="120"></el-table-column>
            <el-table-column prop="vehicle" label="车辆" width="120"></el-table-column>
            <el-table-column prop="route" label="路线"></el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getDispatchStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getVehicleList } from '@/api/vehicle'
import { getDriverList } from '@/api/driver'
import { getApplicationList } from '@/api/application'

export default {
  name: 'DashboardIndex',
  setup() {
    const router = useRouter()
    
    // 统计数据
    const vehicleCount = ref(0)
    const driverCount = ref(0)
    const applicationCount = computed(() => {
      return recentApplications.value.filter(app => app.status === 'PENDING').length
    })
    const dispatchCount = ref(12)
    
    // 最近用车申请
    const recentApplications = ref([])
    
    // 今日调度任务
    const todayDispatches = ref([
      { id: 'DIS001', driver: '张师傅', vehicle: '京A12345', route: '公司-客户A', status: '已完成' },
      { id: 'DIS002', driver: '李师傅', vehicle: '京A12346', route: '公司-客户B', status: '进行中' },
      { id: 'DIS003', driver: '王师傅', vehicle: '京A12347', route: '公司-客户C', status: '待出发' },
      { id: 'DIS004', driver: '赵师傅', vehicle: '京A12348', route: '公司-客户D', status: '进行中' },
      { id: 'DIS005', driver: '钱师傅', vehicle: '京A12349', route: '公司-客户E', status: '已完成' }
    ])
    
    // 路由跳转
    const navigateTo = (path) => {
      router.push(path)
    }
    
    // 获取申请状态类型
    const getStatusType = (status) => {
      const statusMap = {
        'PENDING': 'warning',
        'APPROVED': 'success',
        'REJECTED': 'danger',
        'COMPLETED': 'info',
        'ASSIGNED': 'primary',
        'IN_PROGRESS': 'primary'
      }
      return statusMap[status] || 'info'
    }

    // 获取申请状态文本
    const getStatusText = (status) => {
      const statusMap = {
        'PENDING': '待审批',
        'APPROVED': '已批准',
        'REJECTED': '已拒绝',
        'COMPLETED': '已完成',
        'ASSIGNED': '已指派',
        'IN_PROGRESS': '进行中'
      }
      return statusMap[status] || '未知'
    }
    
    // 获取调度状态类型
    const getDispatchStatusType = (status) => {
      const statusMap = {
        '待出发': 'info',
        '进行中': 'primary',
        '已完成': 'success',
        '已取消': 'danger'
      }
      return statusMap[status] || 'info'
    }

    // 获取统计数据
    const fetchStatistics = async () => {
      try {
        // 获取车辆总数
        const vehicleResponse = await getVehicleList(1, 1000)
        vehicleCount.value = vehicleResponse.data.total

        // 获取驾驶员总数
        const driverResponse = await getDriverList(1, 1000)
        driverCount.value = driverResponse.data.total

        // 获取最近用车申请
        const applicationResponse = await getApplicationList(1, 5)
        recentApplications.value = applicationResponse.data.list.map(item => ({
          id: item.id,
          applicationNo: item.applicationNo,
          applicantName: item.applicantName,
          endLocation: item.endLocation,
          status: item.status
        }))
      } catch (error) {
        console.error('获取统计数据失败：', error)
      }
    }
    
    // 组件挂载时获取统计数据
    onMounted(() => {
      fetchStatistics()
    })

    return {
      vehicleCount,
      driverCount,
      applicationCount,
      dispatchCount,
      recentApplications,
      todayDispatches,
      navigateTo,
      getStatusType,
      getStatusText,
      getDispatchStatusType
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding: 1rem;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.stat-icon .el-icon {
  font-size: 28px;
  color: white;
}

.stat-content {
  flex: 1;
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

.quick-actions {
  margin-bottom: 20px;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}

.action-buttons .el-button {
  flex: 1;
  min-width: 120px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.recent-activities {
  margin-bottom: 20px;
}
</style>