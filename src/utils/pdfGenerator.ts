import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Expense } from '../types';

const replaceSpecialChars = (str: string): string => {
    return str
        .replace(/[čć]/g, 'c')
        .replace(/đ/g, 'd')
};

export const generatePDF = (
    expenses: Expense[],
    totalExpenses: number,
    persons: { name: string; income: number }[],
    fileName: string,
    chartImage: string,
    balanceText: string,
    personSummaries: { name: string; totalPaid: number; expectedContribution: number }[]
) => {
    const doc = new jsPDF();
    
    // Add title and date
    doc.setFontSize(15);
    doc.text('Household Expenses Report', 14, 15);

    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25);

    // Add total expenses
    doc.setFontSize(12);
    doc.text(`Total Household Expenses: ${totalExpenses.toFixed(2)}€`, 14, 35);

    // Add balance text in red
    doc.setTextColor(244, 67, 54); // Red color
    doc.text(balanceText, 14, 45);
    doc.setTextColor(0); // Reset to black

    // Add person summary table
    autoTable(doc, {
        head: [['Name', 'Total Paid', 'Expected Contribution']],
        body: personSummaries.map(summary => [
            summary.name,
            `${summary.totalPaid.toFixed(2)}€`,
            `${summary.expectedContribution.toFixed(2)}€`
        ]),
        startY: 50,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [76, 175, 80] },
        margin: { bottom: 30 }
    });

    // Add expense table with individual payments and proper encoding
    autoTable(doc, {
        head: [
            ['Category', 'Amount', 'Paid By', 'Paid For', 
             `${persons[0].name} Paid`, `${persons[1].name} Paid`,
             `${persons[0].name}'s Share`, `${persons[1].name}'s Share`]
        ],
        body: expenses.map(expense => {
            const amount = Number(expense.amount);
            const firstPersonPaid = expense.paidBy === 'Both' ? expense.contribution[0] :
                                   expense.paidBy === persons[0].name ? amount : 0;
            const secondPersonPaid = expense.paidBy === 'Both' ? expense.contribution[1] :
                                    expense.paidBy === persons[1].name ? amount : 0;

            return [
                replaceSpecialChars(expense.category),
                `${amount.toFixed(2)}€`,
                expense.paidBy,
                expense.paidFor,
                `${firstPersonPaid.toFixed(2)}€`,
                `${secondPersonPaid.toFixed(2)}€`,
                `${expense.firstPersonShare.toFixed(2)}€`,
                `${expense.secondPersonShare.toFixed(2)}€`
            ];
        }),
        startY: (doc as any).lastAutoTable.finalY + 5,
        theme: 'grid',
        styles: { fontSize: 8, font: 'Arial' },
        headStyles: { fillColor: [76, 175, 80] }
    });

    const finalY = (doc as any).lastAutoTable.finalY;

    // Create and add bar chart
    if (chartImage) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 800;
        canvas.height = 400;
        
        // Set white background
        ctx!.fillStyle = '#FFFFFF';
        ctx!.fillRect(0, 0, canvas.width, canvas.height);
        
        // Get category data
        const categoryTotals = expenses.reduce((acc, expense) => {
            const category = expense.category || 'Uncategorized';
            acc[category] = (acc[category] || 0) + Number(expense.amount);
            return acc;
        }, {} as Record<string, number>);

        const categories = Object.keys(categoryTotals);
        const values = Object.values(categoryTotals);
        const maxValue = Math.max(...values);

        // Adjust padding based on number of categories
        const padding = categories.length > 6 ? 80 : 60;  // More padding for more categories
        const barWidth = (canvas.width - 2 * padding) / categories.length - 10;
        const maxHeight = canvas.height - 2 * padding;

        // Colors for bars
        const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

        // Draw bars
        ctx!.font = '12px Arial';  // Slightly smaller font
        categories.forEach((category, i) => {
            const value = categoryTotals[category];
            const barHeight = (value / maxValue) * maxHeight;
            const x = padding + i * (barWidth + 10);
            const y = canvas.height - padding - barHeight;

            // Draw bar
            ctx!.fillStyle = colors[i % colors.length];
            ctx!.fillRect(x, y, barWidth, barHeight);

            // Draw category label at an angle
            ctx!.fillStyle = '#333333';
            ctx!.save();
            ctx!.translate(x + barWidth / 2, canvas.height - padding + 10);
            ctx!.rotate(-Math.PI / 4);  // 45-degree angle
            ctx!.textAlign = 'right';
            ctx!.fillText(category, 0, 0);
            ctx!.restore();

            // Draw value on top of bar
            ctx!.textAlign = 'center';
            ctx!.fillText(`${value.toFixed(2)}€`, x + barWidth / 2, y - 5);
        });

        // Draw Y axis
        ctx!.beginPath();
        ctx!.moveTo(padding, padding);
        ctx!.lineTo(padding, canvas.height - padding);
        ctx!.stroke();

        // Add to PDF
        doc.addImage(canvas.toDataURL(), 'PNG', 14, finalY + 5, 180, 90);
        doc.save(`${fileName}.pdf`);
    } else {
        doc.save(`${fileName}.pdf`);
    }
}; 