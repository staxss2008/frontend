import request from '@/utils/request'

/**
 * 获取车辆统计信息
 */
export function getVehicleStats() {
  return request({
    url: '/api/vehicle/stats',
    method: 'get'
  })
}

/**
 * 获取车辆列表
 */
export function getVehicleList() {
  return request({
    url: '/api/vehicle/list',
    method: 'get',
    params: {
      page: 1,
      size: 100  // 获取全部车辆
    }
  })
}

/**
 * 获取实时位置
 */
export function getRealTimeLocation() {
  return request({
    url: '/api/dispatch/real-time-location',
    method: 'get'
  })
}

/**
 * 创建调度单
 */
export function createDispatchOrder(data) {
  return request({
    url: '/api/dispatch/create-order',
    method: 'post',
    data
  })
}

/**
 * 智能调度推荐
 */
export function smartDispatch(data) {
  return request({
    url: '/api/dispatch/smart-dispatch',
    method: 'post',
    data
  })
}

/**
 * 获取监控数据
 */
export function getMonitorData() {
  return request({
    url: '/api/dispatch/monitor-data',
    method: 'get'
  })
}