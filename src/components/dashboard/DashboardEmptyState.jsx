import React from 'react';

export default function DashboardEmptyState() {
  return (
    <div className="dashboard-empty-state">
      <div className="dashboard-empty-state__copy glass-card">
        <p className="dashboard-empty-state__eyebrow">Бастау</p>
        <h2>Талдауды бастау үшін журналды жүктеңіз</h2>
        <p>
          Жүйе Excel немесе CSV файлын оқып, әр оқушының орташа балын, трендін,
          тәуекел деңгейін және жалпы сынып көрсеткіштерін автоматты түрде есептейді.
        </p>
        <div className="dashboard-empty-state__list">
          <div className="dashboard-empty-state__item">
            <strong>1</strong>
            <span>Excel немесе CSV журналын таңдаңыз</span>
          </div>
          <div className="dashboard-empty-state__item">
            <strong>2</strong>
            <span>Жүйе үлгерім динамикасын және болжамды есептейді</span>
          </div>
          <div className="dashboard-empty-state__item">
            <strong>3</strong>
            <span>Тәуекел оқушыларын, есепті және экспортты алыңыз</span>
          </div>
        </div>
      </div>
    </div>
  );
}
