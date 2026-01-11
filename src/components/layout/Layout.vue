
<template>
  <div class="layout">
    <header class="header">
      <el-button class="menu-button" @click="toggleSidebar" circle>
        <el-icon><Menu /></el-icon>
      </el-button>
      <h1 data-text="车辆管理系统">车辆管理系统</h1>
      <div class="user-info">
        <el-dropdown @command="handleCommand">
          <span class="el-dropdown-link">
            <div class="user-avatar">
              <el-icon><User /></el-icon>
            </div>
            <div class="user-details">
              <div class="user-name">{{ userInfo?.realName || '用户' }}</div>
              <div class="user-role">{{ userInfo?.role || '管理员' }}</div>
            </div>
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
      <div class="sidebar-overlay" @click="closeSidebar" v-if="isMobile && sidebarOpen"></div>
      <aside class="sidebar" :class="{ 'mobile-open': sidebarOpen }">
        <el-menu
          :default-active="activeMenu"
          class="sidebar-menu"
          @select="handleMenuSelect"
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

          <el-sub-menu v-if="isAdminOrManager" index="/vehicle">
            <template #title>
              <el-icon><Van /></el-icon>
              <span>车辆管理</span>
            </template>
            <el-menu-item index="/vehicle/list">车辆档案</el-menu-item>
            <el-menu-item index="/vehicle/maintenance">维修保养</el-menu-item>
          </el-sub-menu>

          <el-sub-menu v-if="isAdminOrManager" index="/driver">
            <template #title>
              <el-icon><User /></el-icon>
              <span>驾驶员管理</span>
            </template>
            <el-menu-item index="/driver/list">驾驶员档案</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="/application">
            <template #title>
              <el-icon><Document /></el-icon>
              <span>用车申请</span>
            </template>
            <el-menu-item index="/application/create">申请用车</el-menu-item>
            <el-menu-item v-if="isAdminOrManager" index="/application/list">申请记录</el-menu-item>
          </el-sub-menu>

          <el-sub-menu v-if="isAdminOrManager" index="/statistics">
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
        <div class="tabs-container">
          <el-tabs
            v-model="activeTab"
            type="card"
            @tab-remove="removeTab"
            @tab-click="handleTabClick"
          >
            <el-tab-pane
              v-for="item in tabsList"
              :key="item.path"
              :label="item.title"
              :name="item.path"
              :closable="item.path !== '/dashboard'"
            >
              <component :is="item.component" v-if="activeTab === item.path" />
            </el-tab-pane>
          </el-tabs>
          
          <!-- 右键菜单 -->
          <ul
            v-show="contextMenuVisible"
            :style="{ left: contextMenuPosition.x + 'px', top: contextMenuPosition.y + 'px' }"
            class="context-menu"
          >
            <li @click="closeCurrentTab">关闭当前标签</li>
            <li @click="closeOtherTabs">关闭其他标签</li>
            <li @click="closeAllTabs">关闭全部标签</li>
            <li @click="closeLeftTabs">关闭左侧标签</li>
            <li @click="closeRightTabs">关闭右侧标签</li>
          </ul>
        </div>
      </main>
    </div>
    <footer class="footer">
      <p>© 2025 车辆管理系统</p>
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, shallowRef, defineAsyncComponent, watch, nextTick, markRaw } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { logout } from '@/api/auth'

const route = useRoute()
const router = useRouter()
const activeMenu = computed(() => activeTab.value)
const userInfo = ref(null)

// 移动端侧边栏相关
const sidebarOpen = ref(false)
const isMobile = ref(false)

// 检测是否为移动设备
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

// 切换侧边栏
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

// 关闭侧边栏
const closeSidebar = () => {
  sidebarOpen.value = false
}

// 判断当前用户是否为管理员或经理
const isAdminOrManager = computed(() => {
  if (!userInfo.value || !userInfo.value.roles) {
    return false
  }
  return userInfo.value.roles.some(role => role.roleCode === 'ADMIN' || role.roleCode === 'MANAGER')
})

// 标签页相关状态
const activeTab = ref('/dashboard')
const tabsList = ref([
  {
    path: '/dashboard',
    title: '工作台',
    component: markRaw(defineAsyncComponent(() => import('@/views/dashboard/Index.vue')))
  }
])

// 菜单标题映射
const menuTitleMap = {
  '/dashboard': '工作台',
  '/dispatch/monitor': '实时监控',
  '/dispatch/list': '调度单管理',
  '/vehicle/list': '车辆档案',
  '/vehicle/maintenance': '维修保养',
  '/driver/list': '驾驶员档案',
  '/application/create': '申请用车',
  '/application/list': '申请记录',
  '/statistics/usage': '使用统计',
  '/statistics/maintenance': '维修统计'
}

// 组件路径映射
const componentMap = {
  '/dashboard': () => import('@/views/dashboard/Index.vue'),
  '/dispatch/monitor': () => import('@/views/dispatch/Monitor.vue'),
  '/dispatch/list': () => import('@/views/dispatch/List.vue'),
  '/vehicle/list': () => import('@/views/vehicle/List.vue'),
  '/vehicle/maintenance': () => import('@/views/vehicle/Maintenance.vue'),
  '/driver/list': () => import('@/views/driver/List.vue'),
  '/application/create': () => import('@/views/application/Create.vue'),
  '/application/list': () => import('@/views/application/List.vue'),
  '/statistics/usage': () => import('@/views/statistics/Usage.vue'),
  '/statistics/maintenance': () => import('@/views/statistics/Maintenance.vue')
}

// 处理菜单选择
const handleMenuSelect = (index) => {
  const title = menuTitleMap[index]
  if (!title) return

  const existingTab = tabsList.value.find(tab => tab.path === index)
  if (!existingTab) {
    tabsList.value.push({
      path: index,
      title: title,
      component: markRaw(defineAsyncComponent(componentMap[index]))
    })
  }
  activeTab.value = index
}

// 移除标签页
const removeTab = (targetName) => {
  // 不允许移除工作台标签
  if (targetName === '/dashboard') {
    return
  }
  
  const index = tabsList.value.findIndex(tab => tab.path === targetName)
  if (index === -1) return
  
  // 如果关闭的是当前激活的标签页，需要切换到其他标签页
  if (activeTab.value === targetName) {
    // 优先切换到工作台标签
    activeTab.value = '/dashboard'
  }
  
  tabsList.value.splice(index, 1)
}

// 处理标签页点击
const handleTabClick = (tab) => {
  activeTab.value = tab.props.name
}

// 处理标签页双击
const handleTabDblClick = (path) => {
  removeTab(path)
}

// 右键菜单相关
const contextMenuVisible = ref(false)
const contextMenuPosition = ref({ x: 0, y: 0 })
const contextMenuTargetPath = ref('')

// 关闭右键菜单
const closeContextMenu = () => {
  contextMenuVisible.value = false
}

// 关闭当前标签
const closeCurrentTab = () => {
  removeTab(contextMenuTargetPath.value)
  closeContextMenu()
}

// 关闭其他标签
const closeOtherTabs = () => {
  if (contextMenuTargetPath.value === '/dashboard') {
    // 如果右键的是工作台标签，只保留工作台标签
    tabsList.value = tabsList.value.filter(tab => tab.path === '/dashboard')
  } else {
    // 否则保留工作台标签和当前右键的标签
    tabsList.value = tabsList.value.filter(
      tab => tab.path === '/dashboard' || tab.path === contextMenuTargetPath.value
    )
  }
  activeTab.value = contextMenuTargetPath.value
  closeContextMenu()
}

// 关闭全部标签
const closeAllTabs = () => {
  // 只保留工作台标签
  tabsList.value = tabsList.value.filter(tab => tab.path === '/dashboard')
  activeTab.value = '/dashboard'
  closeContextMenu()
}

// 关闭左侧标签
const closeLeftTabs = () => {
  const index = tabsList.value.findIndex(tab => tab.path === contextMenuTargetPath.value)
  if (index === -1) return
  
  // 保留工作台标签和当前右键标签及其右侧的标签
  tabsList.value = tabsList.value.filter((tab, i) => 
    tab.path === '/dashboard' || i >= index
  )
  activeTab.value = contextMenuTargetPath.value
  closeContextMenu()
}

// 关闭右侧标签
const closeRightTabs = () => {
  const index = tabsList.value.findIndex(tab => tab.path === contextMenuTargetPath.value)
  if (index === -1) return
  
  // 保留工作台标签和当前右键标签及其左侧的标签
  tabsList.value = tabsList.value.filter((tab, i) => 
    tab.path === '/dashboard' || i <= index
  )
  activeTab.value = contextMenuTargetPath.value
  closeContextMenu()
}

// 点击页面其他地方关闭右键菜单
const handleClickOutside = () => {
  closeContextMenu()
}

// 添加标签页双击和右键事件监听
const addTabDblClickListener = () => {
  // 使用nextTick确保DOM已更新
  nextTick(() => {
    const tabItems = document.querySelectorAll('.el-tabs__item')
    tabItems.forEach(tab => {
      // 移除可能存在的旧事件监听器
      tab.removeEventListener('dblclick', handleTabDblClick)
      
      // 添加双击事件监听器
      tab.addEventListener('dblclick', (e) => {
        // 获取标签页的路径，从id属性中提取
        const tabId = tab.id
        // Element Plus的标签页id格式通常是tab-{path}
        let path = tabId.replace('tab-', '')
        
        // 如果没有从id中获取到有效路径，尝试从其他属性获取
        if (!path || path === tabId) {
          // 尝试从data属性获取
          const dataPath = tab.getAttribute('data-path')
          if (dataPath) {
            path = dataPath
          } else {
            // 尝试从textContent和tabsList中匹配
            const tabText = tab.textContent.trim()
            const matchedTab = tabsList.value.find(t => t.title === tabText)
            if (matchedTab) {
              path = matchedTab.path
            }
          }
        }
        
        if (path) {
          handleTabDblClick(path)
        }
      })
      
      // 添加右键菜单事件监听器
      tab.addEventListener('contextmenu', (e) => {
        e.preventDefault()
        // 获取标签页的路径
        const tabId = tab.id
        let path = tabId.replace('tab-', '')
        
        // 如果没有从id中获取到有效路径，尝试从其他属性获取
        if (!path || path === tabId) {
          // 尝试从data属性获取
          const dataPath = tab.getAttribute('data-path')
          if (dataPath) {
            path = dataPath
          } else {
            // 尝试从textContent和tabsList中匹配
            const tabText = tab.textContent.trim()
            const matchedTab = tabsList.value.find(t => t.title === tabText)
            if (matchedTab) {
              path = matchedTab.path
            }
          }
        }
        
        if (path) {
          contextMenuTargetPath.value = path
          contextMenuPosition.value = {
            x: e.clientX,
            y: e.clientY
          }
          contextMenuVisible.value = true
        }
      })
    })
  })
}

// 获取用户信息
onMounted(() => {
  const userInfoStr = localStorage.getItem('userInfo')
  if (userInfoStr) {
    userInfo.value = JSON.parse(userInfoStr)
  }
  // 检测是否为移动设备
  checkMobile()
  // 监听窗口大小变化
  window.addEventListener('resize', checkMobile)
  // 添加标签页双击事件监听
  addTabDblClickListener()
  // 添加点击页面其他地方关闭右键菜单的事件监听
  document.addEventListener('click', handleClickOutside)
  // 监听自定义事件，处理来自Dashboard组件的标签页打开请求
  window.addEventListener('open-tab', (event) => {
    const { path } = event.detail
    const title = menuTitleMap[path]
    if (!title) return

    const existingTab = tabsList.value.find(tab => tab.path === path)
    if (!existingTab) {
      tabsList.value.push({
        path: path,
        title: title,
        component: markRaw(defineAsyncComponent(componentMap[path]))
      })
    }
    activeTab.value = path
  })
})

// 监听tabsList的变化，重新添加双击事件监听器
watch(tabsList, () => {
  addTabDblClickListener()
}, { deep: true })

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
  background: #e8eaed;
}

.header {
  background: 
    linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    linear-gradient(180deg, #4a9eff 0%, #409EFF 50%, #3690f0 100%);
  color: white;
  padding: 1rem;
  display: flex;
  align-items: center;
  box-shadow: 
    0 8px 20px rgba(64, 158, 255, 0.5),
    0 12px 32px rgba(64, 158, 255, 0.4),
    0 16px 48px rgba(64, 158, 255, 0.3),
    inset 0 3px 0 rgba(255, 255, 255, 0.5),
    inset 0 -3px 6px rgba(0, 0, 0, 0.2);
  border-bottom: 4px solid rgba(255, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
}

.header::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(255, 255, 255, 0.5) 50%, 
    transparent 100%);
}

.header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: bold;
  letter-spacing: 1px;
  position: relative;
  z-index: 1;
  color: #ffffff;
  text-shadow: 4px 4px 0 #000;
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
  gap: 12px;
  padding: 8px 16px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.el-dropdown-link:hover {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.1) 100%);
  transform: translateY(-2px);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #66b1ff 0%, #409EFF 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 2px 8px rgba(64, 158, 255, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.user-avatar .el-icon {
  font-size: 20px;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.user-role {
  font-size: 12px;
  opacity: 0.8;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.container {
  display: flex;
  flex: 1;
}

.sidebar {
  width: 176px;
  background: 
    linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, transparent 50%),
    linear-gradient(180deg, #1e2b3d 0%, #16202c 100%);
  flex-shrink: 0;
  box-shadow: 
    4px 0 12px rgba(0, 0, 0, 0.25),
    inset -2px 0 4px rgba(255, 255, 255, 0.05),
    inset 2px 0 4px rgba(0, 0, 0, 0.1);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  position: relative;
  overflow: hidden;
  z-index: 10;
  box-shadow:
    6px 0 24px rgba(0, 0, 0, 0.35),
    8px 0 32px rgba(0, 0, 0, 0.2),
    inset -3px 0 6px rgba(255, 255, 255, 0.08),
    inset 3px 0 6px rgba(0, 0, 0, 0.15);
  border-right: 2px solid rgba(255, 255, 255, 0.12);
  height: calc(100% - 33.33%);
  border-radius: 0 0 8px 8px;
}

.sidebar::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 5px;
  background: linear-gradient(180deg, #409EFF 0%, #66b1ff 100%);
  box-shadow:
    2px 0 8px rgba(64, 158, 255, 0.4),
    3px 0 12px rgba(64, 158, 255, 0.3),
    inset 0 0 4px rgba(255, 255, 255, 0.3);
  z-index: 1;
}

.sidebar::after {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 1px;
  background: linear-gradient(180deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    rgba(255, 255, 255, 0.05) 50%, 
    rgba(255, 255, 255, 0.1) 100%);
  z-index: 1;
}

.sidebar-menu {
  border-right: 2px solid rgba(255, 255, 255, 0.12);
  height: 100%;
  background: transparent !important;
}

.sidebar-menu :deep(.el-menu-item),
.sidebar-menu :deep(.el-sub-menu__title) {
  margin: 6px 12px;
  border-radius: 10px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.05);
  position: relative;
}

.sidebar-menu :deep(.el-menu-item)::before,
.sidebar-menu :deep(.el-sub-menu__title)::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 0;
  background: linear-gradient(180deg, #409EFF 0%, #66b1ff 100%);
  border-radius: 0 4px 4px 0;
  transition: height 0.3s ease;
  box-shadow: 0 0 8px rgba(64, 158, 255, 0.4);
}

.sidebar-menu :deep(.el-menu-item:hover)::before,
.sidebar-menu :deep(.el-sub-menu__title:hover)::before {
  height: 70%;
}

.sidebar-menu :deep(.el-menu-item:hover),
.sidebar-menu :deep(.el-sub-menu__title:hover) {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%) !important;
  transform: translateX(6px);
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  border-color: rgba(64, 158, 255, 0.3);
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background: linear-gradient(135deg, #409EFF 0%, #66b1ff 50%, #409EFF 100%) !important;
  box-shadow: 
    0 6px 16px rgba(64, 158, 255, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
  transform: translateX(6px);
  border-color: rgba(255, 255, 255, 0.3);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.sidebar-menu :deep(.el-menu-item.is-active)::before {
  height: 80%;
}

.sidebar-menu :deep(.el-sub-menu) {
  margin: 6px 0;
}

.sidebar-menu :deep(.el-sub-menu .el-menu) {
  background: rgba(0, 0, 0, 0.15) !important;
  padding: 5px 0;
}

.sidebar-menu :deep(.el-sub-menu .el-menu-item) {
  margin: 3px 12px;
  min-height: 42px;
  line-height: 42px;
  border-radius: 6px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%) !important;
}

.sidebar-menu :deep(.el-sub-menu .el-menu-item:hover) {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%) !important;
}

.sidebar-menu :deep(.el-sub-menu .el-menu-item.is-active) {
  background: linear-gradient(135deg, #409EFF 0%, #66b1ff 50%, #409EFF 100%) !important;
  box-shadow: 
    0 4px 12px rgba(64, 158, 255, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.main-content {
  flex: 1;
  padding: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.tabs-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f5f7fa;
  box-shadow:
    0 12px 28px rgba(0, 0, 0, 0.12),
    0 16px 40px rgba(0, 0, 0, 0.1),
    0 20px 56px rgba(0, 0, 0, 0.08),
    inset 0 3px 0 rgba(255, 255, 255, 0.9),
    inset 0 -3px 6px rgba(0, 0, 0, 0.06);
  border-radius: 12px;
  margin: 16px;
  border: 1px solid rgba(255, 255, 255, 0.6);
}

.tabs-container :deep(.el-tabs) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tabs-container :deep(.el-tabs__header) {
  margin: 0;
  flex-shrink: 0;
  padding: 6px 12px 0 12px;
  border-bottom: none;
}

.tabs-container :deep(.el-tabs__content) {
  flex: 1;
  overflow: auto;
  padding: 12px;
  background: #f5f7fa;
}

.tabs-container :deep(.el-tab-pane) {
  height: 100%;
}

.tabs-container :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.tabs-container :deep(.el-tabs__item) {
  margin-right: 3px;
  margin-bottom: 0;
  border-radius: 4px 4px 0 0;
  background: linear-gradient(180deg, rgba(144, 147, 153, 0.9) 0%, rgba(96, 98, 102, 0.9) 100%) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #fff;
  position: relative;
  padding: 0 10px;
  height: 28px;
  line-height: 28px;
  font-size: 12px;
}

.tabs-container :deep(.el-tabs__item::before) {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 0;
  background: linear-gradient(180deg, #409EFF 0%, #66b1ff 100%);
  border-radius: 0 4px 4px 0;
  transition: height 0.3s ease;
  box-shadow: 0 0 8px rgba(64, 158, 255, 0.4);
}

.tabs-container :deep(.el-tabs__item:hover::before) {
  height: 70%;
}

.tabs-container :deep(.el-tabs__item:hover) {
  background: linear-gradient(180deg, rgba(144, 147, 153, 1) 0%, rgba(96, 98, 102, 1) 100%) !important;
  box-shadow:
    0 2px 5px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  border-color: rgba(64, 158, 255, 0.4);
}

.tabs-container :deep(.el-tabs__item.is-active) {
  background: linear-gradient(135deg, #409EFF 0%, #66b1ff 50%, #409EFF 100%) !important;
  box-shadow:
    0 4px 12px rgba(64, 158, 255, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.tabs-container :deep(.el-tabs__item.is-active::before) {
  height: 80%;
}

.tabs-container :deep(.el-icon-close) {
  transition: all 0.3s ease;
  color: rgba(255, 255, 255, 0.7);
}

.tabs-container :deep(.el-icon-close:hover) {
  color: #fff;
  transform: rotate(90deg);
}

/* 右键菜单样式 */
.context-menu {
  position: fixed;
  z-index: 9999;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 4px 0;
  min-width: 120px;
  list-style: none;
  margin: 0;
}

.context-menu li {
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  color: #606266;
}

.context-menu li:hover {
  background-color: #ecf5ff;
  color: #409EFF;
}

.footer {
  background: #f5f7fa;
  padding: 1rem;
  text-align: center;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .header {
    padding: 0.5rem;
    position: sticky;
    top: 0;
    z-index: 1000;
  }

  .menu-button {
    display: flex;
    margin-right: 10px;
  }

  .header h1 {
    font-size: 1.2rem;
    flex: 1;
    text-shadow: 4px 4px 0 rgba(0, 0, 0, 0.8);
  }

  .user-info {
    margin-left: auto;
  }

  .user-avatar {
    width: 32px;
    height: 32px;
  }

  .user-avatar .el-icon {
    font-size: 16px;
  }

  .user-details {
    display: none;
  }

  .container {
    flex-direction: column;
  }

  .sidebar-overlay {
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 998;
  }

  .sidebar {
    width: 100%;
    position: fixed;
    top: 60px;
    left: -100%;
    width: 250px;
    height: calc(100vh - 60px);
    z-index: 999;
    transition: left 0.3s ease;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.2);
  }

  .sidebar.mobile-open {
    left: 0;
  }

  .main-content {
    padding: 0;
    width: 100%;
  }

  .tabs-container :deep(.el-tabs__content) {
    padding: 8px;
  }

  .tabs-container :deep(.el-tabs__item) {
    padding: 0 8px;
    font-size: 11px;
  }
}

/* 桌面端隐藏菜单按钮 */
@media (min-width: 769px) {
  .menu-button {
    display: none;
  }
}
</style>
