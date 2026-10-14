import request from './request';

export function getAllSportRecords() {
  return request.get('/admin/sport-records');
}

export function createSportRecord(data) {
  return request.post('/admin/sport-records', data);
}

export function updateSportRecord(id, data) {
  return request.put(`/admin/sport-records/${id}`, data);
}

export function deleteSportRecord(id) {
  return request.delete(`/admin/sport-records/${id}`);
} 