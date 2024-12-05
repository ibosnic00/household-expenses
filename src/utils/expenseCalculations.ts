import { Person, Expense } from '../types';

export const calculateExpenseSummary = (persons: Person[], expenses: Expense[]) => {
  const totalIncome = persons.reduce((sum, person) => sum + person.income, 0);
  const incomeRatios = totalIncome > 0 ? persons.map((p) => p.income / totalIncome) : [0.5, 0.5];

  let totalExpenses = 0;
  let totalPaid = [0, 0];
  let expectedContributions = [0, 0];

  expenses.forEach((expense) => {
    totalExpenses = Math.round((totalExpenses + expense.amount) * 100) / 100;

    // Calculate total paid
    if (expense.paidBy === persons[0].name) {
      totalPaid[0] = Math.round((totalPaid[0] + expense.amount) * 100) / 100;
    } else if (expense.paidBy === persons[1].name) {
      totalPaid[1] = Math.round((totalPaid[1] + expense.amount) * 100) / 100;
    } else if (expense.paidBy === 'Both' && expense.contribution) {
      totalPaid[0] = Math.round((totalPaid[0] + expense.contribution[0]) * 100) / 100;
      totalPaid[1] = Math.round((totalPaid[1] + expense.contribution[1]) * 100) / 100;
    }

    // Calculate expected contributions
    if (expense.paidFor === 'Common') {
      expectedContributions[0] += Math.round(expense.amount * incomeRatios[0] * 100) / 100;
      expectedContributions[1] += Math.round(expense.amount * incomeRatios[1] * 100) / 100;
    } else if (expense.paidFor === persons[0].name) {
      expectedContributions[0] += expense.amount;
    } else if (expense.paidFor === persons[1].name) {
      expectedContributions[1] += expense.amount;
    }
  });

  const balances = totalPaid.map((paid, i) =>
    Math.round((paid - expectedContributions[i]) * 100) / 100
  );

  return {
    totalExpenses,
    totalPaid,
    expectedContributions,
    balances
  };
};

export const calculateIncomeRatio = (persons: Person[]): [number, number] => {
    const totalIncome = persons.reduce((sum, person) => sum + person.income, 0);
    return totalIncome > 0 
        ? persons.map(p => p.income / totalIncome) as [number, number]
        : [0.5, 0.5];
};

export const calculateShares = (
    amount: number,
    paidFor: string,
    persons: Person[]
): [number, number] => {
    if (paidFor === persons[0]?.name) {
        return [amount, 0];
    } else if (paidFor === persons[1]?.name) {
        return [0, amount];
    } else if (paidFor === 'Common') {
        const ratio = calculateIncomeRatio(persons);
        return [
            Math.round(amount * ratio[0] * 100) / 100,
            Math.round(amount * ratio[1] * 100) / 100
        ];
    } else {
        // Handle any other cases similarly to 'Common'
        const ratio = calculateIncomeRatio(persons);
        return [
            Math.round(amount * ratio[0] * 100) / 100,
            Math.round(amount * ratio[1] * 100) / 100
        ];
    }
};

export const calculateContributions = (
    amount: number,
    paidBy: string,
    persons: Person[]
): [number, number] => {
    if (paidBy === persons[0]?.name) {
        return [amount, 0];
    } else if (paidBy === persons[1]?.name) {
        return [0, amount];
    } else if (paidBy === 'Both') {
        const ratio = calculateIncomeRatio(persons);
        return [
            Math.round(amount * ratio[0] * 100) / 100,
            Math.round(amount * ratio[1] * 100) / 100
        ];
    }
    return [0, 0];
}; 