import React, { useState, useEffect } from 'react';
import { Person, Expense } from '../types';
import { calculateShares, calculateContributions } from '../utils/expenseCalculations';

interface InputFormProps {
    persons: Person[];
    updatePersons: (persons: Person[]) => void;
    addExpense: (expense: Expense) => void;
    useLeftoverMethod: boolean;
    setUseLeftoverMethod: (value: boolean) => void;
}

const InputForm: React.FC<InputFormProps> = ({ persons, updatePersons, addExpense, useLeftoverMethod, setUseLeftoverMethod }) => {
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
            const [firstPersonShare, secondPersonShare] = calculateShares(prev.amount, value, persons);
            return {
                ...prev,
                paidFor: value,
                firstPersonShare,
                secondPersonShare
            };
        });
    };

    const handlePaidByChange = (value: string) => {
        setExpense(prev => {
            const contribution = calculateContributions(prev.amount, value, persons);
            return {
                ...prev,
                paidBy: value,
                contribution
            };
        });
    };

    const handleAmountChange = (value: number) => {
        setExpense(prev => {
            const [firstPersonShare, secondPersonShare] = calculateShares(value, prev.paidFor, persons);
            return {
                ...prev,
                amount: value,
                firstPersonShare,
                secondPersonShare
            };
        });
    };

    const handleExpenseSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!expense.paidBy) {
            alert('Please select who paid the expense.');
            return;
        }
        
        const [firstShare, secondShare] = calculateShares(expense.amount, expense.paidFor, persons);

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
    const handleSwitchChange = () => {
        const updatedPersons = persons.map(person => {
            const updatedPerson = { ...person };
            if (!useLeftoverMethod) {
                updatedPerson.salaryRemaining = 0;
            } else {                
                updatedPerson.income = updatedPerson.income + (updatedPerson.salaryRemaining ?? 0);
                delete updatedPerson.salaryRemaining;
            }
            return updatedPerson;
        });
        updatePersons(updatedPersons);
        setUseLeftoverMethod(!useLeftoverMethod);
    };

    const handleDesiredRemainingChange = (index: number, value: number) => {        
        const updatedPersons = [...persons];
        if (updatedPersons[index]?.income !== undefined && updatedPersons[index]?.salaryRemaining !== undefined) {
            const originalIncome = updatedPersons[index].income + updatedPersons[index].salaryRemaining;
            updatedPersons[index].salaryRemaining = value;
            updatedPersons[index].income = originalIncome - value;
            updatePersons(updatedPersons);
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
            <div className="section-header">
                <h2 
                    className="section-title clickable"
                    onClick={() => setShowSetupForm(!showSetupForm)}
                >
                    Setup Household <span className="toggle-arrow">{showSetupForm ? '⌵' : '❯'}</span>
                </h2>
                <div className="switch-container">
                    <span className="switch-label">Monthly Leftover</span>
                    <label className="switch">
                        <input
                            type="checkbox"
                            checked={useLeftoverMethod}
                            onChange={handleSwitchChange}
                        />
                        <span className="slider"></span>
                    </label>
                </div>
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
                                placeholder={`${index === 0 ? 'First' : 'Second'} person`}
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
                                placeholder={`${index === 0 ? 'First' : 'Second'} person's salary (€)`}
                                value={person.income}
                                onFocus={handleNumberFocus}
                                onChange={(e) => handlePersonChange(index, 'income', Number(e.target.value))}
                            />
                        ))}
                    </div>
                    {useLeftoverMethod && (
                        <div className="input-field-container">
                            <label className="input-label">Desired Remaining Amount</label>
                            {persons.map((person, index) => (
                                <input
                                    key={index}
                                    className="input-field"
                                    type="number"
                                    placeholder={`${index === 0 ? 'First' : 'Second'} person's remaining amount (€)`}
                                    value={person.salaryRemaining}
                                    onFocus={handleNumberFocus}
                                    onChange={(e) => handleDesiredRemainingChange(index, Number(e.target.value))}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
            
            <div className="section-header">
                <h2 
                    className="section-title clickable"
                    onClick={() => setShowExpenseForm(!showExpenseForm)}
                >
                    Add Expense <span className="toggle-arrow">{showExpenseForm ? '⌵' : '❯'}</span>
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
                                placeholder="Expense title"
                                value={expense.category}
                                onChange={(e) => setExpense({ ...expense, category: e.target.value })}
                            />
                        </div>
                        <div className="input-field-container">
                            <label className="input-label">Amount</label>
                            <input
                                className="input-field"
                                type="number"
                                placeholder="€"
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
