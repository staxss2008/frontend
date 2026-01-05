<template>
  <div class="vehicle-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>车辆档案管理</h3>
          <el-button type="primary" @click="handleAdd">新增车辆</el-button>
        </div>
      </template>
      
      <!-- 搜索表单 -->
      <el-form :model="queryParams" inline>
        <el-form-item label="车牌号">
          <el-input 
            v-model="queryParams.plateNo" 
            placeholder="请输入车牌号" 
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
            <el-option label="空闲" value="IDLE" />
            <el-option label="已指派" value="IN_USE" />
            <el-option label="使用中" value="BUSY" />
            <el-option label="维修中" value="MAINTENANCE" />
            <el-option label="离线" value="OFFLINE" />
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
            type="warning" 
            @click="handleMaintenanceSelected"
            :disabled="!selectedRow || selectedRow.status === 'MAINTENANCE' || selectedRow.status === 'IN_USE'"
          >
            维修
          </el-button>
          <el-button 
            type="danger" 
            @click="handleDeleteSelected"
            :disabled="!selectedRow || selectedRow.status === 'IN_USE'"
          >
            删除
          </el-button>
        </el-form-item>
      </el-form>
      
      <!-- 表格 -->
      <el-table 
        :data="vehicleList"
        @row-click="handleRowClick"
        :row-class-name="tableRowClassName" 
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="plateNo" label="车牌号" width="120" />
        <el-table-column prop="brand" label="品牌" width="120" />
        <el-table-column prop="model" label="型号" width="150" />
        <el-table-column prop="vehicleType" label="类型" width="100" />
        <el-table-column prop="color" label="颜色" width="100" />
        <el-table-column prop="seats" label="座位数" width="100" />
        <el-table-column prop="fuelType" label="燃料类型" width="120" />
        <el-table-column prop="buyDate" label="购置日期" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
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
    
    <!-- 车辆信息编辑对话框 -->
    <el-dialog 
      :title="dialogTitle" 
      v-model="dialogVisible" 
      width="500px"
      @close="handleDialogClose"
    >
      <el-form 
        :model="form" 
        :rules="formRules" 
        ref="formRef"
        label-width="100px"
      >
        <el-form-item label="车牌号" prop="plateNo">
          <el-input v-model="form.plateNo" :disabled="!!form.id" />
        </el-form-item>
        <el-form-item label="车辆类型" prop="vehicleType">
          <el-input v-model="form.vehicleType" />
        </el-form-item>
        <el-form-item label="品牌">
          <el-input v-model="form.brand" />
        </el-form-item>
        <el-form-item label="型号">
          <el-input v-model="form.model" />
        </el-form-item>
        <el-form-item label="颜色">
          <el-input v-model="form.color" />
        </el-form-item>
        <el-form-item label="座位数">
          <el-input-number v-model="form.seats" :min="1" :max="100" />
        </el-form-item>
        <el-form-item label="燃料类型">
          <el-select v-model="form.fuelType" placeholder="请选择燃料类型">
            <el-option label="汽油" value="GASOLINE" />
            <el-option label="柴油" value="DIESEL" />
            <el-option label="电动" value="ELECTRIC" />
            <el-option label="混合动力" value="HYBRID" />
          </el-select>
        </el-form-item>
        <el-form-item label="购置日期">
          <el-date-picker
            v-model="form.buyDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择日期"
          />
        </el-form-item>
        <el-form-item label="GPS设备ID">
          <el-input v-model="form.gpsDeviceId" />
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

import { getVehicleList, addVehicle, updateVehicle, updateVehicleStatus, deleteVehicle } from '@/api/vehicle'
import { createMaintenance } from '@/api/maintenance'
// 响应式数据
const loading = ref(false)
const vehicleList = ref([])
const total = ref(0)
const selectedRow = ref(null)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)

// 查询参数
const queryParams = ref({
  page: 1,
  size: 10,
  plateNo: undefined,
  status: undefined
})

// 表单数据
const form = ref({
  id: undefined,
  plateNo: '',
  vehicleType: '',
  brand: '',
  model: '',
  color: '',
  seats: 5,
  fuelType: '',
  buyDate: '',
  gpsDeviceId: ''
})

// 表单验证规则
const formRules = {
  plateNo: [
    { required: true, message: '请输入车牌号', trigger: 'blur' }
  ],
  vehicleType: [
    { required: true, message: '请输入车辆类型', trigger: 'blur' }
  ]
}

// 表单引用
const formRef = ref(null)

// 获取车辆列表
const getList = async () => {
  loading.value = true
  try {
    const response = await getVehicleList(
      queryParams.value.page, 
      queryParams.value.size, 
      queryParams.value.plateNo, 
      queryParams.value.status
    )
    vehicleList.value = response.data.list
    total.value = response.data.total
  } catch (error) {
    console.error(error)
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
    plateNo: undefined,
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

// 新增车辆
const handleAdd = () => {
  dialogTitle.value = '新增车辆'
  isEdit.value = false
  dialogVisible.value = true
}

// 编辑车辆
const handleEdit = (row) => {
  dialogTitle.value = '编辑车辆'
  isEdit.value = true
  form.value = { ...row }
  dialogVisible.value = true
}

// 更新车辆状态
const handleUpdateStatus = async (row, status) => {
  try {
    await ElMessageBox.confirm(
      `确定要将车辆 ${row.plateNo} 的状态更新为 ${getStatusText(status)} 吗？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 如果是维修状态，需要创建维修记录
    if (status === 'MAINTENANCE') {
      await ElMessageBox.confirm(
        `确定要将车辆 ${row.plateNo} 设为维修状态吗？这将在维修保养中创建一条维修记录。`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )

      // 创建维修记录
      const maintenanceData = {
        vehicleId: row.id,
        type: 'MAINTENANCE',
        date: new Date().toISOString(),
        content: '车辆维修',
        mileage: 0,
        cost: 0
      }

      await createMaintenance(maintenanceData)
      ElMessage.success('已创建维修记录，车辆状态已更新为维修中')
    } else {
      await updateVehicleStatus(row.id, status)
      ElMessage.success('状态更新成功')
    }
    getList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('状态更新失败')
    }
  }
}

// 删除车辆
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除车辆 ${row.plateNo} 吗？删除后将无法恢复。`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await deleteVehicle(row.id)
    ElMessage.success('删除成功')
    getList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 提交表单
const submitForm = async () => {
  await formRef.value.validate(valid => {
    if (valid) {
      if (isEdit.value) {
        updateVehicle(form.value.id, form.value).then(() => {
          ElMessage.success('修改成功')
          dialogVisible.value = false
          getList()
        })
      } else {
        addVehicle(form.value).then(() => {
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

// 状态类型映射
const getStatusType = (status) => {
  const map = {
    'IDLE': 'success',
    'IN_USE': 'primary',
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
    'IN_USE': '已指派',
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



// 编辑选中的车辆
const handleEditSelected = () => {
  if (selectedRow.value) {
    handleEdit(selectedRow.value)
  }
}

// 维修选中的车辆
const handleMaintenanceSelected = () => {
  if (selectedRow.value) {
    handleUpdateStatus(selectedRow.value, 'MAINTENANCE')
  }
}

// 删除选中的车辆
const handleDeleteSelected = () => {
  if (selectedRow.value) {
    handleDelete(selectedRow.value)
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
}

.vehicle-list .el-card {
  min-height: 80vh;
}

.button-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.vehicle-list :deep(.el-table) {
  cursor: pointer;
}

.vehicle-list :deep(.selected-row) {
  background-color: #ecf5ff;
}
</style>