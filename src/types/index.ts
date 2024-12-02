export type Person = {
    name: string;
    income: number;
  };
  
  export interface Expense {
    category: string;
    amount: number;
    paidBy: string;
    contribution: [number, number];
    paidFor: 'Common' | string;
  }
  
  export type HouseholdData = {
    persons: Person[];
    expenses: Expense[];
  };
  