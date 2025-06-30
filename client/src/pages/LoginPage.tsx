import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const LoginPage = () => {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      if (token === 'agent-token-123') {
        login(token);
        const redirectPath = localStorage.getItem("redirectPath");
        if (redirectPath) {
          localStorage.removeItem("redirectPath");
          navigate(redirectPath);
        } else {
          navigate("/dashboard");
        }
      } else {
        setError("Invalid token. Please try again.");
        toast.error("Login failed: Invalid token.");
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="max-w-sm mx-auto mt-12 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4 text-center">Agent Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Enter token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          disabled={loading}
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </Button>
      </form>
      {error && <p className="text-red-600 mt-2 text-sm">{error}</p>}
      <p className="text-sm text-gray-600 mt-3 text-center">
        Hint: use <code className="bg-gray-100 px-2 py-1 rounded">agent-token-123</code>
      </p>
    </div>
  );
};

export default LoginPage;
