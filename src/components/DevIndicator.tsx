'use client';

/**
 * Development indicator that shows which database you're connected to.
 * Only visible in development mode.
 * 
 * Shows:
 * - 🟢 Local DB - Connected to local Supabase (http://127.0.0.1:55321)
 * - 🔵 Cloud DB - Connected to cloud Supabase (https://[project].supabase.co)
 */
export function DevIndicator() {
  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const isLocal = supabaseUrl.includes('127.0.0.1') || supabaseUrl.includes('localhost');
  
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: 'bold',
        zIndex: 9999,
        // Better contrast: dark green/blue backgrounds with white text meet WCAG AA
        backgroundColor: isLocal ? '#059669' : '#2563eb',
        color: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        cursor: 'pointer',
        transition: 'opacity 0.2s',
      }}
      onClick={() => {
        console.log('%c DATABASE INFO', 'font-size: 16px; font-weight: bold;');
        console.log('Type:', isLocal ? '🟢 LOCAL SUPABASE' : '🔵 CLOUD SUPABASE');
        console.log('URL:', supabaseUrl);
        console.log('Studio:', isLocal ? 'http://127.0.0.1:55323' : 'https://app.supabase.com');
      }}
      title={`Click to see details in console\n\nURL: ${supabaseUrl}`}
      role="status"
      aria-label={isLocal ? 'Using local database' : 'Using cloud database'}
    >
      {isLocal ? '🟢 Local DB' : '🔵 Cloud DB'}
    </div>
  );
}
