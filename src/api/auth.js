
import request from '@/utils/request'

/**
 * 用户登录
 */
export function login(data) {
  return request({
    url: '/api/auth/login',
    method: 'post',
    data
  })
}

/**
 * 用户登出
 */
export function logout() {
  return request({
    url: '/api/auth/logout',
    method: 'post'
  })
}

/**
 * 获取当前用户信息
 */
export function getCurrentUser() {
  return request({
    url: '/api/auth/current',
    method: 'get'
  })
}

/**
 * 获取用户权限
 */
export function getUserPermissions() {
  return request({
    url: '/api/permission/user',
    method: 'get'
  })
}

/**
 * 获取所有权限树
 */
export function getAllPermissionsTree() {
  return request({
    url: '/api/permission/tree',
    method: 'get'
  })
}
