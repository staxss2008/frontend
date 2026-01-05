
import request from '@/utils/request'

/**
 * 获取角色列表
 */
export function getRoleList(page, size, roleName, roleCode, status) {
  return request({
    url: '/api/role/list',
    method: 'get',
    params: {
      page,
      size,
      roleName,
      roleCode,
      status
    }
  })
}

/**
 * 获取所有角色（不分页）
 */
export function getAllRoles() {
  return request({
    url: '/api/role/all',
    method: 'get'
  })
}

/**
 * 新增角色
 */
export function addRole(data) {
  return request({
    url: '/api/role/add',
    method: 'post',
    data
  })
}

/**
 * 更新角色
 */
export function updateRole(id, data) {
  return request({
    url: `/api/role/update/${id}`,
    method: 'put',
    data
  })
}

/**
 * 更新角色状态
 */
export function updateRoleStatus(id, status) {
  return request({
    url: `/api/role/update-status/${id}`,
    method: 'put',
    params: {
      status
    }
  })
}

/**
 * 删除角色
 */
export function deleteRole(id) {
  return request({
    url: `/api/role/delete/${id}`,
    method: 'delete'
  })
}
