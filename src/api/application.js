
import request from '@/utils/request'

/**
 * 获取用车申请列表
 */
export function getApplicationList(page, size, status) {
  return request({
    url: '/api/application/list',
    method: 'get',
    params: {
      page,
      size,
      status,
      sortField: 'createTime',
      sortOrder: 'desc'
    }
  })
}

/**
 * 创建用车申请
 */
export function createApplication(data) {
  return request({
    url: '/api/application/create',
    method: 'post',
    data
  })
}

/**
 * 审批用车申请
 */
export function approveApplication(id, data) {
  return request({
    url: `/api/application/approve/${id}`,
    method: 'put',
    data
  })
}

/**
 * 拒绝用车申请
 */
export function rejectApplication(id, data) {
  return request({
    url: `/api/application/reject/${id}`,
    method: 'put',
    data
  })
}

/**
 * 获取申请详情
 */
export function getApplicationDetail(id) {
  return request({
    url: `/api/application/detail/${id}`,
    method: 'get'
  })
}

/**
 * 指派车辆
 */
export function assignVehicle(id, data) {
  return request({
    url: `/api/application/assign-vehicle/${id}`,
    method: 'post',
    data
  })
}

/**
 * 获取可用的驾驶员列表
 */
export function getAvailableDrivers() {
  return request({
    url: '/api/application/available-drivers',
    method: 'get'
  })
}

/**
 * 获取可用的车辆列表
 */
export function getAvailableVehicles() {
  return request({
    url: '/api/application/available-vehicles',
    method: 'get'
  })
}

/**
 * 完成申请
 */
export function completeApplication(id) {
  return request({
    url: `/api/application/complete/${id}`,
    method: 'put'
  })
}
