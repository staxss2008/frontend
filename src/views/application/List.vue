<template>
  <div class="application-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>用车申请列表</h3>
          <el-button type="primary" @click="handleAdd">新建申请</el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :model="queryParams" inline>
        <el-form-item label="申请状态">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
            <el-option label="待审批" value="PENDING" />
            <el-option label="已批准" value="APPROVED" />
            <el-option label="已拒绝" value="REJECTED" />
            <el-option label="已指派" value="ASSIGNED" />
            <el-option label="进行中" value="IN_PROGRESS" />
            <el-option label="已完成" value="COMPLETED" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">搜索</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
        <el-form-item>
          <el-button 
            type="primary" 
            @click="handleViewSelected"
            :disabled="!selectedRow"
          >
            查看
          </el-button>
          <el-button 
            type="success" 
            @click="handleApproveAndAssignSelected"
            :disabled="!selectedRow || selectedRow.status !== 'PENDING'"
          >
            批准并指派
          </el-button>
          <el-button 
            type="danger" 
            @click="handleRejectSelected"
            :disabled="!selectedRow || selectedRow.status !== 'PENDING'"
          >
            拒绝
          </el-button>
          <el-button 
            type="success" 
            @click="handleCompleteSelected"
            :disabled="!selectedRow || (selectedRow.status !== 'ASSIGNED' && selectedRow.status !== 'IN_PROGRESS')"
          >
            完成
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 表格 -->
      <el-table
        :data="applicationList"
        v-loading="loading"
        style="width: 100%"
        @row-click="handleRowClick"
        :row-class-name="tableRowClassName"
        height="calc(80vh - 300px)"
        :header-cell-style="{ background: '#f5f7fa', position: 'sticky', top: '0', zIndex: 10 }"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="applicationNo" label="申请单号" width="150" />
        <el-table-column prop="applicantName" label="申请人" width="100" />
        <el-table-column prop="vehiclePlateNo" label="车辆" width="120">
          <template #default="scope">
            {{ scope.row.vehiclePlateNo || '未指派' }}
          </template>
        </el-table-column>
        <el-table-column prop="driverName" label="驾驶人" width="100">
          <template #default="scope">
            {{ scope.row.driverName || '未指派' }}
          </template>
        </el-table-column>
        <el-table-column prop="departmentName" label="部门" width="120" />
        <el-table-column prop="tripType" label="用车类型" width="100">
          <template #default="scope">
            {{ getTripTypeText(scope.row.tripType) }}
          </template>
        </el-table-column>
        <el-table-column prop="purpose" label="用车事由" width="150" show-overflow-tooltip />
        <el-table-column prop="passengerCount" label="乘车人数" width="100" />
        <el-table-column prop="startTime" label="开始时间" width="160" />
        <el-table-column prop="endTime" label="结束时间" width="160" />
        <el-table-column prop="startLocation" label="出发地" width="120" show-overflow-tooltip />
        <el-table-column prop="endLocation" label="目的地" width="120" show-overflow-tooltip />
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="queryParams.page"
        v-model:page-size="queryParams.size"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        style="margin-top: 20px; text-align: right"
      />
    </el-card>

    <!-- 申请详情对话框 -->
    <el-dialog
      title="申请详情"
      v-model="detailDialogVisible"
      width="600px"
    >
      <el-descriptions :column="1" border>
        <el-descriptions-item label="申请单号">{{ currentApplication.applicationNo }}</el-descriptions-item>
        <el-descriptions-item label="申请人">{{ currentApplication.applicantName }}</el-descriptions-item>
        <el-descriptions-item label="部门">{{ currentApplication.departmentName }}</el-descriptions-item>
        <el-descriptions-item label="用车类型">{{ getTripTypeText(currentApplication.tripType) }}</el-descriptions-item>
        <el-descriptions-item label="用车事由">{{ currentApplication.purpose }}</el-descriptions-item>
        <el-descriptions-item label="乘车人数">{{ currentApplication.passengerCount }}</el-descriptions-item>
        <el-descriptions-item label="开始时间">{{ currentApplication.startTime }}</el-descriptions-item>
        <el-descriptions-item label="结束时间">{{ currentApplication.endTime }}</el-descriptions-item>
        <el-descriptions-item label="出发地点">{{ currentApplication.startLocation }}</el-descriptions-item>
        <el-descriptions-item label="目的地">{{ currentApplication.endLocation }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentApplication.status)">
            {{ getStatusText(currentApplication.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="备注">{{ formatRemark(currentApplication.remark) }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 拒绝理由对话框 -->
    <el-dialog
      title="拒绝理由"
      v-model="rejectDialogVisible"
      width="500px"
    >
      <el-form :model="rejectForm" label-width="80px">
        <el-form-item label="拒绝理由">
          <el-input
            v-model="rejectForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请输入拒绝理由"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="rejectDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="confirmReject">确 定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 指派车辆对话框 -->
    <el-dialog
      title="批准并指派车辆"
      v-model="assignDialogVisible"
      width="600px"
    >
      <el-form :model="assignForm" label-width="100px">
        <el-form-item label="申请单号">
          <span>{{ currentApplication.applicationNo }}</span>
        </el-form-item>
        <el-form-item label="车辆" required>
          <el-select
            v-model="assignForm.vehicleId"
            placeholder="请选择车辆"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="vehicle in vehicleList"
              :key="vehicle.id"
              :label="`${vehicle.plateNo} - ${vehicle.brand} ${vehicle.model}`"
              :value="vehicle.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="驾驶员" required>
          <el-select
            v-model="assignForm.driverId"
            placeholder="请选择驾驶员"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="driver in driverList"
              :key="driver.id"
              :label="driver.name"
              :value="driver.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="assignDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="confirmAssignVehicle">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { getApplicationList, approveApplication, rejectApplication, getApplicationDetail, assignVehicle, getAvailableDrivers, getAvailableVehicles, completeApplication } from '@/api/application'
import { getDispatchList } from '@/api/dispatch'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const applicationList = ref([])
const total = ref(0)
const selectedRow = ref(null)
const detailDialogVisible = ref(false)
const rejectDialogVisible = ref(false)
const assignDialogVisible = ref(false)
const currentApplication = ref({})
const rejectForm = ref({
  reason: ''
})
const assignForm = ref({
  vehicleId: null,
  driverId: null,
  dispatcherId: 1 // TODO: 从当前登录用户获取
})
const vehicleList = ref([])
const driverList = ref([])

// 查询参数
const queryParams = ref({
  page: 1,
  size: 10,
  status: undefined
})

// 获取申请列表
const getList = async () => {
  loading.value = true
  try {
    const response = await getApplicationList(
      queryParams.value.page,
      queryParams.value.size,
      queryParams.value.status
    )
    applicationList.value = response.data.list
    total.value = response.data.total
  } catch (error) {
    console.error(error)
    ElMessage.error('获取申请列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleQuery = () => {
  queryParams.value.page = 1
  getList()
}

// 重置搜索
const resetQuery = () => {
  queryParams.value = {
    page: 1,
    size: 10,
    status: undefined
  }
  handleQuery()
}

// 处理分页大小变化
const handleSizeChange = (val) => {
  queryParams.value.size = val
  getList()
}

// 处理当前页变化
const handleCurrentChange = (val) => {
  queryParams.value.page = val
  getList()
}

// 新建申请
const handleAdd = () => {
  // 触发自定义事件，让Layout组件打开标签页
  window.dispatchEvent(new CustomEvent('open-tab', {
    detail: { path: '/application/create' }
  }))
}

// 查看详情
const handleView = async (row) => {
  try {
    const response = await getApplicationDetail(row.id)
    currentApplication.value = response.data
    detailDialogVisible.value = true
  } catch (error) {
    console.error(error)
    ElMessage.error('获取申请详情失败')
  }
}

// 批准并指派车辆
const handleApproveAndAssign = async (row) => {
  currentApplication.value = row
  assignForm.value.vehicleId = null
  assignForm.value.driverId = null
  // 获取车辆和驾驶员列表
  await Promise.all([getVehicleListData(), getDriverListData()])
  assignDialogVisible.value = true
}

// 拒绝申请
const handleReject = (row) => {
  currentApplication.value = row
  rejectForm.value.reason = ''
  rejectDialogVisible.value = true
}

// 确认拒绝
const confirmReject = async () => {
  if (!rejectForm.value.reason.trim()) {
    ElMessage.warning('请输入拒绝理由')
    return
  }

  try {
    await rejectApplication(currentApplication.value.id, { remark: rejectForm.value.reason })
    ElMessage.success('申请已拒绝')
    rejectDialogVisible.value = false
    getList()
  } catch (error) {
    console.error(error)
    ElMessage.error('拒绝申请失败')
  }
}

// 完成申请
const handleComplete = async (row) => {
  try {
    await ElMessageBox.confirm('确认完成该申请吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await completeApplication(row.id)
    ElMessage.success('申请已完成')
    getList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
      ElMessage.error('完成申请失败')
    }
  }
}

// 获取车辆列表
const getVehicleListData = async () => {
  try {
    const response = await getAvailableVehicles()
    vehicleList.value = response.data
  } catch (error) {
    console.error(error)
    ElMessage.error('获取车辆列表失败')
  }
}

// 获取驾驶员列表
const getDriverListData = async () => {
  try {
    const response = await getAvailableDrivers()
    // 获取调度列表，找出当前在途的驾驶员
    const dispatchResponse = await getDispatchList()
    const inProgressDriverIds = new Set()

    if (dispatchResponse.data) {
      dispatchResponse.data.forEach(dispatch => {
        if (dispatch.status === 'IN_PROGRESS' && dispatch.driverId) {
          inProgressDriverIds.add(dispatch.driverId)
        }
      })
    }

    // 过滤掉当前在途的驾驶员
    driverList.value = response.data.filter(driver => !inProgressDriverIds.has(driver.id))
  } catch (error) {
    console.error(error)
    ElMessage.error('获取驾驶员列表失败')
  }
}

// 确认指派车辆
const confirmAssignVehicle = async () => {
  if (!assignForm.value.vehicleId) {
    ElMessage.warning('请选择车辆')
    return
  }
  if (!assignForm.value.driverId) {
    ElMessage.warning('请选择驾驶员')
    return
  }

  try {
    // 先批准申请
    await approveApplication(currentApplication.value.id, { remark: '批准并指派车辆' })
    // 再指派车辆
    await assignVehicle(currentApplication.value.id, assignForm.value)
    ElMessage.success('批准并指派车辆成功')
    assignDialogVisible.value = false
    getList()
  } catch (error) {
    console.error(error)
    ElMessage.error('操作失败')
  }
}

// 状态类型映射
const getStatusType = (status) => {
  const map = {
    'PENDING': 'warning',
    'APPROVED': 'success',
    'REJECTED': 'danger',
    'COMPLETED': 'info',
    'ASSIGNED': 'primary',
    'IN_PROGRESS': 'primary'
  }
  return map[status] || 'info'
}

// 状态文本映射
const getStatusText = (status) => {
  const map = {
    'PENDING': '待审批',
    'APPROVED': '已批准',
    'REJECTED': '已拒绝',
    'COMPLETED': '已完成',
    'ASSIGNED': '已指派',
    'IN_PROGRESS': '进行中'
  }
  return map[status] || '未知'
}

// 用车类型文本映射
const getTripTypeText = (tripType) => {
  const map = {
    'OFFICIAL': '公务用车',
    'TRANSPORT': '通勤用车',
    'RECEIVE': '接待用车'
  }
  return map[tripType] || '未知'
}

// 格式化备注，解析JSON格式
const formatRemark = (remark) => {
  if (!remark) return '无'
  try {
    // 尝试解析JSON
    const parsed = JSON.parse(remark)
    // 提取reason或remark字段的值
    if (parsed.reason) return parsed.reason
    if (parsed.remark) return parsed.remark
    // 如果没有这两个字段，返回原字符串
    return remark
  } catch (e) {
    // 如果不是有效的JSON，直接返回原字符串
    return remark
  }
}

// 处理行点击
const handleRowClick = (row) => {
  selectedRow.value = row
}

// 表格行样式
const tableRowClassName = ({ row }) => {
  return selectedRow.value && selectedRow.value.id === row.id ? 'selected-row' : ''
}

// 查看选中的申请
const handleViewSelected = () => {
  if (selectedRow.value) {
    handleView(selectedRow.value)
  }
}

// 批准并指派选中的申请
const handleApproveAndAssignSelected = () => {
  if (selectedRow.value) {
    handleApproveAndAssign(selectedRow.value)
  }
}

// 拒绝选中的申请
const handleRejectSelected = () => {
  if (selectedRow.value) {
    handleReject(selectedRow.value)
  }
}

// 完成选中的申请
const handleCompleteSelected = () => {
  if (selectedRow.value) {
    handleComplete(selectedRow.value)
  }
}

// 初始化数据
onMounted(() => {
  getList()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: nowrap;
}

.application-list .el-card {
  min-height: 80vh;
}

.application-list :deep(.el-card__body) {
  padding-top: 4px;
}

.application-list :deep(.el-card__header) {
  padding: 6px 16px;
}

.application-list :deep(.el-table) {
  cursor: pointer;
}

.application-list :deep(.selected-row) {
  background-color: #ecf5ff;
}

/* 固定表头 */
.application-list :deep(.el-table__header-wrapper) {
  position: sticky;
  top: 0;
  z-index: 10;
}

.application-list :deep(.el-table__header th) {
  background-color: #f5f7fa !important;
  position: sticky;
  top: 0;
  z-index: 10;
}

/* 操作按钮悬浮 */
.application-list :deep(.el-form) {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: #fff;
  padding: 4px 0;
  margin-bottom: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.application-list :deep(.el-form-item) {
  margin-bottom: 4px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .application-list .el-card {
    min-height: auto;
  }

  .application-list :deep(.el-form) {
    flex-direction: column;
    align-items: stretch;
  }

  .application-list :deep(.el-form-item) {
    width: 100%;
    margin-right: 0;
  }

  .application-list :deep(.el-form-item__content) {
    width: 100%;
  }

  .application-list :deep(.el-select),
  .application-list :deep(.el-input) {
    width: 100%;
  }

  .application-list :deep(.el-button-group) {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .application-list :deep(.el-button) {
    flex: 1;
    min-width: 80px;
  }

  .application-list :deep(.el-table) {
    font-size: 12px;
  }

  .application-list :deep(.el-table__body-wrapper) {
    overflow-x: auto;
  }

  .application-list :deep(.el-table__cell) {
    padding: 8px 4px;
  }
}
</style>