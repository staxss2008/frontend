import request from '@/utils/request'

/**
 * 获取车辆列表
 */
export function getVehicleList(page, size, plateNo, status) {
  return request({
    url: '/api/vehicle/list',
    method: 'get',
    params: {
      page,
      size,
      plateNo,
      status
    }
  })
}

/**
 * 新增车辆
 */
export function addVehicle(data) {
  return request({
    url: '/api/vehicle/add',
    method: 'post',
    data
  })
}

/**
 * 更新车辆
 */
export function updateVehicle(id, data) {
  return request({
    url: `/api/vehicle/update/${id}`,
    method: 'put',
    data
  })
}

/**
 * 更新车辆状态
 */
export function updateVehicleStatus(id, status) {
  return request({
    url: `/api/vehicle/update-status/${id}`,
    method: 'put',
    params: {
      status
    }
  })
}

/**
 * 删除车辆
 */
export function deleteVehicle(id) {
  return request({
    url: `/api/vehicle/delete/${id}`,
    method: 'delete'
  })
}

/**
 * 获取车辆统计信息
 */
export function getVehicleStats() {
  return request({
    url: '/api/vehicle/stats',
    method: 'get'
  })
}