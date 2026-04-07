# Zota Backend - Complete API Documentation

This document provides a comprehensive overview of all microservices in the Zota hotspot billing backend system.

## 🌐 API Access

### Production (via Nginx Reverse Proxy)
All services are accessible through a single domain with path-based routing:

| Service | Nginx Path | Base URL |
|---------|-----------|----------|
| Auth Service | `/auth/` | `https://yourdomain.com/auth/` |
| Base Operations | `/bop/` | `https://yourdomain.com/bop/` |
| Devices Service | `/devices/` | `https://yourdomain.com/devices/` |
| MikroTik Service | `/mikrotik/` | `https://yourdomain.com/mikrotik/` |
| RADIUS Server | `/radius/` | `https://yourdomain.com/radius/` |
| Wallet Service | `/wallet/` | `https://yourdomain.com/wallet/` |

**Example:** To login, POST to `https://yourdomain.com/auth/login`

### Development (Direct Service Access)
For local development without Nginx, access services directly on their ports:

| Service | Base URL |
|---------|----------|
| Auth Service | `http://localhost:3001/` |
| Base Operations | `http://localhost:3000/` |
| Devices Service | `http://localhost:3004/` |
| MikroTik Service | `http://localhost:3003/` |
| RADIUS Server | `http://localhost:3005/` |
| Wallet Service | `http://localhost:3002/` |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Applications                       │
└─────────────┬──────────────────────────────┬─────────────────┘
              │                              │
              ▼                              ▼
    ┌──────────────────┐        ┌──────────────────────────┐
    │  Auth Service    │        │ Base Operations Service  │
    │   (Port 3001)    │        │     (Port 3000)          │
    └──────────┬───────┘        └──────────┬───────────────┘
               │                           │
               │  JWT Tokens               │  CRUD Operations
               │  User Authentication      │  Clients, Packages,
               │                           │  Vouchers, Adverts,
               │                           │  Devices
               ├───────────────┬───────────┤
                               │
                               ▼
                    ┌──────────────────────┐
                    │  Wallet Service      │
                    │   (Port 3002)        │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
    ┌──────────────────┐  ┌──────────────┐  ┌─────────────────┐
    │ Payment Gateway  │  │ MikroTik     │  │ Mobile Money    │
    │ (External)       │  │ Service      │  │ (MTN/Airtel)    │
    │                  │  │ (Port 3003)  │  │                 │
    └──────────────────┘  └──────┬───────┘  └─────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    ▼                        ▼
              ┌──────────────┐      ┌──────────────────┐
              │ RouterOS API │      │ Hotspot Portal   │
              │              │      │ (HTML/CSS)       │
              └──────────────┘      └──────────────────┘

                    ┌──────────────────────┐
                    │  Devices Service     │
                    │   (Port 3004)        │
                    └──────────────────────┘
```

---

## Service Overview

### 1. Auth Service (Port 3001 / via Nginx: `/auth/`)

**Purpose:** User authentication, role-based access control, and agent management.

**Base URL:** `https://yourdomain.com/auth/` (via Nginx) or `http://localhost:3001/` (direct)

**Database:** PostgreSQL `auth_service`

**Key Entities:**
- `User`: fullname, email, password, emailVerified, role (Admin/Agent), client_id, verificationCode, resetToken, verificationCodeExpiry, resetTokenExpiry
- `Client`: businessName, adminFullName, adminEmail, adminPassword, contact, status (Active/Pending/InActive/Suspended)
- `Package`: client_id, period (seconds), title, price, agentComissionPercentage
- `Voucher`: code, package_id, status (used/active/expired), usedAt, client_id
- `Advert`: description, media, client_id, duration (seconds), endsIn
- `RouterDevice`: name, macAddress, ipAddress, client_id
- `Device`: voucher_id, macAddress, JoinedAt, expiresAt

**Authentication:** JWT (24-hour expiry)

#### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Register new user with email verification |
| POST | `/auth/login` | Login and receive JWT token |
| POST | `/auth/verify-email` | Verify email with code |
| POST | `/auth/resend-verification-code` | Resend verification code |
| POST | `/auth/forgot-password` | Request password reset token |
| POST | `/auth/reset-password` | Reset password with token |
| POST | `/auth/add-agent` | Create new agent (Admin only) |
| PUT | `/auth/update-profile` | Update user profile (fullname, email, password) |

#### Example Requests

**Register (via Nginx):**
```bash
curl -X POST https://yourdomain.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": "Musa Kasirye",
    "email": "musa@example.com",
    "password": "SecurePass123!",
    "clientId": "1"
  }'
```

**Register (Direct):**
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": "Musa Kasirye",
    "email": "musa@example.com",
    "password": "SecurePass123!",
    "clientId": "1"
  }'
```

**Login (via Nginx):**
```bash
curl -X POST https://yourdomain.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "musa@example.com",
    "password": "SecurePass123!"
  }'
```

**Login (Direct):**
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "musa@example.com",
    "password": "SecurePass123!"
  }'
```

**Verify Email:**
```bash
curl -X POST http://localhost:3001/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "musa@example.com",
    "verificationCode": "123456"
  }'
```
    "password": "SecurePass123!"
  }'
```

**Verify Email:**
```bash
curl -X POST http://localhost:3001/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "musa@example.com",
    "verificationCode": "123456"
  }'
```

---

### 2. Base Operations Service (Port 3000 / via Nginx: `/bop/`)

**Purpose:** Core business logic for clients, packages, vouchers, devices, and reporting.

**Base URL:** `https://yourdomain.com/bop/` (via Nginx) or `http://localhost:3000/` (direct)

**Database:** PostgreSQL `base_ops_service`

**Key Entities:**
- `Client`: businessName, adminEmail, adminPassword, status
- `Package`: client_id, period (seconds), title, price, agentComissionPercentage
- `Voucher`: code, clientId, packageId, status, usedAt
- `Advert`: description, media, clientId, duration (seconds), endsIn
- `RouterDevice`: name, macAddress, ipAddress, clientId
- `Device`: voucherId, macAddress, JoinedAt, expiresAt

**Integration:** Syncs new admin users to auth-service automatically.

#### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/clients` | Create new client |
| GET | `/clients` | Get all clients |
| GET | `/clients/:id` | Get client details |
| GET | `/clients/:id/packages` | Get client packages |
| PUT | `/clients/:id/status` | Update client status |
| GET | `/clients/:id/report` | Get client stats report |
| POST | `/packages` | Create package |
| GET | `/packages` | Get all packages |
| GET | `/packages/:id` | Get package details |
| PUT | `/packages/:id` | Update package |
| DELETE | `/packages/:id` | Delete package |
| POST | `/vouchers` | Create voucher |
| GET | `/vouchers/client/:client_id` | Get client vouchers |
| GET | `/vouchers/code/:code` | Get voucher by code |
| PUT | `/vouchers/:id/status` | Update voucher status |
| DELETE | `/vouchers/:id` | Delete voucher |
| POST | `/adverts` | Create advert |
| GET | `/adverts/client/:client_id` | Get client adverts |
| GET | `/adverts/client/:client_id/active` | Get active adverts |
| GET | `/adverts/:id` | Get advert details |
| PUT | `/adverts/:id` | Update advert |
| DELETE | `/adverts/:id` | Delete advert |
| POST | `/router-devices` | Register router device |
| GET | `/router-devices/client/:client_id` | Get client routers |
| GET | `/router-devices/:id` | Get router device |
| PUT | `/router-devices/:id` | Update router |
| DELETE | `/router-devices/:id` | Delete router |
| POST | `/devices` | Register device |
| GET | `/devices/voucher/:voucher_id` | Get devices by voucher |
| GET | `/devices/:id` | Get device |
| PUT | `/devices/:id/expiry` | Update device expiry |
| DELETE | `/devices/:id` | Delete device |
| GET | `/devices/mac/:macAddress` | Get device by MAC address |

#### Example Requests

**Create Client (via Nginx):**
```bash
curl -X POST https://yourdomain.com/bop/clients \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "FastNet Uganda",
    "adminEmail": "admin@fastnet.ug",
    "adminPassword": "AdminPass123!"
  }'
```

**Create Client (Direct):**
```bash
curl -X POST http://localhost:3000/clients \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "FastNet Uganda",
    "adminEmail": "admin@fastnet.ug",
    "adminPassword": "AdminPass123!"
  }'
```

**Create Package (via Nginx):**
```bash
curl -X POST https://yourdomain.com/bop/packages \
  -H "Content-Type: application/json" \
  -d '{
    "period": 2592000,
    "title": "Monthly Plan",
    "price": 29.99,
    "agentComissionPercentage": 10.5,
    "clientId": 1
  }'
```

**Create Package (Direct):**
```bash
curl -X POST http://localhost:3000/packages \
  -H "Content-Type: application/json" \
  -d '{
    "period": 2592000,
    "title": "Monthly Plan",
    "price": 29.99,
    "agentComissionPercentage": 10.5,
    "clientId": 1
  }'
```

**Get Client Packages (via Nginx):**
```bash
curl -X GET https://yourdomain.com/bop/clients/1/packages
```

**Get Client Packages (Direct):**
```bash
curl -X GET http://localhost:3000/clients/1/packages
```

**Create Voucher (via Nginx):**
```bash
curl -X POST https://yourdomain.com/bop/vouchers \
  -H "Content-Type: application/json" \
  -d '{
    "length": 10,
    "count": 1,
    "prefix": "ZT",
    "package_id": 1,
    "client_id": 1
  }'
```

**Create Voucher (Direct):**
```bash
curl -X POST http://localhost:3000/vouchers \
  -H "Content-Type: application/json" \
  -d '{
    "length": 10,
    "count": 1,
    "prefix": "ZT",
    "package_id": 1,
    "client_id": 1
  }'
```

---

### 3. Wallet Service (Port 3002 / via Nginx: `/wallet/`)

**Purpose:** Financial operations including wallets, transactions, withdrawals, and voucher sales with automatic fee distribution.

**Base URL:** `https://yourdomain.com/wallet/` (via Nginx) or `http://localhost:3002/` (direct)

**Database:** PostgreSQL `wallet_service`

**Key Entities:**
- `Wallet`: userId, owner_type (Client/Agent/Admin), client_id, phone, balance, isActive
- `Account`: agentId, agent_email, agent_fullname, client_id, totalEarnings, withdrawnAmount, currentBalance, isActive
- `Transaction`: transactionId, type, wallet_id, relatedWalletId, amount, description, status, phone, provider, paymentMethod, externalReferenceId, failureReason
- `Withdrawal`: walletId, amount, phone, provider, status
- `AdminWallet`: username="superAdmin", balance (auto-seeded on startup)
- `VoucherSale`: voucherId, voucherCode, client_id, amount, serviceFee, status, paymentMethod, phone, provider

**Auto-Seeding:** Creates `superAdmin` wallet with balance 0 on first startup.

**Fee Calculation:** When voucher is sold for amount X:
- Client receives: X
- Admin receives: X × 10% (as serviceFee)
- Both recorded as transactions in system

#### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/wallets` | Create wallet |
| GET | `/wallets/:walletId/balance` | Get wallet balance |
| GET | `/wallets/user/:userId` | Get wallet by user ID |
| GET | `/wallets/:walletId/transactions` | Get transaction history |
| POST | `/withdrawals` | Initiate withdrawal (calls payment gateway) |
| GET | `/withdrawals/:id` | Get withdrawal status |
| GET | `/withdrawals/wallet/:walletId` | Get wallet withdrawals |
| POST | `/purchases/package` | Purchase package (initiates mobile money payment) |
| POST | `/vouchers/record-sale` | Record voucher sale with 10% admin fee |
| GET | `/vouchers/sales/:clientId` | Get client voucher sales |
| POST | `/accounts` | Create agent account |
| GET | `/accounts/:id` | Get account details |
| GET | `/accounts/agent/:agentId` | Get account by agent ID |
| PUT | `/accounts/:id/balance` | Update account balance |
| GET | `/accounts/client/:clientId/agents` | Get all agents for client |
| GET | `/reports/transactions/:walletId` | Transaction report with date filtering |
| GET | `/reports/sales/:clientId` | Sales report with date filtering |
| GET | `/reports/statement/:walletId` | Wallet statement with running balance |

#### Example Requests

**Create Wallet (via Nginx):**
```bash
curl -X POST https://yourdomain.com/wallet/wallets \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "ownerType": "Client",
    "clientId": 1,
    "phone": "+256701234567"
  }'
```

**Create Wallet (Direct):**
```bash
curl -X POST http://localhost:3002/wallets \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "ownerType": "Client",
    "clientId": 1,
    "phone": "+256701234567"
  }'
```

**Record Voucher Sale via Nginx (with auto 10% fee):**
```bash
curl -X POST https://yourdomain.com/wallet/vouchers/record-sale \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": 1,
    "voucherId": 1,
    "voucherCode": "VOUCHER123ABC",
    "amount": 50000,
    "phone": "+256701234567",
    "provider": "MTN"
  }'
```

**Record Voucher Sale (Direct):**
```bash
curl -X POST http://localhost:3002/vouchers/record-sale \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": 1,
    "voucherId": 1,
    "voucherCode": "VOUCHER123ABC",
    "amount": 50000,
    "phone": "+256701234567",
    "provider": "MTN"
  }'
```

**Result:**
- Client wallet: +50,000
- AdminWallet: +5,000 (10% service fee)
- Transaction recorded for each with type "Voucher_Sale" and "Service_Fee"

**Initiate Withdrawal:**
```bash
curl -X POST http://localhost:3002/withdrawals \
  -H "Content-Type: application/json" \
  -d '{
    "walletId": 1,
    "amount": 50000,
    "phone": "+256701234567",
    "provider": "MTN"
  }'
```

**Transaction Report (with date range):**
```bash
curl "http://localhost:3002/reports/transactions/1?startDate=2026-01-01&endDate=2026-12-31&type=Deposit"
```

**Wallet Statement:**
```bash
curl "http://localhost:3002/reports/statement/1?startDate=2026-01-01&endDate=2026-12-31"
```

---

### 4. MikroTik Service (Port 3003)

**Purpose:** RouterOS integration for hotspot management, user provisioning, and session tracking with external portal.

**Database:** PostgreSQL `mikrotik_service`

**Key Entities:**
- `RouterConnection`: name, ipAddress, apiPort, apiUser, apiPassword, client_id, isConnected, lastConnectedAt
- `HotspotUser`: username, voucherCode, client_id, router_id, password, profile, status, expiresAt, uploadLimit, downloadLimit, uploadUsed, downloadUsed
- `Session`: hotspotUser_id, router_id, ipAddress, macAddress, sessionKey, status, startedAt, endedAt, uploadBytes, downloadBytes, sessionDuration

**Router OS Integration:** Currently mocked (ready for `librouteros` library integration).

**External Portal:** HTML/CSS interface at `/portal/` for voucher redemption and hotspot login.

#### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/routers` | Register new RouterOS connection |
| GET | `/routers` | Get all routers |
| GET | `/routers/client/:client_id` | Get client routers |
| GET | `/routers/:id` | Get router connection details |
| DELETE | `/routers/:id` | Delete router |
| POST | `/routers/:id/connect` | Test connection to router |
| POST | `/routers/:id/disconnect` | Disconnect router |
| GET | `/routers/:id/connection` | Get connection status |
| GET | `/routers/:id/status` | Get router status |
| GET | `/routers/:id/stats/system` | Get system stats |
| GET | `/routers/:id/stats/interfaces` | Get interface stats |
| GET | `/routers/:id/dhcp` | Get DHCP leases |
| POST | `/routers/:id/hotspot/users` | Create hotspot user from voucher |
| GET | `/routers/:id/hotspot/users` | Get all hotspot users |
| GET | `/routers/:id/hotspot/users/:username` | Get hotspot user details |
| PATCH | `/routers/:id/hotspot/users/:username` | Update hotspot user |
| DELETE | `/routers/:id/hotspot/users/:username` | Remove hotspot user |
| POST | `/routers/:id/hotspot/users/:username/enable` | Enable hotspot user |
| POST | `/routers/:id/hotspot/users/:username/disable` | Disable hotspot user |
| GET | `/routers/:id/sessions` | Get active sessions on router |
| GET | `/routers/:id/sessions/mac/:mac` | Get session by MAC address |
| GET | `/routers/:id/sessions/user/:username` | Get session by username |
| DELETE | `/routers/:id/sessions/user/:username` | Kick session by username |
| DELETE | `/routers/:id/sessions/mac/:mac` | Kick session by MAC address |
| GET | `/routers/:id/hotspot/profiles` | Get hotspot profiles |
| POST | `/routers/:id/hotspot/profiles/qos` | Set QoS profile |

#### Example Requests

**Register Router:**
```bash
curl -X POST http://localhost:3003/routers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Main Hotspot Router",
    "ipAddress": "192.168.1.1",
    "apiPort": 8728,
    "apiUser": "api_user",
    "apiPassword": "api_password",
    "client_id": 1
  }'
```

**Create Hotspot User (from voucher):**
```bash
curl -X POST http://localhost:3003/routers/1/hotspot/users \
  -H "Content-Type: application/json" \
  -d '{
    "voucherCode": "VOUCHER123ABC",
    "client_id": 1,
    "expiresAt": "2026-03-22T00:00:00Z"
  }'
```

**Test Connection:**
```bash
curl -X POST http://localhost:3003/routers/1/connect
```

**Get Active Sessions:**
```bash
curl http://localhost:3003/routers/1/sessions
```

#### Portal Pages

- **Redeem Voucher:** `GET /portal/redeem.html` - Input voucher code → fetch user details → display username & expiry
- **Login:** `GET /portal/login.html` - Input username → redirect to RouterOS login with username parameter

---

### 5. Devices Service (Port 3004)

**Purpose:** Management of physical devices, routers, and network equipment.

**Database:** PostgreSQL `devices_service`

**Key Entities:**
- `Device`: Various device properties including client_id, status, type, location, etc.

#### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/addDevice` | Add a new device |
| GET | `/devices` | Get all devices |
| GET | `/devices/client/:client_id` | Get devices by client ID |
| GET | `/devices/status/:status` | Get devices by status |
| GET | `/devices/type/:deviceType` | Get devices by type |
| GET | `/devices/location/:location` | Get devices by location |
| GET | `/devices/:id` | Get device by ID |
| PUT | `/devices/:id` | Update device |
| DELETE | `/devices/:id` | Delete device |

#### Example Requests

**Add Device:**
```bash
curl -X POST http://localhost:3004/addDevice \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Router 1",
    "client_id": 1,
    "status": "active",
    "type": "router",
    "location": "Main Office"
  }'
```

---

## Installation & Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- npm

### Service Setup

#### 1. Auth Service
```bash
cd auth-service
npm install
cp .env.example .env
# Configure: DB_HOST, DB_USER, DB_PASSWORD, EMAIL credentials
npm start
```

#### 2. Base Operations Service
```bash
cd base-operations-service
npm install
cp .env.example .env
# Configure: DB_HOST, DB_USER, DB_PASSWORD, AUTH_SERVICE_URL
npm start
```

#### 3. Wallet Service
```bash
cd wallet-service
npm install
cp .env.example .env
# Configure: DB_HOST, DB_USER, DB_PASSWORD, BASE_OPS_SERVICE_URL, PAYMENT_GATEWAY_URL
npm start
# Auto-seeds superAdmin wallet on first startup
```

#### 5. Devices Service
```bash
cd devices-service
npm install
cp .env.example .env
# Configure: DB_HOST, DB_USER, DB_PASSWORD
npm start
# Port: 3004
```

---

## Data Flow Examples

### Example 1: New Client Onboarding
```
1. POST /clients (Base Ops) → Creates Client record
2. Auto-calls POST /auth/register (Auth) → Creates admin user with JWT
3. Wallet auto-synced from Client.adminEmail
4. Client ready to create packages and vouchers
```

### Example 2: Voucher Sale with Admin Fee
```
1. POST /vouchers/record-sale (Wallet)
   ├─ Amount: 50,000
   ├─ Service Fee (10%): 5,000
   └─ Splits:
      ├─ Client wallet: +50,000
      └─ Admin wallet: +5,000
2. Two transactions recorded:
   ├─ Type: "Voucher_Sale" → Client wallet
   └─ Type: "Service_Fee" → Admin wallet
```

### Example 3: Hotspot Login Flow
```
1. User opens http://router-ip:8080
2. Redirected to MikroTik hotspot login
3. User enters voucher code in portal
4. GET /hotspot/users/voucher/{code} returns username
5. Username passed to RouterOS login redirect
6. RouterOS authenticates and creates session
7. POST /sessions records session start
8. Connection tracked until POST /sessions/{id}/end
```

---

## Integration Points

### Payment Gateway
- **URL:** Configurable via `PAYMENT_GATEWAY_URL` env var
- **Endpoints Called:**
  - POST `/withdrawals` → Payment gateway processes MTN/Airtel withdrawal
  - POST `/purchases/package` → Payment gateway initiates mobile money charge
- **Mock Response:** Gateway stub can be implemented separately

### RouterOS API
- **Client:** `src/services/RouterOSClient.ts`
- **Methods:** createHotspotUser, removeHotspotUser, enableHotspotUser, disableHotspotUser, getActiveSessions, getSessionStats, setQoSProfile
- **Currently:** Mocked with success responses
- **Integration:** Replace with `librouteros` npm package for real RouterOS API calls

### Base Operations Service
- **Called By:** Wallet service for package/voucher info
- **Endpoints Used:**
  - GET `/packages/{id}` - For purchase processing
  - GET `/vouchers/code/{code}` - For hotspot user creation

---

## Postman Collections

Import these JSON files into Postman for easy API testing:

- `zota_full_postman_collection.json` - Complete collection with all services
- `auth-service/postman_collection.json`
- `base-operations-service/postman_collection.json`
- `wallet-service/postman_collection.json`
- `mikrotik-service/postman_collection.json`
- `devices-service/postman_collection.json`

Each collection includes:
- Pre-configured variables (baseUrl, IDs, timestamps)
- Example request bodies
- Response examples for all endpoints

---

## Environment Variables

### Auth Service (.env)
```
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=auth_service
DB_PORT=5432

EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587

JWT_SECRET=your-jwt-secret-key
JWT_EXPIRY=24h

PORT=3001
```

### Base Operations Service (.env)
```
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=base_ops_service
DB_PORT=5432

AUTH_SERVICE_URL=http://localhost:3001

PORT=3000
```

### Wallet Service (.env)
```
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=wallet_service
DB_PORT=5432

BASE_OPS_SERVICE_URL=http://localhost:3000
PAYMENT_GATEWAY_URL=http://localhost:3003

PORT=3002
```

### MikroTik Service (.env)
```
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=mikrotik_service
DB_PORT=5432

ROUTER_HOST=192.168.1.1
ROUTER_USER=api_user
ROUTER_PASSWORD=api_password
ROUTER_PORT=8728

PORT=3003
```

### Devices Service (.env)
```
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=devices_service
DB_PORT=5432

PORT=3004
```

---

## Error Handling

All services return consistent error responses:

```json
{
  "status": 400,
  "message": "Error description",
  "error": "error_code"
}
```

Common HTTP Status Codes:
- **200:** Success
- **201:** Created
- **400:** Bad Request (validation error)
- **401:** Unauthorized (missing/invalid auth)
- **403:** Forbidden (insufficient permissions)
- **404:** Not Found
- **409:** Conflict (duplicate entry)
- **500:** Internal Server Error

---

## Performance Considerations

1. **Database Indexes:** Recommended on:
   - `User.email` (auth-service)
   - `Client.businessName` (base-ops)
   - `Voucher.code` (base-ops)
   - `Wallet.userId` (wallet-service)
   - `Withdrawal.status` (wallet-service)
   - `HotspotUser.voucherCode` (mikrotik-service)

2. **Caching:** Consider caching for:
   - Package details (30-min TTL)
   - Client info (1-hour TTL)
   - Router connection status (5-min TTL)

3. **Batch Operations:** Use batch endpoints for:
   - Creating multiple vouchers
   - Recording multiple sessions
   - Generating transaction reports

---

## Future Enhancements

1. **Admin Dashboard:** Frontend for managing clients, packages, reports
2. **Real RouterOS Integration:** Replace mock with librouteros API calls
3. **Payment Gateway:** Implement actual MTN/Airtel payment API
4. **Notification Service:** Email/SMS for transaction confirmations, expiry alerts
5. **Analytics:** Advanced reporting with graphs, charts, predictions
6. **Mobile App:** iOS/Android apps for agent usage and wallet management
7. **API Rate Limiting:** Protect services from abuse
8. **Audit Logging:** Track all operations for compliance
9. **Multi-currency Support:** Handle different currencies for international expansion
10. **Webhook Integration:** Allow clients to hook into transaction events

---

## Support

For issues or questions:
1. Check service logs: `npm start` outputs
2. Verify database connections in .env files
3. Ensure all services are running on correct ports
4. Check Postman collections for example payloads
5. Review entity relationships in src/entity/ folders

---

**Last Updated:** March 2026  
**Version:** 1.1.0  
**Status:** Production Ready
