<template>
  <div class="vehicle-maintenance">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>车辆维修保养记录</h3>
          <el-button type="primary" @click="handleAdd">新增记录</el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :model="queryParams" inline>
        <el-form-item label="车辆">
          <el-select v-model="queryParams.vehicleId" placeholder="请选择车辆" clearable filterable>
            <el-option
              v-for="vehicle in vehicleList"
              :key="vehicle.id"
              :label="vehicle.plateNo"
              :value="vehicle.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="queryParams.type" placeholder="请选择类型" clearable>
            <el-option label="维修" value="MAINTENANCE" />
            <el-option label="年检" value="INSPECTION" />
            <el-option label="保险" value="INSURANCE" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">搜索</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
        <el-form-item>
          <el-button 
            type="primary" 
            @click="handleEditSelected"
            :disabled="!selectedRow"
          >
            编辑
          </el-button>
          <el-button 
            type="success" 
            @click="handleCompleteSelected"
            :disabled="!selectedRow"
          >
            完成维保
          </el-button>
          <el-button 
            type="danger" 
            @click="handleDeleteSelected"
            :disabled="!selectedRow"
          >
            删除
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 表格 -->
      <el-table
        :data="maintenanceList"
        v-loading="loading"
        style="width: 100%"
        @row-click="handleRowClick"
        :row-class-name="tableRowClassName"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="plateNo" label="车牌号" width="120" />
        <el-table-column prop="vehicleStatus" label="车辆状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.vehicleStatus)">
              {{ getStatusText(scope.row.vehicleStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="100">
          <template #default="scope">
            <el-tag :type="getTypeType(scope.row.type)">
              {{ getTypeText(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="date" label="日期" width="160" />
        <el-table-column prop="mileage" label="里程(km)" width="120" />
        <el-table-column prop="cost" label="费用(元)" width="120" />
        <el-table-column prop="content" label="内容" width="200" show-overflow-tooltip />
        <el-table-column prop="provider" label="服务商" width="150" show-overflow-tooltip />
        <el-table-column prop="handler" label="负责人" width="100" />
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

    <!-- 维修保养记录编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        :model="form"
        :rules="formRules"
        ref="formRef"
        label-width="100px"
      >
        <el-form-item label="车辆" prop="vehicleId">
          <el-select v-model="form.vehicleId" placeholder="请选择车辆" filterable>
            <el-option
              v-for="vehicle in vehicleList"
              :key="vehicle.id"
              :label="vehicle.plateNo"
              :value="vehicle.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择类型">
            <el-option label="维修" value="MAINTENANCE" />
            <el-option label="年检" value="INSPECTION" />
            <el-option label="保险" value="INSURANCE" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期" prop="date">
          <el-date-picker
            v-model="form.date"
            type="datetime"
            placeholder="选择日期时间"
            value-format="YYYY-MM-DDTHH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="里程(km)">
          <el-input-number v-model="form.mileage" :min="0" :precision="0" />
        </el-form-item>
        <el-form-item label="费用(元)">
          <el-input-number v-model="form.cost" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="3"
            placeholder="请输入维修保养内容"
          />
        </el-form-item>
        <el-form-item label="服务商">
          <el-input v-model="form.provider" placeholder="请输入服务商名称" />
        </el-form-item>
        <el-form-item label="负责人">
          <el-input v-model="form.handler" placeholder="请输入负责人" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="2"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getMaintenanceList, createMaintenance, updateMaintenance, deleteMaintenance } from '@/api/maintenance'
import { getVehicleList } from '@/api/vehicle'

// 响应式数据
const loading = ref(false)
const maintenanceList = ref([])
const vehicleList = ref([])
const total = ref(0)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const selectedRow = ref(null)

// 查询参数
const queryParams = ref({
  page: 1,
  size: 10,
  vehicleId: undefined,
  type: undefined
})

// 表单数据
const form = ref({
  id: undefined,
  vehicleId: undefined,
  type: '',
  date: '',
  mileage: 0,
  cost: 0,
  content: '',
  provider: '',
  handler: '',
  remark: ''
})

// 表单验证规则
const formRules = {
  vehicleId: [
    { required: true, message: '请选择车辆', trigger: 'change' }
  ],
  type: [
    { required: true, message: '请选择类型', trigger: 'change' }
  ],
  date: [
    { required: true, message: '请选择日期', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入内容', trigger: 'blur' }
  ]
}

// 表单引用
const formRef = ref(null)

// 获取车辆列表
const getVehicleOptions = async () => {
  try {
    const response = await getVehicleList(1, 1000)
    vehicleList.value = response.data.list
  } catch (error) {
    console.error(error)
    ElMessage.error('获取车辆列表失败')
  }
}

// 获取维修保养记录列表
const getList = async () => {
  loading.value = true
  try {
    const response = await getMaintenanceList(
      queryParams.value.page,
      queryParams.value.size,
      queryParams.value.vehicleId,
      queryParams.value.type
    )
    maintenanceList.value = response.data.list
    total.value = response.data.total
  } catch (error) {
    console.error(error)
    ElMessage.error('获取维修保养记录失败')
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
    vehicleId: undefined,
    type: undefined
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

// 新增记录
const handleAdd = () => {
  dialogTitle.value = '新增维修保养记录'
  isEdit.value = false
  dialogVisible.value = true
}

// 编辑记录
const handleEdit = (row) => {
  dialogTitle.value = '编辑维修保养记录'
  isEdit.value = true
  form.value = { ...row }
  dialogVisible.value = true
}

// 删除记录
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除该维修保养记录吗？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await deleteMaintenance(row.id)
    ElMessage.success('删除成功')
    getList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 完成维保
const handleComplete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要完成车辆 ${row.plateNo} 的维保吗？完成后车辆状态将恢复为空闲。`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    )

    await deleteMaintenance(row.id)
    ElMessage.success('维保已完成，车辆状态已恢复为空闲')
    getList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

// 提交表单
const submitForm = async () => {
  await formRef.value.validate(valid => {
    if (valid) {
      if (isEdit.value) {
        updateMaintenance(form.value.id, form.value).then(() => {
          ElMessage.success('修改成功')
          dialogVisible.value = false
          getList()
        })
      } else {
        createMaintenance(form.value).then(() => {
          ElMessage.success('新增成功')
          dialogVisible.value = false
          getList()
        })
      }
    }
  })
}

// 对话框关闭
const handleDialogClose = () => {
  formRef.value?.resetFields()
}

// 类型类型映射
const getTypeType = (type) => {
  const map = {
    'MAINTENANCE': 'warning',
    'INSPECTION': 'success',
    'INSURANCE': 'info'
  }
  return map[type] || 'info'
}

// 类型文本映射
const getTypeText = (type) => {
  const map = {
    'MAINTENANCE': '维修',
    'INSPECTION': '年检',
    'INSURANCE': '保险'
  }
  return map[type] || '未知'
}

// 车辆状态类型映射
const getStatusType = (status) => {
  const map = {
    'IDLE': 'success',
    'BUSY': 'warning',
    'OFFLINE': 'info',
    'MAINTENANCE': 'danger'
  }
  return map[status] || 'info'
}

// 车辆状态文本映射
const getStatusText = (status) => {
  const map = {
    'IDLE': '空闲',
    'BUSY': '使用中',
    'OFFLINE': '离线',
    'MAINTENANCE': '维修中'
  }
  return map[status] || '未知'
}

// 处理行点击
const handleRowClick = (row) => {
  selectedRow.value = row
}

// 表格行样式
const tableRowClassName = ({ row }) => {
  return selectedRow.value && selectedRow.value.id === row.id ? 'selected-row' : ''
}

// 编辑选中的维修保养记录
const handleEditSelected = () => {
  if (selectedRow.value) {
    handleEdit(selectedRow.value)
  }
}

// 完成选中的维修保养记录
const handleCompleteSelected = () => {
  if (selectedRow.value) {
    handleComplete(selectedRow.value)
  }
}

// 删除选中的维修保养记录
const handleDeleteSelected = () => {
  if (selectedRow.value) {
    handleDelete(selectedRow.value)
  }
}

// 初始化数据
onMounted(() => {
  getVehicleOptions()
  getList()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.vehicle-maintenance .el-card {
  min-height: 80vh;
}

.vehicle-maintenance :deep(.el-table) {
  cursor: pointer;
}

.vehicle-maintenance :deep(.selected-row) {
  background-color: #ecf5ff;
}
</style>