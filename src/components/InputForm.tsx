import React, { useState, useEffect } from 'react';
import { Person, Expense } from '../types';

interface InputFormProps {
    persons: Person[];
    updatePersons: (persons: Person[]) => void;
    addExpense: (expense: Expense) => void;
}

const InputForm: React.FC<InputFormProps> = ({ persons, updatePersons, addExpense }) => {
    const [expense, setExpense] = useState({
        category: '',
        amount: 0,
        paidBy: '',
        contribution: [0, 0],
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
                newExpense.contribution = [prev.amount, 0];
            } else if (value === persons[1]?.name) {
                newExpense.contribution = [0, prev.amount];
            } else {
                const totalIncome = persons.reduce((sum, person) => sum + person.income, 0);
                const ratio = totalIncome > 0 ? persons.map((p) => p.income / totalIncome) : [0.5, 0.5];
                newExpense.contribution = [
                    Math.round(prev.amount * ratio[0] * 100) / 100,
                    Math.round(prev.amount * ratio[1] * 100) / 100,
                ];
            }
            return newExpense;
        });
    };

    const handlePaidByChange = (value: string) => {
        setExpense((prev) => ({
            ...prev,
            paidBy: value,
        }));
    };

    const handleAmountChange = (value: number) => {
        setExpense(prev => {
            const newExpense = { ...prev, amount: value };
            if (prev.paidFor === persons[0]?.name) {
                newExpense.contribution = [value, 0];
            } else if (prev.paidFor === persons[1]?.name) {
                newExpense.contribution = [0, value];
            } else {
                const totalIncome = persons.reduce((sum, person) => sum + person.income, 0);
                const ratio = totalIncome > 0 ? persons.map((p) => p.income / totalIncome) : [0.5, 0.5];
                newExpense.contribution = [
                    Math.round(value * ratio[0] * 100) / 100,
                    Math.round(value * ratio[1] * 100) / 100,
                ];
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
        addExpense(expense as Expense);
        setExpense({
            category: '',
            amount: 0,
            paidBy: persons[0]?.name || '',
            contribution: [0, 0],
            paidFor: 'Common',
        });
    };

    return (
        <div>
            <h2 className="section-title">Setup Household</h2>
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
                            onChange={(e) => handlePersonChange(index, 'income', Number(e.target.value))}
                        />
                    ))}
                </div>
            </div>
            <h2 className="section-title">Add Expense</h2>
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
                                onChange={(e) =>
                                    setExpense((prev) => ({
                                        ...prev,
                                        contribution: [Number(e.target.value), prev.contribution[1]],
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
                                onChange={(e) =>
                                    setExpense((prev) => ({
                                        ...prev,
                                        contribution: [prev.contribution[0], Number(e.target.value)],
                                    }))
                                }
                            />
                        </div>
                    </div>
                )}
                <button className="button" type="submit">Add Expense</button>
            </form>
        </div>
    );
};

export default InputForm;
