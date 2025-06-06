import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import { SendIcon, History, PlusCircle } from 'lucide-react';

interface DashboardProps {
  username: string;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ username, onLogout }) => {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      const email = localStorage.getItem('email');

      if (!email) {
        setError('You are not logged in. Please log in again.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://127.0.0.1:8000/api/v1/accounts/get-balance/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: email }), // Send email as part of the request body
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch balance: ${response.status}`);
        }

        const data = await response.json();
        setBalance(data.balance);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar username={username} onLogout={onLogout} />

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Welcome back, {username}</h2>
              <p className="text-gray-600">Pamomo-Dashboard</p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="bg-[#8928A4] text-white px-6 py-4 rounded-lg">
                <p className="text-sm">Available Balance</p>
                {loading ? (
                  <p className="text-lg">Loading...</p>
                ) : error ? (
                  <p className="text-lg text-red-500">{error}</p>
                ) : (
                  <p className="text-3xl font-bold">MK {balance?.toLocaleString()}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Link to="/deposit" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <PlusCircle className="h-6 w-6 text-[#8928A4]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Deposit Money</h3>
                <p className="text-gray-600">Add funds for users</p>
              </div>
            </div>
          </Link>

          <Link to="/send" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <SendIcon className="h-6 w-6 text-[#8928A4]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Send Money</h3>
                <p className="text-gray-600">Transfer to anyone</p>
              </div>
            </div>
          </Link>

          <Link to="/withdraw" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <h1 className="text-[#8928A4]"><b>MK</b></h1>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Withdraw Money</h3>
                <p className="text-gray-600">Cash out funds</p>
              </div>
            </div>
          </Link>

          <Link to="/history" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <History className="h-6 w-6 text-[#8928A4]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Transaction History</h3>
                <p className="text-gray-600">View all transactions</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Your Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card cardNumber="**** **** **** 1234" cardHolder={username} expiryDate="12/28" type="Platinum" />
            <Card cardNumber="**** **** **** 5678" cardHolder={username} expiryDate="09/27" type="Gold" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

