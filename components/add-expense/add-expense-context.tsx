'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { AddExpenseDialog } from './add-expense-dialog';

interface AddExpenseContextValue {
  open: () => void;
}

const AddExpenseContext = createContext<AddExpenseContextValue | null>(null);

export function AddExpenseProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const value = useMemo(() => ({ open: () => setIsOpen(true) }), []);
  return (
    <AddExpenseContext.Provider value={value}>
      {children}
      <AddExpenseDialog open={isOpen} onOpenChange={setIsOpen} />
    </AddExpenseContext.Provider>
  );
}

export function useAddExpense(): AddExpenseContextValue {
  const ctx = useContext(AddExpenseContext);
  if (!ctx) throw new Error('useAddExpense must be used within AddExpenseProvider');
  return ctx;
}
