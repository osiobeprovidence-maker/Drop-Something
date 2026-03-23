# Admin Login Debugging Guide

## 🔍 **What Was Fixed**

Updated admin login to expose **ALL errors** with detailed console logging at every step:

1. ✅ **Frontend (AdminLogin.tsx)** - Logs form submission
2. ✅ **Frontend (AdminContext.tsx)** - Logs mutation call and error details
3. ✅ **Backend (convex/adminAuth.ts)** - Logs every validation step
4. ✅ **Environment variables** - Shows which env vars are missing

---

## 🧪 **How to Debug Your Login**

### **Step 1: Check Browser Console**

When you attempt to log in:

1. Open DevTools: **F12** (Chrome, Firefox, Edge) or **Cmd+Option+I** (Safari)
2. Go to **Console** tab
3. Try logging in with any email/password
4. **You will see one of these:**

---

### **Error Scenario #1: Environment Variables Not Set** ❌

**You'll see in console:**
```
🔑 [AdminLogin] Form submitted. Email: admin@example.com
🔑 [AdminContext] Login attempt: {email: "admin@example.com"}
🔑 [AdminContext] Calling backend adminAuth.login mutation...
❌ [AdminContext] Login error: {
  error: Error: "Server Error: ADMIN_EMAIL not configured in Convex environment"
  errorMessage: "Server Error: ADMIN_EMAIL not configured in Convex environment"
  ...
}
```

**What it means:** The environment variables are not set in Convex. See **Step 2** below.

---

### **Error Scenario #2: Password Hash Not Set** ❌

**You'll see in console:**
```
🔑 [AdminContext] Calling backend adminAuth.login mutation...
❌ [AdminContext] Login error: {
  errorMessage: "Server Error: ADMIN_PASSWORD_HASH not configured in Convex environment"
}
```

**What it means:** Password hash is missing. See **Step 2** below.

---

### **Error Scenario #3: Email Mismatch** ❌

**You'll see in console (backend logs appear in Convex logs):**
```
Run `npx convex logs` to see:

🔑 [adminAuth.login] Backend handler called. Email: wrong@example.com
🔑 [adminAuth.login] Checking environment variables...
  ADMIN_EMAIL configured: true
  ADMIN_PASSWORD_HASH configured: true
🔑 [adminAuth.login] Step 1: Validating email...
  Provided email: wrong@example.com
  Admin email (from env): admin@example.com
  Case-insensitive match: false
❌ [adminAuth.login] Email mismatch. Login attempt with: wrong@example.com
```

**What it means:** You're using the wrong email. The email must match exactly (case-insensitive).

---

### **Error Scenario #4: Password Mismatch** ❌

**You'll see in backend logs:**
```
🔑 [adminAuth.login] Step 2: Validating password with bcryptjs.compare()...
  Password valid: false
❌ [adminAuth.login] Password mismatch
```

**What it means:** Password is wrong or hash is corrupted.

---

### **Success Scenario** ✅

**You'll see in console:**
```
🔑 [AdminLogin] Form submitted. Email: admin@example.com
🔑 [AdminContext] Login attempt: {email: "admin@example.com"}
🔑 [AdminContext] Calling backend adminAuth.login mutation...
✅ [AdminContext] Backend returned result: {success: true, adminEmail: "admin@example.com", timestamp: ...}
✅ [AdminContext] Login successful. Setting admin session...
✅ [AdminContext] Admin session stored in localStorage
```

**And in backend logs (`npx convex logs`):**
```
🔑 [adminAuth.login] Backend handler called. Email: admin@example.com
🔑 [adminAuth.login] Step 1: Validating email...
  Case-insensitive match: true
✅ [adminAuth.login] Email matched
🔑 [adminAuth.login] Step 2: Validating password with bcryptjs.compare()...
  Password valid: true
✅ [adminAuth.login] Password matched
✅ [adminAuth.login] Login successful! Returning session data.
```

You should be logged in immediately.

---

## 📋 **Step 2: Verify Convex Environment Variables**

The issue is likely: **Environment variables are not set in Convex** (not Vercel).

### **2a) Check if variables are set:**

```bash
npx convex env list
```

You should see:
```
ADMIN_EMAIL
ADMIN_PASSWORD_HASH
```

### **2b) If they're NOT listed, set them:**

First, generate a password hash:

```bash
node scripts/generate-admin-hash.js --password "your-secure-password"
```

Output will show:
```
Set ADMIN_PASSWORD_HASH to:
$2b$10$WoNoCCW0lBkGpc/BEkF5leOoqO/kICxbd.rKpOb3f.vxrx8r.o/Pu
```

Then set the environment variables in Convex:

```bash
# Set admin email
npx convex env set ADMIN_EMAIL "your-admin@example.com"

# Set password hash (copy from generate-admin-hash output)
npx convex env set ADMIN_PASSWORD_HASH "$2b$10$WoNoCCW0lBkGpc/BEkF5leOoqO/kICxbd.rKpOb3f.vxrx8r.o/Pu"
```

### **2c) Deploy after setting env vars:**

```bash
npx convex deploy --yes
```

### **2d) Verify they're now set:**

```bash
npx convex env list
```

Should show both variables.

---

## ⚠️ **IMPORTANT: Vercel vs Convex Environment Variables**

**Common Mistake:**

You might have set these in **Vercel**:
- `VITE_ADMIN_EMAIL`
- `VITE_ADMIN_PASSWORD_HASH`

**But the code expects them in Convex:**
- `ADMIN_EMAIL` (in Convex backend)
- `ADMIN_PASSWORD_HASH` (in Convex backend)

**These are TWO DIFFERENT systems:**

| System | Where | Access | Usage |
|--------|-------|--------|-------|
| **Vercel** | Deployment platform | Frontend (if prefixed `VITE_`) | Hosting |
| **Convex** | Backend database | `process.env` in mutations | Admin auth |

The admin login happens **entirely in Convex** (backend), so the env vars must be in **Convex**, not Vercel.

---

## 🧭 **Error Flow with New Logging**

```
User enters email + password
    ↓
[AdminLogin.tsx] Logs: "🔑 Form submitted. Email: ..."
    ↓
Calls adminLogin(email, password)
    ↓
[AdminContext.tsx] Logs: "🔑 Login attempt: ..."
    ↓
Calls adminLoginMutation via Convex
    ↓
[convex/adminAuth.ts] Handler runs:
  ├─ Logs: "🔑 Backend handler called"
  ├─ Logs: "🔑 Checking environment variables"
  │  ├─ If missing → "❌ ADMIN_EMAIL not configured"
  │  └─ Throw error → Return to frontend
  ├─ Logs: "🔑 Step 1: Validating email"
  │  ├─ If mismatch → "❌ Email mismatch"
  │  └─ Throw error → Return to frontend
  ├─ Logs: "🔑 Step 2: Validating password"
  │  ├─ If mismatch → "❌ Password mismatch"
  │  └─ Throw error → Return to frontend
  └─ Success → Return session data
    ↓
[AdminContext.tsx] Catches result:
  ├─ If error → Logs "❌ Login error: {details}"
  └─ Sets loginError state
    ↓
[AdminLogin.tsx] Error alert shows in UI
    ↓
User sees error message
```

---

## 📊 **Viewing Backend Logs**

To see backend logs from `convex/adminAuth.ts`:

```bash
npx convex logs
```

This streams real-time logs. Try logging in while watching this terminal.

Or check logs with tail:
```bash
npx convex logs | tail -50
```

---

## ✅ **Complete Checklist**

Before trying to log in again:

- [ ] Run `npx convex env list` and confirm `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH` are set
- [ ] Run `npx convex deploy --yes` after adding env vars
- [ ] Build updated code: `npm run build` ✅ Should succeed
- [ ] Deploy: `npx convex deploy --yes` ✅ Should succeed
- [ ] Clear browser cache (Ctrl+Shift+Delete) or open in private/incognito window
- [ ] Open DevTools (F12)
- [ ] Try logging in with email and password
- [ ] Check **Console** tab for logs starting with 🔑 or ✅ or ❌
- [ ] If still failing, run `npx convex logs` in another terminal and try login again

---

## 🐛 **If You Still Can't See Logs**

1. **Clear localStorage:**
   - DevTools → Application → Local Storage → Clear All
   - Reload page

2. **Check network tab:**
   - DevTools → Network tab
   - Try login
   - Look for failed requests to Convex
   - Right-click → Copy as cURL

3. **Check if admin page loads at all:**
   - Visit `/admin`
   - Should show **AdminLogin** component
   - Should NOT show **AdminDashboard**

4. **Verify Convex is deployed:**
   ```bash
   npx convex deploy --yes
   ```

---

## 📝 **Files Modified**

- `src/pages/AdminLogin.tsx` - Added frontend form logging
- `src/context/AdminContext.tsx` - Added mutation and error logging
- `convex/adminAuth.ts` - Added step-by-step backend logging

All changes deployed. No database changes. No breaking changes.

---

## 🎯 **Next Steps**

1. **Set environment variables:**
   ```bash
   npx convex env set ADMIN_EMAIL "your-email@example.com"
   npx convex env set ADMIN_PASSWORD_HASH "your-hash-from-script"
   ```

2. **Deploy:**
   ```bash
   npx convex deploy --yes
   ```

3. **Try login and check logs:**
   ```bash
   npx convex logs
   ```

4. **Open DevTools (F12)** and check **Console** for 🔑 logs

You should now see the **exact error** preventing login!
