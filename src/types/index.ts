export type Person = {
    name: string;
    income: number;    
    salaryRemaining?: number;
  };
  
  export interface Expense {
    category: string;
    amount: number;
    paidBy: string;
    paidFor: string;
    firstPersonShare: number;
    secondPersonShare: number;
    contribution: [number, number];
  }
  
  export type HouseholdData = {
    persons: Person[];
    expenses: Expense[];
  };
  