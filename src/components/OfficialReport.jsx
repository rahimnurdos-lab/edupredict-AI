import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { askLocalAiClient } from '../utils/aiClient';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  }),
};

function Avatar({ name, gradient }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

  return (
    <div
      style={{
        width: 52,
        height: 52,
        borderRadius: '50%',
        background: gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.1rem',
        fontWeight: 900,
        color: '#fff',
        flexShrink: 0,
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
      }}
    >
      {initials}
    </div>
  );
}

function LeaderCard({ student }) {
  if (!student) return null;

  return (
    <motion.div className="highlight-card highlight-card--leader glass-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
      <div className="highlight-icon">Үздік</div>
      <Avatar name={student.name} gradient="linear-gradient(135deg, #f59e0b, #10b981)" />
      <div className="highlight-info">
        <div className="highlight-label">Ең жоғары нәтиже</div>
        <div className="highlight-name">{student.name}</div>
        <div className="highlight-meta">
          <span className="highlight-pct" style={{ color: '#10b981' }}>{student.pct}%</span>
          <span className="highlight-avg"> · {student.avg} балл · {student.grade5}</span>
        </div>
      </div>
      <div className="highlight-signal highlight-signal--good">Модерацияға үлгі ретінде ұсынуға болады</div>
    </motion.div>
  );
}

function RiskCard({ student }) {
  if (!student) return null;

  return (
    <motion.div className="highlight-card highlight-card--risk glass-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}>
      <div className="highlight-icon">Назар</div>
      <Avatar name={student.name} gradient="linear-gradient(135deg, #ef4444, #f97316)" />
      <div className="highlight-info">
        <div className="highlight-label">Қолдау қажет оқушы</div>
        <div className="highlight-name">{student.name}</div>
        <div className="highlight-meta">
          <span className="highlight-pct" style={{ color: '#ef4444' }}>{student.pct}%</span>
          <span className="highlight-avg"> · {student.avg} балл · {student.grade5}</span>
        </div>
      </div>
      <div className="highlight-signal highlight-signal--bad">Жеке жұмыс не қайта түсіндіру қажет</div>
    </motion.div>
  );
}

export default function OfficialReport({ levels, quality, performance, interventionList, conclusions, leaderRisk }) {
  const [aiAdvice, setAiAdvice] = useState({});
  const [isAiLoading, setIsAiLoading] = useState({});

  const handleGetAdvice = async (student) => {
    setIsAiLoading((previous) => ({ ...previous, [student.name]: true }));
    try {
      const grade = student.pytorchPrediction || student.grade5;
      const advice = await askLocalAiClient(student.name, student.avg, grade, false, student.grades);
      setAiAdvice((previous) => ({ ...previous, [student.name]: advice }));
    } catch (error) {
      setAiAdvice((previous) => ({ ...previous, [student.name]: `Қате: ${error.message}` }));
    } finally {
      setIsAiLoading((previous) => ({ ...previous, [student.name]: false }));
    }
  };

  return (
    <div className="official-report">
      <motion.div className="report-section glass-card" variants={fadeUp} initial="hidden" animate="visible" custom={0}>
        <h3 className="chart-title">Ресми деңгейлік есеп</h3>
        <div className="table-scroll">
          <table className="student-table">
            <thead>
              <tr>
                <th>Деңгей</th>
                <th>Аралық</th>
                <th>Оқушы саны</th>
                <th>Пайызы</th>
                <th>Көрсеткіш</th>
              </tr>
            </thead>
            <tbody>
              {levels.map((level, index) => (
                <motion.tr key={level.name} variants={fadeUp} initial="hidden" animate="visible" custom={index + 1}>
                  <td>
                    <span className="risk-badge" style={{ background: `${level.color}12`, color: level.color, borderColor: `${level.color}25` }}>
                      {level.name}
                    </span>
                  </td>
                  <td className="td-center" style={{ fontWeight: 500 }}>{level.range}</td>
                  <td className="td-center" style={{ fontWeight: 800, fontSize: '1rem' }}>{level.count}</td>
                  <td className="td-center" style={{ fontWeight: 700, color: level.color }}>{level.pct}%</td>
                  <td style={{ width: 120 }}>
                    <div className="progress-bar">
                      <motion.div
                        className="progress-bar__fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${level.pct}%` }}
                        transition={{ duration: 1, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
                        style={{ background: level.color }}
                      />
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', gap: 24, marginTop: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
          <div className="report-stat">
            <span className="report-stat__label">Сапа пайызы</span>
            <span className="report-stat__value" style={{ color: quality >= 50 ? '#10b981' : '#ef4444' }}>{quality}%</span>
          </div>
          <div className="report-stat">
            <span className="report-stat__label">Үлгерім пайызы</span>
            <span className="report-stat__value" style={{ color: '#2563eb' }}>{performance}%</span>
          </div>
        </div>
      </motion.div>

      {interventionList.length > 0 && (
        <motion.div className="report-section glass-card" variants={fadeUp} initial="hidden" animate="visible" custom={5}>
          <h3 className="chart-title">Қосымша қолдау қажет оқушылар</h3>
          <div className="intervention-list">
            {interventionList.map((student, index) => (
              <motion.div key={student.name} className="intervention-card" variants={fadeUp} initial="hidden" animate="visible" custom={index + 6}>
                <div className="intervention-header">
                  <span className="intervention-name">{student.name}</span>
                  <span
                    className="risk-badge"
                    style={{
                      background: student.avg < 4.0 ? '#ef444415' : '#f59e0b12',
                      color: student.avg < 4.0 ? '#ef4444' : '#f59e0b',
                      borderColor: student.avg < 4.0 ? '#ef444430' : '#f59e0b30',
                    }}
                  >
                    {student.avg < 4.0 ? 'Төмен' : 'Орта'} · {student.avg} балл
                  </span>
                  <span style={{ fontSize: '0.88rem' }}>{student.trend.icon}</span>
                </div>
                <div className="intervention-detail">{student.reasoning}</div>

                <div style={{ marginTop: 12 }}>
                  {!aiAdvice[student.name] && !isAiLoading[student.name] ? (
                    <button
                      onClick={() => handleGetAdvice(student)}
                      style={{
                        background: 'linear-gradient(135deg, #2563eb, #8b5cf6)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '6px 12px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        boxShadow: '0 2px 8px rgba(37,99,235,0.2)',
                      }}
                    >
                      ЖИ кеңесін алу
                    </button>
                  ) : isAiLoading[student.name] ? (
                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
                      ЖИ талдап жатыр...
                    </div>
                  ) : (
                    <div
                      style={{
                        marginTop: 8,
                        padding: 12,
                        borderRadius: 12,
                        background: 'rgba(37,99,235,0.05)',
                        border: '1px solid rgba(37,99,235,0.15)',
                        fontSize: '0.85rem',
                        color: '#1e293b',
                        whiteSpace: 'pre-wrap',
                        lineHeight: 1.5,
                      }}
                    >
                      <b>ЖИ ментор:</b>
                      <br />
                      {aiAdvice[student.name]}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div className="report-section glass-card" variants={fadeUp} initial="hidden" animate="visible" custom={10}>
        <h3 className="chart-title">Модерацияға ұсыныс</h3>

        {leaderRisk && (
          <div className="highlights-grid">
            <LeaderCard student={leaderRisk.leader} />
            <RiskCard student={leaderRisk.risk} />
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 24 }}>
          <div className="conclusion-block conclusion-block--good">
            <h4>Жақсы меңгерілген бағыттар</h4>
            {conclusions.achieved.length > 0 ? (
              <ul>{conclusions.achieved.map((item) => <li key={item}>{item}</li>)}</ul>
            ) : (
              <p className="conclusion-empty">Анықталған жоқ</p>
            )}
          </div>
          <div className="conclusion-block conclusion-block--warn">
            <h4>Қиындық туғызған тақырыптар</h4>
            {conclusions.challenging.length > 0 ? (
              <ul>
                {conclusions.challenging.map((item) => (
                  <li key={item}>
                    {item}
                    <span className="moderation-note">→ Бұл бағытты сыныппен қайта пысықтау керек</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="conclusion-empty">Анықталған жоқ</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
