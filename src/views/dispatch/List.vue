<template>
  <div class="dispatch-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>调度列表</span>
          <el-button type="primary" @click="refreshList">刷新</el-button>
        </div>
      </template>

      <el-table :data="dispatchList" v-loading="loading" border stripe>
        <el-table-column prop="orderNo" label="调度单号" width="180" />
        <el-table-column prop="plateNo" label="车牌号" width="120" />
        <el-table-column prop="driverName" label="驾驶员" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="dispatchTime" label="调度时间" width="180" />
        <el-table-column prop="actualStartTime" label="开始时间" width="180" />
        <el-table-column prop="actualEndTime" label="结束时间" width="180" />
        <el-table-column prop="actualStartMileage" label="开始里程" width="120" />
        <el-table-column prop="actualEndMileage" label="结束里程" width="120" />
        <el-table-column label="行驶里程" width="120">
          <template #default="scope">
            {{ calculateMileage(scope.row) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button
              v-if="scope.row.status === 'PENDING'"
              type="primary"
              size="small"
              @click="handleStartMileage(scope.row)"
            >
              出车
            </el-button>
            <el-button
              v-if="scope.row.status === 'IN_PROGRESS'"
              type="success"
              size="small"
              @click="handleEndMileage(scope.row)"
            >
              收车
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 出车里程对话框 -->
    <el-dialog v-model="startMileageDialogVisible" title="出车登记" width="400px">
      <el-form :model="startMileageForm" label-width="100px">
        <el-form-item label="调度单号">
          <el-input v-model="startMileageForm.orderNo" disabled />
        </el-form-item>
        <el-form-item label="车牌号">
          <el-input v-model="startMileageForm.plateNo" disabled />
        </el-form-item>
        <el-form-item label="开始里程" required>
          <el-input-number
            v-model="startMileageForm.mileage"
            :min="0"
            :precision="1"
            :step="0.1"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="startMileageDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitStartMileage">确定</el-button>
      </template>
    </el-dialog>

    <!-- 收车里程对话框 -->
    <el-dialog v-model="endMileageDialogVisible" title="收车登记" width="400px">
      <el-form :model="endMileageForm" label-width="100px">
        <el-form-item label="调度单号">
          <el-input v-model="endMileageForm.orderNo" disabled />
        </el-form-item>
        <el-form-item label="车牌号">
          <el-input v-model="endMileageForm.plateNo" disabled />
        </el-form-item>
        <el-form-item label="开始里程">
          <el-input v-model="endMileageForm.startMileage" disabled />
        </el-form-item>
        <el-form-item label="结束里程" required>
          <el-input-number
            v-model="endMileageForm.mileage"
            :min="endMileageForm.startMileage || 0"
            :precision="1"
            :step="0.1"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="endMileageDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEndMileage">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { updateStartMileage, updateEndMileage, getDispatchList } from '@/api/dispatch'

// 响应式数据
const dispatchList = ref([])
const loading = ref(false)
const startMileageDialogVisible = ref(false)
const endMileageDialogVisible = ref(false)
const startMileageForm = ref({
  orderId: null,
  orderNo: '',
  plateNo: '',
  mileage: 0
})
const endMileageForm = ref({
  orderId: null,
  orderNo: '',
  plateNo: '',
  startMileage: 0,
  mileage: 0
})

// 状态类型映射
const getStatusType = (status) => {
  const map = {
    'PENDING': 'info',
    'IN_PROGRESS': 'warning',
    'COMPLETED': 'success'
  }
  return map[status] || 'info'
}

// 状态文本映射
const getStatusText = (status) => {
  const map = {
    'PENDING': '待出车',
    'IN_PROGRESS': '使用中',
    'COMPLETED': '已完成'
  }
  return map[status] || '未知'
}

// 计算行驶里程
const calculateMileage = (row) => {
  if (row.actualStartMileage && row.actualEndMileage) {
    return (row.actualEndMileage - row.actualStartMileage).toFixed(1)
  }
  return '-'
}

// 出车操作
const handleStartMileage = (row) => {
  startMileageForm.value = {
    orderId: row.id,
    orderNo: row.orderNo,
    plateNo: row.plateNo,
    mileage: 0
  }
  startMileageDialogVisible.value = true
}

// 提交开始里程
const submitStartMileage = async () => {
  try {
    await updateStartMileage(startMileageForm.value.orderId, startMileageForm.value.mileage)
    ElMessage.success('出车登记成功')
    startMileageDialogVisible.value = false
    refreshList()
  } catch (error) {
    ElMessage.error('出车登记失败')
  }
}

// 收车操作
const handleEndMileage = (row) => {
  endMileageForm.value = {
    orderId: row.id,
    orderNo: row.orderNo,
    plateNo: row.plateNo,
    startMileage: row.actualStartMileage,
    mileage: 0
  }
  endMileageDialogVisible.value = true
}

// 提交结束里程
const submitEndMileage = async () => {
  try {
    await updateEndMileage(endMileageForm.value.orderId, endMileageForm.value.mileage)
    ElMessage.success('收车登记成功')
    endMileageDialogVisible.value = false
    refreshList()
  } catch (error) {
    ElMessage.error('收车登记失败')
  }
}

// 刷新列表
const refreshList = async () => {
  try {
    loading.value = true
    const response = await getDispatchList()

    // 转换数据格式，添加车牌号和驾驶员姓名
    dispatchList.value = response.data.map(item => ({
      ...item,
      plateNo: item.vehicle?.plateNo || '',
      driverName: item.driver?.name || ''
    }))
  } catch (error) {
    console.error('获取调度列表失败:', error)
    ElMessage.error('获取调度列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  refreshList()
})
</script>

<style scoped>
.dispatch-list {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>