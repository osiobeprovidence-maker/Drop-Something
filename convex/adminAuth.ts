import { mutation } from "./_generated/server";
import { v } from "convex/values";
import bcryptjs from "bcryptjs";

/**
 * Admin Authentication Module
 * 
 * This handles superadmin login using credentials from environment variables
 * Credentials are NOT stored in the database for enhanced security
 * 
 * Environment Variables Required:
 * - ADMIN_EMAIL: The admin email address
 * - ADMIN_PASSWORD_HASH: The bcrypt hash of the admin password
 */

/**
 * Admin login mutation
 * Validates email and password against environment variable credentials
 * 
 * In production:
 * 1. Set ADMIN_EMAIL and ADMIN_PASSWORD_HASH in Convex environment variables
 * 2. Generate hash using: bcryptjs.hashSync(password, 10)
 * 3. Never expose ADMIN_PASSWORD_HASH in client code
 */
export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      console.log("🔐 [adminAuth.login] Backend handler called. Email:", args.email);
      
      // Get credentials from environment variables
      const adminEmail = process.env.ADMIN_EMAIL;
      const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
      
      console.log("🔐 [adminAuth.login] Checking environment variables...");
      console.log("  ADMIN_EMAIL configured:", !!adminEmail);
      console.log("  ADMIN_PASSWORD_HASH configured:", !!adminPasswordHash);

      // Validate environment variables are configured
      if (!adminEmail) {
        console.error("❌ [adminAuth.login] ADMIN_EMAIL is not set in Convex environment variables");
        throw new Error("Server Error: ADMIN_EMAIL not configured in Convex environment");
      }
      
      if (!adminPasswordHash) {
        console.error("❌ [adminAuth.login] ADMIN_PASSWORD_HASH is not set in Convex environment variables");
        throw new Error("Server Error: ADMIN_PASSWORD_HASH not configured in Convex environment");
      }

      // Step 1: Check email match
      console.log("🔐 [adminAuth.login] Step 1: Validating email...");
      console.log("  Provided email:", args.email);
      console.log("  Admin email (from env):", adminEmail);
      console.log("  Case-insensitive match:", args.email.toLowerCase() === adminEmail.toLowerCase());
      
      if (args.email.toLowerCase() !== adminEmail.toLowerCase()) {
        console.warn("❌ [adminAuth.login] Email mismatch. Login attempt with:", args.email);
        throw new Error("Invalid credentials");
      }
      console.log("✅ [adminAuth.login] Email matched");

      // Step 2: Verify password using bcryptjs
      console.log("🔐 [adminAuth.login] Step 2: Validating password with bcryptjs.compare()...");
      const isPasswordValid = await bcryptjs.compare(args.password, adminPasswordHash);
      console.log("  Password valid:", isPasswordValid);

      if (!isPasswordValid) {
        console.warn("❌ [adminAuth.login] Password mismatch");
        throw new Error("Invalid credentials");
      }
      console.log("✅ [adminAuth.login] Password matched");

      // Successful login
      console.log("✅ [adminAuth.login] Login successful! Returning session data.");
      return {
        success: true,
        adminEmail: adminEmail,
        timestamp: Date.now(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login failed";
      console.error("❌ [adminAuth.login] Error during authentication:", {
        message: errorMessage,
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        originalError: error,
      });
      throw new Error(errorMessage);
    }
  },
});

/**
 * Helper function to check if user is admin
 * Used in other admin functions for authorization
 * 
 * Returns the admin status
 */
export async function requireAdmin(ctx: any): Promise<boolean> {
  try {
    // Check if request has admin session token (optional, for API-based admin access)
    // In client-side access, the check happens in the frontend via localStorage
    
    // Alternative: Check Convex identity for admin role
    const identity = await ctx.auth.getUserIdentity();
    if (identity) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
        .unique();
      
      return user?.role === "admin" || false;
    }
    
    return false;
  } catch (error) {
    return false;
  }
}
