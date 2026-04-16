import React, { useCallback, useState } from 'react';
import * as XLSX from 'xlsx';

const IconUpload = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const IconFile = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
  </svg>
);

function parseGrade(value) {
  if (value === undefined || value === null || value === '' || value === ' ') return null;
  const number = Number(value);
  if (Number.isNaN(number) || !Number.isFinite(number)) return null;
  if (number < 1 || number > 10) return null;
  if (Math.floor(number) !== number) return null;
  return number;
}

function parseSchoolJournal(jsonData) {
  const meta = { className: '', subject: '', teacher: '' };

  for (let rowIndex = 0; rowIndex < Math.min(jsonData.length, 8); rowIndex += 1) {
    const row = jsonData[rowIndex];
    if (!row || row.length === 0) continue;

    for (let columnIndex = 0; columnIndex < Math.min(row.length, 5); columnIndex += 1) {
      const cell = String(row[columnIndex] || '').trim();
      if (!cell) continue;

      const lower = cell.toLowerCase();
      if (lower.includes('сынып') || lower.includes('класс')) meta.className = cell;
      if (lower.includes('пән') || lower.includes('предмет')) meta.subject = cell;
      if (lower.includes('мұғалім') || lower.includes('учитель')) meta.teacher = cell;
    }
  }

  let headerRowIndex = 7;
  for (let rowIndex = 5; rowIndex < Math.min(jsonData.length, 12); rowIndex += 1) {
    const row = jsonData[rowIndex];
    const nextRow = jsonData[rowIndex + 1];
    if (!row || !nextRow || row.length < 3 || nextRow.length < 3) continue;

    const firstCell = nextRow[0];
    const secondCell = String(nextRow[1] || '').trim();
    if (typeof firstCell === 'number' && firstCell >= 1 && firstCell <= 50 && secondCell.length > 2) {
      headerRowIndex = rowIndex;
      break;
    }
  }

  const summaryKeywords = ['тоқсан', 'жылдық', 'итого', 'орташа', 'средн', 'қорытынды', 'сабақ', 'average'];
  const headerRow = jsonData[headerRowIndex] || [];
  const headers = [];
  const gradeColumns = [];

  for (let columnIndex = 2; columnIndex < headerRow.length; columnIndex += 1) {
    const cellValue = String(headerRow[columnIndex] || '').trim();
    const lower = cellValue.toLowerCase();
    const isSummary = summaryKeywords.some((keyword) => lower.includes(keyword));

    if (!isSummary && cellValue !== '') {
      headers.push(cellValue);
      gradeColumns.push(columnIndex);
    }
  }

  if (headers.length === 0) {
    for (let columnIndex = 2; columnIndex < headerRow.length; columnIndex += 1) {
      headers.push(`БЖ${columnIndex - 1}`);
      gradeColumns.push(columnIndex);
    }
  }

  const students = [];
  for (let rowIndex = headerRowIndex + 1; rowIndex < jsonData.length; rowIndex += 1) {
    const row = jsonData[rowIndex];
    if (!row || row.length < 3) continue;

    const name = String(row[1] || '').trim();
    if (!name || name.length < 2) continue;

    const lower = name.toLowerCase();
    if (['тоқсан', 'жылдық', 'итого', 'орташа', 'оқушы', 'аты', 'тегі'].some((keyword) => lower.includes(keyword))) continue;

    const grades = gradeColumns.map((columnIndex) => parseGrade(row[columnIndex]));
    if (grades.some((grade) => grade !== null)) {
      students.push({ name, grades });
    }
  }

  return { meta, headers, students };
}

function parseSimpleFormat(jsonData) {
  const headerRow = jsonData[0] || [];
  const headers = headerRow.slice(1).map((header) => String(header || '').trim());
  const students = [];

  for (let rowIndex = 1; rowIndex < jsonData.length; rowIndex += 1) {
    const row = jsonData[rowIndex];
    if (!row || !row[0]) continue;

    const name = String(row[0]).trim();
    if (!name || name.length < 2) continue;

    const grades = row.slice(1).map((value) => parseGrade(value));
    if (grades.some((grade) => grade !== null)) {
      students.push({ name, grades });
    }
  }

  return { meta: {}, headers, students };
}

function detectAndParse(jsonData) {
  const journalKeywords = ['сынып', 'класс', 'пән', 'предмет', 'мұғалім', 'учитель', '№', 'р/с', 'оқушы'];
  let isSchoolJournal = false;

  for (let rowIndex = 0; rowIndex < Math.min(jsonData.length, 10); rowIndex += 1) {
    const row = jsonData[rowIndex];
    if (!row) continue;

    for (let columnIndex = 0; columnIndex < Math.min(row.length, 5); columnIndex += 1) {
      const cell = String(row[columnIndex] || '').toLowerCase().trim();
      if (journalKeywords.some((keyword) => cell.includes(keyword))) {
        isSchoolJournal = true;
        break;
      }
    }

    if (isSchoolJournal) break;
  }

  if (!isSchoolJournal) {
    const firstValue = jsonData[0]?.[0];
    if (typeof firstValue === 'number' && firstValue >= 1 && firstValue <= 5) {
      isSchoolJournal = true;
    }
  }

  return isSchoolJournal ? parseSchoolJournal(jsonData) : parseSimpleFormat(jsonData);
}

export default function FileUpload({ onDataLoaded }) {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [metaInfo, setMetaInfo] = useState(null);

  const processFile = useCallback((file) => {
    if (!file) return;

    const extension = file.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(extension)) {
      setError('Тек Excel (.xlsx, .xls) немесе CSV файлдарын жүктеуге болады.');
      return;
    }

    setFileName(file.name);
    setLoading(true);
    setError('');
    setMetaInfo(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });

        if (jsonData.length < 2) {
          setError('Файлда жеткілікті дерек жоқ.');
          setLoading(false);
          return;
        }

        const result = detectAndParse(jsonData);
        if (result.students.length === 0) {
          setError('Оқушылар табылмады. Файл форматында 1-10 аралығындағы бағалар болуы керек.');
          setLoading(false);
          return;
        }

        if (result.meta && (result.meta.className || result.meta.subject || result.meta.teacher)) {
          setMetaInfo(result.meta);
        }

        onDataLoaded({ headers: result.headers, students: result.students, meta: result.meta });
        setLoading(false);
      } catch (readError) {
        setError(`Файлды оқу кезінде қате кетті: ${readError.message}`);
        setLoading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  }, [onDataLoaded]);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    setDragActive(false);
    processFile(event.dataTransfer.files[0]);
  }, [processFile]);

  const handleChange = useCallback((event) => {
    processFile(event.target.files[0]);
  }, [processFile]);

  return (
    <div className="upload-section">
      <div
        className={`upload-dropzone glass-card ${dragActive ? 'upload-dropzone--active' : ''}`}
        onDragOver={(event) => { event.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
      >
        <input type="file" accept=".xlsx,.xls,.csv" onChange={handleChange} className="upload-input" id="file-upload" />
        <label htmlFor="file-upload" className="upload-label">
          <div className="upload-icon"><IconUpload /></div>
          <h3 className="upload-title">Excel немесе CSV журналын жүктеңіз</h3>
          <p className="upload-hint">Файлды осы жерге сүйреңіз немесе <span className="upload-link">таңдаңыз</span></p>
          <p className="upload-formats">.xlsx, .xls, .csv — мектеп журналы, қалыптастырушы бағалар 1-10 шкаласында</p>
        </label>
      </div>

      {loading && (
        <div className="upload-status"><div className="spinner" /><span>Файл өңделіп жатыр...</span></div>
      )}

      {fileName && !loading && !error && (
        <div className="upload-status upload-status--success"><IconFile /><span>{fileName} сәтті жүктелді</span></div>
      )}

      {metaInfo && (metaInfo.className || metaInfo.subject || metaInfo.teacher) && (
        <div className="upload-meta glass-card">
          {metaInfo.className && <div className="meta-item"><strong>Сынып:</strong> {metaInfo.className}</div>}
          {metaInfo.subject && <div className="meta-item"><strong>Пән:</strong> {metaInfo.subject}</div>}
          {metaInfo.teacher && <div className="meta-item"><strong>Мұғалім:</strong> {metaInfo.teacher}</div>}
        </div>
      )}

      {error && (
        <div className="upload-status upload-status--error"><span>{error}</span></div>
      )}

      <div className="upload-template glass-card">
        <h4>Журнал құрылымы</h4>
        <p>Алғашқы жолдарда сынып, пән, мұғалім секілді ақпарат болуы мүмкін. Одан кейін оқушылар мен бағалар кестесі келеді.</p>
        <div className="template-table">
          <table>
            <tbody>
              <tr><td colSpan="6" style={{ textAlign: 'left', fontWeight: 600, color: 'var(--primary)' }}>1-3 жол: сынып, пән, мұғалім</td></tr>
              <tr><td colSpan="6" style={{ textAlign: 'left', fontWeight: 600, color: 'var(--primary)' }}>4-8 жол: бағалау тақырыптары</td></tr>
              <tr><th>№</th><th>Оқушы аты-жөні</th><th>БЖ1</th><th>БЖ2</th><th>БЖ3</th><th>БЖ4</th></tr>
              <tr><td>1</td><td style={{ textAlign: 'left' }}>Асанов Алмас</td><td>8</td><td>6</td><td>7</td><td>9</td></tr>
              <tr><td>2</td><td style={{ textAlign: 'left' }}>Болатова Бота</td><td>5</td><td>4</td><td>6</td><td>5</td></tr>
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: 12, fontSize: '0.72rem', color: 'var(--fg-subtle)' }}>
          Тек 1-10 аралығындағы бүтін бағалар есепке алынады. Бос ұяшықтар талдауға кірмейді.
        </p>
      </div>
    </div>
  );
}
