const getLevel = (avg) => {
  if (avg >= 8.5) return 'high';
  if (avg >= 6.5) return 'medium';
  return 'low';
};

export const getKazakhDiagnostic = (studentName, avg, prediction, grades = []) => {
  const valid = grades.filter((grade) => grade !== null && !Number.isNaN(grade));

  if (valid.length >= 3) {
    const jumps = [];
    for (let index = 1; index < valid.length; index += 1) {
      jumps.push(Math.abs(valid[index] - valid[index - 1]));
    }

    const maxDiff = Math.max(...jumps);
    if (maxDiff > 3) {
      return 'Үлгерімі тұрақсыз: оқушының зейінін және тапсырма орындау ырғағын қосымша тексеру керек.';
    }
  }

  const normalizedPrediction = prediction > 5 ? (prediction / 10) * 5 : prediction;
  if (normalizedPrediction < 3.5) {
    return 'Қауіп тобы: негізгі тақырыптарды қайталап, қысқа жеке қолдау жоспарын құру қажет.';
  }

  if (normalizedPrediction > 4.5) {
    return 'Көшбасшы деңгей: күрделірек тапсырма мен тереңдетілген жұмыс ұсынуға болады.';
  }

  const level = getLevel(avg);
  const trend = prediction > avg ? 'rising' : (prediction < avg ? 'declining' : 'stable');

  const templates = {
    high: {
      rising: `${studentName} жоғары нәтиже көрсетіп тұр және өсім сақталып келеді. Күрделірек тапсырма беру тиімді болады.`,
      stable: `${studentName} тұрақты жоғары деңгейде. Қазіргі қарқынды сақтап, тереңдетілген тапсырмалар ұсынуға болады.`,
      declining: `${studentName} жақсы оқиды, бірақ соңғы нәтижелерде әлсіздеу белгі бар. Жеке кері байланыс беру пайдалы.`,
    },
    medium: {
      rising: `${studentName} біртіндеп жақсарып келеді. Қосымша ынталандыру нәтижені одан әрі көтере алады.`,
      stable: `${studentName} орта деңгейде тұрақты. Әлсіз тұстарын нысаналы түрде пысықтаса, өсімге шығуға болады.`,
      declining: `${studentName} бойынша төмендеу белгісі бар. Негізгі тақырыптарды қайталап, үй тапсырмасын бақылауды күшейткен жөн.`,
    },
    low: {
      rising: `${studentName} бойынша оң өзгеріс байқалады. Қарапайымнан күрделіге өтетін жеке қолдау жоспары тиімді.`,
      stable: `${studentName} төмен деңгейде тұрақтап тұр. Базалық ұғымдарды қайта түсіндіру және қысқа жеке жұмыс қажет.`,
      declining: `${studentName} ерекше назарды қажет етеді. Ата-анамен байланысып, жеке түзету жұмысын ұйымдастырған дұрыс.`,
    },
  };

  return templates[level][trend];
};

export const getKazakhChatResponse = (query) => {
  const q = query.toLowerCase();

  if (q.includes('сәлем') || q.includes('салем') || q.includes('ассалаумағалейкум')) {
    return 'Сәлеметсіз бе! Сынып, оқушы, тәуекел немесе болжам туралы сұрағыңызды жазыңыз.';
  }
  if (q.includes('үздік') || q.includes('кім') || q.includes('жақсы')) {
    return 'Үздік оқушыларды көру үшін модерация блогындағы көшбасшы картасына және кестедегі жоғары нәтиже көрсеткіштеріне қараңыз.';
  }
  if (q.includes('төмен') || q.includes('қауіп') || q.includes('нашар')) {
    return 'Қауіп тобындағы оқушылар есептің “Қосымша қолдау қажет оқушылар” бөлімінде көрсетіледі.';
  }
  if (q.includes('болжам') || q.includes('болашақ') || q.includes('баға')) {
    return 'Болжам бұрынғы бағалар динамикасы мен тренд негізінде есептеледі. Оны оқушы кестесінен көруге болады.';
  }
  if (q.includes('көмек') || q.includes('не істеу')) {
    return 'Нақтырақ сұраңыз: мысалы, “Қай оқушыға қолдау керек?” немесе “Қай тақырып әлсіз?” деп жаза аласыз.';
  }
  if (q.includes('рақмет')) {
    return 'Оқасы жоқ. Қажет болса, тағы сұрақ қоя беріңіз.';
  }

  return 'Мен сынып үлгерімі, тәуекел, болжам және тақырыптық әлсіз тұстар туралы сұрақтарға жауап бере аламын.';
};
