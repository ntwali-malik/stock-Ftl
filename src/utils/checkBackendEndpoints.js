// Utility to check which backend endpoints are available
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const checkBackendEndpoints = async () => {
  console.log('🔍 Checking backend endpoints...');
  console.log('Base URL:', API_BASE_URL);
  
  const endpoints = [
    '/auth/me',
    '/products',
    '/categories',
    '/clients',
    '/stock'
  ];
  
  const results = {};
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\nChecking ${endpoint}...`);
      const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
        method: 'GET',
        credentials: 'include'
      });
      
      results[endpoint] = {
        status: response.status,
        ok: response.ok,
        contentType: response.headers.get('content-type')
      };
      
      console.log(`✅ ${endpoint}: ${response.status} ${response.ok ? 'OK' : 'ERROR'}`);
      
      if (response.ok) {
        try {
          const data = await response.json();
          console.log(`   Data:`, data);
        } catch (e) {
          console.log(`   Non-JSON response`);
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log(`⏰ ${endpoint}: TIMEOUT (10s)`);
        results[endpoint] = {
          error: 'Request timeout',
          status: 'TIMEOUT'
        };
      } else {
        console.log(`❌ ${endpoint}: ${error.message}`);
        results[endpoint] = {
          error: error.message,
          status: 'CONNECTION_ERROR'
        };
      }
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(results);
  
  return results;
};

// Auto-run in development
if (process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    checkBackendEndpoints();
  }, 3000);
}
