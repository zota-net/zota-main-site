# Zota Backend - Client Dashboard Integration Guide

## Overview

This guide provides comprehensive instructions for integrating the Zota backend APIs into a client dashboard application that supports both Admin and Agent user roles. The dashboard should provide different functionalities based on user roles while maintaining secure API communication.

### Accessing the APIs

**Production Environment (via Nginx):**
```javascript
const API_BASE_URL = 'https://yourdomain.com';
const AUTH_API = `${API_BASE_URL}/auth`;
const OPS_API = `${API_BASE_URL}/bop`;
const WALLET_API = `${API_BASE_URL}/wallet`;
const MIKROTIK_API = `${API_BASE_URL}/mikrotik`;
const DEVICES_API = `${API_BASE_URL}/devices`;
```

**Development Environment (Direct Service Access):**
```javascript
const API_BASE_URL = 'http://localhost';
const AUTH_API = 'http://localhost:3001';
const OPS_API = 'http://localhost:3000';
const WALLET_API = 'http://localhost:3002';
const MIKROTIK_API = 'http://localhost:3003';
const DEVICES_API = 'http://localhost:3004';
```

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Client        │────│   Nginx Proxy    │────│   Microservices │
│   Dashboard     │    │   (HTTPS 443)    │    │   (Ports 3000-) │
│   (React/Vue)   │    └──────────────────┘    └─────────────────┘
└─────────────────┘
         │
         ▼
┌─────────────────┐
│   PostgreSQL    │
│   Redis         │
│   (Docker)      │
└─────────────────┘
```

## Authentication Flow

### 1. User Login Process

```javascript
// Login function
async function login(email, password, clientId) {
  try {
    // Use nginx proxy URL in production
    const loginUrl = process.env.NODE_ENV === 'production' 
      ? 'https://yourdomain.com/auth/login'
      : 'http://localhost:3001/auth/login';
    
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        client_id: clientId
      })
    });

    const data = await response.json();

    if (response.ok) {
      // Store JWT token
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect based on role
      if (data.user.role === 'Admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/agent/dashboard');
      }
    }
  } catch (error) {
    console.error('Login failed:', error);
  }
}
```

### 2. JWT Token Management

```javascript
// Configure axios with appropriate base URL
const apiClient = axios.create({
  baseURL: process.env.NODE_ENV === 'production'
    ? 'https://yourdomain.com'
    : 'http://localhost'
});

// Axios interceptor for automatic token attachment
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Token refresh logic
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## Admin Dashboard Features

### Client Management

```javascript
// Admin: Create new client
async function createClient(clientData) {
  // Via Nginx: /bop/clients
  // Direct: http://localhost:3000/clients
  const response = await apiClient.post('/bop/clients', {
    businessName: clientData.businessName,
    adminEmail: clientData.adminEmail,
    adminPassword: clientData.adminPassword,
    contact: clientData.contact
  });

  return response.data;
}

// // Admin: Get all clients
// async function getClients() {
//   const response = await apiClient.get('/bop/clients');
//   return response.data;
// }

// Admin: Update client status
async function updateClientStatus(clientId, status) {
  const response = await apiClient.put(`/bop/clients/${clientId}/status`, { status });
  return response.data;
}
```

### Agent Management

```javascript
// Admin: Add new agent
async function addAgent(agentData) {
  // Via Nginx: /auth/add-agent
  const response = await apiClient.post('/auth/add-agent', {
    fullname: agentData.fullname,
    email: agentData.email,
    password: agentData.password,
    client_id: agentData.clientId
  });

  return response.data;
}

// Admin: Get all agents for client
async function getClientAgents(clientId) {
  // Via Nginx: /wallet/accounts/client/{clientId}/agents
  const response = await apiClient.get(`/wallet/accounts/client/${clientId}/agents`);
  return response.data;
}
```

### Package Management

```javascript
// Admin: Create package
async function createPackage(packageData) {
  // Via Nginx: /bop/packages
  const response = await apiClient.post('/bop/packages', {
    period: packageData.period, // in seconds
    title: packageData.title,
    price: packageData.price,
    agentComissionPercentage: packageData.commission
  });

  return response.data;
}

// Admin: Get all packages
async function getPackages() {
  const response = await apiClient.get('/bop/packages');
  return response.data;
}
```

### Voucher Management

```javascript
// Admin: Generate vouchers
async function generateVouchers(voucherData) {
  // Via Nginx: /bop/vouchers
  const response = await apiClient.post('/bop/vouchers', {
    length: voucherData.length,
    prefix: voucherData.prefix,
    count: voucherData.count,
    package_id: voucherData.packageId,
    client_id: voucherData.clientId
  });

  return response.data;
}

// Admin: Get client vouchers
async function getClientVouchers(clientId) {
  const response = await apiClient.get(`/bop/vouchers/client/${clientId}`);
  return response.data;
}
```

### Router Management

```javascript
// Admin: Register router
async function registerRouter(routerData) {
  // Via Nginx: /bop/router-devices
  const response = await apiClient.post('/bop/router-devices', {
    name: routerData.name,
    ipAddress: routerData.ipAddress,
    apiPort: routerData.apiPort,
    apiUser: routerData.apiUser,
    apiPassword: routerData.apiPassword,
    client_id: routerData.clientId
  });

  return response.data;
}

// Admin: Get client routers
async function getClientRouters(clientId) {
  const response = await apiClient.get(`/bop/router-devices/client/${clientId}`);
  return response.data;
}
```

### Reports and Analytics

```javascript
// Admin: Get client report
async function getClientReport(clientId) {
  // Via Nginx: /bop/clients/{clientId}/report
  const response = await apiClient.get(`/bop/clients/${clientId}/report`);
  return response.data;
}

// Admin: Get sales report
async function getSalesReport(clientId, startDate, endDate) {
  // Via Nginx: /wallet/reports/sales/{clientId}
  const response = await apiClient.get(`/wallet/reports/sales/${clientId}`, {
    params: { startDate, endDate }
  });

  return response.data;
}
```

## Agent Dashboard Features

### Profile Management

```javascript
// Agent: Update profile
async function updateProfile(profileData) {
  // Via Nginx: /auth/update-profile
  const response = await apiClient.put('/auth/update-profile', {
    fullname: profileData.fullname,
    currentPassword: profileData.currentPassword,
    newPassword: profileData.newPassword,
    client_id: profileData.clientId
  });

  return response.data;
}
```

### Voucher Sales

```javascript
// Agent: Record voucher sale
async function recordVoucherSale(saleData) {
  // Via Nginx: /wallet/vouchers/record-sale
  const response = await apiClient.post('/wallet/vouchers/record-sale', {
    clientId: saleData.clientId,
    voucherId: saleData.voucherId,
    voucherCode: saleData.voucherCode,
    amount: saleData.amount,
    phone: saleData.phone,
    provider: saleData.provider
  });

  return response.data;
}

// Agent: Get voucher sales
async function getVoucherSales(clientId) {
  // Via Nginx: /wallet/vouchers/sales/{clientId}
  const response = await apiClient.get(`/wallet/vouchers/sales/${clientId}`);
  return response.data;
}
```

### Account Management

```javascript
// Agent: Get account details
async function getAgentAccount(agentId) {
  // Via Nginx: /wallet/accounts/agent/{agentId}
  const response = await apiClient.get(`/wallet/accounts/agent/${agentId}`);
  return response.data;
}

// Agent: Get account balance
async function getAccountBalance(accountId) {
  const response = await apiClient.get(`/wallet/accounts/${accountId}`);
  return response.data;
}
```

### Wallet Operations

```javascript
// Agent: Get wallet balance
async function getWalletBalance(walletId) {
  // Via Nginx: /wallet/wallets/{walletId}/balance
  const response = await apiClient.get(`/wallet/wallets/${walletId}/balance`);
  return response.data;
}

// Agent: Get transaction history
async function getTransactionHistory(walletId, limit = 50) {
  const response = await axios.get(`/wallets/${walletId}/transactions`, {
    params: { limit }
  });

  return response.data;
}

// Agent: Initiate withdrawal
async function initiateWithdrawal(withdrawalData) {
  const response = await axios.post('/withdrawals', {
    walletId: withdrawalData.walletId,
    amount: withdrawalData.amount,
    phone: withdrawalData.phone,
    provider: withdrawalData.provider
  });

  return response.data;
}
```

## UI Components Structure

### Admin Dashboard Layout

```
AdminDashboard/
├── Sidebar/
<!-- │   ├── Clients -->
│   ├── Agents
│   ├── Packages
│   ├── Vouchers
│   ├── Routers
│   └── Reports
├── MainContent/
<!-- │   ├── ClientList/ -->
│   ├── AgentList/
│   ├── PackageManager/
│   ├── VoucherGenerator/
│   ├── RouterManager/
│   └── Analytics/
```

### Agent Dashboard Layout

```
AgentDashboard/
├── Sidebar/
│   ├── Profile
│   ├── Sell Vouchers
│   ├── My Sales
│   ├── Wallet
│   └── Withdrawals
├── MainContent/
│   ├── ProfileEditor/
│   ├── VoucherSaleForm/
│   ├── SalesHistory/
│   ├── WalletBalance/
│   └── WithdrawalForm/
```

## Error Handling

```javascript
// Global error handler
function handleApiError(error) {
  if (error.response) {
    switch (error.response.status) {
      case 400:
        showToast('Invalid request data', 'error');
        break;
      case 401:
        showToast('Session expired. Please login again.', 'error');
        logout();
        break;
      case 403:
        showToast('Access denied', 'error');
        break;
      case 404:
        showToast('Resource not found', 'error');
        break;
      case 500:
        showToast('Server error. Please try again later.', 'error');
        break;
      default:
        showToast('An error occurred', 'error');
    }
  } else if (error.request) {
    showToast('Network error. Please check your connection.', 'error');
  } else {
    showToast('An unexpected error occurred', 'error');
  }
}
```

## Data Caching Strategy

```javascript
// React Query setup for caching
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

// Usage in components
function useClients() {
  return useQuery('clients', () => axios.get('/clients').then(res => res.data));
}

function usePackages() {
  return useQuery('packages', () => axios.get('/packages').then(res => res.data));
}
```

## Real-time Updates (Optional)

For real-time features like voucher sales notifications:

```javascript
// WebSocket connection for real-time updates
import io from 'socket.io-client';

const socket = io(process.env.REACT_APP_WS_URL);

socket.on('voucher-sold', (data) => {
  // Update UI with new sale
  queryClient.invalidateQueries('sales');
  showNotification('New voucher sold!', data);
});
```

## Security Best Practices

1. **Environment Variables**: Store API URLs and secrets in environment variables
2. **HTTPS Only**: Ensure all API calls use HTTPS in production
3. **Input Validation**: Validate all user inputs on both client and server
4. **Rate Limiting**: Implement rate limiting for sensitive operations
5. **CSRF Protection**: Use CSRF tokens for state-changing operations
6. **Content Security Policy**: Implement CSP headers

## Testing Strategy

```javascript
// API testing with Jest
describe('Auth API', () => {
  test('should login successfully', async () => {
    const response = await axios.post('/auth/login', {
      email: 'admin@example.com',
      password: 'password'
    });

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('token');
  });
});

// Component testing
describe('LoginForm', () => {
  test('should call login API on form submit', () => {
    // Test implementation
  });
});
```

## Deployment Checklist

- [ ] Configure environment variables
- [ ] Set up HTTPS certificates
- [ ] Configure nginx proxy
- [ ] Set up database backups
- [ ] Implement monitoring and logging
- [ ] Configure firewall rules
- [ ] Set up CI/CD pipeline
- [ ] Implement automated testing
- [ ] Configure error tracking (Sentry, etc.)
- [ ] Set up performance monitoring

## Support and Maintenance

- Monitor API response times
- Set up alerts for service downtime
- Regularly update dependencies
- Implement feature flags for gradual rollouts
- Maintain comprehensive API documentation
- Plan for database migrations
- Implement proper logging and auditing