import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';

function MoodChart({ sentimentHistory }) {
  const data = {
    labels: sentimentHistory.map((_, i) => `Message ${i + 1}`),
    datasets: [
      {
        label: 'Sentiment Score',
        data: sentimentHistory.map((s) => 
          s.sentiment === 'positive' ? 1 : s.sentiment === 'negative' ? -1 : 0
        ),
        borderColor: 'blue',
        tension: 0.3,
      },
    ],
  };

  return <Line data={data} />;
}

export default MoodChart;
