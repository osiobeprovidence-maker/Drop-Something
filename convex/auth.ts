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

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function normalizeTokenIdentifier(value: string) {
  return value.trim();
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
  const normalizedEmail = normalizeEmail(email);
  const indexedMatch = await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
    .unique();

  if (indexedMatch) {
    return indexedMatch;
  }

  const users = await ctx.db.query("users").collect();
  return users.find((user) => normalizeEmail(user.email) === normalizedEmail) ?? null;
}

async function findUserByTokenIdentifier(ctx: AuthCtx, tokenIdentifier: string) {
  const normalizedTokenIdentifier = normalizeTokenIdentifier(tokenIdentifier);
  const indexedMatch = await ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", normalizedTokenIdentifier))
    .unique();

  if (indexedMatch) {
    return indexedMatch;
  }

  const users = await ctx.db.query("users").collect();
  return (
    users.find(
      (user) =>
        normalizeTokenIdentifier(user.tokenIdentifier) === normalizedTokenIdentifier,
    ) ?? null
  );
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

async function getCreatorProfileForUser(ctx: AuthCtx, userId: UserDoc["_id"]) {
  return await ctx.db
    .query("creators")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .unique();
}

async function resolveUserForIdentity(
  ctx: AuthCtx,
  identity: NonNullable<Awaited<ReturnType<AuthCtx["auth"]["getUserIdentity"]>>>,
) {
  const normalizedEmail = normalizeEmail(identity.email ?? "");
  const normalizedTokenIdentifier = normalizeTokenIdentifier(identity.subject);
  const users = await ctx.db.query("users").collect();

  const candidates = users.filter((user) => {
    const emailMatches = normalizeEmail(user.email) === normalizedEmail;
    const tokenMatches =
      normalizeTokenIdentifier(user.tokenIdentifier) === normalizedTokenIdentifier;
    return emailMatches || tokenMatches;
  });

  if (candidates.length === 0) {
    return null;
  }

  const candidatesWithCreator = await Promise.all(
    candidates.map(async (candidate) => ({
      user: candidate,
      creatorProfile: await getCreatorProfileForUser(ctx, candidate._id),
      emailMatches: normalizeEmail(candidate.email) === normalizedEmail,
      tokenMatches:
        normalizeTokenIdentifier(candidate.tokenIdentifier) ===
        normalizedTokenIdentifier,
    })),
  );

  candidatesWithCreator.sort((left, right) => {
    const leftHasCreator = left.creatorProfile ? 1 : 0;
    const rightHasCreator = right.creatorProfile ? 1 : 0;

    if (leftHasCreator !== rightHasCreator) {
      return rightHasCreator - leftHasCreator;
    }

    const leftEmailMatch = left.emailMatches ? 1 : 0;
    const rightEmailMatch = right.emailMatches ? 1 : 0;
    if (leftEmailMatch !== rightEmailMatch) {
      return rightEmailMatch - leftEmailMatch;
    }

    const leftTokenMatch = left.tokenMatches ? 1 : 0;
    const rightTokenMatch = right.tokenMatches ? 1 : 0;
    if (leftTokenMatch !== rightTokenMatch) {
      return rightTokenMatch - leftTokenMatch;
    }

    return left.user._creationTime - right.user._creationTime;
  });

  return candidatesWithCreator[0] ?? null;
}

export async function getCurrentUserOrNull(ctx: AuthCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity?.email) {
    return null;
  }

  const resolvedUser = await resolveUserForIdentity(ctx, identity);
  const user = resolvedUser?.user ?? null;

  return user ? withEffectiveRole(user) : null;
}

export async function requireAuthenticatedUser(ctx: AuthCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity?.email) {
    throw new Error("Unauthorized: Authentication required");
  }

  const resolvedUser = await resolveUserForIdentity(ctx, identity);
  const user = resolvedUser?.user ?? null;

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

  const email = normalizeEmail(identity.email);
  const resolvedUser = await resolveUserForIdentity(ctx, identity);
  const existingUser = resolvedUser?.user ?? null;
  const fallbackName = profile?.name || identity.name || fallbackUsernameFromEmail(email);

  if (existingUser) {
    const creatorProfile =
      resolvedUser?.creatorProfile ??
      (await getCreatorProfileForUser(ctx, existingUser._id));

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
