<template>
  <div class="driver-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>驾驶员档案管理</h3>
          <el-button type="primary" @click="handleAdd">新增驾驶员</el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :model="queryParams" inline>
        <el-form-item label="姓名">
          <el-input
            v-model="queryParams.name"
            placeholder="请输入驾驶员姓名"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
            <el-option label="正常" value="ACTIVE" />
            <el-option label="已出车" value="ON_TRIP" />
            <el-option label="休假" value="ON_LEAVE" />
            <el-option label="离职" value="RESIGNED" />
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
            :disabled="selectedRows.length === 0"
          >
            编辑
          </el-button>
          <el-button 
            type="danger" 
            @click="handleDeleteSelected"
            :disabled="selectedRows.length === 0"
          >
            删除
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 表格 -->
      <el-table
        ref="tableRef"
        :data="driverList"
        v-loading="loading"
        style="width: 100%"
        @row-click="handleRowClick"
        :row-class-name="tableRowClassName"
        height="calc(80vh - 300px)"
        :header-cell-style="{ background: '#f5f7fa', position: 'sticky', top: '0', zIndex: 10 }"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="employeeNo" label="工号" width="120" />
        <el-table-column prop="phone" label="联系电话" width="120" />
        <el-table-column prop="licenseNo" label="驾驶证号" width="180" />
        <el-table-column prop="licenseType" label="准驾车型" width="100" />
        <el-table-column prop="licenseExpire" label="驾照有效期" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160" />
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

    <!-- 驾驶员信息编辑对话框 -->
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
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="工号" prop="employeeNo">
          <el-input v-model="form.employeeNo" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="驾驶证号" prop="licenseNo">
          <el-input v-model="form.licenseNo" />
        </el-form-item>
        <el-form-item label="准驾车型" prop="licenseType">
          <el-select v-model="form.licenseType" placeholder="请选择准驾车型">
            <el-option label="A1" value="A1" />
            <el-option label="A2" value="A2" />
            <el-option label="B1" value="B1" />
            <el-option label="B2" value="B2" />
            <el-option label="C1" value="C1" />
            <el-option label="C2" value="C2" />
          </el-select>
        </el-form-item>
        <el-form-item label="驾照有效期" prop="licenseExpire">
          <el-date-picker
            v-model="form.licenseExpire"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择日期"
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
import { getDriverList, addDriver, updateDriver, deleteDriver, updateDriverStatus } from '@/api/driver'

// 响应式数据
const loading = ref(false)
const driverList = ref([])
const total = ref(0)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const selectedRow = ref(null)
const selectedRows = ref([])
const lastSelectedIndex = ref(0)

// 查询参数
const queryParams = ref({
  page: 1,
  size: 10,
  name: undefined,
  status: undefined
})

// 表单数据
const form = ref({
  id: undefined,
  name: '',
  employeeNo: '',
  phone: '',
  licenseNo: '',
  licenseType: '',
  licenseExpire: ''
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' }
  ],
  licenseNo: [
    { required: true, message: '请输入驾驶证号', trigger: 'blur' }
  ]
}

// 表单引用
const formRef = ref(null)
const tableRef = ref(null)

// 获取驾驶员列表
const getList = async () => {
  loading.value = true
  try {
    const response = await getDriverList(
      queryParams.value.page,
      queryParams.value.size,
      queryParams.value.name,
      queryParams.value.status
    )
    driverList.value = response.data.list
    total.value = response.data.total
  } catch (error) {
    console.error(error)
    ElMessage.error('获取驾驶员列表失败')
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
    name: undefined,
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

// 新增驾驶员
const handleAdd = () => {
  dialogTitle.value = '新增驾驶员'
  isEdit.value = false
  dialogVisible.value = true
}

// 编辑驾驶员
const handleEdit = (row) => {
  dialogTitle.value = '编辑驾驶员'
  isEdit.value = true
  form.value = { ...row }
  dialogVisible.value = true
}

// 更新驾驶员状态
const handleUpdateStatus = async (row, status) => {
  try {
    await ElMessageBox.confirm(
      `确定要将驾驶员 ${row.name} 的状态更新为 ${getStatusText(status)} 吗？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await updateDriverStatus(row.id, status)
    ElMessage.success('状态更新成功')
    getList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('状态更新失败')
    }
  }
}

// 删除驾驶员
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除驾驶员 ${row.name} 吗？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await deleteDriver(row.id)
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
        updateDriver(form.value.id, form.value).then(() => {
          ElMessage.success('修改成功')
          dialogVisible.value = false
          getList()
        })
      } else {
        addDriver(form.value).then(() => {
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
    'ACTIVE': 'success',
    'ON_TRIP': 'primary',
    'ON_LEAVE': 'warning',
    'RESIGNED': 'danger'
  }
  return map[status] || 'info'
}

// 状态文本映射
const getStatusText = (status) => {
  const map = {
    'ACTIVE': '正常',
    'ON_TRIP': '已出车',
    'ON_LEAVE': '休假',
    'RESIGNED': '离职'
  }
  return map[status] || '未知'
}

// 处理行点击
const handleRowClick = (row, event) => {
  const currentIndex = driverList.value.findIndex(item => item.id === row.id)

  // 获取Shift键状态
  const isShiftPressed = window.event && window.event.shiftKey

  // 处理Shift键多选
  if (isShiftPressed) {
    const start = Math.min(lastSelectedIndex.value, currentIndex)
    const end = Math.max(lastSelectedIndex.value, currentIndex)
    // 选中范围内的所有行
    const rowsToSelect = driverList.value.slice(start, end + 1)
    selectedRows.value = rowsToSelect
    selectedRow.value = row
    lastSelectedIndex.value = currentIndex
    return
  }

  // 普通点击，单选
  selectedRows.value = [row]
  selectedRow.value = row
  lastSelectedIndex.value = currentIndex
}

// 表格行样式
const tableRowClassName = ({ row }) => {
  return selectedRows.value.some(item => item.id === row.id) ? 'selected-row' : ''
}

// 编辑选中的驾驶员
const handleEditSelected = () => {
  if (selectedRows.value.length === 1) {
    handleEdit(selectedRows.value[0])
  } else if (selectedRows.value.length > 1) {
    ElMessage.warning('请选择一条记录进行编辑')
  }
}

// 删除选中的驾驶员
const handleDeleteSelected = async () => {
  if (selectedRows.value.length === 0) return

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 条驾驶员记录吗？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 批量删除
    await Promise.all(selectedRows.value.map(row => deleteDriver(row.id)))
    ElMessage.success('删除成功')
    selectedRows.value = []
    selectedRow.value = null
    lastSelectedIndex.value = -1
    getList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
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

.driver-list .el-card {
  min-height: 80vh;
}

.driver-list :deep(.el-card__body) {
  padding-top: 4px;
}

.driver-list :deep(.el-card__header) {
  padding: 6px 16px;
}

.driver-list :deep(.el-table) {
  cursor: pointer;
}

.driver-list :deep(.selected-row) {
  background-color: #ecf5ff;
}

/* 固定表头 */
.driver-list :deep(.el-table__header-wrapper) {
  position: sticky;
  top: 0;
  z-index: 10;
}

.driver-list :deep(.el-table__header th) {
  background-color: #f5f7fa !important;
  position: sticky;
  top: 0;
  z-index: 10;
}

/* 操作按钮悬浮 */
.driver-list :deep(.el-form) {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: #fff;
  padding: 4px 0;
  margin-bottom: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.driver-list :deep(.el-form-item) {
  margin-bottom: 4px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .driver-list .el-card {
    min-height: auto;
  }

  .driver-list :deep(.el-form) {
    flex-direction: column;
    align-items: stretch;
  }

  .driver-list :deep(.el-form-item) {
    width: 100%;
    margin-right: 0;
  }

  .driver-list :deep(.el-form-item__content) {
    width: 100%;
  }

  .driver-list :deep(.el-select),
  .driver-list :deep(.el-input) {
    width: 100%;
  }

  .driver-list :deep(.el-button-group) {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .driver-list :deep(.el-button) {
    flex: 1;
    min-width: 80px;
  }

  .driver-list :deep(.el-table) {
    font-size: 12px;
  }

  .driver-list :deep(.el-table__body-wrapper) {
    overflow-x: auto;
  }

  .driver-list :deep(.el-table__cell) {
    padding: 8px 4px;
  }
}
</style>
