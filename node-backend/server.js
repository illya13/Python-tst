const express = require('express');
const cors = require('cors');
const http = require('http');

const app = express();
const config = require('express-configers');
const PORT = process.env.PORT || 3000;
const GO_BACKEND_URL = process.env.GO_BACKEND_URL || 'http://localhost:8080';

// Middleware
app.use(cors());
app.use(express.json());
app.use(config());


// Helper function to make HTTP requests to Go backend
function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, GO_BACKEND_URL);
    const requestOptions = {
      hostname: url.hostname,
      port: url.port || 8080,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = http.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data);
          }
        } else {
          // Try to parse error response as JSON
          let errorMessage = data;
          try {
            const errorData = JSON.parse(data);
            errorMessage = errorData.error || errorData.message || data;
          } catch (e) {
            // Keep original error message if not JSON
          }
          const error = new Error(errorMessage);
          error.statusCode = res.statusCode;
          error.responseData = data;
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check Go backend health
    const goHealth = await makeRequest('/health');
    res.json({ 
      status: 'ok', 
      message: 'Node.js backend is running',
      goBackend: goHealth
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'error', 
      message: 'Node.js backend is running but Go backend is unavailable',
      error: error.message
    });
  }
});

// Users endpoints
app.get('/api/users', async (req, res) => {
  try {
    const response = await makeRequest('/api/users');
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await makeRequest(`/api/users/${req.params.id}`);
    res.json(user);
  } catch (error) {
    if (error.message.includes('404') || error.message.includes('not found')) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const response = await makeRequest('/api/users', {
      method: 'POST',
      body: req.body
    });
    res.status(201).json(response);
  } catch (error) {
    const statusCode = error.statusCode || (error.message.includes('400') ? 400 : 500);
    res.status(statusCode).json({ error: error.message });
  }
});

// Tasks endpoints
app.get('/api/tasks', async (req, res) => {
  try {
    const { status, userId } = req.query;
    let path = '/api/tasks';
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (userId) params.append('userId', userId);
    if (params.toString()) {
      path += '?' + params.toString();
    }
    const response = await makeRequest(path);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const response = await makeRequest('/api/tasks', {
      method: 'POST',
      body: req.body
    });
    res.status(201).json(response);
  } catch (error) {
    const statusCode = error.statusCode || (error.message.includes('400') ? 400 : 500);
    res.status(statusCode).json({ error: error.message });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const response = await makeRequest(`/api/tasks/${req.params.id}`, {
      method: 'PUT',
      body: req.body
    });
    res.json(response);
  } catch (error) {
    const statusCode = error.statusCode || 
      (error.message.includes('404') || error.message.includes('not found') ? 404 :
       error.message.includes('400') ? 400 : 500);
    res.status(statusCode).json({ error: error.message });
  }
});

// Statistics endpoint
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await makeRequest('/api/stats');
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Node.js backend server running on http://localhost:${PORT}`);
  console.log(`Connecting to Go backend at ${GO_BACKEND_URL}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
