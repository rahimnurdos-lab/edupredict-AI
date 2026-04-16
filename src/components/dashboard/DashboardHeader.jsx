import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const IconBrain = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
    <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
  </svg>
);

const IconHome = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

export default function DashboardHeader({ navigate, isModelLoading, localAiProgress }) {
  return (
    <>
      <nav className="navbar glass">
        <div className="navbar__inner">
          <div className="navbar__logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <IconBrain /> EduPredict <span>ЖИ</span>
          </div>
          <div className="navbar__links">
            <button className="navbar__cta" onClick={() => navigate('/')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <IconHome /> Басты бет
            </button>
          </div>
        </div>
      </nav>

      <div className="dashboard">
        <motion.div
          className="dashboard__header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="dashboard-title">
            <span className="icon-wrapper"><IconBrain /></span>
            Талдау панелі
          </h1>
          <p className="dashboard-subtitle">Журналды жүктеп, оқушылардың үлгерімі мен тәуекелін бір жерден бақылаңыз.</p>

          <AnimatePresence>
            {(isModelLoading || (localAiProgress > 0 && localAiProgress < 100)) && (
              <motion.div
                className="local-ai-status glass"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="status-header">
                  <span className="status-text">
                    {isModelLoading ? 'Жергілікті ЖИ моделі жүктелуде...' : 'Жергілікті ЖИ талдау жүргізіп жатыр...'}
                  </span>
                  <span className="status-pct">{localAiProgress}%</span>
                </div>
                <div className="progress-track">
                  <motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: `${localAiProgress}%` }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
}
