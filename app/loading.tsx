'use client';

export default function Loading() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #F8F7FC 0%, #EDE9FE 50%, #F5F3FF 100%)',
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
      }} />
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <p style={{ color: '#6B7280', fontWeight: 500 }}>We Won&apos;t SAIL Anymore...</p>
    </div>
  );
}
