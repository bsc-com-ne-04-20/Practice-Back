import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SendMoney from './pages/SendMoney';
import WithdrawMoney from './pages/WithdrawMoney';
import DepositMoney from './pages/DepositMoney';
import TransactionHistory from './pages/TransactionHistory';
import VerifyIdentity from './pages/VerifyIdentity';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('authToken'));
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [username, setUsername] = useState<string>(localStorage.getItem('username') || '');
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    const fetchBalance = async () => {
      const email = localStorage.getItem('email');
      if (!email) return;

      try {
        const response = await fetch('http://127.0.0.1:8000/api/v1/accounts/get-balance/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        if (!response.ok) throw new Error('Failed to fetch balance');

        const data = await response.json();
        setBalance(data.balance);
      } catch (error) {
        console.error(error);
      }
    };

    if (isAuthenticated) {
      fetchBalance();
    }
  }, [isAuthenticated]);

  const handleLogin = (user: string, token: string) => {
    setIsAuthenticated(true);
    setUsername(user);
    localStorage.setItem('authToken', token);
    localStorage.setItem('username', user);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setIsVerified(false);
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    window.location.href = '/login'; // Redirect to login
  };

  const handleVerify = () => {
    setIsVerified(true);
  };

  const handleSendMoney = (receiver: string, amount: number) => {
    if (!isVerified || amount > balance) return false;
    setBalance(prev => prev - amount);
    setTransactions(prev => [...prev, {
      id: Date.now(),
      type: 'debit',
      amount,
      date: new Date().toLocaleDateString(),
      description: `Sent to ${receiver}`
    }]);
    return true;
  };

  const handleWithdraw = (amount: number, code: string) => {
    if (!isVerified || amount > balance || code !== '1234') return false;
    setBalance(prev => prev - amount);
    setTransactions(prev => [...prev, {
      id: Date.now(),
      type: 'debit',
      amount,
      date: new Date().toLocaleDateString(),
      description: 'Withdrawal'
    }]);
    return true;
  };

  return (
    <div className="min-h-screen bg-white">
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />
        } />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<VerifyIdentity username={username} onLogout={handleLogout} onVerify={handleVerify} />} />
        <Route path="/dashboard" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Dashboard username={username} balance={balance} onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/send" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <SendMoney username={username} balance={balance} onSend={handleSendMoney} onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/withdraw" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <WithdrawMoney username={username} balance={balance} onWithdraw={handleWithdraw} onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/deposit" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <DepositMoney username={username} onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/history" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <TransactionHistory username={username} transactions={transactions} onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </div>
  );
};

export default App;
