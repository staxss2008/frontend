
<template>
  <div class="layout">
    <header class="header">
      <h1>车辆管理系统</h1>
      <div class="user-info">
        <el-dropdown @command="handleCommand">
          <span class="el-dropdown-link">
            <el-icon><User /></el-icon>
            {{ userInfo?.realName || '用户' }}
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-item command="profile">个人信息</el-dropdown-item>
            <el-dropdown-item command="logout">退出登录</el-dropdown-item>
          </template>
        </el-dropdown>
      </div>
    </header>
    <div class="container">
      <aside class="sidebar">
        <el-menu
          :default-active="activeMenu"
          class="sidebar-menu"
          router
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#ffd04b"
        >
          <el-menu-item index="/dashboard">
            <el-icon><Monitor /></el-icon>
            <span>工作台</span>
          </el-menu-item>

          <el-sub-menu index="/dispatch">
            <template #title>
              <el-icon><Position /></el-icon>
              <span>调度中心</span>
            </template>
            <el-menu-item index="/dispatch/monitor">实时监控</el-menu-item>
            <el-menu-item index="/dispatch/list">调度单管理</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="/vehicle">
            <template #title>
              <el-icon><Van /></el-icon>
              <span>车辆管理</span>
            </template>
            <el-menu-item index="/vehicle/list">车辆档案</el-menu-item>
            <el-menu-item index="/vehicle/maintenance">维修保养</el-menu-item>
            <el-menu-item index="/vehicle/inspection">年检保险</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="/driver">
            <template #title>
              <el-icon><User /></el-icon>
              <span>驾驶员管理</span>
            </template>
            <el-menu-item index="/driver/list">驾驶员档案</el-menu-item>
            <el-menu-item index="/driver/evaluation">绩效考核</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="/application">
            <template #title>
              <el-icon><Document /></el-icon>
              <span>用车申请</span>
            </template>
            <el-menu-item index="/application/create">申请用车</el-menu-item>
            <el-menu-item index="/application/list">申请记录</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="/statistics">
            <template #title>
              <el-icon><TrendCharts /></el-icon>
              <span>统计分析</span>
            </template>
            <el-menu-item index="/statistics/usage">使用统计</el-menu-item>
            <el-menu-item index="/statistics/maintenance">维修统计</el-menu-item>
          </el-sub-menu>


        </el-menu>
      </aside>
      <main class="main-content">
        <router-view />
      </main>
    </div>
    <footer class="footer">
      <p>© 2025 车辆管理系统</p>
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { logout } from '@/api/auth'

const route = useRoute()
const router = useRouter()
const activeMenu = computed(() => route.path)
const userInfo = ref(null)

// 获取用户信息
onMounted(() => {
  const userInfoStr = localStorage.getItem('userInfo')
  if (userInfoStr) {
    userInfo.value = JSON.parse(userInfoStr)
  }
})

// 处理下拉菜单命令
// 处理下拉菜单命令
const handleCommand = async (command) => {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm(
        '确定要退出登录吗？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )

      await logout()
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      ElMessage.success('退出登录成功')
      router.push('/login')
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('退出登录失败')
      }
    }
  } else if (command === 'profile') {
    router.push('/profile')
  }
}

</script>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background-color: #409EFF;
  color: white;
  padding: 1rem;
  display: flex;
  align-items: center;
}

.header h1 {
  margin: 0;
  font-size: 1.5rem;
}

.user-info {
  margin-left: auto;
  display: flex;
  align-items: center;
}

.el-dropdown-link {
  cursor: pointer;
  color: white;
  display: flex;
  align-items: center;
}

.container {
  display: flex;
  flex: 1;
}

.sidebar {
  width: 220px;
  background-color: #545c64;
  flex-shrink: 0;
}

.sidebar-menu {
  border-right: none;
  height: 100%;
}

.main-content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.footer {
  background-color: #f0f0f0;
  padding: 1rem;
  text-align: center;
}
</style>
