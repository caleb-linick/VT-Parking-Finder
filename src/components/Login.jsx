/**
 * Login.jsx
 * 
 * This component handles user authentication, allowing users to either
 * log in to an existing account or sign up for a new account.
 * 
 * Features:
 * - Toggle between login and signup modes
 * - Form validation for both modes
 * - Error messaging for form validation
 * - Authentication state management using localStorage
 * - Redirection after successful authentication
 * - Information about the benefits of creating an account
 * 
 * @author VT Parking Finder Team
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';

/**
 * Component that handles user authentication
 * 
 * @returns {JSX.Element} The rendered login/signup form
 */
const Login = () => {
  // State for form management
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and signup modes
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Hook for programmatic navigation
  const navigate = useNavigate();

  /**
   * Handle form submission for both login and signup
   * 
   * @param {Event} e - The form submission event
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    setError(''); // Clear any previous errors

    // Basic form validation
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    // Mock API call - in production, this would be a real backend request
    setTimeout(() => {
      if (isLogin) {
        // Login flow
        console.log(`Logging in user: ${username}`);
        
        // Mock successful login - in production, this would validate credentials
        localStorage.setItem('user', JSON.stringify({ 
          username, 
          favorites: [1, 3] // Sample favorite parking lots
        }));
        
        // Redirect to home page after login
        navigate('/');
      } else {
        // Signup flow
        console.log(`Signing up user: ${username}`);
        
        // Mock successful signup - in production, this would create a new user
        localStorage.setItem('user', JSON.stringify({ 
          username, 
          favorites: [] // New users start with no favorites
        }));
        
        // Redirect to home page after signup
        navigate('/');
      }
    }, 1000); // Simulate network delay
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
              />
            </div>
            
            <button type="submit" style={styles.submitButton}>
              {isLogin ? 'Login' : 'Sign Up'}
            </button>
          </form>
          
          {/* Informational text based on current mode */}
          <div style={styles.infoText}>
            {isLogin ? (
              <p>After login, you will be able to see your favorite parking spots and quickly access information about them.</p>
            ) : (
              <p>Sign up to save your favorite parking spots and get personalized parking recommendations based on your usage patterns.</p>
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