import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import LazyBlock from './components/LazyBlock';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const HeroCanvas = lazy(() => import('./components/landing/HeroCanvas'));

const IconBrain = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
    <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
  </svg>
);

const IconArrowRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const IconUpload = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const IconTrendUp = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);

const IconShield = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const heroStats = [
  { label: 'Мониторинг', value: 'Сыныптың ағымдағы көрінісі' },
  { label: 'Болжам', value: 'Тоқсан қорытындысын алдын ала көру' },
  { label: 'Назар', value: 'Тәуекел оқушыларын ерте анықтау' },
];

const processSteps = [
  {
    number: '01',
    title: 'Журнал жүктеу',
    text: 'Мұғалім Excel немесе CSV журналын бір рет жүктейді. Жүйе деректі оқып, талдауға дайындайды.',
  },
  {
    number: '02',
    title: 'ЖИ талдау',
    text: 'Жүйе трендті, орташа балды, тәуекелді және әлсіз тақырыптарды автоматты түрде есептейді.',
  },
  {
    number: '03',
    title: 'Шешім шығару',
    text: 'Нәтиже панелі қай оқушыға көңіл бөлу керек екенін, есеп пен экспортты бірден көрсетеді.',
  },
];

const featureCards = [
  {
    eyebrow: 'Болжау',
    title: 'Бағаны алдын ала көру',
    text: 'Тоқсандық нәтиженің қай бағытта өзгеруі мүмкін екенін ерте байқауға көмектеседі.',
  },
  {
    eyebrow: 'Түсініктілік',
    title: 'Нақты аналитика',
    text: 'Тек мұғалімге қажет көрсеткіштер: тәуекел, тренд, орташа балл және әлсіз тақырыптар.',
  },
  {
    eyebrow: 'Құпиялылық',
    title: 'Жергілікті есептеу',
    text: 'Дерек жергілікті ортада өңделеді, сондықтан бағалау ақпараты сыртқа шықпайды.',
  },
];

function FloatingOrb({ className }) {
  return (
    <motion.div
      className={className}
      animate={{ x: [0, 18, -12, 0], y: [0, -24, 16, 0], scale: [1, 1.06, 0.95, 1] }}
      transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-shell">
      <FloatingOrb className="landing-orb landing-orb--one" />
      <FloatingOrb className="landing-orb landing-orb--two" />
      <FloatingOrb className="landing-orb landing-orb--three" />

      <nav className="landing-nav glass">
        <div className="landing-nav__logo">
          <IconBrain />
          <span>EduPredict AI</span>
        </div>
        <div className="landing-nav__links">
          <a href="#process">Процесс</a>
          <a href="#features">Мүмкіндіктер</a>
          <button className="landing-nav__cta" onClick={() => navigate('/dashboard')}>
            Талдау панелі
          </button>
        </div>
      </nav>

      <main className="landing-main">
        <section className="landing-hero">
          <div className="landing-copy">
            <motion.div className="landing-kicker" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
              <span className="landing-kicker__dot" />
              Білім аналитикасына арналған ЖИ көмекші
            </motion.div>

            <motion.h1 className="landing-title" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.1 }}>
              Оқушы үлгерімін
              <span> бір қараста түсіндіретін </span>
              басқару панелі
            </motion.h1>

            <motion.p className="landing-description" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.2 }}>
              EduPredict AI мұғалімге қай оқушы тәуекелде екенін, қай тақырып әлсіз екенін
              және тоқсан соңында қандай нәтиже күтілетінін анық көруге көмектеседі.
            </motion.p>

            <motion.div className="landing-actions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.3 }}>
              <button className="landing-btn landing-btn--primary" onClick={() => navigate('/dashboard')}>
                Талдауға өту <IconArrowRight />
              </button>
              <button className="landing-btn landing-btn--secondary" onClick={() => navigate('/dashboard')}>
                <IconUpload />
                Журнал жүктеу
              </button>
            </motion.div>

            <motion.div className="landing-trust" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.4 }}>
              <span><IconShield /> Жергілікті өңдеу</span>
              <span><IconTrendUp /> Үлгерім динамикасы</span>
              <span>Дайын есеп пен экспорт</span>
            </motion.div>
          </div>

          <motion.aside className="landing-panel glass-card" initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
            <div className="landing-panel__top">
              <div>
                <p className="landing-panel__eyebrow">Жедел көрініс</p>
                <h2 className="landing-panel__title">Сынып жағдайы</h2>
              </div>
              <div className="landing-panel__badge">Белсенді</div>
            </div>

            <div className="landing-panel__canvas">
              <Suspense fallback={<LazyBlock height={280} label="Көрнекі блок жүктелуде..." />}>
                <HeroCanvas />
              </Suspense>
            </div>

            <div className="landing-stat-list">
              {heroStats.map((item) => (
                <div key={item.label} className="landing-stat">
                  <p>{item.label}</p>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>

            <div className="landing-scoreboard">
              <div className="landing-scorecard landing-scorecard--blue">
                <span>Тәуекелге назар</span>
                <strong>3 оқушы</strong>
              </div>
              <div className="landing-scorecard landing-scorecard--amber">
                <span>Орташа тренд</span>
                <strong>7.4-тен 8.1-ге</strong>
              </div>
            </div>
          </motion.aside>
        </section>

        <section id="process" className="landing-section">
          <div className="landing-section__intro">
            <p className="landing-section__eyebrow">Жұмыс барысы</p>
            <h2>Үш қадам, бір түсінікті нәтиже</h2>
          </div>
          <div className="landing-process-grid">
            {processSteps.map((step) => (
              <article key={step.number} className="landing-process-card glass-card">
                <span className="landing-process-card__number">{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="features" className="landing-section">
          <div className="landing-section__intro">
            <p className="landing-section__eyebrow">Негізгі пайда</p>
            <h2>Сайт не береді</h2>
          </div>
          <div className="landing-feature-grid">
            {featureCards.map((feature) => (
              <article key={feature.title} className="landing-feature-card glass-card">
                <p className="landing-feature-card__eyebrow">{feature.eyebrow}</p>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-cta glass-card">
          <div>
            <p className="landing-section__eyebrow">Келесі қадам</p>
            <h2>Қазір талдау панеліне өтіп, нақты дерекпен жұмысты бастауға болады</h2>
          </div>
          <button className="landing-btn landing-btn--primary" onClick={() => navigate('/dashboard')}>
            Талдау панелін ашу <IconArrowRight />
          </button>
        </section>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="route-loading">Бет жүктелуде...</div>}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
