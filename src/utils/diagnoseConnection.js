// Diagnostic utility to check backend connection
import { checkBackendStatus, checkSpecificEndpoint } from './backendStatus';

export const diagnoseConnection = async () => {
  console.log('🔍 Starting backend connection diagnosis...');
  console.log('=====================================');
  
  // Check base backend status
  console.log('1. Checking base backend status...');
  const baseStatus = await checkBackendStatus();
  console.log('Base status result:', baseStatus);
  
  // Check specific endpoints
  const endpoints = [
    '/products',
    '/categories', 
    '/clients',
    '/stock-movements',
    '/auth/status'
  ];
  
  console.log('\n2. Checking specific endpoints...');
  for (const endpoint of endpoints) {
    console.log(`\nChecking ${endpoint}...`);
    const result = await checkSpecificEndpoint(endpoint);
    console.log(`${endpoint} result:`, result);
  }
  
  // Test different ports
  console.log('\n3. Testing different common ports...');
  const commonPorts = [3001, 5000, 8000, 3000];
  
  for (const port of commonPorts) {
    try {
      console.log(`\nTesting port ${port}...`);
      const response = await fetch(`http://localhost:${port}/api/health`, {
        method: 'GET',
        credentials: 'include'
      });
      console.log(`Port ${port} response status:`, response.status);
      
      if (response.ok) {
        console.log(`✅ Backend found on port ${port}!`);
        break;
      }
    } catch (error) {
      console.log(`❌ Port ${port} not accessible:`, error.message);
    }
  }
  
  console.log('\n=====================================');
  console.log('🔍 Diagnosis complete!');
  
  return {
    baseStatus,
    recommendations: getRecommendations(baseStatus)
  };
};

const getRecommendations = (baseStatus) => {
  const recommendations = [];
  
  if (baseStatus.status === 'error') {
    recommendations.push('1. Start your backend server');
    recommendations.push('2. Check if the server is running on the correct port');
    recommendations.push('3. Verify the API_BASE_URL in your service files');
    recommendations.push('4. Check for firewall or network issues');
  } else if (baseStatus.status === 'html') {
    recommendations.push('1. Backend is running but may not be properly configured');
    recommendations.push('2. Check if your backend has the /api/health endpoint');
    recommendations.push('3. Verify CORS settings in your backend');
  } else if (baseStatus.status === 'ok') {
    recommendations.push('✅ Backend connection is working properly!');
  }
  
  return recommendations;
};

// Auto-run diagnosis in development
if (process.env.NODE_ENV === 'development') {
  // Run diagnosis after a short delay to let the app load
  setTimeout(() => {
    diagnoseConnection();
  }, 2000);
}
