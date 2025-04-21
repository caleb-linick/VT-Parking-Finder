/**
 * Login.jsx
 * 
 * Enhanced login component with backend integration.
 * Handles user authentication with the Flask backend.
 * 
 * Features:
 * - Toggle between login and signup modes
 * - Form validation for both modes
 * - Error messaging for form validation and server responses
 * - Backend authentication via API calls
 * - Authentication state management using localStorage
 * - Redirection after successful authentication
 * 
 * @author VT Parking Finder Team
 * @version 1.2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import axios from 'axios';

/**
 * Component that handles user authentication with JWT implementation
 * 
 * @returns {JSX.Element} The rendered login/signup form
 */
const Login = () => {
  // State for form management
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and signup modes
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [car, setCar] = useState(''); // Added car information field
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Hook for programmatic navigation
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/'); // Redirect to home if already logged in
    }
  }, [navigate]);

  /**
   * Save user auth data to localStorage
   * 
   * @param {Object} data - User authentication data including JWT token
   */
  const saveAuthData = (data) => {
    // Save token
    localStorage.setItem('token', data.token);
    
    // Save user data
    localStorage.setItem('user', JSON.stringify({
      id: data.user_id,
      username: data.username,
      car: data.car || '',
      favorites: []
    }));
  };

  /**
   * Handle form submission for both login and signup with JWT authentication
   * 
   * @param {Event} e - The form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear any previous errors
    setIsLoading(true);

    // Basic form validation
    if (!username || !password) {
      setError('Please enter both username and password');
      setIsLoading(false);
      return;
    }

    // Additional validation for signup mode
    if (!isLogin && !car) {
      setError('Please enter your car information for signup');
      setIsLoading(false);
      return;
    }

    try {
      if (isLogin) {
        // Login flow - Call backend API
        const response = await axios.post('/login', {
          username,
          password
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        // Handle successful login - save JWT token
        saveAuthData(response.data);
        
        // Redirect to home page after login
        navigate('/');
      } else {
        // Signup flow - Call backend API
        const response = await axios.post('/signup', {
          username,
          password
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        // Save auth data including token
        saveAuthData(response.data);
        
        // After signup, update car information if provided
        if (car) {
          await axios.put('/car', JSON.stringify({
            model: car
          }), {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${response.data.token}`
            }
          });
          
          // Update car info in localStorage
          const userData = JSON.parse(localStorage.getItem('user'));
          userData.car = car;
          localStorage.setItem('user', JSON.stringify(userData));
        }
        
        // Redirect to home page after signup
        navigate('/');
      }
    } catch (error) {
      // Handle authentication errors
      console.error('Authentication error:', error);
      if (error.response) {
        setError(error.response.data || 'Authentication failed. Please try again.');
      } else {
        setError('Server error. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <Header />
      <main style={styles.main}>
        <div style={styles.loginContainer}>
          {/* Dynamic heading based on current mode */}
          <h2 style={styles.heading}>
            {isLogin ? 'Login to Your Account' : 'Create an Account'}
          </h2>
          
          {/* Tab navigation between login and signup */}
          <div style={styles.tabsContainer}>
            <button 
              style={{
                ...styles.tabButton,
                ...(isLogin ? styles.activeTab : {})
              }}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button 
              style={{
                ...styles.tabButton,
                ...(!isLogin ? styles.activeTab : {})
              }}
              onClick={() => setIsLogin(false)}
            >
              Sign Up
            </button>
          </div>
          
          {/* Error message display */}
          {error && <div style={styles.errorMessage}>{error}</div>}
          
          {/* Authentication form */}
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label htmlFor="username" style={styles.label}>Username</label>
              <input
                type="text"
                id="username"
                style={styles.input}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <div style={styles.formGroup}>
              <label htmlFor="password" style={styles.label}>Password</label>
              <input
                type="password"
                id="password"
                style={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            {/* Car information field (only shown for signup) */}
            {!isLogin && (
              <div style={styles.formGroup}>
                <label htmlFor="car" style={styles.label}>Car Information</label>
                <input
                  type="text"
                  id="car"
                  style={styles.input}
                  value={car}
                  onChange={(e) => setCar(e.target.value)}
                  placeholder="e.g., 2021 Honda Civic (Silver)"
                  disabled={isLoading}
                />
              </div>
            )}
            
            <button 
              type="submit" 
              style={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
            </button>
          </form>
          
          {/* Informational text based on current mode */}
          <div style={styles.infoText}>
            {isLogin ? (
              <p>After login, you will be able to see your favorite parking spots and quickly access information about them.</p>
            ) : (
              <p>Sign up to save your favorite parking spots, register your car information, and get personalized parking recommendations.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

/**
 * Component styles
 */
const styles = {
  container: {
    backgroundColor: '#800000', // VT Maroon
    minHeight: '100vh',
    margin: 0,
    padding: 0,
    color: '#FFFFFF',
    fontFamily: 'Arial, sans-serif',
  },
  main: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px 20px',
  },
  loginContainer: {
    backgroundColor: '#EEEEEE',
    borderRadius: '8px',
    padding: '30px',
    width: '100%',
    maxWidth: '500px',
    color: '#333333',
  },
  heading: {
    textAlign: 'center',
    marginTop: 0,
    marginBottom: '20px',
  },
  tabsContainer: {
    display: 'flex',
    marginBottom: '20px',
  },
  tabButton: {
    flex: 1,
    padding: '10px',
    border: 'none',
    background: '#DDDDDD',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background-color 0.3s',
  },
  activeTab: {
    backgroundColor: '#990000', // Lighter maroon
    color: 'white',
  },
  errorMessage: {
    backgroundColor: '#FFDDDD', // Light red for errors
    color: '#DD0000', // Dark red text
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '15px',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  formGroup: {
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #CCCCCC',
    borderRadius: '4px',
    fontSize: '16px',
  },
  submitButton: {
    padding: '12px',
    backgroundColor: '#800000', // VT Maroon
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'background-color 0.3s',
  },
  infoText: {
    marginTop: '20px',
    padding: '15px',
    backgroundColor: '#FFFFFF',
    borderRadius: '4px',
    fontSize: '14px',
  },
};

export default Login;