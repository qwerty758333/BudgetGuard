import React from 'react';
import { ExpenseForm } from './components/ExpenseForm';
import { Dashboard } from './components/Dashboard';
import { ExpenseList } from './components/ExpenseList';

function App() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-3xl font-bold">BudgetGuard</h1>
      </header>

      {/* Main Content */}
      <main className="p-4 md:p-8">
        {/* Add Expense Form */}
        <div className="mb-8">
          <ExpenseForm />
        </div>

        {/* Dashboard */}
        <div className="mb-8">
          <Dashboard />
        </div>

        {/* Expense List */}
        <div>
          <ExpenseList />
        </div>
      </main>
    </div>
  );
}

export default App;
