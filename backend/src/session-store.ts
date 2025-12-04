// In-memory session store for JWT tokens
// Note: Sessions are cleared on server restart

interface Session {
  jellyfinUserId: string;
  jellyfinToken: string;
  username: string;
  createdAt: number;
}

// Map of JWT jti (unique token ID) to session data
const sessions = new Map<string, Session>();

// Session expiry time (24 hours)
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

export function createSession(jti: string, session: Omit<Session, 'createdAt'>): void {
  sessions.set(jti, {
    ...session,
    createdAt: Date.now(),
  });
}

export function getSession(jti: string): Session | undefined {
  const session = sessions.get(jti);
  if (!session) return undefined;

  // Check if session has expired
  if (Date.now() - session.createdAt > SESSION_TTL_MS) {
    sessions.delete(jti);
    return undefined;
  }

  return session;
}

export function deleteSession(jti: string): boolean {
  return sessions.delete(jti);
}

// Cleanup expired sessions periodically
setInterval(() => {
  const now = Date.now();
  for (const [jti, session] of sessions.entries()) {
    if (now - session.createdAt > SESSION_TTL_MS) {
      sessions.delete(jti);
    }
  }
}, 60 * 60 * 1000); // Run every hour

