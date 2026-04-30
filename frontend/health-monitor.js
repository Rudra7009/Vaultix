const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = 3002;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Mock Supabase configuration check
const checkSupabaseConfig = () => {
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
  
  return {
    configured: !!(supabaseUrl && supabaseKey && 
                  supabaseUrl !== 'your_supabase_project_url' && 
                  supabaseKey !== 'your_supabase_anon_key'),
    url: supabaseUrl,
    keyPresent: !!supabaseKey,
    isPlaceholder: supabaseUrl === 'your_supabase_project_url' || 
                   supabaseKey === 'your_supabase_anon_key'
  };
};

// Check frontend server
const checkFrontendServer = async () => {
  try {
    const response = await axios.get('http://localhost:3001', { timeout: 5000 });
    return {
      status: 'running',
      statusCode: response.status,
      url: 'http://localhost:3001'
    };
  } catch (error) {
    return {
      status: 'not_running',
      error: error.message,
      url: 'http://localhost:3001'
    };
  }
};

// Mock API endpoint checks (these will fail without real Supabase credentials)
const checkMockEndpoints = () => {
  const supabaseConfig = checkSupabaseConfig();
  
  return {
    supabase: {
      status: supabaseConfig.configured ? 'configured' : 'not_configured',
      details: supabaseConfig
    },
    endpoints: [
      {
        name: 'Authentication',
        status: supabaseConfig.configured ? 'ready' : 'blocked',
        issue: supabaseConfig.configured ? null : 'Missing Supabase credentials'
      },
      {
        name: 'Database Tables',
        status: supabaseConfig.configured ? 'ready' : 'blocked',
        issue: supabaseConfig.configured ? null : 'Cannot connect to Supabase'
      },
      {
        name: 'File Storage',
        status: supabaseConfig.configured ? 'ready' : 'blocked',
        issue: supabaseConfig.configured ? null : 'Supabase storage not configured'
      }
    ]
  };
};

app.get('/health', async (req, res) => {
  const frontendStatus = await checkFrontendServer();
  const supabaseStatus = checkSupabaseConfig();
  const endpoints = checkMockEndpoints();
  
  const overallStatus = supabaseStatus.configured ? 'healthy' : 'degraded';
  
  res.json({
    timestamp: new Date().toISOString(),
    status: overallStatus,
    services: {
      frontend: frontendStatus,
      supabase: {
        configured: supabaseStatus.configured,
        url: supabaseStatus.url ? 'Set' : 'Not set',
        key: supabaseStatus.keyPresent ? 'Present' : 'Missing',
        isPlaceholder: supabaseStatus.isPlaceholder
      }
    },
    endpoints: endpoints.endpoints,
    issues: supabaseStatus.configured ? [] : [
      {
        severity: 'high',
        component: 'supabase',
        message: 'Supabase credentials not configured',
        fix: 'Update REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in .env.local'
      }
    ],
    recommendations: [
      supabaseStatus.configured ? 
        'All systems configured. Ready for testing.' :
        'Configure Supabase credentials to enable full functionality.'
    ]
  });
});

app.get('/debug', (req, res) => {
  const envVars = {
    REACT_APP_SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL,
    REACT_APP_SUPABASE_ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY ? 
      (process.env.REACT_APP_SUPABASE_ANON_KEY.length > 10 ? 
        `${process.env.REACT_APP_SUPABASE_ANON_KEY.substring(0, 10)}...` : 
        'Too short') : 
      'Not set',
    NODE_ENV: process.env.NODE_ENV
  };
  
  res.json({
    environment: envVars,
    process: {
      cwd: process.cwd(),
      platform: process.platform,
      nodeVersion: process.version
    },
    instructions: {
      fix_supabase: 'Get credentials from Supabase dashboard → Project Settings → API',
      update_env: 'Update frontend/.env.local with real values',
      test: 'Restart frontend server after updating environment variables'
    }
  });
});

app.get('/test-login', (req, res) => {
  const seededUsers = [
    { email: 'admin@vaultix.com', password: 'Vaultix@123', role: 'ADMIN' },
    { email: 'manager@vaultix.com', password: 'Vaultix@123', role: 'MANAGER' },
    { email: 'clerk@vaultix.com', password: 'Vaultix@123', role: 'INVENTORY_CLERK' },
    { email: 'tech@vaultix.com', password: 'Vaultix@123', role: 'TECHNICIAN' },
    { email: 'auditor@vaultix.com', password: 'Vaultix@123', role: 'AUDITOR' }
  ];
  
  res.json({
    test_users: seededUsers,
    login_url: 'http://localhost:3001/login',
    note: 'These users are seeded in supabase/seed.sql. Use them for testing once Supabase is configured.'
  });
});

app.listen(PORT, () => {
  console.log(`Health monitor running on http://localhost:${PORT}`);
  console.log(`Endpoints:`);
  console.log(`  http://localhost:${PORT}/health - System health status`);
  console.log(`  http://localhost:${PORT}/debug - Environment debug info`);
  console.log(`  http://localhost:${PORT}/test-login - Test user credentials`);
  console.log(`\nFrontend running on http://localhost:3001`);
  console.log(`\n⚠️  IMPORTANT: Supabase credentials need to be configured`);
  console.log(`   Update frontend/.env.local with real Supabase values`);
});

// HTML Dashboard
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vaultix Health Monitor</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .header {
      background: white;
      border-radius: 12px;
      padding: 30px;
      margin-bottom: 20px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .header h1 {
      color: #2d3748;
      font-size: 32px;
      margin-bottom: 10px;
    }
    .header p {
      color: #718096;
      font-size: 16px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }
    .card {
      background: white;
      border-radius: 12px;
      padding: 25px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .card h2 {
      color: #2d3748;
      font-size: 20px;
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .status-healthy { background: #c6f6d5; color: #22543d; }
    .status-degraded { background: #feebc8; color: #7c2d12; }
    .status-down { background: #fed7d7; color: #742a2a; }
    .status-running { background: #bee3f8; color: #2c5282; }
    .endpoint-list {
      list-style: none;
      margin-top: 15px;
    }
    .endpoint-item {
      padding: 12px;
      background: #f7fafc;
      border-radius: 8px;
      margin-bottom: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .endpoint-name {
      font-weight: 500;
      color: #2d3748;
    }
    .endpoint-status {
      font-size: 12px;
      padding: 4px 8px;
      border-radius: 4px;
    }
    .status-ready { background: #c6f6d5; color: #22543d; }
    .status-blocked { background: #fed7d7; color: #742a2a; }
    .issue-box {
      background: #fff5f5;
      border-left: 4px solid #fc8181;
      padding: 15px;
      border-radius: 8px;
      margin-top: 15px;
    }
    .issue-title {
      font-weight: 600;
      color: #742a2a;
      margin-bottom: 8px;
    }
    .issue-text {
      color: #742a2a;
      font-size: 14px;
      line-height: 1.6;
    }
    .test-users {
      background: #f7fafc;
      border-radius: 8px;
      padding: 15px;
      margin-top: 15px;
    }
    .test-user {
      display: flex;
      justify-content: space-between;
      padding: 10px;
      border-bottom: 1px solid #e2e8f0;
    }
    .test-user:last-child { border-bottom: none; }
    .user-email { font-weight: 500; color: #2d3748; }
    .user-role { 
      font-size: 12px;
      padding: 4px 8px;
      background: #e6fffa;
      color: #234e52;
      border-radius: 4px;
    }
    .refresh-btn {
      background: #667eea;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }
    .refresh-btn:hover {
      background: #5a67d8;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
    .timestamp {
      color: #a0aec0;
      font-size: 14px;
      margin-top: 10px;
    }
    .link-btn {
      display: inline-block;
      padding: 8px 16px;
      background: #edf2f7;
      color: #2d3748;
      text-decoration: none;
      border-radius: 6px;
      font-size: 14px;
      margin-right: 10px;
      margin-top: 10px;
      transition: all 0.2s;
    }
    .link-btn:hover {
      background: #e2e8f0;
      transform: translateY(-1px);
    }
    .loading {
      text-align: center;
      padding: 40px;
      color: #718096;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏥 Vaultix Health Monitor</h1>
      <p>Real-time system health and API monitoring dashboard</p>
      <div style="margin-top: 15px;">
        <button class="refresh-btn" onclick="loadHealth()">🔄 Refresh Status</button>
        <a href="/health" class="link-btn" target="_blank">📊 JSON Health</a>
        <a href="/debug" class="link-btn" target="_blank">🐛 Debug Info</a>
        <a href="/test-login" class="link-btn" target="_blank">👤 Test Users</a>
        <a href="http://localhost:3001" class="link-btn" target="_blank">🚀 Open Frontend</a>
      </div>
    </div>

    <div id="content" class="loading">Loading health data...</div>
  </div>

  <script>
    async function loadHealth() {
      const content = document.getElementById('content');
      content.innerHTML = '<div class="loading">Loading health data...</div>';
      
      try {
        const [healthRes, testUsersRes] = await Promise.all([
          fetch('/health'),
          fetch('/test-login')
        ]);
        
        const health = await healthRes.json();
        const testUsers = await testUsersRes.json();
        
        const overallStatus = health.status === 'healthy' ? 'healthy' : 
                             health.status === 'degraded' ? 'degraded' : 'down';
        
        content.innerHTML = \`
          <div class="grid">
            <div class="card">
              <h2>
                \${overallStatus === 'healthy' ? '✅' : overallStatus === 'degraded' ? '⚠️' : '❌'}
                Overall Status
              </h2>
              <span class="status-badge status-\${overallStatus}">\${health.status}</span>
              <p class="timestamp">Last checked: \${new Date(health.timestamp).toLocaleString()}</p>
            </div>

            <div class="card">
              <h2>🖥️ Frontend Server</h2>
              <span class="status-badge status-\${health.services.frontend.status === 'running' ? 'running' : 'down'}">
                \${health.services.frontend.status}
              </span>
              <p style="margin-top: 10px; color: #718096; font-size: 14px;">
                URL: <a href="\${health.services.frontend.url}" target="_blank" style="color: #667eea;">\${health.services.frontend.url}</a>
              </p>
            </div>

            <div class="card">
              <h2>🗄️ Supabase</h2>
              <span class="status-badge status-\${health.services.supabase.configured ? 'healthy' : 'degraded'}">
                \${health.services.supabase.configured ? 'Configured' : 'Not Configured'}
              </span>
              <div style="margin-top: 15px; font-size: 14px; color: #718096;">
                <div style="margin-bottom: 8px;">URL: <strong>\${health.services.supabase.url}</strong></div>
                <div style="margin-bottom: 8px;">Key: <strong>\${health.services.supabase.key}</strong></div>
                <div>Placeholder: <strong>\${health.services.supabase.isPlaceholder ? 'Yes ⚠️' : 'No ✅'}</strong></div>
              </div>
            </div>
          </div>

          <div class="card">
            <h2>🔌 API Endpoints</h2>
            <ul class="endpoint-list">
              \${health.endpoints.map(ep => \`
                <li class="endpoint-item">
                  <span class="endpoint-name">\${ep.name}</span>
                  <span class="endpoint-status status-\${ep.status}">\${ep.status}</span>
                </li>
                \${ep.issue ? \`<div style="font-size: 12px; color: #e53e3e; margin-top: 5px;">⚠️ \${ep.issue}</div>\` : ''}
              \`).join('')}
            </ul>
          </div>

          \${health.issues.length > 0 ? \`
            <div class="card">
              <h2>⚠️ Issues Detected</h2>
              \${health.issues.map(issue => \`
                <div class="issue-box">
                  <div class="issue-title">🔴 \${issue.severity.toUpperCase()}: \${issue.component}</div>
                  <div class="issue-text">
                    <strong>Problem:</strong> \${issue.message}<br>
                    <strong>Fix:</strong> \${issue.fix}
                  </div>
                </div>
              \`).join('')}
            </div>
          \` : ''}

          <div class="card">
            <h2>👥 Test User Credentials</h2>
            <p style="color: #718096; font-size: 14px; margin-bottom: 15px;">
              Use these credentials to test login functionality (after configuring Supabase)
            </p>
            <div class="test-users">
              \${testUsers.test_users.map(user => \`
                <div class="test-user">
                  <div>
                    <div class="user-email">\${user.email}</div>
                    <div style="font-size: 12px; color: #718096; margin-top: 4px;">Password: \${user.password}</div>
                  </div>
                  <span class="user-role">\${user.role}</span>
                </div>
              \`).join('')}
            </div>
          </div>

          <div class="card">
            <h2>💡 Recommendations</h2>
            <ul style="list-style: none; padding: 0;">
              \${health.recommendations.map(rec => \`
                <li style="padding: 10px; background: #f7fafc; border-radius: 6px; margin-bottom: 8px; color: #2d3748;">
                  💡 \${rec}
                </li>
              \`).join('')}
            </ul>
          </div>
        \`;
      } catch (error) {
        content.innerHTML = \`
          <div class="card">
            <h2>❌ Error Loading Health Data</h2>
            <div class="issue-box">
              <div class="issue-text">\${error.message}</div>
            </div>
          </div>
        \`;
      }
    }

    // Auto-refresh every 30 seconds
    setInterval(loadHealth, 30000);
    
    // Initial load
    loadHealth();
  </script>
</body>
</html>
  `);
});