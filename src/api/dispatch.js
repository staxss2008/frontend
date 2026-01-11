import request from '@/utils/request'

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

/**
 * 更新开始里程（出车时填写）
 */
export function updateStartMileage(orderId, startMileage) {
  return request({
    url: '/api/dispatch/update-start-mileage',
    method: 'post',
    params: {
      orderId,
      startMileage
    }
  })
}

/**
 * 更新结束里程（收车时填写）
 */
export function updateEndMileage(orderId, endMileage) {
  return request({
    url: '/api/dispatch/update-end-mileage',
    method: 'post',
    params: {
      orderId,
      endMileage
    }
  })
}

/**
 * 获取调度列表
 */
export function getDispatchList() {
  return request({
    url: '/api/dispatch/list',
    method: 'get'
  })
}