import react ,{ useState } from 'react';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleUserSubmit = (event) => {
    event.preventDefault();
    const response = fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({username: username, password: password}),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Login failed');
        }
        return response.json();
    })
    .then(data => {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        window.location.href = '/';
    })
    .catch(error => {
        setErrorMessage('Invalid username or password');
        console.error('Login error:', error);
    });
  }

  const handleUsername = (event) => {
    setUsername(event.target.value);
    setErrorMessage('');
  };
  
  const handlePassword = (event) => {
    setPassword(event.target.value);
    setErrorMessage('');
  }

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
          <form id="noteForm" onSubmit={handleFormSubmit} className="mb-6">
            <div className="flex items-center border-b border-gray-300 py-2">
              <input
                type="text"
                name="content"
                ref={noteInputRef}
                value={content}
                onChange={handleInputChange}
                required
                className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
                placeholder="Type your note and press Enter"
                autoComplete="off"
              />
            </div>
          </form>
          <ul className="space-y-2">
            {notes.map((note, index) => (
              <li key={index} className="bg-gray-50 rounded p-3 shadow">
                {note.content}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
