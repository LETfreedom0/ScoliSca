'use client';

export default function HomePage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        🏥 ScoliSca API
      </h1>
      <p style={{ fontSize: '1.5rem', opacity: 0.9, marginBottom: '2rem' }}>
        脊柱筛查分析系统
      </p>
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        padding: '2rem 3rem',
        borderRadius: '1rem',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
          ✅ API 服务已启动
        </p>
        <p style={{ fontSize: '1rem', opacity: 0.8 }}>
          域名配置成功！
        </p>
      </div>
      <div style={{ marginTop: '2rem', fontSize: '0.9rem', opacity: 0.7 }}>
        <p>管理后台: <a href="/admin" style={{ color: 'white', textDecoration: 'underline' }}>/admin</a></p>
        <p style={{ marginTop: '0.5rem' }}>状态检查: <a href="/api/diagnose" style={{ color: 'white', textDecoration: 'underline' }}>/api/diagnose</a></p>
      </div>
    </div>
  );
}
