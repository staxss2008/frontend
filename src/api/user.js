
import request from '@/utils/request'

/**
 * 获取用户列表
 */
export function getUserList(page, size, username, realName, status) {
  return request({
    url: '/api/user/list',
    method: 'get',
    params: {
      page,
      size,
      username,
      realName,
      status
    }
  })
}

/**
 * 新增用户
 */
export function addUser(data) {
  return request({
    url: '/api/user/add',
    method: 'post',
    data
  })
}

/**
 * 更新用户
 */
export function updateUser(id, data) {
  return request({
    url: `/api/user/update/${id}`,
    method: 'put',
    data
  })
}

/**
 * 更新用户状态
 */
export function updateUserStatus(id, status) {
  return request({
    url: `/api/user/update-status/${id}`,
    method: 'put',
    params: {
      status
    }
  })
}

/**
 * 删除用户
 */
export function deleteUser(id) {
  return request({
    url: `/api/user/delete/${id}`,
    method: 'delete'
  })
}

/**
 * 分配角色
 */
export function assignRoles(userId, roleIds) {
  return request({
    url: '/api/user/assign-roles',
    method: 'post',
    data: {
      userId,
      roleIds
    }
  })
}

/**
 * 获取用户角色
 */
export function getUserRoles(userId) {
  return request({
    url: `/api/user/roles/${userId}`,
    method: 'get'
  })
}

/**
 * 修改密码
 */
export function changePassword(oldPassword, newPassword) {
  return request({
    url: '/api/user/change-password',
    method: 'post',
    data: {
      oldPassword,
      newPassword
    }
  })
}

/**
 * 获取当前登录用户信息
 */
export function getCurrentUserInfo() {
  return request({
    url: '/api/auth/current',
    method: 'get'
  })
}

/**
 * 更新当前用户信息
 */
export function updateCurrentUserInfo(data) {
  return request({
    url: '/api/auth/update-current',
    method: 'put',
    data
  })
}
