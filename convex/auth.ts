import type { Doc } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";

export const SUPER_ADMIN_USERNAME = "riderezzy";

export type UserRole = "super_admin" | "admin" | "moderator" | "user";
type AuthCtx = QueryCtx | MutationCtx;
type UserDoc = Doc<"users">;

export type AuthenticatedUser = Omit<UserDoc, "role" | "username"> & {
  role: UserRole;
  username: string;
};

const MAX_USERNAME_LENGTH = 32;

function fallbackUsernameFromEmail(email: string) {
  return email.split("@")[0] || "user";
}

function normalizeUsername(value: string) {
  const normalized = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

  return normalized.slice(0, MAX_USERNAME_LENGTH);
}

function toUserRole(role: UserDoc["role"]): UserRole {
  if (
    role === "super_admin" ||
    role === "admin" ||
    role === "moderator" ||
    role === "user"
  ) {
    return role;
  }

  return "user";
}

function buildUsernameSeed({
  email,
  requestedUsername,
  fallbackName,
}: {
  email: string;
  requestedUsername?: string;
  fallbackName?: string;
}) {
  return (
    normalizeUsername(requestedUsername || "") ||
    normalizeUsername(fallbackName || "") ||
    normalizeUsername(fallbackUsernameFromEmail(email)) ||
    "user"
  );
}

export function getEffectiveRole(
  user: Pick<UserDoc, "username" | "role"> | null | undefined,
) {
  if (user?.username?.toLowerCase() === SUPER_ADMIN_USERNAME) {
    return "super_admin" satisfies UserRole;
  }

  return toUserRole(user?.role);
}

export function withEffectiveRole(user: UserDoc): AuthenticatedUser {
  const username = user.username || fallbackUsernameFromEmail(user.email);
  return {
    ...user,
    username,
    role: getEffectiveRole({ username, role: user.role }),
  };
}

export async function findUserByEmail(ctx: AuthCtx, email: string) {
  return await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", email.toLowerCase()))
    .unique();
}

async function findUserByTokenIdentifier(ctx: AuthCtx, tokenIdentifier: string) {
  return await ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
    .unique();
}

export async function findUserByUsername(ctx: AuthCtx, username: string) {
  return await ctx.db
    .query("users")
    .withIndex("by_username", (q) => q.eq("username", normalizeUsername(username)))
    .unique();
}

async function generateUniqueUsername(
  ctx: MutationCtx,
  baseUsername: string,
  excludeUserId?: UserDoc["_id"],
) {
  const base = normalizeUsername(baseUsername) || "user";

  for (let attempt = 0; attempt < 10_000; attempt += 1) {
    const suffix = attempt === 0 ? "" : `_${attempt + 1}`;
    const trimmedBase = base.slice(0, MAX_USERNAME_LENGTH - suffix.length);
    const candidate = `${trimmedBase}${suffix}`;
    const existing = await findUserByUsername(ctx, candidate);

    if (!existing || existing._id === excludeUserId) {
      return candidate;
    }
  }

  throw new Error("Unable to generate a unique username");
}

export async function getCurrentUserOrNull(ctx: AuthCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity?.email) {
    return null;
  }

  const email = identity.email.toLowerCase();
  const user =
    (await findUserByEmail(ctx, email)) ||
    (await findUserByTokenIdentifier(ctx, identity.subject));

  return user ? withEffectiveRole(user) : null;
}

export async function requireAuthenticatedUser(ctx: AuthCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity?.email) {
    throw new Error("Unauthorized: Authentication required");
  }

  const email = identity.email.toLowerCase();
  const user =
    (await findUserByEmail(ctx, email)) ||
    (await findUserByTokenIdentifier(ctx, identity.subject));

  if (!user) {
    throw new Error("Unauthorized: User record not found");
  }

  return withEffectiveRole(user);
}

export async function requireAdmin(ctx: AuthCtx) {
  const user = await requireAuthenticatedUser(ctx);
  if (user.role !== "admin" && user.role !== "super_admin") {
    throw new Error("Unauthorized: Admin access required");
  }
  return user;
}

export async function requireSuperAdmin(ctx: AuthCtx) {
  const user = await requireAuthenticatedUser(ctx);
  if (user.role !== "super_admin") {
    throw new Error("Unauthorized: Super admin access required");
  }
  return user;
}

export async function requireModerator(ctx: AuthCtx) {
  const user = await requireAuthenticatedUser(ctx);
  if (
    user.role !== "moderator" &&
    user.role !== "admin" &&
    user.role !== "super_admin"
  ) {
    throw new Error("Unauthorized: Moderator access required");
  }
  return user;
}

export async function ensureUserFromIdentity(
  ctx: MutationCtx,
  profile?: {
    image?: string;
    name?: string;
    username?: string;
  },
) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity?.email) {
    throw new Error("Unauthorized: Authentication required");
  }

  const email = identity.email.toLowerCase();
  const existingByEmail = await findUserByEmail(ctx, email);
  const existingByToken = await findUserByTokenIdentifier(ctx, identity.subject);

  if (
    existingByEmail &&
    existingByToken &&
    existingByEmail._id !== existingByToken._id
  ) {
    throw new Error(
      "Data integrity error: email and tokenIdentifier point to different users",
    );
  }

  const existingUser = existingByEmail || existingByToken;
  const fallbackName = profile?.name || identity.name || fallbackUsernameFromEmail(email);

  if (existingUser) {
    const creatorProfile = await ctx.db
      .query("creators")
      .withIndex("by_userId", (q) => q.eq("userId", existingUser._id))
      .unique();

    const desiredUsername =
      existingUser.username ||
      creatorProfile?.username ||
      (await generateUniqueUsername(
        ctx,
        buildUsernameSeed({
          email,
          requestedUsername: profile?.username,
          fallbackName,
        }),
        existingUser._id,
      ));

    const desiredRole = getEffectiveRole({
      username: desiredUsername,
      role: existingUser.role,
    });

    const updates: Partial<UserDoc> = {};

    if (existingUser.email !== email) {
      updates.email = email;
    }
    if (existingUser.tokenIdentifier !== identity.subject) {
      updates.tokenIdentifier = identity.subject;
    }
    if (profile?.image !== undefined && existingUser.image !== profile.image) {
      updates.image = profile.image;
    }
    if (existingUser.name !== fallbackName) {
      updates.name = fallbackName;
    }
    if (existingUser.username !== desiredUsername) {
      updates.username = desiredUsername;
    }
    if (existingUser.role !== desiredRole) {
      updates.role = desiredRole;
    }

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(existingUser._id, updates);
    }

    return {
      isNew: false,
      user: withEffectiveRole({
        ...existingUser,
        ...updates,
        email,
        tokenIdentifier: identity.subject,
        name: updates.name || existingUser.name,
        username: desiredUsername,
        role: desiredRole,
      }),
    };
  }

  const username = await generateUniqueUsername(
    ctx,
    buildUsernameSeed({
      email,
      requestedUsername: profile?.username,
      fallbackName,
    }),
  );

  const role = getEffectiveRole({ username, role: "user" });
  const userId = await ctx.db.insert("users", {
    email,
    image: profile?.image,
    name: fallbackName,
    role,
    tokenIdentifier: identity.subject,
    username,
  });

  const createdUser = await ctx.db.get(userId);
  if (!createdUser) {
    throw new Error("Failed to create user");
  }

  return {
    isNew: true,
    user: withEffectiveRole(createdUser),
  };
}
