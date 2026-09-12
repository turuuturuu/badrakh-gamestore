// Admin Panel → Settings: the registered admin name + profile-link rows
// that feed the hero's admin-names marquee.
import axiosClient from './axiosClient';

const settingsService = {
  // Public — no auth required. Used by both the storefront marquee and
  // the admin Settings screen's own listing.
  listAdminProfiles() {
    return axiosClient.get('/settings/admin-profiles');
  },

  // Public — the page-wide background + Hero banner images, with the
  // dark-overlay/glow fallback baked into how the frontend consumes a
  // null value rather than in this call itself.
  getSiteSettings() {
    return axiosClient.get('/settings/site');
  },

  // Public — Түгээмэл асуултууд accordion above the footer. Empty list ->
  // the component falls back to its own built-in default questions.
  listFaqs() {
    return axiosClient.get('/settings/faqs');
  },

  // ---- admin-only below (require token, sent automatically) ----------

  createAdminProfile({ name, profileUrl }) {
    return axiosClient.post('/admin/settings/admin-profiles', { name, profile_url: profileUrl });
  },

  removeAdminProfile(id) {
    return axiosClient.delete(`/admin/settings/admin-profiles/${id}`);
  },

  /** @param {File} file */
  uploadBackgroundImage(file) {
    const fd = new FormData();
    fd.append('image', file);
    return axiosClient.post('/admin/settings/site/background-image', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  removeBackgroundImage() {
    return axiosClient.delete('/admin/settings/site/background-image');
  },

  /** @param {File} file */
  uploadHeroImage(file) {
    const fd = new FormData();
    fd.append('image', file);
    return axiosClient.post('/admin/settings/site/hero-image', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  removeHeroImage() {
    return axiosClient.delete('/admin/settings/site/hero-image');
  },

  createFaq({ question, answer }) {
    return axiosClient.post('/admin/settings/faqs', { question, answer });
  },

  updateFaq(id, { question, answer }) {
    return axiosClient.put(`/admin/settings/faqs/${id}`, { question, answer });
  },

  removeFaq(id) {
    return axiosClient.delete(`/admin/settings/faqs/${id}`);
  },
};

export default settingsService;
