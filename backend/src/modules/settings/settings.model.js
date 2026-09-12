// All raw SQL for the site-content tables owned by Admin Panel → Settings
// (admin_profiles, site_settings, faqs).
const { query } = require('../../config/db');

// ---- admin_profiles --------------------------------------------------
async function listAdminProfiles() {
  const { rows } = await query(
    'SELECT id, name, profile_url, sort_order, created_at FROM admin_profiles ORDER BY sort_order ASC, id ASC'
  );
  return rows;
}

async function createAdminProfile({ name, profileUrl }) {
  const { rows: maxRows } = await query('SELECT COALESCE(MAX(sort_order), -1) AS max_sort FROM admin_profiles');
  const sortOrder = maxRows[0].max_sort + 1;

  const { rows } = await query(
    `INSERT INTO admin_profiles (name, profile_url, sort_order)
     VALUES ($1, $2, $3)
     RETURNING id, name, profile_url, sort_order, created_at`,
    [name, profileUrl, sortOrder]
  );
  return rows[0];
}

async function removeAdminProfile(id) {
  const { rowCount } = await query('DELETE FROM admin_profiles WHERE id = $1', [id]);
  return rowCount > 0;
}

// ---- faqs --------------------------------------------------------------
async function listFaqs() {
  const { rows } = await query(
    'SELECT id, question, answer, sort_order FROM faqs ORDER BY sort_order ASC, id ASC'
  );
  return rows;
}

async function createFaq({ question, answer }) {
  const { rows: maxRows } = await query('SELECT COALESCE(MAX(sort_order), -1) AS max_sort FROM faqs');
  const sortOrder = maxRows[0].max_sort + 1;

  const { rows } = await query(
    `INSERT INTO faqs (question, answer, sort_order)
     VALUES ($1, $2, $3)
     RETURNING id, question, answer, sort_order`,
    [question, answer, sortOrder]
  );
  return rows[0];
}

async function updateFaq(id, { question, answer }) {
  const { rows } = await query(
    `UPDATE faqs SET question = $1, answer = $2 WHERE id = $3
     RETURNING id, question, answer, sort_order`,
    [question, answer, id]
  );
  return rows[0] || null;
}

async function removeFaq(id) {
  const { rowCount } = await query('DELETE FROM faqs WHERE id = $1', [id]);
  return rowCount > 0;
}

// ---- site_settings (singleton row, id = 1) --------------------------
// Public-facing shape only ever exposes the two URLs — public_ids are an
// internal Cloudinary bookkeeping detail (needed to delete the old asset
// when it's replaced/removed) and never leave the model layer.
const SITE_SETTINGS_PUBLIC_COLUMNS = 'background_image_url, hero_image_url';

async function getSiteSettings() {
  const { rows } = await query(`SELECT ${SITE_SETTINGS_PUBLIC_COLUMNS} FROM site_settings WHERE id = 1`);
  return rows[0] || { background_image_url: null, hero_image_url: null };
}

async function getSiteImagePublicIds() {
  const { rows } = await query(
    'SELECT background_image_public_id, hero_image_public_id FROM site_settings WHERE id = 1'
  );
  return rows[0] || { background_image_public_id: null, hero_image_public_id: null };
}

async function setBackgroundImage({ url, publicId }) {
  const { rows } = await query(
    `UPDATE site_settings SET background_image_url = $1, background_image_public_id = $2 WHERE id = 1
     RETURNING ${SITE_SETTINGS_PUBLIC_COLUMNS}`,
    [url, publicId]
  );
  return rows[0];
}

async function clearBackgroundImage() {
  const { rows } = await query(
    `UPDATE site_settings SET background_image_url = NULL, background_image_public_id = NULL WHERE id = 1
     RETURNING ${SITE_SETTINGS_PUBLIC_COLUMNS}`
  );
  return rows[0];
}

async function setHeroImage({ url, publicId }) {
  const { rows } = await query(
    `UPDATE site_settings SET hero_image_url = $1, hero_image_public_id = $2 WHERE id = 1
     RETURNING ${SITE_SETTINGS_PUBLIC_COLUMNS}`,
    [url, publicId]
  );
  return rows[0];
}

async function clearHeroImage() {
  const { rows } = await query(
    `UPDATE site_settings SET hero_image_url = NULL, hero_image_public_id = NULL WHERE id = 1
     RETURNING ${SITE_SETTINGS_PUBLIC_COLUMNS}`
  );
  return rows[0];
}

module.exports = {
  listAdminProfiles,
  createAdminProfile,
  removeAdminProfile,
  listFaqs,
  createFaq,
  updateFaq,
  removeFaq,
  getSiteSettings,
  getSiteImagePublicIds,
  setBackgroundImage,
  clearBackgroundImage,
  setHeroImage,
  clearHeroImage,
};
