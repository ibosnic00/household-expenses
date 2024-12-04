import React, { useState, useEffect } from 'react';
import { Person, Expense } from '../types';

interface InputFormProps {
    persons: Person[];
    updatePersons: (persons: Person[]) => void;
    addExpense: (expense: Expense) => void;
}

const InputForm: React.FC<InputFormProps> = ({ persons, updatePersons, addExpense }) => {
    const [showExpenseForm, setShowExpenseForm] = useState(true);
    const [showSetupForm, setShowSetupForm] = useState(true);
    const [expense, setExpense] = useState({
        category: '',
        amount: 0,
        paidBy: '',
        firstPersonShare: 0,
        secondPersonShare: 0,
        contribution: [0, 0] as [number, number],
        paidFor: 'Common' as 'Common' | string,
    });

    useEffect(() => {
        if (persons.length > 0) {
            setExpense((prev) => ({
                ...prev,
                paidBy: persons[0].name || '',
            }));
        }
    }, [persons]);

    const handlePersonChange = <K extends keyof Person>(index: number, field: K, value: Person[K]) => {
        const updatedPersons = [...persons];
        updatedPersons[index][field] = value;
        updatePersons(updatedPersons);
    };

    const handlePaidForChange = (value: string) => {
        setExpense(prev => {
            const newExpense = { ...prev, paidFor: value };
            if (value === persons[0]?.name) {
                newExpense.firstPersonShare = prev.amount;
                newExpense.secondPersonShare = 0;
            } else if (value === persons[1]?.name) {
                newExpense.firstPersonShare = 0;
                newExpense.secondPersonShare = prev.amount;
            } else {
                const totalIncome = persons.reduce((sum, person) => sum + person.income, 0);
                const ratio = totalIncome > 0 ? persons.map((p) => p.income / totalIncome) : [0.5, 0.5];
                newExpense.firstPersonShare = Math.round(prev.amount * ratio[0] * 100) / 100;
                newExpense.secondPersonShare = Math.round(prev.amount * ratio[1] * 100) / 100;
            }
            return newExpense;
        });
    };

    const handlePaidByChange = (value: string) => {
        setExpense(prev => {
            const newExpense = { ...prev, paidBy: value };
            if (value === persons[0]?.name) {
                newExpense.contribution = [prev.amount, 0];
            } else if (value === persons[1]?.name) {
                newExpense.contribution = [0, prev.amount];
            } else if (value === 'Both') {
                const totalIncome = persons.reduce((sum, person) => sum + person.income, 0);
                const ratio = totalIncome > 0 ? persons.map((p) => p.income / totalIncome) : [0.5, 0.5];
                newExpense.contribution = [
                    Math.round(prev.amount * ratio[0] * 100) / 100,
                    Math.round(prev.amount * ratio[1] * 100) / 100
                ];
            }
            return newExpense;
        });
    };

    const handleAmountChange = (value: number) => {
        setExpense(prev => {
            const newExpense = { ...prev, amount: value };
            if (prev.paidFor === persons[0]?.name) {
                newExpense.firstPersonShare = value;
                newExpense.secondPersonShare = 0;
            } else if (prev.paidFor === persons[1]?.name) {
                newExpense.firstPersonShare = 0;
                newExpense.secondPersonShare = value;
            } else {
                const totalIncome = persons.reduce((sum, person) => sum + person.income, 0);
                const ratio = totalIncome > 0 ? persons.map((p) => p.income / totalIncome) : [0.5, 0.5];
                newExpense.firstPersonShare = Math.round(value * ratio[0] * 100) / 100;
                newExpense.secondPersonShare = Math.round(value * ratio[1] * 100) / 100;
            }
            return newExpense;
        });
    };

    const handleExpenseSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!expense.paidBy) {
            alert('Please select who paid the expense.');
            return;
        }
        
        let firstShare = 0;
        let secondShare = 0;

        if (expense.paidFor === 'Common') {
            const totalIncome = persons.reduce((sum, person) => sum + person.income, 0);
            const ratio = totalIncome > 0 ? persons.map((p) => p.income / totalIncome) : [0.5, 0.5];
            firstShare = Math.round(expense.amount * ratio[0] * 100) / 100;
            secondShare = Math.round(expense.amount * ratio[1] * 100) / 100;
        } else if (expense.paidFor === persons[0].name) {
            firstShare = expense.amount;
            secondShare = 0;
        } else {
            firstShare = 0;
            secondShare = expense.amount;
        }

        const newExpense: Expense = {
            category: expense.category,
            amount: expense.amount,
            paidBy: expense.paidBy,
            paidFor: expense.paidFor,
            firstPersonShare: firstShare,
            secondPersonShare: secondShare,
            contribution: expense.contribution
        };

        addExpense(newExpense);
        setExpense({
            category: '',
            amount: 0,
            paidBy: persons[0]?.name || '',
            firstPersonShare: 0,
            secondPersonShare: 0,
            contribution: [0, 0],
            paidFor: 'Common',
        });
    };

    const handleRestore = () => {
        setShowSetupForm(true);
        setShowExpenseForm(true);
    };

    const handleNumberFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        if (e.target.value === '0') {
            e.target.value = '';
        }
    };

    if (!showSetupForm && !showExpenseForm) {
        return (
            <div className="card minimized-card" onClick={handleRestore}>
                <span className="settings-icon">Settings ⚙️</span>
            </div>
        );
    }

    return (
        <div className='maximized-card'>
            <div 
                className="section-header clickable"
                onClick={() => setShowSetupForm(!showSetupForm)}
            >
                <h2 className="section-title">
                    Setup Household <span className="toggle-arrow">{showSetupForm ? '▼' : '▶'}</span>
                </h2>
            </div>

            {showSetupForm && (
                <div className="input-group">
                    <div className="input-field-container">
                        <label className="input-label">Name</label>
                        {persons.map((person, index) => (
                            <input
                                key={index}
                                className="input-field"
                                type="text"
                                placeholder="Name"
                                value={person.name}
                                onChange={(e) => handlePersonChange(index, 'name', e.target.value)}
                            />
                        ))}
                    </div>
                    <div className="input-field-container">
                        <label className="input-label">Income</label>
                        {persons.map((person, index) => (
                            <input
                                key={index}
                                className="input-field"
                                type="number"
                                placeholder="Income"
                                value={person.income}
                                onFocus={handleNumberFocus}
                                onChange={(e) => handlePersonChange(index, 'income', Number(e.target.value))}
                            />
                        ))}
                    </div>
                </div>
            )}
            
            <div 
                className="section-header clickable"
                onClick={() => setShowExpenseForm(!showExpenseForm)}
            >
                <h2 className="section-title">
                    Add Expense <span className="toggle-arrow">{showExpenseForm ? '▼' : '▶'}</span>
                </h2>
            </div>

            {showExpenseForm && (
                <form onSubmit={handleExpenseSubmit}>
                    <div className="input-group">
                        <div className="input-field-container">
                            <label className="input-label">Category</label>
                            <input
                                className="input-field"
                                type="text"
                                placeholder="Category"
                                value={expense.category}
                                onChange={(e) => setExpense({ ...expense, category: e.target.value })}
                            />
                        </div>
                        <div className="input-field-container">
                            <label className="input-label">Amount</label>
                            <input
                                className="input-field"
                                type="number"
                                placeholder="Amount"
                                value={expense.amount}
                                onFocus={handleNumberFocus}
                                onChange={(e) => handleAmountChange(Number(e.target.value))}
                            />
                        </div>
                        <div className="input-field-container">
                            <label className="input-label">Paid For</label>
                            <select
                                className="input-field"
                                value={expense.paidFor}
                                onChange={(e) => handlePaidForChange(e.target.value)}
                            >
                                <option value="Common">Common</option>
                                {persons.map((person, index) => (
                                    <option key={index} value={person.name}>
                                        {person.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="input-field-container">
                            <label className="input-label">Paid By</label>
                            <select
                                className="input-field"
                                value={expense.paidBy}
                                onChange={(e) => handlePaidByChange(e.target.value)}
                            >
                                {persons.map((person, index) => (
                                    <option key={index} value={person.name}>
                                        {person.name}
                                    </option>
                                ))}
                                {expense.paidFor === 'Common' && <option value="Both">Both</option>}
                            </select>
                        </div>
                    </div>
                    {expense.paidBy === 'Both' && (
                        <div className="input-group">
                            <div className="input-field-container">
                                <label className="input-label">{persons[0].name} Contribution</label>
                                <input
                                    className="input-field"
                                    type="number"
                                    value={expense.contribution[0]}
                                    onFocus={handleNumberFocus}
                                    onChange={(e) =>
                                        setExpense((prev) => ({
                                            ...prev,
                                            contribution: [
                                                Number(e.target.value),
                                                Math.round((prev.amount - Number(e.target.value)) * 100) / 100
                                            ],
                                        }))
                                    }
                                />
                            </div>
                            <div className="input-field-container">
                                <label className="input-label">{persons[1].name} Contribution</label>
                                <input
                                    className="input-field"
                                    type="number"
                                    value={expense.contribution[1]}
                                    onFocus={handleNumberFocus}
                                    onChange={(e) =>
                                        setExpense((prev) => ({
                                            ...prev,
                                            contribution: [
                                                Math.round((prev.amount - Number(e.target.value)) * 100) / 100,
                                                Number(e.target.value)
                                            ],
                                        }))
                                    }
                                />
                            </div>
                        </div>
                    )}
                    <button className="button" type="submit">Add Expense</button>
                </form>
            )}
        </div>
    );
};

export default InputForm;
