import React, { useState, useEffect } from 'react';
import InputForm from './components/InputForm'
import ExpenseTable from './components/ExpenseTable';
import Summary from './components/Summary';
import { Person, Expense } from './types';
import { calculateExpenseSummary, calculateShares } from './utils/expenseCalculations';

const App: React.FC = () => {
  const [persons, setPersons] = useState<Person[]>(() => {
    const savedPersons = localStorage.getItem('persons');
    return savedPersons ? JSON.parse(savedPersons) : [
      { name: '', income: 0 },
      { name: '', income: 0 },
    ];
  });
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const savedExpenses = localStorage.getItem('expenses');
    return savedExpenses ? JSON.parse(savedExpenses) : [];
  });
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalPaid, setTotalPaid] = useState([0, 0]);
  const [expectedContributions, setExpectedContributions] = useState([0, 0]);
  const [balances, setBalances] = useState([0, 0]);
  const [useLeftoverMethod, setUseLeftoverMethod] = useState(() => {
    const savedMethod = localStorage.getItem('useLeftoverMethod');
    return savedMethod ? JSON.parse(savedMethod) : false;
  });

  useEffect(() => {
    calculateSummary();
  }, [persons, expenses]);

  useEffect(() => {
    localStorage.setItem('persons', JSON.stringify(persons));
  }, [persons]);

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('useLeftoverMethod', JSON.stringify(useLeftoverMethod));
  }, [useLeftoverMethod]);

  const calculateSummary = () => {
    const summary = calculateExpenseSummary(persons, expenses);
    setTotalExpenses(summary.totalExpenses);
    setTotalPaid(summary.totalPaid);
    setExpectedContributions(summary.expectedContributions);
    setBalances(summary.balances);
  };

  const updatePersons = (newPersons: Person[]) => {
    const updatedExpenses = expenses.map(expense => {
      const [firstPersonShare, secondPersonShare] = calculateShares(
        expense.amount,
        expense.paidFor,
        newPersons
      );
      return {
        ...expense,
        firstPersonShare,
        secondPersonShare
      };
    });

    setPersons(newPersons);
    setExpenses(updatedExpenses);
  };

  const addExpense = (expense: Expense) => {
    setExpenses([...expenses, expense]);
  };

  const removeExpense = (index: number) => {
    setExpenses(expenses.filter((_, i) => i !== index));
  };

  return (
    <div className="app-container">
      <h2>Household Expense Tracker</h2>
      <div className="main-layout">
        <div className="left-column">
          <div className="card">
            <InputForm
              persons={persons}
              updatePersons={updatePersons}
              addExpense={addExpense}
              useLeftoverMethod={useLeftoverMethod}
              setUseLeftoverMethod={setUseLeftoverMethod}
            />
          </div>
          <div className="card"><ExpenseTable
            expenses={expenses}
            removeExpense={removeExpense}
            personAName={persons[0].name || '1st'}
            personBName={persons[1].name || '2nd'}
          />
          </div>
        </div>
        <div className="right-column">
          <Summary
            persons={persons}
            incomes={persons.map(p => p.income)}
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
