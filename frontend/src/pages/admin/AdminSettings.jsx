import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { UserRound, ExternalLink, Trash2, ImagePlus, Pencil, X } from 'lucide-react';
import AdminHeader from '../../components/admin/AdminHeader';
import GradientButton from '../../components/common/GradientButton';
import Loader from '../../components/common/Loader';
import settingsService from '../../api/settingsService';

// Same sliding-pill pattern as AdminFilterTabs/CategoryTabs, own layoutId
// so it doesn't collide with those.
const TABS = [
  { value: 'images', label: 'Зураг' },
  { value: 'admins', label: 'Админууд' },
  { value: 'faq', label: 'FAQ' },
];
const PILL_SPRING = { type: 'spring', stiffness: 300, damping: 25 };

function SettingsTabs({ value, onChange }) {
  return (
    <div className="mb-6 flex w-fit items-center gap-1 rounded-2xl bg-base-800/70 p-1 backdrop-blur-sm">
      {TABS.map((tab) => {
        const isActive = value === tab.value;
        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={`relative whitespace-nowrap rounded-xl px-4 py-1.5 text-sm font-semibold transition-colors duration-300 ease-smooth ${
              isActive ? 'text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="admin-settings-tab-pill"
                transition={PILL_SPRING}
                className="absolute inset-0 rounded-xl bg-brand-gradient shadow-glow"
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// One upload/preview/remove block, used for both the background and hero
// images below. With no image set it's a dashed drop-zone button; with
// one set, a preview with a "Устгах" button that fades in on hover.
function SiteImageSetting({ label, imageUrl, busy, onUpload, onRemove }) {
  const inputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // let picking the same file again still fire onChange
    if (file) onUpload(file);
  };

  return (
    <section className="rounded-2xl border border-base-600 bg-base-800/60 p-4">
      <h2 className="mb-3 text-sm font-bold text-white">{label}</h2>

      <div>
        {imageUrl ? (
          <div className="group relative overflow-hidden rounded-xl border border-base-600">
            <img src={imageUrl} alt="" className="aspect-video w-full object-cover" />
            <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-300 ease-smooth group-hover:bg-black/40" />
            <button
              type="button"
              onClick={onRemove}
              disabled={busy}
              className="absolute right-2.5 top-2.5 flex items-center gap-1.5 rounded-lg bg-black/60 px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 backdrop-blur-sm transition-all duration-300 ease-smooth hover:bg-accent-red/80 group-hover:opacity-100 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
              Устгах
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-base-500 text-gray-500 transition-colors duration-300 ease-smooth hover:border-brand-to hover:text-gray-300 disabled:opacity-50"
          >
            <ImagePlus className="h-6 w-6" strokeWidth={1.5} />
            <span className="text-xs font-medium">{busy ? 'Оруулж байна...' : 'Зураг оруулах'}</span>
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </section>
  );
}

// Admin Panel → Settings: manage the admin name + profile-link rows that
// power the storefront hero's scrolling admin-names marquee, plus the two
// site-wide images (page background + Hero banner). Either image left
// unset falls back to the storefront's own built-in ambient glow /
// glassmorphism styling — see SiteSettingsContext + index.css's
// `.has-bg-image` rule and Storefront.jsx's hero section.
export default function AdminSettings() {
  const [tab, setTab] = useState('images');
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [profileUrl, setProfileUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const [siteImages, setSiteImages] = useState({ background_image_url: null, hero_image_url: null });
  const [uploadingBg, setUploadingBg] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);

  const [faqs, setFaqs] = useState([]);
  const [faqLoading, setFaqLoading] = useState(true);
  const [faqError, setFaqError] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [editingFaqId, setEditingFaqId] = useState(null); // null = adding new
  const [faqSubmitting, setFaqSubmitting] = useState(false);
  const [busyFaqId, setBusyFaqId] = useState(null);

  const load = () => {
    setLoading(true);
    settingsService
      .listAdminProfiles()
      .then(setProfiles)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);
  useEffect(() => {
    settingsService.getSiteSettings().then(setSiteImages).catch(() => {});
  }, []);

  const loadFaqs = () => {
    setFaqLoading(true);
    settingsService
      .listFaqs()
      .then(setFaqs)
      .catch((e) => setFaqError(e.message))
      .finally(() => setFaqLoading(false));
  };

  useEffect(loadFaqs, []);

  const resetFaqForm = () => {
    setEditingFaqId(null);
    setQuestion('');
    setAnswer('');
  };

  const handleEditFaq = (faq) => {
    setEditingFaqId(faq.id);
    setQuestion(faq.question);
    setAnswer(faq.answer);
  };

  const handleFaqSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;

    setFaqSubmitting(true);
    try {
      if (editingFaqId) {
        await settingsService.updateFaq(editingFaqId, { question: question.trim(), answer: answer.trim() });
      } else {
        await settingsService.createFaq({ question: question.trim(), answer: answer.trim() });
      }
      resetFaqForm();
      loadFaqs();
    } catch (err) {
      alert(err.message);
    } finally {
      setFaqSubmitting(false);
    }
  };

  const handleDeleteFaq = async (faq) => {
    if (!confirm('Энэ асуултыг устгах уу?')) return;
    setBusyFaqId(faq.id);
    try {
      await settingsService.removeFaq(faq.id);
      if (editingFaqId === faq.id) resetFaqForm();
      loadFaqs();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusyFaqId(null);
    }
  };

  const handleUploadBackground = async (file) => {
    setUploadingBg(true);
    try {
      setSiteImages(await settingsService.uploadBackgroundImage(file));
    } catch (err) {
      alert(err.message);
    } finally {
      setUploadingBg(false);
    }
  };

  const handleRemoveBackground = async () => {
    if (!confirm('Background зургийг устгах уу?')) return;
    setUploadingBg(true);
    try {
      setSiteImages(await settingsService.removeBackgroundImage());
    } catch (err) {
      alert(err.message);
    } finally {
      setUploadingBg(false);
    }
  };

  const handleUploadHero = async (file) => {
    setUploadingHero(true);
    try {
      setSiteImages(await settingsService.uploadHeroImage(file));
    } catch (err) {
      alert(err.message);
    } finally {
      setUploadingHero(false);
    }
  };

  const handleRemoveHero = async () => {
    if (!confirm('Hero баннерын зургийг устгах уу?')) return;
    setUploadingHero(true);
    try {
      setSiteImages(await settingsService.removeHeroImage());
    } catch (err) {
      alert(err.message);
    } finally {
      setUploadingHero(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !profileUrl.trim()) return;

    setSubmitting(true);
    try {
      await settingsService.createAdminProfile({ name: name.trim(), profileUrl: profileUrl.trim() });
      setName('');
      setProfileUrl('');
      load();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (profile) => {
    if (!confirm(`"${profile.name}"-г устгах уу?`)) return;
    setBusyId(profile.id);
    try {
      await settingsService.removeAdminProfile(profile.id);
      load();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-base-500 bg-base-800 px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-brand-to';
  const labelClass = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-400';

  return (
    <div className="min-h-screen bg-base-950">
      <AdminHeader />
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <h1 className="mb-4 text-xl font-extrabold text-white">Тохиргоо</h1>

        <SettingsTabs value={tab} onChange={setTab} />

        {tab === 'images' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SiteImageSetting
              label="Background зураг"
              imageUrl={siteImages.background_image_url}
              busy={uploadingBg}
              onUpload={handleUploadBackground}
              onRemove={handleRemoveBackground}
            />
            <SiteImageSetting
              label="Hero баннерын зураг"
              imageUrl={siteImages.hero_image_url}
              busy={uploadingHero}
              onUpload={handleUploadHero}
              onRemove={handleRemoveHero}
            />
          </div>
        )}

        {tab === 'admins' && (
          <>
            <form
              onSubmit={handleSubmit}
              className="mb-6 grid grid-cols-1 gap-4 rounded-2xl border border-base-600 bg-base-800/60 p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
            >
              <div>
                <label className={labelClass}>Админы нэр</label>
                <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Жишээ: Bataa" />
              </div>
              <div>
                <label className={labelClass}>Профайл линк (Facebook / Messenger)</label>
                <input
                  required
                  type="url"
                  value={profileUrl}
                  onChange={(e) => setProfileUrl(e.target.value)}
                  className={inputClass}
                  placeholder="https://facebook.com/... эсвэл https://m.me/..."
                />
              </div>
              <GradientButton type="submit" disabled={submitting}>
                {submitting ? 'Нэмж байна...' : '+ Нэмэх'}
              </GradientButton>
            </form>

            {loading && <Loader />}
            {error && <p className="text-sm text-accent-red">{error}</p>}

            {!loading && !error && (
              <div className="space-y-2">
                {!profiles.length && (
                  <p className="rounded-xl border border-dashed border-base-600 px-4 py-6 text-center text-sm text-gray-500">
                    Одоогоор бүртгэлтэй админ алга. Дээрх маягтаар нэмнэ үү.
                  </p>
                )}
                {profiles.map((profile) => (
                  <div
                    key={profile.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-base-600 bg-base-800/60 px-4 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="flex text-brand-to">
                        <UserRound className="h-4 w-4" strokeWidth={2} />
                      </span>
                      <span className="truncate text-sm font-semibold text-white">{profile.name}</span>
                      <a
                        href={profile.profile_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex shrink-0 items-center gap-1 truncate text-xs text-gray-400 hover:text-brand-to"
                      >
                        <ExternalLink className="h-3 w-3" strokeWidth={2} />
                        <span className="max-w-[12rem] truncate">{profile.profile_url}</span>
                      </a>
                    </div>
                    <button
                      onClick={() => handleDelete(profile)}
                      disabled={busyId === profile.id}
                      className="flex shrink-0 items-center justify-center rounded-lg border border-base-500 p-2 text-accent-red transition-all duration-300 ease-smooth hover:border-accent-red disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={2} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'faq' && (
          <>
            <form
              onSubmit={handleFaqSubmit}
              className="mb-6 space-y-4 rounded-2xl border border-base-600 bg-base-800/60 p-4"
            >
              <div>
                <label className={labelClass}>Асуулт</label>
                <input
                  required
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className={inputClass}
                  placeholder="Жишээ: Төлбөрөө хэрхэн хийх вэ?"
                />
              </div>
              <div>
                <label className={labelClass}>Хариулт</label>
                <textarea
                  required
                  rows={3}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className={inputClass}
                  placeholder="Хариултаа энд бичнэ үү..."
                />
              </div>
              <div className="flex gap-2">
                <GradientButton type="submit" disabled={faqSubmitting}>
                  {faqSubmitting ? 'Хадгалж байна...' : editingFaqId ? 'Хадгалах' : '+ Нэмэх'}
                </GradientButton>
                {editingFaqId && (
                  <GradientButton type="button" variant="outline" onClick={resetFaqForm}>
                    Цуцлах
                  </GradientButton>
                )}
              </div>
            </form>

            {faqLoading && <Loader />}
            {faqError && <p className="text-sm text-accent-red">{faqError}</p>}

            {!faqLoading && !faqError && (
              <div className="space-y-2">
                {!faqs.length && (
                  <p className="rounded-xl border border-dashed border-base-600 px-4 py-6 text-center text-sm text-gray-500">
                    Одоогоор нэмсэн асуулт алга. Нэмэхээс өмнө вебсайт өөрийн built-in fallback асуултуудыг харуулна.
                  </p>
                )}
                {faqs.map((faq) => (
                  <div key={faq.id} className="rounded-xl border border-base-600 bg-base-800/60 px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-white">{faq.question}</p>
                      <div className="flex shrink-0 gap-1.5">
                        <button
                          onClick={() => handleEditFaq(faq)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-base-500 text-gray-300 transition-all duration-300 ease-smooth hover:border-brand-to hover:text-white"
                        >
                          <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
                        </button>
                        <button
                          onClick={() => handleDeleteFaq(faq)}
                          disabled={busyFaqId === faq.id}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-base-500 text-accent-red transition-all duration-300 ease-smooth hover:border-accent-red disabled:opacity-50"
                        >
                          <X className="h-3.5 w-3.5" strokeWidth={2.2} />
                        </button>
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-gray-400">{faq.answer}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
