import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {Navigate, createBrowserRouter, RouterProvider} from 'react-router-dom';
import PageNotFound from './pages/PageNotFound.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import './index.css';

const ProtectedRoute = ({ children}) => {
  const isAuthenticated = localStorage.getItem('token');
  if (!isAuthenticated) {
    //if no replace user would loop back to login when trying to access previous page
    return <Navigate to='/login' replace />
  }
  return children;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    )
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '*',
    element: <PageNotFound/>,
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);