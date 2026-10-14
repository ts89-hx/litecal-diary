import request from './request';

export function getAllUsers() {
  return request.get('/admin/users');
}

export function createUser(data) {
  return request.post('/admin/users', data);
}

export function updateUser(id, data) {
  return request.put(`/admin/users/${id}`, data);
}

export function deleteUser(id) {
  return request.delete(`/admin/users/${id}`);
} 