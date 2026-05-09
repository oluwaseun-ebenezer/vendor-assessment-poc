# 🔐 Demo Login Credentials

This document contains all the demo user accounts for the Vendor Assessment Platform.

## Quick Access

**Login URL:** `http://localhost:3000/login` (or `http://localhost` with nginx)

**Universal Password:** `ChangeMe123!`

---

## Demo User Accounts

The backend automatically seeds 5 demo users on startup with different roles and permissions.

### 1. Admin Account

```
Email:    admin@carlsberg.com
Password: ChangeMe123!
Role:     Administrator
```

**Access Level:**

- ✅ Full system access
- ✅ User management (create, edit, deactivate users)
- ✅ View all vendors and assessments
- ✅ Access to all departments' tasks
- ✅ Analytics dashboard
- ✅ Admin-only pages

---

### 2. Procurement Account

```
Email:    procurement@carlsberg.com
Password: ChangeMe123!
Role:     Procurement Officer
```

**Access Level:**

- ✅ Vendor intake and submission
- ✅ Commercial dimension visibility
- ✅ Viability dimension visibility
- ✅ Operations dimension visibility
- ✅ Department-specific tasks (Procurement)
- ✅ Dashboard and metrics
- ❌ No user management

---

### 3. IT Security Account

```
Email:    security@carlsberg.com
Password: ChangeMe123!
Role:     IT Security Analyst
```

**Access Level:**

- ✅ Security dimension visibility
- ✅ Integration dimension visibility
- ✅ Scalability dimension visibility
- ✅ Department-specific tasks (IT Security)
- ✅ Dashboard and metrics
- ❌ No user management

---

### 4. Legal Account

```
Email:    legal@carlsberg.com
Password: ChangeMe123!
Role:     Legal Counsel
```

**Access Level:**

- ✅ Legal & IP dimension visibility
- ✅ Department-specific tasks (Legal)
- ✅ Dashboard and metrics
- ❌ No user management

---

### 5. AI Innovation Account

```
Email:    innovation@carlsberg.com
Password: ChangeMe123!
Role:     AI Innovation Lead
```

**Access Level:**

- ✅ Product Maturity dimension visibility
- ✅ Read-only access to assessments
- ✅ Dashboard and metrics
- ❌ No user management
- ❌ Limited write permissions

---

## Getting Started

### 1. Start the Backend

```bash
cd backend
docker-compose up -d db  # Start PostgreSQL
python -m uvicorn app.main:app --reload --port 8000
```

The backend will automatically seed these demo users on startup.

### 2. Start the Frontend

```bash
cd frontend
npm install  # First time only
npm run dev
```

### 3. Login

1. Navigate to `http://localhost:3000/login`
2. Choose any demo account from above
3. Enter the email and password: `ChangeMe123!`
4. Click "Sign in"

---

## Features by Role

### Dashboard Access (All Roles)

- View vendor pipeline
- Search and filter vendors
- See vendor statistics
- Access vendor details

### Assessment Permissions

| Dimension                      | Admin | Procurement | IT Security | Legal | AI Innovation |
| ------------------------------ | ----- | ----------- | ----------- | ----- | ------------- |
| Security, Privacy & Compliance | ✅    | ❌          | ✅          | ❌    | ❌            |
| Vendor Viability & Continuity  | ✅    | ✅          | ❌          | ❌    | ❌            |
| Integration & Data Integrity   | ✅    | ❌          | ✅          | ❌    | ❌            |
| Legal & IP                     | ✅    | ❌          | ❌          | ✅    | ❌            |
| Cost & Commercials             | ✅    | ✅          | ❌          | ❌    | ❌            |
| Operations & Change Management | ✅    | ✅          | ❌          | ❌    | ❌            |
| Global Scalability             | ✅    | ❌          | ✅          | ❌    | ❌            |
| Product Maturity & Delivery    | ✅    | ❌          | ❌          | ❌    | ✅            |

### Task Management

All roles can:

- View tasks assigned to their department
- Update task status (Open → In Progress → Done)
- Filter tasks by status and priority
- See task counts in notification badge

### Admin-Only Features

Only the **Admin** account can access:

- `/admin/users` - User management page
- Create new users
- Edit user roles
- Deactivate/activate users

---

## Testing Different Workflows

### Test 1: End-to-End Assessment (Use Admin)

1. Login as `admin@carlsberg.com`
2. Go to Dashboard
3. Click on a vendor
4. Click "Run Assessment"
5. Watch the polling indicator
6. View the 8-dimension scores

### Test 2: Role-Based Access (Use Procurement)

1. Login as `procurement@carlsberg.com`
2. Try to access `/admin/users` → Should see "Access Denied"
3. Go to Tasks → Should only see Procurement tasks
4. View vendor assessment → Should see Commercial, Viability, Operations dimensions

### Test 3: Task Management (Use Any Role)

1. Login with any account
2. Go to Tasks page
3. Filter by "Open" status
4. Click on a task's checkbox to mark as done
5. See the notification badge update

---

## Password Reset (for Development)

If you need to reset a demo user password:

```python
# In backend/app/main.py, update the _seed_users function
# Change "ChangeMe123!" to your new password
# Restart the backend
```

Or use the API:

```bash
# Update user password via API
curl -X PATCH http://localhost:8000/api/users/{user_id} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"password": "NewPassword123!"}'
```

---

## Security Notes

⚠️ **These are demo credentials for development only!**

- Do NOT use these credentials in production
- The password `ChangeMe123!` is intentionally simple for demo purposes
- In production, implement:
  - Strong password requirements (min 12 chars, complexity)
  - Password expiry policies
  - Multi-factor authentication (MFA)
  - Account lockout after failed attempts
  - Password reset via email

---

## Troubleshooting

### "Invalid email or password"

- Check you're using the exact email (e.g., `@carlsberg.com` not `@example.com`)
- Password is case-sensitive: `ChangeMe123!`
- Ensure backend is running and database is seeded

### "Access Denied" on certain pages

- This is expected! Some pages are role-restricted
- Use the **Admin** account to access all features
- Check the "Features by Role" table above

### No vendors showing up

- The system starts with an empty vendor database
- Use the MCP server tools to submit vendors, or
- Manually create vendors via the API, or
- Import demo vendors (if demo scripts exist)

---

## Next Steps

After logging in successfully:

1. **Explore the Dashboard** - See the vendor pipeline interface
2. **Check Metrics** - View analytics and charts (if data exists)
3. **Browse Tasks** - See action items for your role
4. **Run an Assessment** - Create or view a vendor assessment
5. **Test Permissions** - Try accessing admin features with non-admin accounts

---

## Support

For issues or questions:

- Check the main README.md for setup instructions
- Review the frontend/README.md for frontend-specific docs
- Check backend logs: `docker-compose logs -f backend`
- Check frontend logs in the browser console (F12)

---

**Last Updated:** 2026-01-09  
**Valid For:** Vendor Assessment PoC v1.0
