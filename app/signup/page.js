"use client";
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const { signup, loginWithGoogle } = useAuth();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await signup(email, password);
      router.push("/");
    } catch (err) {
      setError(err.message || "Signup failed.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      router.push("/");
    } catch (err) {
      setError("Google signup failed");
    }
  };

  return (
    <div style={{minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'}}>
      <div className="login-card">
        <div className="login-header-icon">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="8"></circle>
           </svg>
        </div>

        <div style={{textAlign: 'center', marginBottom: '2rem'}}>
            <h1 className="login-title">Create Account</h1>
            <p className="login-subtitle">Join us to start your culinary journey.</p>
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
                    placeholder="Choose a strong password" 
                    value={password} 
                    onChange={e=>setPassword(e.target.value)} 
                    required 
                />
            </div>

            <button type="submit" className="login-btn-primary full-width" style={{marginTop: '1rem'}} disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Sign Up'}
            </button>
        </form>

        <div className="login-divider-container">
            <div className="login-divider-line"></div>
            <span className="login-divider-text">Or</span>
            <div className="login-divider-line"></div>
        </div>

        <button onClick={handleGoogleLogin} className="login-btn-secondary full-width">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" style={{width:'18px'}}/>
            Sign up with Google
        </button>

        <p style={{marginTop: '2rem', textAlign: 'center', color: '#888', fontSize: '0.9rem'}}>
            Already have an account? {' '}
            <Link href="/login" className="auth-link" style={{fontWeight: '600'}}>
               Log In
            </Link>
        </p>

        {error && (
            <div style={{marginTop:'1.5rem', fontWeight:'bold', textAlign:'center', color: '#d9534f'}}>
                {error}
            </div>
        )}
      </div>
    </div>
  );
}
