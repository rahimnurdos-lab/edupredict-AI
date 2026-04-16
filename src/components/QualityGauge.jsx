import React from 'react';
import { motion } from 'framer-motion';

export default function QualityGauge({ quality, performance, successCount, total }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progress = (quality / 100) * circumference;
  const isGood = quality >= 50;
  const mainColor = isGood ? '#10b981' : '#ef4444';
  const bgColor = isGood ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)';

  return (
    <div className="quality-gauge glass-card">
      <h3 className="chart-title">Білім сапасы</h3>

      <div style={{ display: 'flex', alignItems: 'center', gap: 40, flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: 180, height: 180 }}>
          <svg width="180" height="180" viewBox="0 0 180 180">
            <circle cx="90" cy="90" r={radius} fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth="12" />
            <motion.circle
              cx="90"
              cy="90"
              r={radius}
              fill="none"
              stroke={mainColor}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference}
              animate={{ strokeDashoffset: circumference - progress }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              transform="rotate(-90 90 90)"
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <motion.span
              style={{ fontSize: '2.2rem', fontWeight: 900, color: mainColor, letterSpacing: '-0.03em' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {quality}%
            </motion.span>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--fg-muted)' }}>САПА</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ padding: '14px 20px', borderRadius: 14, background: bgColor }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--fg-muted)' }}>Сапалы оқушылар (4-5)</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: mainColor, marginTop: 2 }}>
              {successCount} / {total}
            </div>
          </div>
          <div style={{ padding: '14px 20px', borderRadius: 14, background: 'rgba(37,99,235,0.06)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--fg-muted)' }}>Үлгерім пайызы</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--primary)', marginTop: 2 }}>
              {performance}%
            </div>
          </div>
          <div
            style={{
              padding: '10px 16px',
              borderRadius: 10,
              background: isGood ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
              fontSize: '0.78rem',
              fontWeight: 700,
              textAlign: 'center',
              color: mainColor,
            }}
          >
            {isGood ? 'Жақсы деңгей' : 'Қауіп аймағы'}
          </div>
        </div>
      </div>
    </div>
  );
}
