import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, MessageCircleQuestion } from 'lucide-react';
import settingsService from '../../api/settingsService';
import { EASE_SMOOTH } from '../../utils/motion';

// Shown whenever the admin hasn't added any FAQ yet (see Admin Panel →
// Settings → FAQ) — a real storefront reads better with a few sensible
// trust-building questions than with this section missing entirely.
const DEFAULT_FAQS = [
  {
    id: 'default-1',
    question: 'Төлбөрөө хэрхэн хийх вэ?',
    answer:
      'Барааныхаа дэлгэрэнгүй дээрх товч дээр дарахад манай Messenger рүү шууд холбогдоно — тэндээс админтай харилцан ярьж, тохиромжтой аргаараа төлбөрөө хийнэ.',
  },
  {
    id: 'default-2',
    question: 'Аккаунтаа хэр хугацаанд хүлээж авах вэ?',
    answer: 'Төлбөр баталгаажсаны дараа ихэвчлэн 5–30 минутын дотор аккаунтын мэдээллийг Messenger-ээр хүлээлгэн өгнө.',
  },
  {
    id: 'default-3',
    question: 'Худалдан авалт баталгаат уу?',
    answer: 'Тийм ээ. Манай бүх бараа баталгаат бөгөөд асуудал гарвал шууд бидэнтэй холбогдож шийдвэрлүүлэх боломжтой.',
  },
  {
    id: 'default-4',
    question: 'Түрээслэсэн аккаунтаа хэрхэн буцаах вэ?',
    answer: 'Түрээсийн хугацаа дуусахад нэвтрэх мэдээллийг ашиглахаа зогсоож, бидэнд мэдэгдэхэд хангалттай — нэмэлт үйлдэл шаардлагагүй.',
  },
];

function FaqItem({ item, isOpen, onToggle }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-base-600 bg-base-800/60 backdrop-blur-md">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors duration-300 ease-smooth hover:bg-base-700/40 sm:px-6"
      >
        <span className="text-base font-semibold text-ink">{item.question}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: EASE_SMOOTH }}
          className="flex shrink-0 text-brand-to"
        >
          <ChevronDown className="h-5 w-5" strokeWidth={2.2} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE_SMOOTH }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-4 text-sm leading-relaxed text-gray-400 sm:px-6">{item.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// "Түгээмэл асуултууд" accordion, placed just above <Footer/> (see
// App.jsx). Reads the admin-managed list from the backend; falls back to
// DEFAULT_FAQS above when the admin hasn't added any yet.
export default function FaqSection() {
  const [faqs, setFaqs] = useState(null); // null = still loading
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    settingsService
      .listFaqs()
      .then(setFaqs)
      .catch(() => setFaqs([]));
  }, []);

  // Avoid a flash of default content before the real list has loaded.
  if (faqs === null) return null;

  const list = faqs.length ? faqs : DEFAULT_FAQS;

  return (
    <section className="mx-auto mt-16 w-full max-w-6xl px-4 sm:px-6">
      <div className="mb-6 flex items-center gap-2.5">
        <MessageCircleQuestion className="h-6 w-6 shrink-0 text-brand-to" strokeWidth={2.2} />
        <h2 className="text-xl font-extrabold text-ink sm:text-2xl">Түгээмэл асуултууд</h2>
      </div>
      <div className="space-y-2">
        {list.map((item) => (
          <FaqItem
            key={item.id}
            item={item}
            isOpen={openId === item.id}
            onToggle={() => setOpenId((cur) => (cur === item.id ? null : item.id))}
          />
        ))}
      </div>
    </section>
  );
}
