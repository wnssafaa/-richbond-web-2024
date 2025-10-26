exports.handler = async (event, context) => {
  // Parse the path
  const path = event.path.replace('/.netlify/functions/proxy', '');
  
  // Construct the backend URL
  const backendUrl = `http://68.183.71.119:8080${path}${event.queryStringParameters ? '?' + new URLSearchParams(event.queryStringParameters).toString() : ''}`;
  
  try {
    // Forward the request to the backend
    const response = await fetch(backendUrl, {
      method: event.httpMethod,
      headers: {
        'Content-Type': event.headers['content-type'] || 'application/json',
        ...(event.headers.authorization && { 'Authorization': event.headers.authorization })
      },
      body: event.body || undefined
    });
    
    const data = await response.text();
    
    return {
      statusCode: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
      },
      body: data
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

