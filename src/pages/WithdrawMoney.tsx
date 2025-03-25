import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { KeyRound, ArrowLeft } from 'lucide-react';
import axios from 'axios';

interface WithdrawMoneyProps {
  balance: number;
  username: string;
  onLogout: () => void;
}

const WithdrawMoney: React.FC<WithdrawMoneyProps> = ({ balance, username, onLogout }) => {
  const [amount, setAmount] = useState('');
  const [email, setEmail] = useState(username); // Allow user to input their email
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!amount) {
      setError('Please fill in the amount field');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (amountNum > balance) {
      setError('Insufficient balance');
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/v1/wtdr/', {
        email: email, // Send email as part of the request
        amount: amountNum,
      });

      // Extract response data
      const { amount, withdrawal_fee, trans_id, time_stamp } = response.data;

      // Set success message to match the desired format
      setSuccess(`
          Amount: "${amount}",
          ithdrawal_fee": "${withdrawal_fee}",
          "trans_id": "${trans_id}",
          "time_stamp": "${time_stamp}"
      `);
      
      setAmount('');
      setEmail(username); // Reset to the original email after success
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.non_field_errors || 'An error occurred. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar username={username} onLogout={onLogout} />
      
      <div className="container mx-auto px-4 py-8">
        <button 
          onClick={() => navigate('/dashboard')} 
          className="flex items-center text-[#8928A4] mb-6 hover:underline"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Dashboard
        </button>
        
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Withdraw Money</h2>
          
          <div className="bg-purple-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-600">Available Balance</p>
            <p className="text-xl font-bold text-[#8928A4]">${balance.toLocaleString()}</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <h1 className="text-[#8928A4]"><b>$</b></h1>
                </div>
                <input
                  type="number"
                  id="amount"
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8928A4] focus:ring-[#8928A4] sm:text-sm border p-2"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0.01"
                  step="0.01"
                />
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8928A4] focus:ring-[#8928A4] sm:text-sm border p-2"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            
            {error && (
              <div className="mb-4 p-2 bg-red-50 text-red-500 rounded-md text-sm">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-4 p-2 bg-green-50 text-green-500 rounded-md text-sm">
                <pre>{success}</pre> {/* Use <pre> to preserve formatting */}
              </div>
            )}
            
            <button
              type="submit"
              className="w-full bg-[#8928A4] text-white py-2 px-4 rounded-md hover:bg-[#7a2391] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8928A4]"
            >
              Withdraw Money
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WithdrawMoney;