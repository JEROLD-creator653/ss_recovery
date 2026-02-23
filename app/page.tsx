'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import './page.css';

async function getOTP(rollNumber: string): Promise<string | number> {
  try {
    const res = await fetch('/api/otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roll_number: rollNumber }),
    });
    const data = await res.json();
    if (data.success) {
      return data.otp_send_to;
    }
    return -1;
  } catch (error) {
    console.error('Error getting OTP:', error);
    return -1;
  }
}

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [hasSelectedMethod, setHasSelectedMethod] = useState(false);

  const handleMethodSelection = async (method: 'otp' | 'password') => {
    setIsOtpMode(method === 'otp');
    
    if (method === 'otp') {
      const username = (document.getElementById('username') as HTMLInputElement)?.value;
      if (username) {
        const result = await getOTP(username);
        if (result !== -1) {
          alert(`OTP sent to: ${result}`);
        } else {
          alert('Failed to send OTP. Please try again.');
          return;
        }
      }
    }
    
    setHasSelectedMethod(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const username = (document.getElementById('username') as HTMLInputElement)?.value;
    const password = isOtpMode
      ? (document.getElementById('otp') as HTMLInputElement)?.value
      : (document.getElementById('password') as HTMLInputElement)?.value;

    try {
      // Authenticate directly via Edwisely getUserDetails (RSA-encrypted)
      const paramName = isOtpMode ? 'otp' : 'password';
      const detailsRes = await fetch(
        `/api/user-details?roll_number=${encodeURIComponent(username!)}&${paramName}=${encodeURIComponent(password!)}`
      );
      const detailsData = await detailsRes.json();

      if (detailsData.success && detailsData.user) {
        const user = detailsData.user;
        sessionStorage.setItem('user', JSON.stringify(user));
        sessionStorage.setItem('token', user.token);
        sessionStorage.setItem('edwiselyToken', user.token);
        setIsLoading(false);
        router.push('/dashboard');
      } else {
        setIsLoading(false);
        alert(detailsData.message || 'Invalid credentials');
      }
    } catch (error) {
      if (isLoading) setIsLoading(false);
      alert('An error occurred. Please try again.');
      console.error('Authentication error:', error);
    }
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#080710',
        color: '#ffffff',
        fontFamily: 'Poppins, sans-serif',
        fontSize: '24px',
        flexDirection: 'column',
        gap: '20px',
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '5px solid rgba(255, 255, 255, 0.3)',
          borderTop: '5px solid #ffffff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="background">
      <div>
        <div className="shape"></div>
        <div className="shape"></div>
      </div>
      <form onSubmit={handleSubmit}>
        <h3>SAIL Login</h3>

        <label htmlFor="username">Username</label>
        <input
          type="text"
          placeholder="SEC ID"
          id="username"
          name="user"
          required
          suppressHydrationWarning
        />

        {hasSelectedMethod ? (
          isOtpMode ? (
            <>
              <label htmlFor="otp">OTP</label>
              <input
                type="text"
                placeholder="Enter OTP"
                id="otp"
                name="otp"
                required
                suppressHydrationWarning
              />
            </>
          ) : (
            <>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                placeholder="Password"
                id="password"
                name="password"
                required
                suppressHydrationWarning
              />
            </>
          )
        ) : (
          <>
            <button
              type="button"
              onClick={() => handleMethodSelection('otp')}
            >
              Log in using OTP
            </button>
            <button
              type="button"
              onClick={() => handleMethodSelection('password')}
            >
              Log in using Password
            </button>
          </>
        )}

        {hasSelectedMethod && (
          <button type="submit" id="sendData">
            Log In
          </button>
        )}
      </form>

      <footer className="site-footer">
        <p className="footer-tagline">&ldquo;A product of what happens when students are pushed beyond tolerance.&rdquo;</p>
        <p className="footer-credit">Built with hatred against SAIL &mdash; by <strong>Jerry</strong> &amp; <strong>N71.h5</strong></p>
      </footer>
    </div>
  );
}
