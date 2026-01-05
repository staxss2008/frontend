<template>
  <div class="sidebar-container" :class="{ 'collapse': isCollapse }">
    <!-- Logo区域 -->
    <div class="logo-container">
      <img src="@/assets/logo.png" alt="logo">
      <span v-if="!isCollapse">派车管理系统</span>
    </div>
    
    <!-- 菜单区域 -->
    <el-scrollbar class="menu-scrollbar">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :unique-opened="true"
        :collapse-transition="false"
        class="el-menu-vertical"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <!-- 动态渲染菜单 -->
        <sidebar-item
          v-for="route in routes"
          :key="route.path"
          :item="route"
          :base-path="route.path"
        />
      </el-menu>
    </el-scrollbar>
    
    <!-- 折叠按钮 -->
    <div class="collapse-btn" @click="toggleCollapse">
      <i :class="isCollapse ? 'el-icon-d-arrow-right' : 'el-icon-d-arrow-left'"></i>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import SidebarItem from './SidebarItem.vue'

const isCollapse = ref(false)
const route = useRoute()

// 从路由配置中获取菜单
const routes = [
  {
    path: '/dashboard',
    meta: { title: '工作台', icon: 'Monitor' }
  },
  {
    path: '/dispatch',
    meta: { title: '调度中心', icon: 'Position' },
    children: [
      { path: '/dispatch/monitor', meta: { title: '实时监控' } },
      { path: '/dispatch/list', meta: { title: '调度单管理' } }
    ]
  },
  {
    path: '/vehicle',
    meta: { title: '车辆管理', icon: 'Van' },
    children: [
      { path: '/vehicle/list', meta: { title: '车辆档案' } },
      { path: '/vehicle/maintenance', meta: { title: '维修保养' } },
      { path: '/vehicle/inspection', meta: { title: '年检保险' } }
    ]
  },
  {
    path: '/driver',
    meta: { title: '驾驶员管理', icon: 'User' },
    children: [
      { path: '/driver/list', meta: { title: '驾驶员档案' } },
      { path: '/driver/evaluation', meta: { title: '绩效考核' } }
    ]
  },
  {
    path: '/application',
    meta: { title: '用车申请', icon: 'Document' },
    children: [
      { path: '/application/create', meta: { title: '申请用车' } },
      { path: '/application/list', meta: { title: '申请记录' } }
    ]
  },
  {
    path: '/statistics',
    meta: { title: '统计分析', icon: 'TrendCharts' },
    children: [
      { path: '/statistics/usage', meta: { title: '使用统计' } },
      { path: '/statistics/maintenance', meta: { title: '维修统计' } }
    ]
  }
]

const activeMenu = computed(() => {
  const { meta, path } = route
  return meta.activeMenu || path
})

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}
</script>

<style scoped>
.sidebar-container {
  width: 210px;
  height: 100%;
  background-color: #304156;
  transition: width 0.3s;
  position: relative;
  overflow: hidden;
}

.sidebar-container.collapse {
  width: 64px;
}

.logo-container {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  color: #fff;
  font-size: 16px;
  font-weight: bold;
}

.logo-container img {
  width: 32px;
  height: 32px;
  margin-right: 8px;
}

.menu-scrollbar {
  height: calc(100% - 90px);
}

.el-menu-vertical {
  border-right: none;
}

.collapse-btn {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #bfcbd9;
  cursor: pointer;
  background-color: #263445;
  border-top: 1px solid #2b3643;
}

.collapse-btn:hover {
  background-color: #1f2d3d;
}
</style>