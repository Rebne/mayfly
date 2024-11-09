import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessages, setErrorMessages] = useState([]);
  const navigate = useNavigate();

  const isInvalidUsername = () => {
    if (!username || username.length < 3 || username.length > 20) {
      setErrorMessages(prev => [...prev, 'Username must be between 3 and 20 characters']);
      return true;
    }
    return false;
  };

  const isInvalidPassword = () => {
    if (!password || password.length < 3 || password.length > 20) {
      setErrorMessages(prev => [...prev, 'Password must be between 3 and 20 characters']);
      return true;
    }
    return false;
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();
    const hasUsernameError = isInvalidUsername();
    const hasPasswordError = isInvalidPassword();
    if (hasUsernameError || hasPasswordError) {
      return;
    }
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username, password: password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }

      localStorage.setItem('refreshToken', data.refreshToken);
      navigate('/');
    } catch (error) {
      setErrorMessages([error.message]);
      console.error('Login error:', error);
    }
  };

  const handleUsername = (event) => {
    setUsername(event.target.value);
    setErrorMessages([]);
  };

  const handlePassword = (event) => {
    setPassword(event.target.value);
    setErrorMessages([]);
  };

  return (
    <div className="bg-gray-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div className="p-8">
          <div className="flex justify-center">
            <svg
              className="w-10 h-10"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 100 100"
            >
              <circle cx="50" cy="50" r="48" fill="black" />
              <path
                d="M25 25 L35 25 L50 50 L65 25 L75 25 L75 75 L65 75 L65 40 L50 65 L35 40 L35 75 L25 75 Z"
                fill="white"
              />
            </svg>
          </div>
          <form id="noteForm" onSubmit={handleRegisterSubmit} className="mb-6">
            <div className="flex flex-col items-center py-2">
              <input
                type="text"
                name="username"
                value={username}
                onChange={handleUsername}
                className="border-2 border-gray-500 rounded-xl w-1/2 p-2 my-0.5 focus:outline-none focus:border-black focus:border-2"
                required
                placeholder="Enter username"
              />
              <input
                type="password"
                name="password"
                value={password}
                onChange={handlePassword}
                className="border-2 border-gray-500 rounded-xl p-2 w-1/2 my-0.5 focus:outline-none focus:border-black focus:border-2"
                required
                placeholder="Enter password"
              />
              <button
                type="submit"
                className="mt-2 flex-shrink-0 bg-black hover:bg-gray-800 border-black hover:border-gray-800 text-sm border-4 text-white py-1 px-2 rounded"
              >
                Register
              </button>
              <div className="h-6">
                {errorMessages.map((msg) => (
                  <p key={msg} className="error-message text-red-500 mt-2">
                    {msg}
                  </p>
                ))}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
