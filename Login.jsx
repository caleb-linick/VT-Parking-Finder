import React from 'react';
import Header from './Header';

const Login = () => {
  return (
    <div style={{ backgroundColor: '#800000', minHeight: '100vh', color: '#FFFFFF', fontFamily: 'Arial, sans-serif' }}>
      <Header />
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Login</h2>
        <p>Login form will go here.</p>
      </div>
    </div>
  );
};

export default Login;
