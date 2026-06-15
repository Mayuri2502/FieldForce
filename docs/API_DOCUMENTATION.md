# FieldForce Pro API Documentation

## Overview

FieldForce Pro is a comprehensive Field Sales Employee Tracking & Workforce Management SaaS Platform. This API documentation provides detailed information about all available endpoints, request/response formats, authentication, and usage examples.

**Base URL**: `http://localhost:5000/api` (Development)
**Production URL**: `https://api.fieldforcepro.com` (Production)

## Authentication

The API uses JWT (JSON Web Token) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_access_token>
```

### Authentication Flow

1. **Register**: Create a new account
2. **Login**: Obtain access and refresh tokens
3. **Use Access Token**: Include in Authorization header for protected routes
4. **Refresh Token**: Use refresh token to get new access token when expired

## API Endpoints

### Authentication

#### Register
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "company_name": "Acme Corp"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "company_admin"
    },
    "tokens": {
      "accessToken": "jwt_token",
      "refreshToken": "refresh_token"
    }
  }
}
```

#### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "tokens": { ... }
  }
}
```

#### Logout
```http
POST /auth/logout
```
**Headers:** `Authorization: Bearer <token>`

#### Refresh Token
```http
POST /auth/refresh-token
```

**Request Body:**
```json
{
  "refreshToken": "your_refresh_token"
}
```

#### Change Password
```http
POST /auth/change-password
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

### Users

#### Get All Users
```http
GET /users
```
**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `role`: Filter by role (super_admin, company_admin, manager, employee)
- `department`: Filter by department
- `search`: Search by name or email

#### Get User by ID
```http
GET /users/:id
```
**Headers:** `Authorization: Bearer <token>`

#### Create User
```http
POST /users
```
**Headers:** `Authorization: Bearer <token>` (Company Admin only)

**Request Body:**
```json
{
  "email": "employee@example.com",
  "password": "password123",
  "first_name": "Jane",
  "last_name": "Smith",
  "role": "employee",
  "department": "Sales",
  "designation": "Sales Representative"
}
```

#### Update User
```http
PUT /users/:id
```
**Headers:** `Authorization: Bearer <token>`

#### Delete User
```http
DELETE /users/:id
```
**Headers:** `Authorization: Bearer <token>` (Company Admin only)

### Companies

#### Get Company by ID
```http
GET /companies/:id
```
**Headers:** `Authorization: Bearer <token>`

#### Update Company
```http
PUT /companies/:id
```
**Headers:** `Authorization: Bearer <token>` (Company Admin only)

#### Get All Companies
```http
GET /companies
```
**Headers:** `Authorization: Bearer <token>` (Super Admin only)

### Attendance

#### Get Attendance Records
```http
GET /attendance
```
**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `date`: Filter by date (YYYY-MM-DD)
- `employee_id`: Filter by employee
- `status`: Filter by status (present, absent, late, early_exit, half_day)

#### Check In
```http
POST /attendance/check-in
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "accuracy": 10.5,
  "selfie_url": "https://example.com/selfie.jpg",
  "device_info": {
    "device_id": "device_123",
    "device_type": "mobile",
    "app_version": "1.0.0"
  }
}
```

#### Check Out
```http
POST /attendance/check-out
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "accuracy": 10.5,
  "device_info": { ... }
}
```

### Location Tracking

#### Update Location
```http
POST /locations/update
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "accuracy": 10.5,
  "altitude": 10.0,
  "speed": 0.0,
  "heading": 0.0,
  "battery_level": 85,
  "is_charging": false,
  "network_type": "wifi",
  "gps_status": "enabled",
  "device_info": { ... }
}
```

#### Get Location History
```http
GET /locations/history/:employeeId
```
**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `start_date`: Start date (YYYY-MM-DD)
- `end_date`: End date (YYYY-MM-DD)

#### Get Live Locations
```http
GET /locations/live
```
**Headers:** `Authorization: Bearer <token>`

### Tasks

#### Get Tasks
```http
GET /tasks
```
**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status`: Filter by status
- `priority`: Filter by priority
- `type`: Filter by type
- `assigned_to`: Filter by assignee
- `due_date_from`: Due date from
- `due_date_to`: Due date to

#### Create Task
```http
POST /tasks
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Visit ABC Corp",
  "description": "Follow up on the proposal",
  "type": "visit",
  "priority": "high",
  "due_date": "2024-12-31T18:00:00Z",
  "assigned_to": "employee_uuid",
  "customer_id": "customer_uuid",
  "location_latitude": 40.7128,
  "location_longitude": -74.0060
}
```

#### Update Task
```http
PUT /tasks/:id
```
**Headers:** `Authorization: Bearer <token>`

#### Delete Task
```http
DELETE /tasks/:id
```
**Headers:** `Authorization: Bearer <token>`

#### Add Task Comment
```http
POST /tasks/:id/comments
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "comment": "Task completed successfully",
  "attachments": []
}
```

### Customers

#### Get Customers
```http
GET /customers
```
**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `category`: Filter by category
- `customer_type`: Filter by type (lead, prospect, active, inactive)
- `assigned_employee_id`: Filter by assigned employee
- `search`: Search by name, phone, or email

#### Create Customer
```http
POST /customers
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "John Smith",
  "business_name": "ABC Corp",
  "phone": "+1234567890",
  "email": "john@abccorp.com",
  "address": "123 Business St",
  "city": "New York",
  "state": "NY",
  "country": "USA",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "category": "retail",
  "customer_type": "active"
}
```

#### Update Customer
```http
PUT /customers/:id
```
**Headers:** `Authorization: Bearer <token>`

#### Delete Customer
```http
DELETE /customers/:id
```
**Headers:** `Authorization: Bearer <token>`

### Visits

#### Get Visits
```http
GET /visits
```
**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status`: Filter by status
- `type`: Filter by type
- `employee_id`: Filter by employee
- `customer_id`: Filter by customer
- `date_from`: Start date
- `date_to`: End date

#### Create Visit
```http
POST /visits
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "customer_id": "customer_uuid",
  "type": "sales",
  "scheduled_date": "2024-12-31T10:00:00Z",
  "purpose": "Product demonstration"
}
```

#### Start Visit
```http
POST /visits/:id/start
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

#### End Visit
```http
POST /visits/:id/end
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "notes": "Visit completed successfully",
  "photos": ["url1", "url2"],
  "outcome": "Positive response",
  "is_productive": true
}
```

### Orders

#### Get Orders
```http
GET /orders
```
**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status`: Filter by status
- `customer_id`: Filter by customer
- `employee_id`: Filter by employee
- `date_from`: Start date
- `date_to`: End date

#### Create Order
```http
POST /orders
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "customer_id": "customer_uuid",
  "items": [
    {
      "product_id": "product_uuid",
      "product_name": "Product A",
      "sku": "SKU001",
      "quantity": 10,
      "unit_price": 100.00,
      "discount_amount": 0,
      "tax_rate": 10
    }
  ],
  "discount_amount": 50,
  "discount_type": "amount",
  "notes": "Order notes"
}
```

#### Update Order
```http
PUT /orders/:id
```
**Headers:** `Authorization: Bearer <token>`

### Products

#### Get Products
```http
GET /products
```
**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `category`: Filter by category
- `search`: Search by name or SKU
- `is_active`: Filter by active status

#### Create Product
```http
POST /products
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Product A",
  "sku": "SKU001",
  "description": "Product description",
  "category": "electronics",
  "brand": "Brand X",
  "unit": "piece",
  "price": 100.00,
  "cost_price": 75.00,
  "tax_rate": 10,
  "stock_quantity": 100
}
```

#### Update Product
```http
PUT /products/:id
```
**Headers:** `Authorization: Bearer <token>`

#### Delete Product
```http
DELETE /products/:id
```
**Headers:** `Authorization: Bearer <token>`

### Expenses

#### Get Expenses
```http
GET /expenses
```
**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status`: Filter by status
- `type`: Filter by type
- `employee_id`: Filter by employee
- `date_from`: Start date
- `date_to`: End date

#### Create Expense
```http
POST /expenses
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "type": "travel",
  "category": "fuel",
  "amount": 50.00,
  "description": "Travel expense",
  "expense_date": "2024-12-31",
  "receipt_url": "https://example.com/receipt.jpg",
  "location": "New York"
}
```

#### Approve Expense
```http
POST /expenses/:id/approve
```
**Headers:** `Authorization: Bearer <token>`

#### Reject Expense
```http
POST /expenses/:id/reject
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "rejection_reason": "Invalid receipt"
}
```

### Leaves

#### Get Leaves
```http
GET /leaves
```
**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status`: Filter by status
- `type`: Filter by type
- `employee_id`: Filter by employee
- `date_from`: Start date
- `date_to`: End date

#### Create Leave Request
```http
POST /leaves
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "type": "casual",
  "start_date": "2024-12-25",
  "end_date": "2024-12-26",
  "total_days": 2,
  "reason": "Personal work"
}
```

#### Approve Leave
```http
POST /leaves/:id/approve
```
**Headers:** `Authorization: Bearer <token>`

#### Reject Leave
```http
POST /leaves/:id/reject
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "rejection_reason": "Insufficient leave balance"
}
```

#### Get Leave Balance
```http
GET /leaves/balance/:employeeId
```
**Headers:** `Authorization: Bearer <token>`

### Geofences

#### Get Geofences
```http
GET /geofences
```
**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `territory_id`: Filter by territory
- `type`: Filter by type (radius, polygon)
- `is_active`: Filter by active status

#### Create Geofence
```http
POST /geofences
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Office Location",
  "type": "radius",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "radius_meters": 100,
  "entry_alert_enabled": true,
  "exit_alert_enabled": true
}
```

#### Update Geofence
```http
PUT /geofences/:id
```
**Headers:** `Authorization: Bearer <token>`

#### Delete Geofence
```http
DELETE /geofences/:id
```
**Headers:** `Authorization: Bearer <token>`

### Territories

#### Get Territories
```http
GET /territories
```
**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `manager_id`: Filter by manager
- `is_active`: Filter by active status

#### Create Territory
```http
POST /territories
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "North Region",
  "code": "NORTH",
  "description": "Northern sales territory",
  "manager_id": "manager_uuid",
  "color": "#FF0000"
}
```

#### Update Territory
```http
PUT /territories/:id
```
**Headers:** `Authorization: Bearer <token>`

#### Delete Territory
```http
DELETE /territories/:id
```
**Headers:** `Authorization: Bearer <token>`

### Beats

#### Get Beats
```http
GET /beats
```
**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `territory_id`: Filter by territory
- `assigned_employee_id`: Filter by assigned employee
- `is_active`: Filter by active status

#### Create Beat
```http
POST /beats
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Downtown Beat",
  "code": "DT",
  "territory_id": "territory_uuid",
  "assigned_employee_id": "employee_uuid",
  "route_coordinates": [[40.7128, -74.0060], [40.7138, -74.0070]]
}
```

#### Update Beat
```http
PUT /beats/:id
```
**Headers:** `Authorization: Bearer <token>`

#### Delete Beat
```http
DELETE /beats/:id
```
**Headers:** `Authorization: Bearer <token>`

### Forms

#### Get Forms
```http
GET /forms
```
**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `form_type`: Filter by type
- `is_active`: Filter by active status

#### Create Form
```http
POST /forms
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Customer Feedback Form",
  "description": "Collect customer feedback",
  "form_type": "survey",
  "form_schema": {
    "fields": [
      {
        "name": "rating",
        "type": "number",
        "label": "Rating",
        "required": true
      },
      {
        "name": "feedback",
        "type": "text",
        "label": "Feedback",
        "required": true
      }
    ]
  }
}
```

#### Submit Form
```http
POST /forms/:id/submit
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "submission_data": {
    "rating": 5,
    "feedback": "Great service!"
  },
  "customer_id": "customer_uuid",
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

### Notifications

#### Get Notifications
```http
GET /notifications
```
**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `is_read`: Filter by read status

#### Mark Notification as Read
```http
PUT /notifications/:id/read
```
**Headers:** `Authorization: Bearer <token>`

#### Mark All Notifications as Read
```http
PUT /notifications/read-all
```
**Headers:** `Authorization: Bearer <token>`

#### Get Notification Preferences
```http
GET /notifications/preferences/me
```
**Headers:** `Authorization: Bearer <token>`

#### Update Notification Preferences
```http
PUT /notifications/preferences/me
```
**Headers:** `Authorization: Bearer <token>`

### Dashboard

#### Get Dashboard Stats
```http
GET /dashboard/stats
```
**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `date`: Target date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "total_employees": 50,
      "present_employees": 45,
      "completed_tasks": 120,
      "completed_visits": 85,
      "orders_today": 15,
      "total_customers": 200,
      "revenue_today": 5000.00
    }
  }
}
```

#### Get Attendance Trend
```http
GET /dashboard/attendance-trend
```
**Headers:** `Authorization: Bearer <token>`

#### Get Sales Trend
```http
GET /dashboard/sales-trend
```
**Headers:** `Authorization: Bearer <token>`

#### Get Top Performers
```http
GET /dashboard/top-performers
```
**Headers:** `Authorization: Bearer <token>`

### Reports

#### Get Reports
```http
GET /reports
```
**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `report_type`: Filter by type
- `status`: Filter by status

#### Generate Report
```http
POST /reports
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Monthly Sales Report",
  "report_type": "sales",
  "parameters": {
    "start_date": "2024-12-01",
    "end_date": "2024-12-31"
  }
}
```

### Subscriptions

#### Get Subscription
```http
GET /subscriptions/company
```
**Headers:** `Authorization: Bearer <token>`

#### Create Subscription
```http
POST /subscriptions
```
**Headers:** `Authorization: Bearer <token>` (Super Admin only)

#### Update Subscription
```http
PUT /subscriptions/:id
```
**Headers:** `Authorization: Bearer <token>` (Super Admin only)

### Device Monitoring

#### Get Device Status
```http
GET /devices/status/:employeeId
```
**Headers:** `Authorization: Bearer <token>`

#### Update Device Status
```http
POST /devices/status
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "device_model": "iPhone 14",
  "os_version": "iOS 17.0",
  "app_version": "1.0.0",
  "battery_level": 85,
  "is_charging": false,
  "network_type": "wifi",
  "gps_enabled": true,
  "gps_accuracy": 10.5
}
```

#### Get Device Alerts
```http
GET /devices/alerts
```
**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `employee_id`: Filter by employee
- `is_resolved`: Filter by resolved status

#### Resolve Alert
```http
PUT /devices/alerts/:id/resolve
```
**Headers:** `Authorization: Bearer <token>`

## Error Responses

All endpoints return error responses in the following format:

```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400
}
```

### HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required or invalid
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Default**: 100 requests per 15 minutes per IP
- **Authentication**: 5 requests per 15 minutes per IP

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1703000000
```

## WebSocket Events

### Connection

Connect to WebSocket server:

```javascript
const io = require('socket.io-client');
const socket = io('http://localhost:5000');

// Join company room
socket.emit('join-company', companyId);

// Join user room
socket.emit('join-user', userId);
```

### Events

#### Location Update
```javascript
socket.on('employee-location', (data) => {
  console.log('Employee location:', data);
  // { employee_id, latitude, longitude, timestamp }
});
```

#### New Notification
```javascript
socket.on('new-notification', (notification) => {
  console.log('New notification:', notification);
});
```

#### Emit Location Update
```javascript
socket.emit('location-update', {
  companyId: 'company_uuid',
  employeeId: 'employee_uuid',
  latitude: 40.7128,
  longitude: -74.0060,
  timestamp: new Date()
});
```

## SDK Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Get users
const users = await api.get('/users');

// Create task
const task = await api.post('/tasks', {
  title: 'New Task',
  type: 'visit',
  priority: 'high'
});
```

### cURL

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get tasks
curl -X GET http://localhost:5000/api/tasks \
  -H "Authorization: Bearer <token>"

# Create customer
curl -X POST http://localhost:5000/api/customers \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"John Smith","phone":"+1234567890"}'
```

## Support

For API support, contact:
- Email: support@fieldforcepro.com
- Documentation: https://docs.fieldforcepro.com
- Status Page: https://status.fieldforcepro.com
