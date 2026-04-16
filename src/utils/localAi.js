import { env, pipeline } from '@xenova/transformers';
import { getKazakhChatResponse, getKazakhDiagnostic } from './kazakhTemplates';

if (typeof window !== 'undefined') {
  env.allowLocalModels = false;
  env.useBrowserCache = true;
}

let generator = null;

export const initLocalAi = async (onProgress = null) => {
  if (generator) return generator;

  try {
    generator = await pipeline('text2text-generation', 'Xenova/LaMini-Flan-T5-77M', {
      progress_callback: (progress) => {
        if (onProgress) onProgress(Math.round(progress.progress || 0));
      },
    });
    return generator;
  } catch (error) {
    console.error('Local AI Init Error:', error);
    throw error;
  }
};

export const askLocalAi = async (studentName, avg, prediction, isChat = false, grades = []) => {
  if (!isChat && studentName && avg !== undefined && prediction !== undefined) {
    return getKazakhDiagnostic(studentName, parseFloat(avg), parseFloat(prediction), grades);
  }

  if (isChat) {
    return getKazakhChatResponse(studentName);
  }

  if (!generator) {
    await initLocalAi();
  }

  const prompt = `Оқушы: ${studentName}. Орташа балл: ${avg}. ЖИ болжамы: ${prediction}. Қысқа педагогикалық кеңес бер.`;

  try {
    const result = await generator(prompt, {
      max_new_tokens: 150,
      temperature: 0.5,
      repetition_penalty: 1.2,
    });

    const text = result[0].generated_text;
    if (text.length < 5 || /^[a-zA-Z\s,.:]+$/.test(text)) {
      return getKazakhDiagnostic(studentName, parseFloat(avg), parseFloat(prediction), grades);
    }

    return text;
  } catch (error) {
    console.error('Local AI Generation Error:', error);
    return getKazakhDiagnostic(studentName, parseFloat(avg), parseFloat(prediction), grades);
  }
};
