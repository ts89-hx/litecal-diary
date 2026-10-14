import request from './request';

export function getAllDietRecords() {
  return request.get('/admin/diet-records');
}

export function createDietRecord(data) {
  return request.post('/admin/diet-records', data);
}

export function updateDietRecord(id, data) {
  return request.put(`/admin/diet-records/${id}`, data);
}

export function deleteDietRecord(id) {
  return request.delete(`/admin/diet-records/${id}`);
} 