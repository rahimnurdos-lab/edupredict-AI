// Script to generate a sample Excel file for testing EduPredict AI
const XLSX = require('xlsx');

const data = [
  ['Оқушы', '1-апта', '2-апта', '3-апта', '4-апта', '5-апта', '6-апта', '7-апта', '8-апта'],
  ['Асанов Алмас', 4, 4, 3, 3, 3, 2, 2, 2],
  ['Болатова Бота', 3, 3, 4, 4, 4, 5, 5, 5],
  ['Сериков Данияр', 5, 5, 5, 4, 4, 4, 4, 3],
  ['Нұрланова Айгерім', 3, 2, 3, 2, 3, 2, 2, 2],
  ['Омаров Ержан', 4, 4, 4, 4, 5, 5, 5, 5],
  ['Тұрсынова Мадина', 3, 3, 3, 3, 3, 3, 3, 3],
  ['Жұмабеков Ерлан', 5, 4, 4, 3, 3, 2, 3, 2],
  ['Қасымова Дана', 4, 5, 4, 5, 4, 5, 5, 5],
];

const ws = XLSX.utils.aoa_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Бағалар');
XLSX.writeFile(wb, 'sample_grades.xlsx');
console.log('Sample file created: sample_grades.xlsx');
