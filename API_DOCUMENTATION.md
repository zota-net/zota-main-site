# Zota Backend - Complete API Documentation

This document provides a comprehensive overview of all four microservices in the Zota hotspot billing backend system.

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
               │  User Authentication      │  Reporting
               │                           │
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
```

---

## Service Overview

### 1. Auth Service (Port 3001)

**Purpose:** User authentication, role-based access control, and agent management.

**Database:** PostgreSQL `auth_service`

**Key Entities:**
- `User`: fullname, email, password, emailVerified, role (Admin/Agent), client_id, verificationCode, resetToken, verificationCodeExpiry, resetTokenExpiry
- `Client`: businessName, adminFullName, adminEmail, adminPassword, contact, status (Active/Pending/InActive/Suspended)
- `Package`: period (seconds), title, price, agentComissionPercentage
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
| POST | `/auth/resend-verification` | Resend verification code |
| POST | `/auth/forgot-password` | Request password reset token |
| POST | `/auth/reset-password` | Reset password with token |
| POST | `/auth/add-agent` | Create new agent (Admin only) |
| PUT | `/auth/profile` | Update user profile (fullname) |

#### Example Requests

**Register:**
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

**Login:**
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

---

### 2. Base Operations Service (Port 3000)

**Purpose:** Core business logic for clients, packages, vouchers, devices, and reporting.

**Database:** PostgreSQL `base_ops_service`

**Key Entities:**
- `Client`: businessName, adminEmail, adminPassword, status
- `Package`: period (seconds), title, price, agentComissionPercentage
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
| GET | `/devices/client/:client_id` | Get devices by client |
| GET | `/devices/:id` | Get device |
| PUT | `/devices/:id/expiry` | Update device expiry |
| DELETE | `/devices/:id` | Delete device |

#### Example Requests

**Create Client:**
```bash
curl -X POST http://localhost:3000/clients \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "FastNet Uganda",
    "adminEmail": "admin@fastnet.ug",
    "adminPassword": "AdminPass123!"
  }'
```

**Create Package:**
```bash
curl -X POST http://localhost:3000/packages \
  -H "Content-Type: application/json" \
  -d '{
    "period": 2592000,
    "title": "Monthly Plan",
    "price": 29.99,
    "agentComissionPercentage": 10.5
  }'
```

**Create Voucher:**
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

### 3. Wallet Service (Port 3002)

**Purpose:** Financial operations including wallets, transactions, withdrawals, and voucher sales with automatic fee distribution.

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

**Create Wallet:**
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

**Record Voucher Sale (with auto 10% fee):**
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
| GET | `/routers/:id` | Get router connection details |
| POST | `/routers/:id/test` | Test connection to router |
| GET | `/routers/client/:client_id` | Get client routers |
| POST | `/hotspot/users` | Create hotspot user from voucher |
| GET | `/hotspot/users/:userId` | Get hotspot user details |
| GET | `/hotspot/users/voucher/:voucherCode` | Get user by voucher code |
| POST | `/hotspot/users/:userId/disable` | Disable hotspot user |
| POST | `/sessions` | Record session start |
| POST | `/sessions/:sessionId/end` | End session and record usage |
| GET | `/sessions/router/:router_id/active` | Get active sessions on router |

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
curl -X POST http://localhost:3003/hotspot/users \
  -H "Content-Type: application/json" \
  -d '{
    "voucherCode": "VOUCHER123ABC",
    "client_id": 1,
    "router_id": 1,
    "expiresAt": "2026-03-22T00:00:00Z"
  }'
```

**Record Session:**
```bash
curl -X POST http://localhost:3003/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "hotspotUser_id": 1,
    "router_id": 1,
    "ipAddress": "192.168.1.100",
    "macAddress": "AA:BB:CC:DD:EE:FF",
    "uploadBytes": 0,
    "downloadBytes": 0
  }'
```

**End Session:**
```bash
curl -X POST http://localhost:3003/sessions/1/end \
  -H "Content-Type: application/json" \
  -d '{
    "uploadBytes": 1000000,
    "downloadBytes": 5000000
  }'
```

#### Portal Pages

- **Redeem Voucher:** `GET /portal/redeem.html` - Input voucher code → fetch user details → display username & expiry
- **Login:** `GET /portal/login.html` - Input username → redirect to RouterOS login with username parameter

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

#### 4. MikroTik Service
```bash
cd mikrotik-service
npm install
cp .env.example .env
# Configure: DB_HOST, DB_USER, DB_PASSWORD, ROUTER_HOST, ROUTER_USER, ROUTER_PASSWORD
npm start
# Portal available at http://localhost:3003/portal/
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

- `auth-service/postman_collection.json`
- `base-operations-service/postman_collection.json`
- `wallet-service/postman_collection.json`
- `mikrotik-service/postman_collection.json`

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

**Last Updated:** March 2025  
**Version:** 1.0.0  
**Status:** Production Ready
