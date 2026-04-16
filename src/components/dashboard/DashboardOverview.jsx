import React from 'react';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function DashboardOverview({ stats, keyInsight, meta }) {
  if (!stats) return null;

  const cards = [
    { value: stats.total, label: 'Жалпы оқушы', color: 'var(--fg)' },
    { value: stats.declining, label: 'Төмендеу', color: 'var(--danger)' },
    { value: stats.stable, label: 'Тұрақты', color: 'var(--primary)' },
    { value: stats.rising, label: 'Өсу', color: 'var(--success)' },
    { value: stats.atRisk, label: 'Қауіп тобы', color: '#f97316' },
    { value: stats.avgAll !== null ? stats.avgAll : '—', label: 'Орташа балл', color: 'var(--primary)' },
  ];

  return (
    <>
      {keyInsight && (
        <motion.div className={`insight-banner insight-banner--${keyInsight.tone} glass-card`} variants={fadeUp} initial="hidden" animate="visible" custom={0}>
          <span className="insight-banner__label">{keyInsight.label}</span>
          <strong>{keyInsight.value}</strong>
        </motion.div>
      )}

      {meta && (meta.className || meta.subject || meta.teacher) && (
        <motion.div className="dashboard-meta glass-card" variants={fadeUp} initial="hidden" animate="visible" custom={0}>
          {meta.className && <div className="meta-item"><strong>Сынып:</strong> {meta.className}</div>}
          {meta.subject && <div className="meta-item"><strong>Пән:</strong> {meta.subject}</div>}
          {meta.teacher && <div className="meta-item"><strong>Мұғалім:</strong> {meta.teacher}</div>}
          <div className="meta-item"><strong>Оқушы:</strong> {stats.total}</div>
        </motion.div>
      )}

      <div className="stats-grid">
        {cards.map((card, index) => (
          <motion.div key={card.label} className="stat-card glass-card" variants={fadeUp} initial="hidden" animate="visible" custom={index + 1}>
            <div className="stat-value" style={{ color: card.color }}>{card.value}</div>
            <div className="stat-label">{card.label}</div>
          </motion.div>
        ))}
      </div>

      <motion.div className="dashboard-mini-grid" variants={fadeUp} initial="hidden" animate="visible" custom={8}>
        <div className="dashboard-mini-card glass-card">
          <span className="dashboard-mini-card__label">Талдаудан өтті</span>
          <strong>{stats.total}</strong>
          <p>Жүктелген журнал толық оқылып, оқушылар тренд бойынша топталды.</p>
        </div>
        <div className="dashboard-mini-card glass-card">
          <span className="dashboard-mini-card__label">Қосымша назар</span>
          <strong>{stats.atRisk}</strong>
          <p>Бұл оқушыларға тоқсан аяқталғанға дейін жеке бақылау қажет болуы мүмкін.</p>
        </div>
        <div className="dashboard-mini-card glass-card">
          <span className="dashboard-mini-card__label">Сынып көрінісі</span>
          <strong>{stats.avgAll !== null ? stats.avgAll : '—'}</strong>
          <p>Қолжетімді қалыптастырушы бағалар бойынша орташа ағымдағы көрсеткіш.</p>
        </div>
      </motion.div>
    </>
  );
}
