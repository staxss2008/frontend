import request from '@/utils/request'

/**
 * 获取驾驶员列表
 */
export function getDriverList(page, size, name, status) {
  return request({
    url: '/api/driver/list',
    method: 'get',
    params: {
      page,
      size,
      name,
      status
    }
  })
}

/**
 * 新增驾驶员
 */
export function addDriver(data) {
  return request({
    url: '/api/driver/add',
    method: 'post',
    data
  })
}

/**
 * 更新驾驶员
 */
export function updateDriver(id, data) {
  return request({
    url: `/api/driver/update/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除驾驶员
 */
export function deleteDriver(id) {
  return request({
    url: `/api/driver/delete/${id}`,
    method: 'delete'
  })
}

/**
 * 更新驾驶员状态
 */
export function updateDriverStatus(id, status) {
  return request({
    url: `/api/driver/update-status/${id}`,
    method: 'put',
    params: {
      status
    }
  })
}