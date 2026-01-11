<template>
  <div class="profile">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>个人信息</h3>
          <div class="header-actions">
            <el-button @click="goBack" :icon="ArrowLeft">
              返回主页
            </el-button>
          </div>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <!-- 基本信息标签页 -->
        <el-tab-pane label="基本信息" name="basic">
          <div class="basic-info">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="用户名">
                {{ userInfo.username }}
              </el-descriptions-item>
              <el-descriptions-item label="真实姓名">
                {{ userInfo.realName }}
              </el-descriptions-item>
              <el-descriptions-item label="邮箱">
                {{ userInfo.email }}
              </el-descriptions-item>
              <el-descriptions-item label="手机号">
                {{ userInfo.phone }}
              </el-descriptions-item>
              <el-descriptions-item label="部门">
                {{ userInfo.department }}
              </el-descriptions-item>
              <el-descriptions-item label="职位">
                {{ userInfo.position }}
              </el-descriptions-item>
              <el-descriptions-item label="状态">
                <el-tag :type="userInfo.status === 'ACTIVE' ? 'success' : 'danger'">
                  {{ userInfo.status === 'ACTIVE' ? '激活' : '禁用' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="创建时间">
                {{ userInfo.createdAt }}
              </el-descriptions-item>
            </el-descriptions>

            <div class="role-info">
              <h4>角色信息</h4>
              <el-tag
                v-for="role in roles"
                :key="role.id"
                type="primary"
                style="margin-right: 10px; margin-bottom: 10px"
              >
                {{ role.roleName }}
              </el-tag>
            </div>

            <div class="action-buttons">
              <el-button type="warning" @click="handleChangePassword" :icon="Lock">
                修改密码
              </el-button>
            </div>
          </div>
        </el-tab-pane>

        <!-- 用户管理标签页 -->
        <el-tab-pane v-if="isAdminOrManager" label="用户管理" name="user">
          <div class="user-management">
            <div class="action-bar">
              <el-button type="primary" @click="handleAddUser">新增用户</el-button>
            </div>
            <!-- 搜索表单 -->
            <el-form :model="userQueryParams" inline>
              <el-form-item label="用户名">
                <el-input
                  v-model="userQueryParams.username"
                  placeholder="请输入用户名"
                  clearable
                  @keyup.enter="handleUserQuery"
                />
              </el-form-item>
              <el-form-item label="真实姓名">
                <el-input
                  v-model="userQueryParams.realName"
                  placeholder="请输入真实姓名"
                  clearable
                  @keyup.enter="handleUserQuery"
                />
              </el-form-item>
              <el-form-item label="状态">
                <el-select v-model="userQueryParams.status" placeholder="请选择状态" clearable>
                  <el-option label="激活" value="ACTIVE" />
                  <el-option label="禁用" value="DISABLED" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleUserQuery">搜索</el-button>
                <el-button @click="resetUserQuery">重置</el-button>
              </el-form-item>
            </el-form>

            <!-- 用户表格 -->
            <el-table
              :data="userList"
              v-loading="userLoading"
              style="width: 100%"
            >
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="username" label="用户名" width="120" />
              <el-table-column prop="realName" label="真实姓名" width="120" />
              <el-table-column prop="email" label="邮箱" width="180" />
              <el-table-column prop="phone" label="手机号" width="120" />
              <el-table-column prop="department" label="部门" width="120" />
              <el-table-column prop="position" label="职位" width="120" />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                  <el-tag :type="scope.row.status === 'ACTIVE' ? 'success' : 'danger'">
                    {{ scope.row.status === 'ACTIVE' ? '激活' : '禁用' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="createdAt" label="创建时间" width="180" />
              <el-table-column label="操作" width="280" fixed="right">
                <template #default="scope">
                  <el-button
                    size="small"
                    type="primary"
                    @click="handleEditUser(scope.row)"
                  >
                    编辑
                  </el-button>
                  <el-button
                    size="small"
                    type="success"
                    @click="handleAssignRoles(scope.row)"
                  >
                    分配角色
                  </el-button>
                  <el-button
                    size="small"
                    type="danger"
                    @click="handleDeleteUser(scope.row)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <!-- 用户分页 -->
            <el-pagination
              v-model:current-page="userQueryParams.page"
              v-model:page-size="userQueryParams.size"
              :page-sizes="[10, 20, 50, 100]"
              :total="userTotal"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleUserSizeChange"
              @current-change="handleUserCurrentChange"
              style="margin-top: 20px; text-align: right"
            />
          </div>
        </el-tab-pane>

        <!-- 角色管理标签页 -->
        <el-tab-pane v-if="isAdminOrManager" label="角色管理" name="role">
          <div class="role-management">
            <div class="action-bar">
              <el-button type="primary" @click="handleAddRole">新增角色</el-button>
            </div>
            <!-- 搜索表单 -->
            <el-form :model="roleQueryParams" inline>
              <el-form-item label="角色名称">
                <el-input
                  v-model="roleQueryParams.roleName"
                  placeholder="请输入角色名称"
                  clearable
                  @keyup.enter="handleRoleQuery"
                />
              </el-form-item>
              <el-form-item label="角色编码">
                <el-input
                  v-model="roleQueryParams.roleCode"
                  placeholder="请输入角色编码"
                  clearable
                  @keyup.enter="handleRoleQuery"
                />
              </el-form-item>
              <el-form-item label="状态">
                <el-select v-model="roleQueryParams.status" placeholder="请选择状态" clearable>
                  <el-option label="激活" value="ACTIVE" />
                  <el-option label="禁用" value="DISABLED" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleRoleQuery">搜索</el-button>
                <el-button @click="resetRoleQuery">重置</el-button>
              </el-form-item>
            </el-form>

            <!-- 角色表格 -->
            <el-table
              :data="roleList"
              v-loading="roleLoading"
              style="width: 100%"
            >
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="roleName" label="角色名称" width="150" />
              <el-table-column prop="roleCode" label="角色编码" width="150" />
              <el-table-column prop="description" label="角色描述" />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                  <el-tag :type="scope.row.status === 'ACTIVE' ? 'success' : 'danger'">
                    {{ scope.row.status === 'ACTIVE' ? '激活' : '禁用' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="createdAt" label="创建时间" width="180" />
              <el-table-column label="操作" width="200" fixed="right">
                <template #default="scope">
                  <el-button
                    size="small"
                    type="primary"
                    @click="handleEditRole(scope.row)"
                  >
                    编辑
                  </el-button>
                  <el-button
                    size="small"
                    type="danger"
                    @click="handleDeleteRole(scope.row)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <!-- 角色分页 -->
            <el-pagination
              v-model:current-page="roleQueryParams.page"
              v-model:page-size="roleQueryParams.size"
              :page-sizes="[10, 20, 50, 100]"
              :total="roleTotal"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleRoleSizeChange"
              @current-change="handleRoleCurrentChange"
              style="margin-top: 20px; text-align: right"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 编辑信息对话框 -->
    <el-dialog
      title="编辑个人信息"
      v-model="editDialogVisible"
      width="600px"
      @close="handleEditDialogClose"
    >
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="editForm.realName" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="editForm.phone" />
        </el-form-item>
        <el-form-item label="部门">
          <el-input v-model="editForm.department" />
        </el-form-item>
        <el-form-item label="职位">
          <el-input v-model="editForm.position" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitEditForm" :loading="editLoading">
            确 定
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 修改密码对话框 -->
    <el-dialog
      title="修改密码"
      v-model="passwordDialogVisible"
      width="500px"
      @close="handlePasswordDialogClose"
    >
      <el-form
        :model="passwordForm"
        :rules="passwordFormRules"
        ref="passwordFormRef"
        label-width="100px"
      >
        <el-form-item label="原密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="passwordDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitPasswordForm" :loading="passwordLoading">
            确 定
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 用户编辑对话框 -->
    <el-dialog
      :title="userDialogTitle"
      v-model="userDialogVisible"
      width="600px"
      @close="handleUserDialogClose"
    >
      <el-form
        :model="userForm"
        :rules="userFormRules"
        ref="userFormRef"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" :disabled="!!userForm.id" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!userForm.id">
          <el-input v-model="userForm.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="userForm.realName" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="userForm.phone" />
        </el-form-item>
        <el-form-item label="部门">
          <el-input v-model="userForm.department" />
        </el-form-item>
        <el-form-item label="职位">
          <el-input v-model="userForm.position" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="userForm.status">
            <el-radio value="ACTIVE">激活</el-radio>
            <el-radio value="DISABLED">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="userDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitUserForm">确 定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 角色分配对话框 -->
    <el-dialog
      title="分配角色"
      v-model="roleAssignDialogVisible"
      width="400px"
    >
      <el-form label-width="100px">
        <el-form-item label="用户">
          <span>{{ currentUser?.realName }}</span>
        </el-form-item>
        <el-form-item label="角色">
          <el-select
            v-model="selectedRoleIds"
            multiple
            placeholder="请选择角色"
            style="width: 100%"
          >
            <el-option
              v-for="role in allRoles"
              :key="role.id"
              :label="role.roleName"
              :value="role.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="roleAssignDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitRoleAssign">确 定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 角色编辑对话框 -->
    <el-dialog
      :title="roleDialogTitle"
      v-model="roleDialogVisible"
      width="500px"
      @close="handleRoleDialogClose"
    >
      <el-form
        :model="roleForm"
        :rules="roleFormRules"
        ref="roleFormRef"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="roleForm.roleName" />
        </el-form-item>
        <el-form-item label="角色编码" prop="roleCode">
          <el-input v-model="roleForm.roleCode" />
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="roleForm.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="roleForm.status">
            <el-radio value="ACTIVE">激活</el-radio>
            <el-radio value="DISABLED">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="roleDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitRoleForm">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Lock, ArrowLeft } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { getUserList, addUser, updateUser, deleteUser, assignRoles, getUserRoles, changePassword, updateCurrentUserInfo } from '@/api/user'
import { getRoleList, addRole, updateRole, deleteRole } from '@/api/role'
import { getCurrentUser } from '@/api/auth'

// 路由
const router = useRouter()

// 响应式数据
const activeTab = ref('basic')
const userInfo = ref({})
const roles = ref([])

// 判断当前用户是否为管理员或经理
const isAdminOrManager = computed(() => {
  return roles.value.some(role => role.roleCode === 'ADMIN' || role.roleCode === 'MANAGER')
})
const editDialogVisible = ref(false)
const passwordDialogVisible = ref(false)
const editLoading = ref(false)
const passwordLoading = ref(false)

// 用户管理相关
const userLoading = ref(false)
const userList = ref([])
const userTotal = ref(0)
const userDialogVisible = ref(false)
const userDialogTitle = ref('')
const userIsEdit = ref(false)
const roleAssignDialogVisible = ref(false)
const currentUser = ref(null)
const allRoles = ref([])
const selectedRoleIds = ref([])

// 角色管理相关
const roleLoading = ref(false)
const roleList = ref([])
const roleTotal = ref(0)
const roleDialogVisible = ref(false)
const roleDialogTitle = ref('')
const roleIsEdit = ref(false)

// 查询参数
const userQueryParams = ref({
  page: 1,
  size: 10,
  username: undefined,
  realName: undefined,
  status: undefined
})

const roleQueryParams = ref({
  page: 1,
  size: 10,
  roleName: undefined,
  roleCode: undefined,
  status: undefined
})

// 编辑表单
const editForm = ref({
  username: '',
  realName: '',
  email: '',
  phone: '',
  department: '',
  position: ''
})

// 修改密码表单
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 用户表单
const userForm = ref({
  id: undefined,
  username: '',
  password: '',
  realName: '',
  email: '',
  phone: '',
  department: '',
  position: '',
  status: 'ACTIVE'
})

// 角色表单
const roleForm = ref({
  id: undefined,
  roleName: '',
  roleCode: '',
  description: '',
  status: 'ACTIVE'
})

// 表单引用
const editFormRef = ref(null)
const passwordFormRef = ref(null)
const userFormRef = ref(null)
const roleFormRef = ref(null)

// 表单验证规则
const editFormRules = {
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

const passwordFormRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.value.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const userFormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

const roleFormRules = {
  roleName: [
    { required: true, message: '请输入角色名称', trigger: 'blur' }
  ],
  roleCode: [
    { required: true, message: '请输入角色编码', trigger: 'blur' }
  ]
}

// 获取用户信息
const getUserInfo = async (updateEditForm = false) => {
  try {
    const userInfoStr = localStorage.getItem('userInfo')
    console.log('getUserInfo - userInfoStr:', userInfoStr)
    if (userInfoStr) {
      const user = JSON.parse(userInfoStr)
      console.log('getUserInfo - user:', user)
      userInfo.value = {
        id: user.userId,
        username: user.username,
        realName: user.realName,
        email: user.email,
        phone: user.phone,
        department: user.department,
        position: user.position,
        status: 'ACTIVE',
        createdAt: null
      }
      console.log('getUserInfo - userInfo.value:', userInfo.value)
      console.log('getUserInfo - activeTab:', activeTab.value)
      roles.value = user.roles || []

      if (updateEditForm) {
        editForm.value = {
          username: user.username,
          realName: user.realName,
          email: user.email,
          phone: user.phone,
          department: user.department,
          position: user.position
        }
      }
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('获取用户信息失败')
  }
}

// 返回主页
const goBack = () => {
  router.push('/dashboard')
}

// 编辑信息
const handleEditInfo = () => {
  editForm.value = {
    username: userInfo.value.username,
    realName: userInfo.value.realName,
    email: userInfo.value.email,
    phone: userInfo.value.phone,
    department: userInfo.value.department,
    position: userInfo.value.position
  }
  editDialogVisible.value = true
}

// 提交编辑表单
const submitEditForm = async () => {
  const valid = await editFormRef.value.validate().catch(() => false)
  if (!valid) return

  editLoading.value = true
  try {
    await updateCurrentUserInfo(editForm.value)
    ElMessage.success('更新成功')
    editDialogVisible.value = false
    // 刷新用户信息
    await getUserInfo()
  } catch (error) {
    console.error(error)
    ElMessage.error('更新失败')
  } finally {
    editLoading.value = false
  }
}

// 关闭编辑对话框
const handleEditDialogClose = () => {
  editFormRef.value?.resetFields()
}

// 修改密码
const handleChangePassword = () => {
  passwordDialogVisible.value = true
}

// 提交修改密码表单
const submitPasswordForm = async () => {
  const valid = await passwordFormRef.value.validate().catch(() => false)
  if (!valid) return

  passwordLoading.value = true
  try {
    await changePassword(passwordForm.value.oldPassword, passwordForm.value.newPassword)
    ElMessage.success('密码修改成功，请重新登录')
    passwordDialogVisible.value = false
    // 清空token和用户信息，跳转到登录页
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    window.location.href = '/login'
  } catch (error) {
    console.error(error)
    ElMessage.error(error.response?.data?.message || '密码修改失败')
  } finally {
    passwordLoading.value = false
  }
}

// 关闭密码对话框
const handlePasswordDialogClose = () => {
  passwordFormRef.value?.resetFields()
}

// 获取用户列表
const getUserListData = async () => {
  userLoading.value = true
  try {
    const response = await getUserList(
      userQueryParams.value.page,
      userQueryParams.value.size,
      userQueryParams.value.username,
      userQueryParams.value.realName,
      userQueryParams.value.status
    )
    userList.value = response.data.list
    userTotal.value = response.data.total
  } catch (error) {
    console.error(error)
  } finally {
    userLoading.value = false
  }
}

// 获取所有角色
const getRolesData = async () => {
  try {
    const response = await getRoleList(1, 1000)
    allRoles.value = response.data.list
  } catch (error) {
    console.error(error)
  }
}

// 用户搜索
const handleUserQuery = () => {
  userQueryParams.value.page = 1
  getUserListData()
}

// 重置用户搜索
const resetUserQuery = () => {
  userQueryParams.value = {
    page: 1,
    size: 10,
    username: undefined,
    realName: undefined,
    status: undefined
  }
  handleUserQuery()
}

// 处理用户分页大小变化
const handleUserSizeChange = (val) => {
  userQueryParams.value.size = val
  getUserListData()
}

// 处理用户当前页变化
const handleUserCurrentChange = (val) => {
  userQueryParams.value.page = val
  getUserListData()
}

// 新增用户
const handleAddUser = () => {
  userDialogTitle.value = '新增用户'
  userIsEdit.value = false
  userForm.value = {
    id: undefined,
    username: '',
    password: '',
    realName: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    status: 'ACTIVE'
  }
  userDialogVisible.value = true
}

// 编辑用户
const handleEditUser = (row) => {
  userDialogTitle.value = '编辑用户'
  userIsEdit.value = true
  userForm.value = { ...row }
  userDialogVisible.value = true
}

// 分配角色
const handleAssignRoles = async (row) => {
  currentUser.value = row
  roleAssignDialogVisible.value = true

  try {
    const response = await getUserRoles(row.id)
    selectedRoleIds.value = response.data.map(role => role.id)
  } catch (error) {
    console.error(error)
    selectedRoleIds.value = []
  }
}

// 提交角色分配
const submitRoleAssign = async () => {
  try {
    await assignRoles(currentUser.value.id, selectedRoleIds.value)
    ElMessage.success('角色分配成功')
    roleAssignDialogVisible.value = false
  } catch (error) {
    console.error(error)
    ElMessage.error('角色分配失败')
  }
}

// 删除用户
const handleDeleteUser = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 ${row.realName} 吗？删除后将无法恢复。`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await deleteUser(row.id)
    ElMessage.success('删除成功')
    getUserListData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 提交用户表单
const submitUserForm = async () => {
  await userFormRef.value.validate(valid => {
    if (valid) {
      if (userIsEdit.value) {
        updateUser(userForm.value.id, userForm.value).then(() => {
          ElMessage.success('修改成功')
          userDialogVisible.value = false
          getUserListData()
          // 如果编辑的是当前登录用户，更新localStorage中的用户信息
          const userInfoStr = localStorage.getItem('userInfo')
          console.log('userInfoStr:', userInfoStr)
          if (userInfoStr) {
            const currentUser = JSON.parse(userInfoStr)
            // 获取当前登录用户的ID
            const currentUserId = currentUser.userId
            console.log('currentUserId:', currentUserId, 'userForm.value.id:', userForm.value.id)
            if (currentUserId === userForm.value.id) {
              console.log('更新当前用户信息')
              console.log('更新前 - currentUser.email:', currentUser.email)
              currentUser.email = userForm.value.email
              currentUser.phone = userForm.value.phone
              currentUser.realName = userForm.value.realName
              currentUser.department = userForm.value.department
              currentUser.position = userForm.value.position
              console.log('更新后 - currentUser.email:', currentUser.email)
              localStorage.setItem('userInfo', JSON.stringify(currentUser))
              console.log('localStorage已更新')
              // 刷新基本信息页面
              getUserInfo()
            }
          }
        })
      } else {
        addUser(userForm.value).then(() => {
          ElMessage.success('新增成功')
          userDialogVisible.value = false
          getUserListData()
        })
      }
    }
  })
}

// 关闭用户对话框
const handleUserDialogClose = () => {
  userFormRef.value?.resetFields()
}

// 获取角色列表
const getRoleListData = async () => {
  roleLoading.value = true
  try {
    const response = await getRoleList(
      roleQueryParams.value.page,
      roleQueryParams.value.size,
      roleQueryParams.value.roleName,
      roleQueryParams.value.roleCode,
      roleQueryParams.value.status
    )
    roleList.value = response.data.list
    roleTotal.value = response.data.total
  } catch (error) {
    console.error(error)
  } finally {
    roleLoading.value = false
  }
}

// 角色搜索
const handleRoleQuery = () => {
  roleQueryParams.value.page = 1
  getRoleListData()
}

// 重置角色搜索
const resetRoleQuery = () => {
  roleQueryParams.value = {
    page: 1,
    size: 10,
    roleName: undefined,
    roleCode: undefined,
    status: undefined
  }
  handleRoleQuery()
}

// 处理角色分页大小变化
const handleRoleSizeChange = (val) => {
  roleQueryParams.value.size = val
  getRoleListData()
}

// 处理角色当前页变化
const handleRoleCurrentChange = (val) => {
  roleQueryParams.value.page = val
  getRoleListData()
}

// 新增角色
const handleAddRole = () => {
  roleDialogTitle.value = '新增角色'
  roleIsEdit.value = false
  roleForm.value = {
    id: undefined,
    roleName: '',
    roleCode: '',
    description: '',
    status: 'ACTIVE'
  }
  roleDialogVisible.value = true
}

// 编辑角色
const handleEditRole = (row) => {
  roleDialogTitle.value = '编辑角色'
  roleIsEdit.value = true
  roleForm.value = { ...row }
  roleDialogVisible.value = true
}

// 删除角色
const handleDeleteRole = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除角色 ${row.roleName} 吗？删除后将无法恢复。`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await deleteRole(row.id)
    ElMessage.success('删除成功')
    getRoleListData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 提交角色表单
const submitRoleForm = async () => {
  await roleFormRef.value.validate(valid => {
    if (valid) {
      if (roleIsEdit.value) {
        updateRole(roleForm.value.id, roleForm.value).then(() => {
          ElMessage.success('修改成功')
          roleDialogVisible.value = false
          getRoleListData()
        })
      } else {
        addRole(roleForm.value).then(() => {
          ElMessage.success('新增成功')
          roleDialogVisible.value = false
          getRoleListData()
        })
      }
    }
  })
}

// 关闭角色对话框
const handleRoleDialogClose = () => {
  roleFormRef.value?.resetFields()
}

// 初始化
onMounted(async () => {
  await getUserInfo(true)
  // 只有管理员和经理才能访问用户列表和角色列表
  const isAdminOrManager = roles.value.some(role => role.roleCode === 'ADMIN' || role.roleCode === 'MANAGER')
  if (isAdminOrManager) {
    getUserListData()
    getRoleListData()
    getRolesData()
  }
})
</script>

<style scoped>
.profile {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.basic-info {
  padding: 20px;
}

.role-info {
  margin-top: 20px;
}

.role-info h4 {
  margin-bottom: 10px;
  color: #606266;
}

.action-buttons {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

.user-management,
.role-management {
  padding: 20px;
}

.action-bar {
  margin-bottom: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
