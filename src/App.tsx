import React, { useState, useEffect } from 'react';
import InputForm from './components/InputForm'
import ExpenseTable from './components/ExpenseTable';
import Summary from './components/Summary';
import { Person, Expense } from './types';

const App: React.FC = () => {
  const [persons, setPersons] = useState<Person[]>([
    { name: '', income: 0 },
    { name: '', income: 0 },
  ]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalPaid, setTotalPaid] = useState([0, 0]);
  const [expectedContributions, setExpectedContributions] = useState([0, 0]);
  const [balances, setBalances] = useState([0, 0]);

  useEffect(() => {
    calculateSummary();
  }, [persons, expenses]);

  const calculateSummary = () => {
    const totalIncome = persons.reduce((sum, person) => sum + person.income, 0);
    const incomeRatios = totalIncome > 0 ? persons.map((p) => p.income / totalIncome) : [0.5, 0.5];

    let newTotalExpenses = 0;
    let newTotalPaid = [0, 0];
    let newExpectedContributions = [0, 0];

    // Calculate total expenses and total paid
    expenses.forEach((expense) => {
      newTotalExpenses = Math.round((newTotalExpenses + expense.amount) * 100) / 100;
      
      if (expense.paidBy === persons[0].name) {
        newTotalPaid[0] = Math.round((newTotalPaid[0] + expense.amount) * 100) / 100;
      } else if (expense.paidBy === persons[1].name) {
        newTotalPaid[1] = Math.round((newTotalPaid[1] + expense.amount) * 100) / 100;
      } else if (expense.paidBy === 'Both' && expense.contribution) {
        newTotalPaid[0] = Math.round((newTotalPaid[0] + expense.contribution[0]) * 100) / 100;
        newTotalPaid[1] = Math.round((newTotalPaid[1] + expense.contribution[1]) * 100) / 100;
      }

      // Calculate expected contributions based on paidFor
      if (expense.paidFor === 'Common') {
        newExpectedContributions[0] += Math.round(expense.amount * incomeRatios[0] * 100) / 100;
        newExpectedContributions[1] += Math.round(expense.amount * incomeRatios[1] * 100) / 100;
      } else if (expense.paidFor === persons[0].name) {
        newExpectedContributions[0] += expense.amount;
      } else if (expense.paidFor === persons[1].name) {
        newExpectedContributions[1] += expense.amount;
      }
    });

    // Calculate balances
    const newBalances = newTotalPaid.map((paid, i) =>
      Math.round((paid - newExpectedContributions[i]) * 100) / 100
    );

    setTotalExpenses(newTotalExpenses);
    setTotalPaid(newTotalPaid);
    setExpectedContributions(newExpectedContributions);
    setBalances(newBalances);
  };

  const updatePersons = (newPersons: Person[]) => {
    setPersons(newPersons);
  };

  const addExpense = (expense: Expense) => {
    setExpenses([...expenses, expense]);
  };

  const removeExpense = (index: number) => {
    setExpenses(expenses.filter((_, i) => i !== index));
  };

  return (
    <div className="app-container">
      <h1>Expense Tracker</h1>
      <div className="main-layout">
        <div className="left-column">
          <div className="card">
            <InputForm
              persons={persons}
              updatePersons={updatePersons}
              addExpense={addExpense}
            />
          </div>
          <ExpenseTable expenses={expenses} removeExpense={removeExpense} />
        </div>
        <div className="right-column">
          <Summary
            persons={persons}
            totalExpenses={totalExpenses}
            totalPaid={totalPaid}
            expectedContributions={expectedContributions}
            balances={balances}
            expenses={expenses}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
