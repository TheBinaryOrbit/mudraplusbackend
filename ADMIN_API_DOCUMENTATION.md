# Admin API Documentation

This document provides comprehensive information about all admin-related API endpoints, including request formats and response structures.

---

## Authentication

All admin routes require an admin or agent token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Table of Contents

1. [Admin Management](#admin-management)
2. [User Management](#user-management)
3. [Agent Management](#agent-management)
4. [Password Management](#password-management)

---

## Admin Management

### 1. Create Admin

Create a new admin or agent account.

**Endpoint:** `POST /api/v1/admin/create-admin`

**Request Body:**
```json
{
    "name": "Anish",
    "email": "admin@example.com",
    "password": "123456",
    "role": "admin || agent",
    "phone": "6203821043"
}
```

**Response:**
```json
{
    "message": "Admin created successfully",
    "admin": {
        "id": 5,
        "name": "Anish",
        "phone": "6203821041",
        "email": "agent@example.com",
        "role": "agent",
        "createdAt": "2026-01-18T13:33:30.405Z",
        "updatedAt": "2026-01-18T13:33:30.405Z"
    }
}
```

---

### 2. Admin Login

Authenticate an admin or agent user.

**Endpoint:** `POST /api/v1/auth/adminlogin`

**Request Body:**
```json
{   
    "email": "admin@example.com",
    "password": "123456"
}
```

**Response:**
```json
{
    "admin": {
        "id": 1,
        "email": "admin@example.com",
        "name": "Anish",
        "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiIsIm5hbWUiOiJBbmlzaCIsImlhdCI6MTc2ODc0Mjk0NSwiZXhwIjoxNzY5MzQ3NzQ1fQ.cx1r1WN-FjYnzxN5VgYGCAO1S_t7-tvQC6D-3tK1-wQ"
}
```

---

### 3. Get All Admins

Retrieve a list of all admin and agent accounts.

**Endpoint:** `GET /api/v1/admin/getalladmins`

**Response:**
```json
[
    {
        "id": 1,
        "name": "Anish",
        "phone": "6203821043",
        "email": "admin@example.com",
        "password": "$2b$10$Sdb0/y6HqSNSwi7U/ytg4OEvX4eaxwL6Ir8ehjh7mZNXRr3yLlfh2",
        "role": "admin",
        "isDeleted": false,
        "createdAt": "2026-01-18T13:15:55.632Z",
        "updatedAt": "2026-01-18T13:15:55.632Z"
    },
    {
        "id": 5,
        "name": "Anish",
        "phone": "6203821041",
        "email": "agent@example.com",
        "password": "$2b$10$OLx6vXsxe5T5ib/bSKbMk.OH.lBDiqrDRF.KjDzyZLpo2nmw3EoNq",
        "role": "agent",
        "isDeleted": false,
        "createdAt": "2026-01-18T13:33:30.405Z",
        "updatedAt": "2026-01-18T13:33:30.405Z"
    }
]
```

---

## User Management

### 4. Get All Users

Retrieve a list of all users.

**Endpoint:** `GET /api/v1/admin/user/users`

**Response:**
```json
[
    {
        "id": 1,
        "email": "anish.2327cs1156@kiet.edu",
        "name": "Anish Kumar",
        "phone": "6203821043",
        "employmentType": "employed",
        "companyName": "Yay",
        "createdAt": "2026-01-16T06:36:36.556Z",
        "isVerified": false,
        "kycStatus": "verified"
    },
    {
        "id": 2,
        "email": "sainiyaman60@gmail.com",
        "name": "Yamandeep saini",
        "phone": "8941092513",
        "employmentType": null,
        "companyName": null,
        "createdAt": "2026-01-17T17:16:25.625Z",
        "isVerified": false,
        "kycStatus": "pending"
    }
]
```

---

### 5. Block User

Block a user account.

**Endpoint:** `PATCH /api/v1/admin/user/block-user/:id`

**Parameters:**
- `id` (path parameter) - User ID to block

**Response:**
```json
{
    "message": "User account blocked successfully"
}
```

---

### 6. Restore User

Restore a blocked user account.

**Endpoint:** `PATCH /api/v1/admin/user/restore-user/:id`

**Parameters:**
- `id` (path parameter) - User ID to restore

**Response:**
```json
{
    "message": "User account restored successfully"
}
```

---

### 7. Update KYC Status

Update the KYC verification status for a user.

**Endpoint:** `PATCH /api/v1/admin/user/update-kyc-status/:id`

**Parameters:**
- `id` (path parameter) - User ID

#### Verify KYC

**Request Body:**
```json
{
    "status": "verified"
}
```

**Response:**
```json
{
    "message": "User KYC verified successfully"
}
```

#### Reject KYC

**Request Body:**
```json
{
    "status": "rejected",
    "reason": "upload aadhar again"
}
```

**Response:**
```json
{
    "message": "User KYC rejected successfully"
}
```

---

### 12. Get Specific User

Retrieve detailed information about a specific user.

**Endpoint:** `GET /api/v1/admin/user/:id`

**Parameters:**
- `id` (path parameter) - User ID

**Query Parameters (Optional):**
- `field` - Comma-separated list of related data to include:
  - `bankDetails`
  - `addresses`
  - `documents`
  - `loans`
  - `activity`
  - `transactions`
  - `agents`
  - `followUps`

**Example:** `/api/v1/admin/user/1?field=bankDetails,addresses,documents`

**Response:**
```json
{
    "id": 1,
    "email": "anish.2327cs1156@kiet.edu",
    "name": "Anish Kumar",
    "phone": "6203821043",
    "gender": "male",
    "dob": "2004-10-15T09:41:00.000Z",
    "employmentType": "employed",
    "companyName": "Yay",
    "netMonthlyIncome": 10000,
    "nextIncomeDate": "2026-01-16T09:41:00.000Z",
    "createdAt": "2026-01-16T06:36:36.556Z",
    "updatedAt": "2026-01-18T13:45:06.057Z",
    "isVerified": true,
    "isBlocked": false,
    "kycExpireAt": "2026-04-18T13:43:58.060Z",
    "kycStatus": "rejected"
}
```

---

## Agent Management

### 9. Assign Agent to User

Assign an agent to a user.

**Endpoint:** `POST /api/v1/admin/assingn-agent`

**Request Body:**
```json
{
    "userId": 1,
    "agentId": 5
}
```

**Response:**
```json
{
    "id": 3,
    "agentId": 5,
    "userId": 1,
    "createdAt": "2026-01-18T13:54:50.728Z",
    "updatedAt": "2026-01-18T13:54:50.728Z"
}
```

---

### 10. Get Agent's Assigned Users

Retrieve all users assigned to a specific agent.

**Endpoint:** `GET /api/v1/admin/agent-users/:id`

**Parameters:**
- `id` (path parameter) - Agent ID

**Response:**
```json
{
    "agent": {
        "id": 5,
        "name": "Anish",
        "phone": "6203821041"
    },
    "assignedUser": [
        {
            "id": 3,
            "agentId": 5,
            "userId": 1,
            "createdAt": "2026-01-18T13:54:50.728Z",
            "updatedAt": "2026-01-18T13:54:50.728Z",
            "user": {
                "id": 1,
                "email": "anish.2327cs1156@kiet.edu",
                "name": "Anish Kumar",
                "phone": "6203821043",
                "employmentType": "employed",
                "companyName": "Yay",
                "createdAt": "2026-01-16T06:36:36.556Z",
                "isVerified": true,
                "kycStatus": "rejected"
            }
        }
    ]
}
```

---

### 11. Unassign Agent from User

Remove agent assignment from a user.

**Endpoint:** `DELETE /api/v1/admin/unassingn-agent`

**Request Body:**
```json
{
    "userId": 1,
    "agentId": 5
}
```

**Response:**
```json
{
    "message": "Agent unassigned successfully"
}
```

---

## Password Management

### 8. Change Password

Change the password for an admin or agent account.

**Endpoint:** `PATCH /api/v1/admin/change-password`

**Request Body:**
```json
{
    "oldPassword": "123456",
    "newPassword": "1234567"
}
```

**Response:**
```json
{
    "message": "Password changed successfully"
}
```

---

## Error Responses

All endpoints may return error responses in the following format:

```json
{
    "error": "Error message description",
    "statusCode": 400
}
```

### Common Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Notes

- All timestamps are in ISO 8601 format
- Authentication tokens expire after 7 days
- Passwords are hashed using bcrypt before storage
- Admin token is required for all admin routes
- Agent token can be used for change-password and get user by ID routes
