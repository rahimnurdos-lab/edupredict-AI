const MAX_GRADE = 10;

function safeAvg(values) {
  const valid = values.filter((grade) => grade !== null && !Number.isNaN(grade));
  if (valid.length === 0) return null;
  return Math.round((valid.reduce((sum, grade) => sum + grade, 0) / valid.length) * 100) / 100;
}

function linearRegression(values) {
  const valid = values
    .map((value, index) => [index, value])
    .filter(([, value]) => value !== null && !Number.isNaN(value));

  const n = valid.length;
  if (n < 2) return { slope: 0, predict: () => valid[0]?.[1] || 0 };

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  valid.forEach(([x, y]) => {
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  });

  const denominator = n * sumX2 - sumX * sumX;
  const slope = denominator !== 0 ? (n * sumXY - sumX * sumY) / denominator : 0;
  const intercept = (sumY - slope * sumX) / n;

  return {
    slope: Math.round(slope * 1000) / 1000,
    predict: (x) => Math.round((slope * x + intercept) * 10) / 10,
  };
}

function calculateTrend(avg, grades) {
  const valid = grades.filter((grade) => grade !== null && !Number.isNaN(grade));
  if (valid.length < 2 || avg === null) {
    return { icon: '→', label: 'Тұрақты', level: 'stable', color: '#2563eb' };
  }

  const lastGrade = valid[valid.length - 1];
  if (lastGrade < avg - 1.5) {
    return { icon: '↓', label: 'Төмендеу тренді', level: 'declining', color: '#ef4444' };
  }

  const windowSize = Math.min(3, Math.floor(valid.length / 2));
  const firstAvg = valid.slice(0, windowSize).reduce((sum, grade) => sum + grade, 0) / windowSize;
  const lastAvg = valid.slice(-windowSize).reduce((sum, grade) => sum + grade, 0) / windowSize;
  const diff = lastAvg - firstAvg;

  if (diff > 0.5) {
    return { icon: '↑', label: 'Өсу тренді', level: 'rising', color: '#10b981' };
  }

  if (diff < -1.5) {
    return { icon: '↓', label: 'Төмендеу тренді', level: 'declining', color: '#ef4444' };
  }

  return { icon: '→', label: 'Тұрақты', level: 'stable', color: '#2563eb' };
}

function convertTo5(avg) {
  if (avg === null) return null;
  if (avg >= 9.0) return 5;
  if (avg >= 7.0) return 4;
  if (avg >= 5.0) return 3;
  return 2;
}

function predictQuarterGrade(avg, trend) {
  if (avg === null) return { grade: null, adjusted: false, direction: null };

  const baseGrade = convertTo5(avg);
  let adjusted = false;
  let direction = null;

  if (trend.level === 'declining' && baseGrade > 2) {
    adjusted = true;
    direction = 'down';
  } else if (trend.level === 'rising' && baseGrade < 5) {
    adjusted = true;
    direction = 'up';
  }

  return { grade: baseGrade, adjusted, direction };
}

function grade5Label(grade) {
  if (grade === 5) return '"5" (өте жақсы)';
  if (grade === 4) return '"4" (жақсы)';
  if (grade === 3) return '"3" (қанағаттанарлық)';
  return '"2" (қанағаттанарлықсыз)';
}

function generateReasoning(student) {
  const { avg, trend, prediction, grades } = student;
  const valid = grades.filter((grade) => grade !== null && !Number.isNaN(grade));
  if (valid.length === 0) return 'Деректер жеткіліксіз.';

  const last = valid[valid.length - 1];
  const g5 = prediction.grade;

  if (trend.level === 'declining') {
    if (prediction.direction === 'down') {
      return `Орташа балл ${avg} (${grade5Label(g5)}). Соңғы баға ${last} болғандықтан, нәтиженің төмендеу қаупі бар.`;
    }
    return `Орташа балл ${avg}. Соңғы баға ${last}, бұл орташа көрсеткіштен төмен. Қосымша қолдау қажет.`;
  }

  if (trend.level === 'rising') {
    if (prediction.direction === 'up') {
      return `Орташа балл ${avg} (${grade5Label(g5)}). Соңғы бағалауларда өсім байқалады, нәтиже жақсаруы мүмкін.`;
    }
    return `Орташа балл ${avg}. Үлгерім біртіндеп жоғарылап келеді.`;
  }

  return `Орташа балл ${avg} (${grade5Label(g5)}), үлгерім тұрақты деңгейде.`;
}

export function analyzeStudents(students) {
  return students.map((student) => {
    const avg = safeAvg(student.grades);
    const regression = linearRegression(student.grades);
    const trend = calculateTrend(avg, student.grades);
    const prediction = predictQuarterGrade(avg, trend);

    const nextIndex = student.grades.length;
    const predicted10 = [
      Math.max(1, Math.min(MAX_GRADE, regression.predict(nextIndex))),
      Math.max(1, Math.min(MAX_GRADE, regression.predict(nextIndex + 1))),
    ];

    const validGrades = student.grades.filter((grade) => grade !== null && !Number.isNaN(grade));
    let worstDrop = 0;
    let worstPeriod = '';

    for (let index = 1; index < validGrades.length; index += 1) {
      const drop = validGrades[index - 1] - validGrades[index];
      if (drop > worstDrop) {
        worstDrop = drop;
        worstPeriod = `${index}-кезең`;
      }
    }

    const analyzed = {
      ...student,
      avg,
      slope: regression.slope,
      trend,
      prediction,
      predicted10,
      worstDrop,
      worstPeriod,
      lastGrade: validGrades[validGrades.length - 1] || null,
      gradeCount: validGrades.length,
    };

    analyzed.reasoning = generateReasoning(analyzed);
    return analyzed;
  });
}

export function sortByTrend(analyzed) {
  const order = { declining: 0, stable: 1, rising: 2 };
  return [...analyzed].sort((a, b) => order[a.trend.level] - order[b.trend.level]);
}

export function calculateQuality(analyzed) {
  const withGrades = analyzed.filter((student) => student.avg !== null);
  if (withGrades.length === 0) return { quality: 0, success: 0, total: 0 };

  const qualityStudents = withGrades.filter((student) => student.avg >= 7.0);
  return {
    quality: Math.round((qualityStudents.length / withGrades.length) * 100),
    success: qualityStudents.length,
    total: withGrades.length,
  };
}

export function calculatePerformance(analyzed) {
  const withGrades = analyzed.filter((student) => student.avg !== null);
  if (withGrades.length === 0) return 0;
  return Math.round((withGrades.filter((student) => student.avg >= 5.0).length / withGrades.length) * 100);
}

export function getOfficialLevels(analyzed) {
  const withGrades = analyzed.filter((student) => student.avg !== null);
  const total = withGrades.length;

  const levels = [
    { name: 'Төмен', range: '0-39%', color: '#ef4444', students: withGrades.filter((student) => student.avg < 4.0) },
    { name: 'Орта', range: '40-64%', color: '#f59e0b', students: withGrades.filter((student) => student.avg >= 4.0 && student.avg < 6.5) },
    { name: 'Жақсы', range: '65-84%', color: '#2563eb', students: withGrades.filter((student) => student.avg >= 6.5 && student.avg < 8.5) },
    { name: 'Жоғары', range: '85-100%', color: '#10b981', students: withGrades.filter((student) => student.avg >= 8.5) },
  ];

  return levels.map((level) => ({
    ...level,
    count: level.students.length,
    pct: total > 0 ? Math.round((level.students.length / total) * 100) : 0,
  }));
}

export function getInterventionList(analyzed) {
  return analyzed
    .filter((student) => student.avg !== null && student.avg < 6.5)
    .map((student) => ({
      name: student.name,
      avg: student.avg,
      grade5: student.prediction.grade,
      trend: student.trend,
      reasoning: student.reasoning,
      weakPeriod: student.worstPeriod,
      grades: student.grades,
      pytorchPrediction: student.pytorchPrediction,
    }));
}

export function generateConclusions(analyzed, headers) {
  const withGrades = analyzed.filter((student) => student.avg !== null);
  if (withGrades.length === 0) return { achieved: [], challenging: [] };

  const topicAverages = headers
    .map((header, index) => {
      const grades = withGrades.map((student) => student.grades[index]).filter((grade) => grade !== null && !Number.isNaN(grade));
      const avg = grades.length > 0 ? grades.reduce((sum, grade) => sum + grade, 0) / grades.length : 0;
      return { topic: header, avg: Math.round(avg * 100) / 100, count: grades.length };
    })
    .filter((topic) => topic.count > 0);

  const achieved = topicAverages
    .filter((topic) => topic.avg >= 7.0)
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 5)
    .map((topic) => `${topic.topic} — орташа ${topic.avg} балл`);

  const challenging = topicAverages
    .filter((topic) => topic.avg < 7.0)
    .sort((a, b) => a.avg - b.avg)
    .slice(0, 5)
    .map((topic) => `${topic.topic} — орташа ${topic.avg} балл`);

  return { achieved, challenging };
}

export function getLeaderRisk(analyzed) {
  const withGrades = analyzed.filter((student) => student.avg !== null);
  if (withGrades.length === 0) return { leader: null, risk: null };

  const leader = withGrades.reduce((best, student) => (student.avg > best.avg ? student : best), withGrades[0]);
  const risk = withGrades.reduce((worst, student) => (student.avg < worst.avg ? student : worst), withGrades[0]);
  const toPct = (avg) => Math.round((avg / 10) * 100);

  return {
    leader: { name: leader.name, avg: leader.avg, pct: toPct(leader.avg), trend: leader.trend, grade5: leader.prediction.grade, grades: leader.grades },
    risk: { name: risk.name, avg: risk.avg, pct: toPct(risk.avg), trend: risk.trend, grade5: risk.prediction.grade, grades: risk.grades },
  };
}
