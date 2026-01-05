import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/components/layout/Layout.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/Index.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/profile/Index.vue'),
    meta: { title: '个人信息' }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Index.vue'),
        meta: { title: '工作台', icon: 'Monitor' }
      }
    ]
  },
  {
    path: '/dispatch',
    component: Layout,
    redirect: '/dispatch/monitor',
    meta: { title: '调度中心', icon: 'Position' },
    children: [
      {
        path: 'monitor',
        name: 'DispatchMonitor',
        component: () => import('@/views/dispatch/Monitor.vue'),
        meta: { title: '实时监控', icon: 'Odometer' }
      },
      {
        path: 'list',
        name: 'DispatchList',
        component: () => import('@/views/dispatch/List.vue'),
        meta: { title: '调度单管理', icon: 'List' }
      }
    ]
  },
  {
    path: '/vehicle',
    component: Layout,
    redirect: '/vehicle/list',
    meta: { title: '车辆管理', icon: 'Van' },
    children: [
      {
        path: 'list',
        name: 'VehicleList',
        component: () => import('@/views/vehicle/List.vue'),
        meta: { title: '车辆档案', icon: 'List' }
      },
      {
        path: 'maintenance',
        name: 'VehicleMaintenance',
        component: () => import('@/views/vehicle/Maintenance.vue'),
        meta: { title: '维修保养', icon: 'Tools' }
      },
      {
        path: 'inspection',
        name: 'VehicleInspection',
        component: () => import('@/views/vehicle/Inspection.vue'),
        meta: { title: '年检保险', icon: 'Memo' }
      }
    ]
  },
  {
    path: '/driver',
    component: Layout,
    redirect: '/driver/list',
    meta: { title: '驾驶员管理', icon: 'User' },
    children: [
      {
        path: 'list',
        name: 'DriverList',
        component: () => import('@/views/driver/List.vue'),
        meta: { title: '驾驶员档案', icon: 'List' }
      },
      {
        path: 'evaluation',
        name: 'DriverEvaluation',
        component: () => import('@/views/driver/Evaluation.vue'),
        meta: { title: '绩效考核', icon: 'ScaleToOriginal' }
      }
    ]
  },
  {
    path: '/application',
    component: Layout,
    redirect: '/application/list',
    meta: { title: '用车申请', icon: 'Document' },
    children: [
      {
        path: 'create',
        name: 'ApplicationCreate',
        component: () => import('@/views/application/Create.vue'),
        meta: { title: '申请用车', icon: 'Edit' }
      },
      {
        path: 'list',
        name: 'ApplicationList',
        component: () => import('@/views/application/List.vue'),
        meta: { title: '申请记录', icon: 'List' }
      }
    ]
  },
  {
    path: '/statistics',
    component: Layout,
    redirect: '/statistics/usage',
    meta: { title: '统计分析', icon: 'TrendCharts' },
    children: [
      {
        path: 'usage',
        name: 'StatisticsUsage',
        component: () => import('@/views/statistics/Usage.vue'),
        meta: { title: '使用统计', icon: 'DataLine' }
      },
      {
        path: 'maintenance',
        name: 'StatisticsMaintenance',
        component: () => import('@/views/statistics/Maintenance.vue'),
        meta: { title: '维修统计', icon: 'DataAnalysis' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  if (to.path === '/login') {
    // 如果已经登录，跳转到首页
    if (token) {
      next('/')
    } else {
      next()
    }
  } else {
    // 如果不是登录页，检查是否登录
    if (!token) {
      next('/login')
    } else {
      next()
    }
  }
})

export default router