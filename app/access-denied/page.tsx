'use client';

import GradientText from '../components/GradientText';
import './access-denied.css';

export default function AccessDenied() {
    return (
        <main className="access-denied-container">
            <div className="access-denied-card">
                <div className="lock-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        <circle cx="12" cy="16" r="1" />
                    </svg>
                </div>

                <h1>
                    <GradientText
                        colors={['#EF4444', '#DC2626', '#B91C1C', '#EF4444']}
                        animationSpeed={6}
                        showBorder={false}
                    >
                        Access Denied
                    </GradientText>
                </h1>

                <p className="access-denied-message">
                    Unauthorized Department Detected.<br />
                    This system serves a restricted department only.
                </p>

                <p className="access-denied-sub">
                    If you believe this is an error, contact the administrators.
                </p>

                <a href="/" className="back-to-login-btn">
                    ← Back to Login
                </a>
            </div>
        </main>
    );
}
