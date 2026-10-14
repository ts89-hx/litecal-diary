import request from './request';

export function login(username, password) {
  return request.post('/admin/login', { username, password });
} 