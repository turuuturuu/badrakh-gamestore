// All product-related HTTP calls, public + admin, in one place.
// Components never import axios directly — they import this service.
import axiosClient from './axiosClient';

const productService = {
  /**
   * @param {{game?: string, category?: string, sellerType?: string, status?: string, cs2ItemType?: string, excludeCs2?: boolean}} filters
   */
  list(filters = {}) {
    const params = {};
    if (filters.game) params.game = filters.game;
    if (filters.category) params.category = filters.category;
    if (filters.sellerType) params.seller_type = filters.sellerType;
    if (filters.status) params.status = filters.status;
    if (filters.cs2ItemType) params.cs2_item_type = filters.cs2ItemType;
    if (filters.excludeCs2) params.exclude_cs2 = 'true';
    return axiosClient.get('/products', { params });
  },

  getById(id) {
    return axiosClient.get(`/products/${id}`);
  },

  // ---- admin-only below (require token, sent automatically) ----------

  /** Same filters as list(), but hits /admin/products so hidden/sold items are included too. */
  adminList(filters = {}) {
    const params = {};
    if (filters.game) params.game = filters.game;
    if (filters.category) params.category = filters.category;
    if (filters.sellerType) params.seller_type = filters.sellerType;
    if (filters.status) params.status = filters.status;
    if (filters.cs2ItemType) params.cs2_item_type = filters.cs2ItemType;
    return axiosClient.get('/admin/products', { params });
  },

  /** @param {FormData} formData */
  create(formData) {
    return axiosClient.post('/admin/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /** @param {FormData} formData */
  update(id, formData) {
    return axiosClient.put(`/admin/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  updateStatus(id, status) {
    return axiosClient.patch(`/admin/products/${id}/status`, { status });
  },

  deleteImage(productId, imageId) {
    return axiosClient.delete(`/admin/products/${productId}/images/${imageId}`);
  },

  remove(id) {
    return axiosClient.delete(`/admin/products/${id}`);
  },
};

export default productService;
