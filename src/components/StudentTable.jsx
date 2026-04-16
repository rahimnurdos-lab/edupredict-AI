import React from 'react';
import { motion } from 'framer-motion';

const MAX_GRADE = 10;

const rowVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    transition: { delay: index * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  }),
};

function GradeBar({ value }) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return <span style={{ color: 'var(--fg-subtle)', fontSize: '0.78rem' }}>—</span>;
  }

  const percent = Math.round((value / MAX_GRADE) * 100);
  let barColor;

  if (value >= 7) barColor = 'linear-gradient(90deg, #10b981, #06b6d4)';
  else if (value >= 4) barColor = 'linear-gradient(90deg, #f59e0b, #f97316)';
  else barColor = 'linear-gradient(90deg, #ef4444, #f97316)';

  return (
    <div className="progress-bar-wrap">
      <div className="progress-bar">
        <motion.div
          className="progress-bar__fill"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{ background: barColor }}
        />
      </div>
      <div className="progress-pct">{value} / {MAX_GRADE}</div>
    </div>
  );
}

function PredictionBadge({ prediction }) {
  if (!prediction || prediction.grade === null) {
    return <span style={{ color: 'var(--fg-subtle)', fontSize: '0.78rem' }}>—</span>;
  }

  const { grade, adjusted, direction } = prediction;
  let bg;
  let color;

  if (grade >= 5) { bg = '#10b98115'; color = '#10b981'; }
  else if (grade >= 4) { bg = '#2563eb12'; color = '#2563eb'; }
  else if (grade >= 3) { bg = '#f59e0b12'; color = '#f59e0b'; }
  else { bg = '#ef444412'; color = '#ef4444'; }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <span className="risk-badge" style={{ background: bg, color, borderColor: `${color}30`, fontSize: '0.85rem', fontWeight: 800 }}>
        {grade}
      </span>
      {adjusted && direction === 'down' && (
        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#ef4444', whiteSpace: 'nowrap' }}>
          {grade - 1}-ке түсу қаупі бар
        </span>
      )}
      {adjusted && direction === 'up' && (
        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#10b981', whiteSpace: 'nowrap' }}>
          {grade + 1}-ге көтерілуі мүмкін
        </span>
      )}
    </div>
  );
}

export default function StudentTable({ students }) {
  if (!students || students.length === 0) return null;

  return (
    <div className="student-table-wrap glass-card">
      <h3 className="chart-title">Оқушылар талдамасы</h3>
      <div className="table-scroll">
        <table className="student-table">
          <thead>
            <tr>
              <th>Оқушы</th>
              <th>Орташа балл</th>
              <th style={{ textAlign: 'left', paddingLeft: '2rem' }}>ЖИ сараптамасы</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <motion.tr
                key={student.name}
                custom={index}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                className={student.trend.level === 'declining' ? 'row-danger' : ''}
              >
                <td className="td-name">{student.name}</td>
                <td className="td-center">
                  <GradeBar value={student.avg} />
                </td>
                <td className="td-note" style={{ paddingLeft: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                    <div style={{ flexShrink: 0 }}>
                      <PredictionBadge prediction={{
                        grade: student.pytorchPrediction || student.prediction.grade,
                        adjusted: student.prediction.adjusted,
                        direction: student.prediction.direction,
                      }}
                      />
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--fg)', lineHeight: 1.5, paddingTop: '4px' }}>
                      {student.localAdvice || student.reasoning}
                    </div>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
