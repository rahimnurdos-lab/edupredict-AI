import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const PALETTE = [
  { line: '#2563eb', gradient: ['rgba(37,99,235,0.2)', 'rgba(37,99,235,0)'] },
  { line: '#ef4444', gradient: ['rgba(239,68,68,0.15)', 'rgba(239,68,68,0)'] },
  { line: '#10b981', gradient: ['rgba(16,185,129,0.15)', 'rgba(16,185,129,0)'] },
  { line: '#f59e0b', gradient: ['rgba(245,158,11,0.15)', 'rgba(245,158,11,0)'] },
  { line: '#8b5cf6', gradient: ['rgba(139,92,246,0.15)', 'rgba(139,92,246,0)'] },
  { line: '#06b6d4', gradient: ['rgba(6,182,212,0.15)', 'rgba(6,182,212,0)'] },
];

function createGradient(ctx, chartArea, colors) {
  if (!chartArea) return colors[0];
  const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
  gradient.addColorStop(0, colors[0]);
  gradient.addColorStop(1, colors[1]);
  return gradient;
}

export default function StudentChart({ headers, students, selectedStudents }) {
  const chartData = useMemo(() => {
    const filtered = selectedStudents && selectedStudents.length > 0
      ? students.filter((student) => selectedStudents.includes(student.name))
      : students;

    return {
      labels: headers,
      datasets: filtered.map((student, index) => ({
        label: student.name,
        data: student.grades,
        borderColor: PALETTE[index % PALETTE.length].line,
        backgroundColor: (ctx) => {
          const { chart } = ctx;
          return createGradient(chart.ctx, chart.chartArea, PALETTE[index % PALETTE.length].gradient);
        },
        fill: true,
        tension: 0.45,
        pointRadius: 4,
        pointHoverRadius: 7,
        pointBackgroundColor: '#fff',
        pointBorderColor: PALETTE[index % PALETTE.length].line,
        pointBorderWidth: 2.5,
        pointHoverBorderWidth: 3,
        borderWidth: 2.5,
      })),
    };
  }, [headers, selectedStudents, students]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1200, easing: 'easeOutQuart' },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { family: "'Unbounded', sans-serif", size: 11, weight: '500' },
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 24,
          boxWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(255,255,255,0.92)',
        titleColor: '#0d0d0d',
        bodyColor: '#64748b',
        borderColor: 'rgba(0,0,0,0.06)',
        borderWidth: 1,
        cornerRadius: 14,
        padding: 16,
        titleFont: { family: "'Unbounded', sans-serif", size: 12, weight: '700' },
        bodyFont: { family: "'Unbounded', sans-serif", size: 11, weight: '400' },
        displayColors: true,
        boxWidth: 8,
        boxHeight: 8,
        boxPadding: 4,
        callbacks: {
          label: (ctx) => {
            const value = ctx.parsed.y;
            return value !== null && !Number.isNaN(value)
              ? `  ${ctx.dataset.label}: ${value} балл`
              : `  ${ctx.dataset.label}: —`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: { family: "'Unbounded', sans-serif", size: 10, weight: '500' },
          color: '#94a3b8',
          maxRotation: 45,
        },
        border: { display: false },
      },
      y: {
        beginAtZero: false,
        grid: { color: 'rgba(0,0,0,0.03)', drawBorder: false },
        ticks: {
          font: { family: "'Unbounded', sans-serif", size: 10, weight: '500' },
          color: '#94a3b8',
          padding: 8,
        },
        border: { display: false },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  return (
    <div className="chart-wrap glass-card">
      <h3 className="chart-title">Үлгерім динамикасы</h3>
      <div className="chart-container">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
