import React from 'react';
import { Person, Expense } from '../types';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { generatePDF } from '../utils/pdfGenerator';
import { useRef } from 'react';

ChartJS.register(ArcElement, Tooltip, Legend);

interface SummaryProps {
  persons: Person[];
  totalExpenses: number;
  totalPaid: number[];
  expectedContributions: number[];
  balances: number[];
  expenses: Expense[];
}

const Summary: React.FC<SummaryProps> = ({
  persons,
  totalExpenses,
  totalPaid,
  expectedContributions,
  balances,
  expenses,
}) => {
  const chartRef = useRef<ChartJS<"pie">>(null);

  const categoryTotals = expenses.reduce((acc, expense) => {
    const category = expense.category || 'Uncategorized';
    acc[category] = (acc[category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const pieChartData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        data: Object.values(categoryTotals),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#EA80FC',
          '#00E676',
          '#FF5252',
          '#40C4FF',
          '#FFD740',
          '#64FFDA',
          '#E040FB',
          '#FF6E40',
          '#69F0AE',
          '#FF4081',
          '#7C4DFF',
          '#18FFFF',
          '#B388FF',
          '#82B1FF',
        ],
        borderWidth: 1,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: 'rgba(255, 255, 255, 0.87)',
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.raw;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${value.toFixed(2)}€ (${percentage}%)`;
          }
        }
      }
    },
  };

  const handleExportPDF = () => {
    const fileName = prompt('Enter a name for the PDF file:', 'household-expenses');
    if (fileName) {
      const chartImage = chartRef.current?.toBase64Image() || '';
      const balance = balances[0];
      const balanceText = balance > 0 
        ? `${persons[1].name} owes ${persons[0].name} ${balance.toFixed(2)}€`
        : `${persons[0].name} owes ${persons[1].name} ${Math.abs(balance).toFixed(2)}€`;
            
      const personSummaries = persons.map((person, index) => ({
        name: person.name,
        totalPaid: totalPaid[index],
        expectedContribution: expectedContributions[index]
      }));

      generatePDF(
        expenses, 
        totalExpenses, 
        persons, 
        fileName, 
        chartImage, 
        balanceText,
        personSummaries
      );
    }
  };

  return (
    <div className="summary-section">
      <h2 className="section-title">Summary</h2>
      <div className="total-expenses">
        <div>Total: <strong>{totalExpenses.toFixed(2)}€</strong></div>
      </div>

      <table className="summary-table">
        <thead>
          <tr>
            <th></th>
            <th>Paid</th>
            <th>Balance</th>
            <th>Expected</th>
          </tr>
        </thead>
        <tbody>
          {persons.map((person, index) => (
            <tr key={index}>
              <td>{person.name}</td>
              <td>{totalPaid[index].toFixed(2)}€</td>
              <td className={balances[index] >= 0 ? 'positive' : 'negative'}>
                {balances[index].toFixed(2)}€
              </td>
              <td>{expectedContributions[index].toFixed(2)}€</td>
            </tr>
          ))}
        </tbody>
      </table>

      {balances[0] !== 0 && (
        <div className="balance-text">
          {balances[0] > 0 ? (
            <span>{persons[1].name} owes {persons[0].name} {balances[0].toFixed(2)}€</span>
          ) : (
            <span>{persons[0].name} owes {persons[1].name} {Math.abs(balances[0]).toFixed(2)}€</span>
          )}
        </div>
      )}

      <div className="chart-section">
        <h3 className="section-title-small">Expense Distribution by Category</h3>
        <div className="chart-container">
          <Pie ref={chartRef} data={pieChartData} options={pieChartOptions} />
        </div>
        {expenses.length > 0 && (
          <div className="export-button-container">
            <button 
              className="export-button"
              onClick={handleExportPDF}
            >
              Export to PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Summary;
