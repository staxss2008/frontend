<template>
  <div class="dashboard">
    <h2>仪表板</h2>
    <p>欢迎使用车辆管理系统</p>
    
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item" style="background: linear-gradient(135deg, #409EFF 0%, #66b1ff 100%);">
            <div class="stat-icon">
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
          <div class="stat-item" style="background: linear-gradient(135deg, #67C23A 0%, #85ce61 100%);">
            <div class="stat-icon">
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
          <div class="stat-item" style="background: linear-gradient(135deg, #E6A23C 0%, #ebb563 100%);">
            <div class="stat-icon">
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
          <div class="stat-item" style="background: linear-gradient(135deg, #F56C6C 0%, #f78989 100%);">
            <div class="stat-icon">
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
            <el-button v-if="isAdminOrManager" type="success" @click="navigateTo('/vehicle/list')">
              <el-icon><Van /></el-icon>
              查看车辆
            </el-button>
            <el-button type="warning" @click="navigateTo('/dispatch/monitor')">
              <el-icon><Odometer /></el-icon>
              实时监控
            </el-button>
            <el-button v-if="isAdminOrManager" type="danger" @click="navigateTo('/statistics/usage')">
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

    // 获取用户角色信息
    const userInfoStr = localStorage.getItem('userInfo')
    const userInfo = userInfoStr ? JSON.parse(userInfoStr) : {}
    const userRoles = userInfo.roles || []

    // 判断当前用户是否为管理员或经理
    const isAdminOrManager = computed(() => {
      return userRoles.some(role => role.roleCode === 'ADMIN' || role.roleCode === 'MANAGER')
    })
    
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
      // 触发自定义事件，通知Layout组件添加新标签页
      window.dispatchEvent(new CustomEvent('open-tab', { detail: { path } }))
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
      getDispatchStatusType,
      isAdminOrManager
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

.stat-card {
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  border-radius: 8px;
  color: white;
  position: relative;
  overflow: hidden;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.2),
    0 8px 24px rgba(0, 0, 0, 0.15),
    inset 0 2px 0 rgba(255, 255, 255, 0.4),
    inset 0 -2px 0 rgba(0, 0, 0, 0.15),
    inset 0 0 20px rgba(255, 255, 255, 0.1);
  transform: translateY(0);
  transition: all 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow:
    0 6px 16px rgba(0, 0, 0, 0.25),
    0 12px 32px rgba(0, 0, 0, 0.2),
    inset 0 2px 0 rgba(255, 255, 255, 0.4),
    inset 0 -2px 0 rgba(0, 0, 0, 0.15),
    inset 0 0 20px rgba(255, 255, 255, 0.15);
}

.stat-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  height: 50%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, transparent 100%);
  pointer-events: none;
}

.stat-icon {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 60px;
  height: 60px;
  opacity: 0.2;
}

.stat-icon .el-icon {
  font-size: 40px;
  color: white;
}

.stat-content {
  text-align: left;
  z-index: 1;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 2px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.stat-label {
  font-size: 12px;
  opacity: 0.9;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
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
  border-radius: 8px;
  padding: 12px 20px;
  font-weight: 500;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.15),
    0 2px 6px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
  transform: translateY(0);
  transition: all 0.3s ease;
}

.action-buttons .el-button:hover {
  transform: translateY(-2px);
  box-shadow:
    0 6px 16px rgba(0, 0, 0, 0.2),
    0 4px 8px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
}

.action-buttons .el-button:active {
  transform: translateY(0);
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
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