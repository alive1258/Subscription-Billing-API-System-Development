# Subscription & Billing API System

Backend API system for managing client subscriptions, billing workflows, and webhook-based payment updates using Node.js, Express, and MongoDB.

---

# Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs
- Express Validator
- Docker
- Winston Logger

---

# Features

## Authentication

- Client Registration
- Client Login
- JWT-based Authentication
- Protected Routes

---

## Subscription Management

- Create Subscription Plans
- Purchase Subscription
- Cancel Subscription
- Auto-renew Support
- Expiry Management
- Upgrade Logic

---

## Webhook System

- Secure Payment Webhook Endpoint
- Signature Validation
- Payment Status Handling
- Subscription Status Updates

---

# Business Rules

## Duplicate Subscription Prevention

If a user already has:

- An active subscription to the same plan  
  → Prevent duplicate purchase

- An active lower-priced plan  
  → Allow upgrade to a higher-priced plan

- An active higher-priced plan  
  → Prevent downgrade purchase

---

## Expired Subscription Logic

Expired subscriptions automatically:

- Change status to `expired`
- Disable access
- Allow repurchase

---

# Project Structure

```bash
src/
│
├── config/
│   ├── db.js
│   └── logger.js
│
├── controllers/
│   ├── auth.controller.js
│   ├── plan.controller.js
│   ├── subscription.controller.js
│   └── webhook.controller.js
│
├── middlewares/
│   ├── auth.middleware.js
│   ├── error.middleware.js
│   └── validate.middleware.js
│
├── models/
│   ├── User.js
│   ├── Plan.js
│   └── Subscription.js
│
├── routes/
│   ├── auth.routes.js
│   ├── plan.routes.js
│   ├── subscription.routes.js
│   └── webhook.routes.js
│
├── services/
│   ├── subscription.service.js
│   └── webhook.service.js
│
├── utils/
│   └── response.js
│
├── app.js
└── server.js
```

---

# Database Design

## User Model

```js
{
  name: String,
  email: String,
  password: String,
  role: String
}
```

## Plan Model

```js
{
  name: String,
  price: Number,
  durationDays: Number,
  isActive: Boolean
}
```

## Subscription Model

```js
{
  user: ObjectId,
  plan: ObjectId,
  price: Number,
  startDate: Date,
  expiryDate: Date,
  status: String,
  autoRenew: Boolean
}
```

---

# API Endpoints

## Auth

### Register

```http
POST /api/auth/register
```

### Login

```http
POST /api/auth/login
```

---

## Plans

### Create Plan

```http
POST /api/plans
```

### Get Plans

```http
GET /api/plans
```

---

## Subscriptions

### Purchase Subscription

```http
POST /api/subscriptions/purchase
```

### Cancel Subscription

```http
POST /api/subscriptions/cancel/:id
```

### Get My Subscriptions

```http
GET /api/subscriptions/me
```

---

## Webhooks

### Payment Webhook

```http
POST /api/webhooks/payment
```

---

# Authentication & Authorization

Protected routes require:

```http
Authorization: Bearer <token>
```

JWT middleware validates:

- Token authenticity
- User existence
- Route permissions

---

# Webhook Validation

Webhook requests are validated using:

- Secret Signature Header
- Timestamp Validation
- Request Hash Verification

Example:

```http
x-webhook-signature
```

---

# API Response Format

## Success Response

```json
{
  "success": true,
  "message": "Subscription created successfully",
  "data": {}
}
```

## Error Response

```json
{
  "success": false,
  "message": "Subscription already exists",
  "error": {}
}
```

---

# Security Considerations

- Password hashing with bcrypt
- JWT token expiration
- Protected private routes
- Request validation
- MongoDB injection prevention
- Helmet security headers
- Rate limiting
- Webhook signature verification

---

# Logging System

Using Winston logger:

- Error logs
- API request logs
- Webhook event logs
- Database connection logs

---

# Docker Setup

## Build Container

```bash
docker build -t subscription-api .
```

## Run Container

```bash
docker run -p 5000:5000 subscription-api
```

---

# Environment Variables

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/subscription-system
JWT_SECRET=your_secret
WEBHOOK_SECRET=your_webhook_secret
```

---

# Sample Subscription Upgrade Logic

```js
if (activeSubscription) {
  if (samePlan) {
    throw new Error("Same active subscription already exists");
  }

  if (newPlan.price <= activePlan.price) {
    throw new Error("Only higher plan upgrades allowed");
  }

  // upgrade allowed
}
```

---

# Bonus Features

- Dockerized deployment
- Postman Collection
- Centralized logger
- Scalable service architecture
- Clean modular structure

---

# Evaluation Coverage

This project demonstrates:

- Secure backend architecture
- Business rule implementation
- Edge-case handling
- REST API best practices
- Database relationship design
- Authentication & authorization
- Error handling strategy
- Clean code organization

---

# Run Project

## Install Dependencies

```bash
npm install
```

## Start Development Server

```bash
npm run dev
```

## Start Production Server

```bash
npm start
```
