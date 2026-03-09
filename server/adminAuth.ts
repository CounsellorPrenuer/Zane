import { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import ConnectPgSimple from 'connect-pg-simple';
import { db, pool } from './db';
import crypto from 'crypto';

const PgSession = ConnectPgSimple(session);

// Extend session data
declare module 'express-session' {
  interface SessionData {
    isAdmin?: boolean;
    adminId?: string;
  }
}

// Create session middleware for admin authentication
export const createAdminSession = () => {
  if (!process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET environment variable is required');
  }

  return session({
    store: new PgSession({
      pool: pool,
      tableName: 'sessions',
      createTableIfMissing: true, // Allow table creation for production safety
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'strict', // Enhanced CSRF protection
    },
    name: 'admin_session',
  });
};

// Admin authentication middleware
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.isAdmin) {
    return res.status(401).json({ message: 'Admin access required' });
  }
  next();
};

// Safe credential comparison to prevent timing attacks
const safeCompare = (a: string, b: string): boolean => {
  if (a.length !== b.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
};

// Admin login handler
export const adminLogin = (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }

  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword) {
    console.error('Admin credentials not configured in environment variables');
    return res.status(500).json({ message: 'Server configuration error' });
  }

  // Use timing-safe comparison to prevent timing attacks
  const usernameValid = safeCompare(username, adminUsername);
  const passwordValid = safeCompare(password, adminPassword);

  if (usernameValid && passwordValid) {
    // SECURITY FIX: Regenerate session to prevent session fixation attacks
    req.session.regenerate((err) => {
      if (err) {
        console.error('Session regeneration error:', err);
        return res.status(500).json({ message: 'Login failed' });
      }

      // Set admin session after regeneration
      req.session.isAdmin = true;
      req.session.adminId = 'admin';

      // Save session before response
      req.session.save((saveErr) => {
        if (saveErr) {
          console.error('Session save error:', saveErr);
          return res.status(500).json({ message: 'Login failed' });
        }

        res.json({
          message: 'Admin login successful',
          admin: {
            id: 'admin',
            username: adminUsername
          }
        });
      });
    });
    return;
  }

  // Add delay to prevent brute force attacks
  setTimeout(() => {
    res.status(401).json({ message: 'Invalid credentials' });
  }, 1000);
};

// Admin logout handler
export const adminLogout = (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destroy error:', err);
      return res.status(500).json({ message: 'Logout failed' });
    }

    res.clearCookie('admin_session');
    res.json({ message: 'Admin logout successful' });
  });
};

// Check admin status
export const adminStatus = (req: Request, res: Response) => {
  if (req.session.isAdmin) {
    return res.json({
      isAdmin: true,
      admin: {
        id: req.session.adminId,
        username: process.env.ADMIN_USERNAME
      }
    });
  }

  res.status(401).json({ message: 'Not authenticated as admin' });
};