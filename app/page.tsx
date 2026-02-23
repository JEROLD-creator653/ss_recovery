'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import GradientText from './components/GradientText';
import './page.css';

// Lazy load heavy components
const AlertPopup = dynamic(() => import('./components/AlertPopup'), { ssr: false });
const Background = dynamic(() => import('./components/Background'), { ssr: false });
const DecryptedText = dynamic(() => import('./components/DecryptedText'), { ssr: false });

async function getOTP(rollNumber: string, signal?: AbortSignal): Promise<{ success: boolean; message?: string; otpSendTo?: string }> {
  try {
    const res = await fetch('/api/otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roll_number: rollNumber }),
      signal,
    });
    const data = await res.json();
    if (data.success) {
      return { success: true, otpSendTo: data.otp_send_to };
    }
    return { success: false, message: data.message };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return { success: false, message: 'Request cancelled.' };
    }
    console.error('Error getting OTP:', error);
    return { success: false, message: 'Failed to send OTP. Please try again.' };
  }
}

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [hasSelectedMethod, setHasSelectedMethod] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ title: string; message: string; type: 'error' | 'success' | 'warning' | 'info'; size?: 'normal' | 'large' } | null>(null);

  const handleMethodSelection = async (method: 'otp' | 'password') => {
    setIsOtpMode(method === 'otp');
    
    if (method === 'otp') {
      const username = (document.getElementById('username') as HTMLInputElement)?.value;
      if (username) {
        const result = await getOTP(username);
        if (result.success) {
          setAlertMessage({
            title: 'OTP Sent',
            message: `OTP has been sent to: ${result.otpSendTo || 'your registered contact'}`,
            type: 'success',
          });
        } else {
          setAlertMessage({
            title: ' Access Denied',
            message: '\t\t\t\t\tUnauthorized Department Detected \n\t\t\t\t    This system serves a higher department.',
            type: 'error',
            size: 'large',
          });
          return;
        }
      }
    }
    
    setHasSelectedMethod(true);
  };

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const controller = new AbortController();
    const username = (document.getElementById('username') as HTMLInputElement)?.value;
    const password = isOtpMode
      ? (document.getElementById('otp') as HTMLInputElement)?.value
      : (document.getElementById('password') as HTMLInputElement)?.value;

    try {
      const paramName = isOtpMode ? 'otp' : 'password';
      const detailsRes = await fetch(
        `/api/user-details?roll_number=${encodeURIComponent(username!)}&${paramName}=${encodeURIComponent(password!)}`,
        { signal: controller.signal }
      );
      const detailsData = await detailsRes.json();

      if (detailsData.success && detailsData.user) {
        const user = detailsData.user;
        sessionStorage.setItem('user', JSON.stringify(user));
        sessionStorage.setItem('token', user.token);
        sessionStorage.setItem('edwiselyToken', user.token);
        setIsLoading(false);
        setAlertMessage({
          title: 'Success',
          message: 'Login successful! Redirecting...',
          type: 'success',
        });
        setTimeout(() => router.push('/dashboard'), 1500);
      } else {
        setIsLoading(false);
        
        if (detailsData.regNo) {
          setAlertMessage({
            title: ' Access Denied',
            message: '\t\t\t\t\tUnauthorized Department Detected \n\t\t\t\t    This system serves a higher department.',
            type: 'error',
            size: 'large',
          });
        } else {
          setAlertMessage({
            title: 'Authentication Failed',
            message: detailsData.message || 'Invalid credentials. Please try again.',
            type: 'error',
            size: 'large',
          });
        }
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setIsLoading(false);
      setAlertMessage({
        title: 'Error',
        message: 'An unexpected error occurred. Please check your connection and try again.',
        type: 'error',
        size: 'large',
      });
      console.error('Authentication error:', error);
    }
  }, [isOtpMode, router]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'transparent',
        color: '#1E1B4B',
        fontFamily: 'Poppins, sans-serif',
        fontSize: '20px',
        flexDirection: 'column',
        gap: '20px',
      }}>
        <div style={{
          width: '44px',
          height: '44px',
          border: '4px solid #DDD6FE',
          borderTop: '4px solid #7C5CFC',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} role="status" aria-label="Loading" />
        <p style={{ color: '#6B7280', fontWeight: 500 }}>Loading...</p>
      </div>
    );
  }

  return (
    <main className="background" role="main">
      <Background />

      <form className="login-form" onSubmit={handleSubmit} aria-label="Login form">
        <h3>
          <GradientText
            colors={['#3B0DBF', '#8B00C4', '#D400FF', '#6A00A8']}
            animationSpeed={8}
            showBorder={false}
          >
            SAIL Slayer Login
          </GradientText>
        </h3>

        <label htmlFor="username">Registration Number</label>
        <input
          type="text"
          placeholder="Reg No"
          id="username"
          name="user"
          required
          autoComplete="username"
          aria-required="true"
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
                autoComplete="one-time-code"
                aria-required="true"
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
                autoComplete="current-password"
                aria-required="true"
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

      <footer className="login-footer">
        <p className="login-footer-tagline">
          &ldquo;<DecryptedText
            text="A product of what happens when students are pushed beyond tolerance."
            animateOn="view"
            speed={40}
            maxIterations={12}
            sequential={true}
          />&rdquo;
        </p>
        <p className="login-footer-credit">Built with hatred against SAIL &mdash; by <strong><GradientText colors={['#3B0DBF', '#8B00C4', '#D400FF', '#6A00A8']} animationSpeed={6} showBorder={false}>Jerry</GradientText></strong> &amp; <strong><GradientText colors={['#3B0DBF', '#8B00C4', '#D400FF', '#6A00A8']} animationSpeed={6} showBorder={false}>N71.h5</GradientText></strong></p>
      </footer>

      {alertMessage && (
        <AlertPopup
          title={alertMessage.title}
          message={alertMessage.message}
          type={alertMessage.type}
          size={alertMessage.size}
          onClose={() => setAlertMessage(null)}
        />
      )}
    </main>
  );
}
