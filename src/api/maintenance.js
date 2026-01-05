
import request from '@/utils/request'

/**
 * 获取维修保养记录列表
 */
export function getMaintenanceList(page, size, vehicleId, type) {
  return request({
    url: '/api/maintenance/list',
    method: 'get',
    params: {
      page,
      size,
      vehicleId,
      type
    }
  })
}

/**
 * 创建维修保养记录
 */
export function createMaintenance(data) {
  return request({
    url: '/api/maintenance/create',
    method: 'post',
    data
  })
}

/**
 * 获取记录详情
 */
export function getMaintenanceDetail(id) {
  return request({
    url: `/api/maintenance/detail/${id}`,
    method: 'get'
  })
}

/**
 * 更新维修保养记录
 */
export function updateMaintenance(id, data) {
  return request({
    url: `/api/maintenance/update/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除维修保养记录
 */
export function deleteMaintenance(id) {
  return request({
    url: `/api/maintenance/delete/${id}`,
    method: 'delete'
  })
}
