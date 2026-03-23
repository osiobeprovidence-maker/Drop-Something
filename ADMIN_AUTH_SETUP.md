# Secure Admin Authentication System

A production-ready admin authentication system for DropSomething built with React (frontend) and Convex (backend).

## 🔒 Features

✅ **Secure Password Hashing** - Uses bcryptjs for password storage
✅ **Environment Variables** - Credentials never stored in database  
✅ **Session Management** - 24-hour session expiration with localStorage
✅ **Modern UI** - Beautiful, responsive admin login page
✅ **Error Handling** - Clear error messages and validation
✅ **Production Ready** - Clean code, well-documented, industry standards

## 📁 File Structure

```
src/
├── context/
│   └── AdminContext.tsx          # Admin session state management
├── pages/
│   ├── AdminLogin.tsx            # Login page UI
│   ├── AdminRoute.tsx            # Route wrapper with session check
│   └── AdminDashboard.tsx        # Admin dashboard (updated with logout)
│
convex/
└── adminAuth.ts                  # Backend authentication logic
```

## 🚀 Setup Instructions

### 1. Generate Admin Password Hash

First, create a bcrypt hash for your admin password:

```bash
npm install bcryptjs
```

Then run this in Node.js:

```javascript
const bcrypt = require('bcryptjs');
const plainPassword = 'your-secure-password-here';
const hash = bcrypt.hashSync(plainPassword, 10);
console.log('Hash:', hash);
// Example output: $2a$10$xyz...
```

**⚠️ IMPORTANT**: Never use this hash in client code or version control!

### 2. Set Environment Variables in Convex

Add these to your Convex environment:

**Via Convex Dashboard:**
1. Go to your Convex project dashboard
2. Navigate to Settings → Environment Variables
3. Add these variables:

```
ADMIN_EMAIL=your-admin@example.com
ADMIN_PASSWORD_HASH=$2a$10$xyz... (use the hash from step 1)
```

**Or via CLI:**
```bash
npx convex env set ADMIN_EMAIL "your-admin@example.com"
npx convex env set ADMIN_PASSWORD_HASH "$2a$10$xyz..."
```

### 3. Deploy Changes

```bash
# Deploy Convex backend
npx convex deploy

# Build and deploy frontend
npm run build
npm run deploy  # or your deployment command
```

### 4. Access Admin Panel

Navigate to: `https://yourdomain.com/admin`

Login with:
- **Email**: `your-admin@example.com`
- **Password**: `your-secure-password-here` (plain text - will be hashed server-side)

## 🔐 Security Architecture

### Frontend (React):
```
/admin route → Check localStorage["adminSession"]
  ├─ Session exists & valid? → Show AdminDashboard
  └─ No session or expired? → Show AdminLogin
```

### Backend (Convex):
```
adminAuth:login mutation
  ├─ Validate email against ADMIN_EMAIL env var
  ├─ Validate password with bcryptjs.compare()
  ├─ Return success token on match
  └─ Throw "Invalid credentials" on failure
```

### Storage:
```
localStorage["adminSession"] {
  isAdmin: true,
  email: "admin@example.com",
  timestamp: 1234567890
}
```

### Expiration:
- Sessions expire after **24 hours**
- Automatic validation on page load
- Can be cleared manually via logout button

## 📝 Usage Examples

### Login Component
```typescript
import { useAdmin } from "@/src/context/AdminContext";

function MyComponent() {
  const { isAdmin, adminLogin, loginError, isLoading } = useAdmin();

  const handleLogin = async (email, password) => {
    await adminLogin(email, password);
  };

  return (
    <form onSubmit={handleLogin}>
      {/* form fields */}
    </form>
  );
}
```

### Checking Admin Session
```typescript
import { useAdmin } from "@/src/context/AdminContext";

function ProtectedFeature() {
  const { isAdmin, checkAdminSession } = useAdmin();

  if (!checkAdminSession()) {
    return <div>Unauthorized</div>;
  }

  return <div>Admin Content</div>;
}
```

### Logout
```typescript
import { useAdmin } from "@/src/context/AdminContext";

function LogoutButton() {
  const { adminLogout } = useAdmin();

  return (
    <button onClick={adminLogout}>
      Logout
    </button>
  );
}
```

## 🔧 Backend Function Reference

### `adminAuth:login` (Mutation)

**Arguments:**
```typescript
{
  email: string;      // Admin email
  password: string;   // Admin password (plain text)
}
```

**Returns:**
```typescript
{
  success: true;
  adminEmail: string;
  timestamp: number;
}
```

**Throws:**
- `"Invalid credentials"` - Email or password mismatch
- `"Server Error"` - Environment variables not configured

## 🛡️ Security Best Practices

### ✅ DO:
- [x] Store password hash in environment variables
- [x] Use bcryptjs for password hashing
- [x] Set 24-hour expiration on sessions
- [x] Clear session on logout
- [x] Validate email on every login attempt
- [x] Use HTTPS only in production
- [x] Rotate passwords regularly

### ❌ DON'T:
- [ ] Store plain text passwords
- [ ] Expose `ADMIN_PASSWORD_HASH` in client code
- [ ] Use weak passwords
- [ ] Skip environment variable setup
- [ ] Log sensitive credentials
- [ ] Run on HTTP (unencrypted)
- [ ] Commit `.env` files to git

## 🔄 Regenerating Admin Password

To change the admin password:

1. Generate new hash using bcryptjs:
```bash
node -e "console.log(require('bcryptjs').hashSync('new-password', 10))"
```

2. Update environment variable:
```bash
npx convex env set ADMIN_PASSWORD_HASH "new-hash-value"
```

3. Deploy:
```bash
npx convex deploy
```

## 🧪 Testing Locally

### 1. Create `.env.local` with test credentials:
```
ADMIN_EMAIL="test@example.com"
ADMIN_PASSWORD_HASH="$2a$10$test..."
```

### 2. Start dev server:
```bash
npm run dev
```

### 3. Navigate to:
```
http://localhost:5173/admin
```

### 4. Login with test credentials

## 📊 Admin Dashboard Features

The admin dashboard includes:

- **Overview**: Platform statistics (users, posts, comments, creators, products, reports)
- **Users**: Manage user roles and ban users
- **Slates**: Moderate content and delete posts
- **Comments**: Review and delete comments
- **Shop**: Manage and delete products
- **Reports**: Review and handle user reports

## 🆘 Troubleshooting

### "Invalid credentials" error
- Check email matches `ADMIN_EMAIL` exactly (case-insensitive)
- Verify `ADMIN_PASSWORD_HASH` is set in Convex environment
- Ensure no spaces in password input

### Session expires immediately
- Clear localStorage: `localStorage.clear()`
- Check browser's localStorage limits
- Verify timestamp is being set correctly

### Login page stuck on loading
- Check browser console for errors
- Verify Convex connection is working
- Test with `npx convex query adminAuth:login`

### Can't access admin dashboard after login
- Ensure `AdminProvider` is in App.tsx provider chain
- Check localStorage has `adminSession` key
- Clear browser cache and localStorage

## 📚 Related Documentation

- [Convex Environment Variables](https://docs.convex.dev/environment-variables)
- [Convex Mutations](https://docs.convex.dev/functions/mutations)
- [bcryptjs Documentation](https://www.npmjs.com/package/bcryptjs)
- [React Context API](https://react.dev/learn/passing-data-deeply-with-context)

## 📄 License

This admin authentication system is part of the DropSomething platform.
