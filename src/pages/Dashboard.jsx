import React, { Suspense, lazy, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import * as XLSX from 'xlsx';
import FileUpload from '../components/FileUpload';
import QualityGauge from '../components/QualityGauge';
import StudentChart from '../components/StudentChart';
import StudentTable from '../components/StudentTable';
import DashboardEmptyState from '../components/dashboard/DashboardEmptyState';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardOverview from '../components/dashboard/DashboardOverview';
import LazyBlock from '../components/LazyBlock';
import { askLocalAiClient, initLocalAiClient } from '../utils/aiClient';
import {
  analyzeStudents,
  calculatePerformance,
  calculateQuality,
  generateConclusions,
  getInterventionList,
  getLeaderRisk,
  getOfficialLevels,
  sortByTrend,
} from '../utils/analysis';

const OfficialReport = lazy(() => import('../components/OfficialReport'));
const AiChat = lazy(() => import('../components/AiChat').then((module) => ({ default: module.AiChat })));

const IconDownload = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  }),
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export default function Dashboard() {
  const navigate = useNavigate();
  const [rawData, setRawData] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [localAiProgress, setLocalAiProgress] = useState(0);
  const [isModelLoading, setIsModelLoading] = useState(false);

  React.useEffect(() => {
    const loadModel = async () => {
      setIsModelLoading(true);
      try {
        await initLocalAiClient((progress) => setLocalAiProgress(progress));
      } catch (error) {
        console.error('Жергілікті ЖИ моделін жүктеу қатесі:', error);
      } finally {
        setIsModelLoading(false);
        setLocalAiProgress(100);
      }
    };

    loadModel();
  }, []);

  const analyzed = useMemo(() => {
    if (!rawData) return null;
    return sortByTrend(analyzeStudents(rawData.students));
  }, [rawData]);

  const qualityData = useMemo(() => (analyzed ? calculateQuality(analyzed) : null), [analyzed]);
  const performance = useMemo(() => (analyzed ? calculatePerformance(analyzed) : 0), [analyzed]);
  const levels = useMemo(() => (analyzed ? getOfficialLevels(analyzed) : []), [analyzed]);
  const interventionList = useMemo(() => (analyzed ? getInterventionList(analyzed) : []), [analyzed]);
  const conclusions = useMemo(
    () => ((analyzed && rawData) ? generateConclusions(analyzed, rawData.headers) : { achieved: [], challenging: [] }),
    [analyzed, rawData],
  );
  const leaderRisk = useMemo(() => (analyzed ? getLeaderRisk(analyzed) : null), [analyzed]);

  const stats = useMemo(() => {
    if (!analyzed) return null;

    const declining = analyzed.filter((student) => student.trend.level === 'declining').length;
    const stable = analyzed.filter((student) => student.trend.level === 'stable').length;
    const rising = analyzed.filter((student) => student.trend.level === 'rising').length;
    const atRisk = analyzed.filter((student) => student.prediction.direction === 'down').length;
    const validAverages = analyzed.filter((student) => student.avg !== null).map((student) => student.avg);
    const avgAll = validAverages.length > 0
      ? Math.round((validAverages.reduce((sum, value) => sum + value, 0) / validAverages.length) * 100) / 100
      : null;

    return { declining, stable, rising, atRisk, total: analyzed.length, avgAll };
  }, [analyzed]);

  const keyInsight = useMemo(() => {
    if (!stats || !qualityData || !leaderRisk) return null;

    if (stats.atRisk > 0) {
      return {
        label: 'Негізгі назар',
        value: `${stats.atRisk} оқушыға қосымша көңіл бөлу керек`,
        tone: 'warning',
      };
    }

    if (qualityData.quality >= 70) {
      return {
        label: 'Күшті нәтиже',
        value: `Сынып сапасы ${qualityData.quality}% деңгейінде`,
        tone: 'success',
      };
    }

    return {
      label: 'Көшбасшы',
      value: `${leaderRisk.leader?.name || 'Оқушы'} жоғары қарқынды сақтап тұр`,
      tone: 'primary',
    };
  }, [leaderRisk, qualityData, stats]);

  const handleExport = () => {
    if (!analyzed) return;

    const exportData = analyzed.map((student) => ({
      Оқушы: student.name,
      'Орташа балл (1-10)': student.avg !== null ? student.avg : '—',
      Тренд: student.trend.label,
      'Тоқсандық болжам (5 балдық)': student.prediction.grade !== null ? student.prediction.grade : '—',
      'ЖИ түсіндірмесі': student.reasoning || '—',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Талдау');
    XLSX.writeFile(workbook, 'EduPredict_AI_талдау.xlsx');
  };

  const toggleStudent = (name) => {
    setSelectedStudents((previous) => (
      previous.includes(name)
        ? previous.filter((studentName) => studentName !== name)
        : [...previous, name]
    ));
  };

  const resetDashboard = () => {
    setRawData(null);
    setSelectedStudents([]);
    setLocalAiProgress(0);
  };

  const processWithLocalAi = async (students) => {
    setLocalAiProgress(1);
    const processed = [];

    for (let index = 0; index < students.length; index += 1) {
      const student = students[index];
      setLocalAiProgress(Math.round(((index + 1) / students.length) * 100));

      let pytorchPrediction = student.prediction.grade;
      let localAdvice = 'Жергілікті ЖИ талдау жасап жатыр...';

      try {
        const response = await fetch(`${API_BASE_URL}/api/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ grades: student.grades }),
        });

        if (response.ok) {
          const data = await response.json();
          pytorchPrediction = data.prediction;
        } else {
          pytorchPrediction = Math.max(1, Math.min(10, Math.round(student.avg * 1.05 * 10) / 10));
        }
      } catch (error) {
        console.error('PyTorch backend қолжетімсіз, уақытша есеп қолданылды:', error);
        pytorchPrediction = Math.max(1, Math.min(10, Math.round(student.avg * 0.98 * 10) / 10));
      }

      try {
        localAdvice = await askLocalAiClient(student.name, student.avg, pytorchPrediction, false, student.grades);
      } catch (error) {
        console.error('Жергілікті ЖИ кеңесі қатесі:', error);
        localAdvice = 'Жергілікті ЖИ кеңесін шығару кезінде қате кетті.';
      }

      processed.push({
        ...student,
        pytorchPrediction,
        localAdvice,
      });
    }

    setRawData((previous) => ({ ...previous, students: processed }));
    setLocalAiProgress(100);
  };

  const onFileUpload = (data) => {
    const analyzedInitial = analyzeStudents(data.students);
    setRawData({ ...data, students: analyzedInitial });
    processWithLocalAi(analyzedInitial);
  };

  return (
    <div className="app-root">
      <div className="blob blob--primary" />
      <div className="blob blob--accent" />
      <div className="blob blob--tertiary" />

      <DashboardHeader
        navigate={navigate}
        isModelLoading={isModelLoading}
        localAiProgress={localAiProgress}
      />

      <div className="dashboard">
        <AnimatePresence mode="wait">
          {!rawData && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <DashboardEmptyState />
              <FileUpload onDataLoaded={onFileUpload} />
            </motion.div>
          )}

          {analyzed && stats && (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
              <DashboardOverview
                stats={stats}
                keyInsight={keyInsight}
                meta={rawData.meta}
              />

              <div className="analytics-row">
                <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={7}>
                  <StudentChart headers={rawData.headers} students={analyzed} selectedStudents={selectedStudents} />
                </motion.div>
                <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={7}>
                  {qualityData && (
                    <QualityGauge
                      quality={qualityData.quality}
                      performance={performance}
                      successCount={qualityData.success}
                      total={qualityData.total}
                    />
                  )}
                </motion.div>
              </div>

              <motion.div className="filter-chips" variants={fadeUp} initial="hidden" animate="visible" custom={8}>
                <span className="filter-label">Оқушыларды таңдаңыз:</span>
                {analyzed.map((student) => (
                  <button
                    key={student.name}
                    className={`chip ${selectedStudents.includes(student.name) ? 'chip--active' : ''}`}
                    onClick={() => toggleStudent(student.name)}
                    style={selectedStudents.includes(student.name) ? {
                      borderColor: student.trend.color,
                      background: `${student.trend.color}12`,
                    } : {}}
                  >
                    <span className="chip-dot" style={{ background: student.trend.color }} />
                    {student.name}
                  </button>
                ))}
                {selectedStudents.length > 0 && (
                  <button className="chip chip--clear" onClick={() => setSelectedStudents([])}>
                    Тазалау
                  </button>
                )}
              </motion.div>

              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={9}>
                <StudentTable students={analyzed} />
              </motion.div>

              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={10}>
                <Suspense fallback={<LazyBlock height={320} label="Есеп блогы жүктелуде..." />}>
                  <OfficialReport
                    levels={levels}
                    quality={qualityData?.quality || 0}
                    performance={performance}
                    interventionList={interventionList}
                    conclusions={conclusions}
                    leaderRisk={leaderRisk}
                  />
                </Suspense>
              </motion.div>

              <motion.div className="dashboard-actions" variants={fadeUp} initial="hidden" animate="visible" custom={11}>
                <button className="btn-primary" onClick={handleExport}>
                  <IconDownload /> Excel-ге экспорттау
                </button>
                <button className="btn-secondary glass-card" onClick={resetDashboard}>
                  Жаңа файл жүктеу
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {analyzed && (
        <Suspense fallback={null}>
          <AiChat contextData={analyzed} isKeySet />
        </Suspense>
      )}
    </div>
  );
}
