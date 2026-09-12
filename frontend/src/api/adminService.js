import axiosClient from './axiosClient';

const adminService = {
  login(username, password) {
    return axiosClient.post('/admin/login', { username, password });
  },
  me() {
    return axiosClient.get('/admin/me');
  },
  getStats() {
    return axiosClient.get('/admin/stats');
  },
};

export default adminService;
