// Backend status checker utility

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const checkBackendStatus = async () => {
  try {
    console.log('Checking backend status...');
    
    // Try to reach the base API endpoint
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      credentials: 'include',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    console.log('Backend response status:', response.status);
    console.log('Backend response headers:', Object.fromEntries(response.headers.entries()));
    
    const contentType = response.headers.get('content-type');
    console.log('Content-Type:', contentType);
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('Backend response data:', data);
      return { status: 'ok', data };
    } else {
      const text = await response.text();
      console.log('Backend response text (first 200 chars):', text.substring(0, 200));
      return { status: 'html', text: text.substring(0, 200) };
    }
  } catch (error) {
    console.error('Backend check failed:', error);
    return { status: 'error', error: error.message };
  }
};

export const checkSpecificEndpoint = async (endpoint) => {
  try {
    console.log(`Checking endpoint: ${endpoint}`);
    
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
      method: 'GET',
      credentials: 'include',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    console.log(`Endpoint ${endpoint} response status:`, response.status);
    
    const contentType = response.headers.get('content-type');
    console.log(`Endpoint ${endpoint} content-type:`, contentType);
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log(`Endpoint ${endpoint} response data:`, data);
      return { status: 'ok', data };
    } else {
      const text = await response.text();
      console.log(`Endpoint ${endpoint} response text (first 200 chars):`, text.substring(0, 200));
      return { status: 'html', text: text.substring(0, 200) };
    }
  } catch (error) {
    console.error(`Endpoint ${endpoint} check failed:`, error);
    return { status: 'error', error: error.message };
  }
};
