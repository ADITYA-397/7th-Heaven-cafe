"use client";
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function LoginModal() {
  const { isLoginOpen, setIsLoginOpen } = useCart();
  const { login, signup, loginWithGoogle } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Authenticating...');
    try {
      if (isRegistering) {
        await signup(email, password);
      } else {
        await login(email, password);
      }
      setStatus('Success!');
      setTimeout(() => { setIsLoginOpen(false); setStatus(''); }, 500);
    } catch (err) {
      console.log(err);
      setStatus(err.message || 'Authentication failed.');
    }
  };

  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
      setIsLoginOpen(false);
    } catch (err) {
      console.log(err);
      setStatus('Google auth failed');
    }
  };

  if (!isLoginOpen) return null;

  return (
    <div className={`modal active`} style={{zIndex: 3000, background: 'rgba(59, 46, 40, 0.4)', backdropFilter: 'blur(8px)'}}>
      <div className="login-card">
        <span className="close-modal" onClick={() => setIsLoginOpen(false)} style={{color:'#666', top: '1.5rem', right: '1.5rem'}}>&times;</span>
        
        <div className="login-header-icon">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="8"></circle>
           </svg>
        </div>

        <div style={{textAlign: 'center', marginBottom: '2rem'}}>
            <h1 className="login-title">{isRegistering ? 'Create Account' : 'Welcome back'}</h1>
            <p className="login-subtitle">
                {isRegistering ? 'Sign up to start your culinary journey.' : 'Enter your credentials to login to your account.'}
            </p>
        </div>

        <form onSubmit={handleSubmit}>
            <div className="login-form-group">
                <label>Email</label>
                <input 
                    type="email" 
                    placeholder="hi@yourcompany.com" 
                    value={email} 
                    onChange={e=>setEmail(e.target.value)} 
                    required 
                />
            </div>
            
            <div className="login-form-group">
                <label>Password</label>
                <input 
                    type="password" 
                    placeholder="Enter your password" 
                    value={password} 
                    onChange={e=>setPassword(e.target.value)} 
                    required 
                />
            </div>

            <div className="login-row-space">
                <label style={{display:'flex', alignItems:'center', margin:0, cursor:'pointer', fontSize: '0.9rem', color: '#888'}}>
                    <input type="checkbox" className="custom-checkbox" style={{width: '16px', height: '16px', marginRight: '0.6rem'}} />
                    Remember me
                </label>
                <span className="auth-link" style={{fontSize: '0.9rem', textDecoration: 'underline'}}>Forgot password?</span>
            </div>

            <button type="submit" className="login-btn-primary full-width">
                {isRegistering ? 'Sign Up' : 'Sign in'}
            </button>
        </form>

        <div className="login-divider-container">
            <div className="login-divider-line"></div>
            <span className="login-divider-text">Or</span>
            <div className="login-divider-line"></div>
        </div>

        <button onClick={handleGoogle} className="login-btn-secondary full-width">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" style={{width:'18px'}}/>
            Login with Google
        </button>

        <p style={{marginTop: '2rem', textAlign: 'center', color: '#888', fontSize: '0.9rem'}}>
            {isRegistering ? 'Already have an account?' : "Don't have an account?"} {' '}
            <span className="auth-link" onClick={() => setIsRegistering(!isRegistering)}>
                {isRegistering ? 'Sign In' : 'Sign Up'}
            </span>
        </p>

        {status && (
            <div style={{marginTop:'1.5rem', fontWeight:'bold', textAlign:'center', color: status.includes('Failed') || status.includes('Invalid') ? '#d9534f' : '#28a745'}}>
                {status}
            </div>
        )}
      </div>
    </div>
  );
}
