import React from 'react';
import { Expense } from '../types';

interface ExpenseTableProps {
  expenses: Expense[];
  removeExpense: (index: number) => void;
  personAName: string;
  personBName: string;
}

const ExpenseTable: React.FC<ExpenseTableProps> = ({ 
  expenses, 
  removeExpense, 
  personAName, 
  personBName 
}) => {
  return (
    <div className="card">
      <h2 className="section-title">Expenses</h2>
      <table className="expense-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Amount</th>
            <th>Paid By</th>
            <th>Paid For</th>
            <th>{personAName}'s Share</th>
            <th>{personBName}'s Share</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense, index) => (
            <tr key={index}>
              <td>{expense.category}</td>
              <td>{expense.amount.toFixed(2)}€</td>
              <td>{expense.paidBy}</td>
              <td>{expense.paidFor}</td>
              <td>{expense.firstPersonShare.toFixed(2)}€</td>
              <td>{expense.secondPersonShare.toFixed(2)}€</td>
              <td>
                <button onClick={() => removeExpense(index)} className="remove-button">
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExpenseTable;
