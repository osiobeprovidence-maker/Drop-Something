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
      // Get credentials from environment variables
      const adminEmail = process.env.ADMIN_EMAIL;
      const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

      // Validate environment variables are configured
      if (!adminEmail || !adminPasswordHash) {
        throw new Error("Server Error: Admin credentials not configured");
      }

      // Check email match
      if (args.email.toLowerCase() !== adminEmail.toLowerCase()) {
        throw new Error("Invalid credentials");
      }

      // Verify password using bcryptjs
      const isPasswordValid = await bcryptjs.compare(args.password, adminPasswordHash);

      if (!isPasswordValid) {
        throw new Error("Invalid credentials");
      }

      // Successful login
      return {
        success: true,
        adminEmail: adminEmail,
        timestamp: Date.now(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login failed";
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
