# 🔐 Secure Admin Authentication - Quick Start Guide

## ✅ What Was Built

A complete, production-ready admin authentication system for DropSomething with:

### Frontend Components
- **AdminLogin.tsx** - Modern login interface with email/password fields
- **AdminContext.tsx** - Session management and state
- **AdminRoute.tsx** - Route protection wrapper
- **AdminDashboard.tsx** - Updated with admin logout

### Backend Components
- **convex/adminAuth.ts** - Login mutation with bcryptjs verification

### Security Features
✅ Passwords hashed with bcryptjs  
✅ Credentials in environment variables (not database)  
✅ 24-hour session expiration  
✅ localStorage session storage  
✅ Production-ready error handling  

## 🚀 Quick Setup (5 minutes)

### Step 1: Generate Password Hash
```bash
node -e "console.log(require('bcryptjs').hashSync('your-secure-password', 10))"
```

Copy the output (it looks like: `$2a$10$...`)

### Step 2: Set Convex Environment Variables
```bash
npx convex env set ADMIN_EMAIL "admin@dropsomething.sbs"
npx convex env set ADMIN_PASSWORD_HASH "$2a$10$..."  # paste from step 1
```

### Step 3: Deploy
```bash
npx convex deploy
```

### Step 4: Test
1. Go to `https://yourdomain.sbs/admin`
2. Login with your email and password
3. You should see the admin dashboard

## 📁 File Overview

| File | Purpose |
|------|---------|
| `src/context/AdminContext.tsx` | Manages admin session state |
| `src/pages/AdminLogin.tsx` | Beautiful login UI |
| `src/pages/AdminRoute.tsx` | Route wrapper with session check |
| `convex/adminAuth.ts` | Backend authentication logic |
| `scripts/generate-admin-hash.js` | Helper to generate password hashes |
| `ADMIN_AUTH_SETUP.md` | Detailed documentation |

## 🔄 How It Works

```
User visits /admin
    ↓
AdminRoute checks localStorage["adminSession"]
    ↓
Session found & valid? → Show AdminDashboard
Session missing/expired? → Show AdminLogin
    ↓
User enters email + password
    ↓
Calls adminAuth:login mutation
    ↓
Backend validates with bcryptjs.compare()
    ↓
Valid? → Store session in localStorage
Invalid? → Show error message
```

## 💻 Code Examples

### Check if user is admin
```typescript
import { useAdmin } from "@/src/context/AdminContext";

export function MyComponent() {
  const { isAdmin } = useAdmin();
  
  return isAdmin ? <AdminFeature /> : <AccessDenied />;
}
```

### Logout
```typescript
const { adminLogout } = useAdmin();

<button onClick={adminLogout}>Logout</button>
```

### Handle login errors
```typescript
const { adminLogin, loginError } = useAdmin();

{loginError && <div className="error">{loginError}</div>}
```

## 🔑 Default Test Credentials

If you want to test with the provided hash:

- **Email**: `admin@example.com`
- **Password**: `admin123`
- **Hash**: `$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeQJJ6pLEuNflxm2B.e`

⚠️ **Change these for production!**

## 📊 Admin Dashboard Features

Once logged in, admins can:

- **Overview** - View platform statistics
- **Users** - Manage user roles and ban users
- **Slates** - Moderate and delete posts
- **Comments** - Review and delete comments
- **Shop** - Manage products
- **Reports** - Handle user reports

## 🛡️ Security Checklist

Before going to production:

- [ ] Generate new password hash (don't use test hash)
- [ ] Set both environment variables in Convex
- [ ] Run `npx convex deploy`
- [ ] Test login/logout works
- [ ] Verify session expires after 24 hours
- [ ] Check browser console for any errors
- [ ] Use HTTPS only (no HTTP)
- [ ] Store password securely (password manager)

## 🆘 Troubleshooting

### Can't login
- Check email is exactly correct (case-insensitive)
- Verify environment variables are set in Convex dashboard
- Check browser console for errors
- Try clearing localStorage: `localStorage.clear()`

### Session expires immediately
- Verify `ADMIN_PASSWORD_HASH` is set correctly
- Check no spaces in password hash
- Try generating new hash

### Logout doesn't work
- Check browser console for errors
- Verify AdminDashboard is using `adminLogout` from context
- Clear localStorage manually if needed

### Login page loads but doesn't submit
- Check Convex is running: `npx convex dev`
- Verify network tab shows mutation being called
- Check browser console for CORS errors

## 📚 Additional Resources

- **Full Setup Guide**: Read `ADMIN_AUTH_SETUP.md`
- **Generate Hash Tool**: Run `node scripts/generate-admin-hash.js`
- **Convex Docs**: https://docs.convex.dev
- **bcryptjs Docs**: https://www.npmjs.com/package/bcryptjs

## ✨ Key Features

✅ **Production Ready** - Industry standard security practices  
✅ **Modern UI** - Beautiful, responsive design  
✅ **Easy Setup** - 5 minute configuration  
✅ **Well Documented** - Comprehensive guides and examples  
✅ **Maintainable** - Clean, well-commented code  
✅ **Secure** - No plain text passwords ever stored  

---

**Need help?** Check `ADMIN_AUTH_SETUP.md` for detailed documentation or review the code comments for implementation details.
