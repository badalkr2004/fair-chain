import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import authConfig from '../config/auth.config';
import prisma from '../lib/prisma';

// Since we may not have Prisma client generated yet, define UserRole enum here
enum UserRole {
  FARMER = 'FARMER',
  INTERMEDIARY = 'INTERMEDIARY',
  CONSUMER = 'CONSUMER',
  ADMIN = 'ADMIN'
}

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Middleware to authenticate JWT token
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded: any = jwt.verify(token, authConfig.jwtSecret);
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Token expired' });
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    return res.status(500).json({ message: 'Authentication error' });
  }
};

/**
 * Middleware to check if user has required role
 */
export const authorize = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Unauthorized - Insufficient permissions' });
    }
    
    next();
  };
};

/**
 * Middleware to validate farmer
 */
export const isFarmer = (req: Request, res: Response, next: NextFunction) => {
  if (req.user.role !== UserRole.FARMER) {
    return res.status(403).json({ message: 'Requires farmer role' });
  }
  next();
};

/**
 * Middleware to validate intermediary
 */
export const isIntermediary = (req: Request, res: Response, next: NextFunction) => {
  if (req.user.role !== UserRole.INTERMEDIARY) {
    return res.status(403).json({ message: 'Requires intermediary role' });
  }
  next();
};

/**
 * Middleware to validate consumer
 */
export const isConsumer = (req: Request, res: Response, next: NextFunction) => {
  if (req.user.role !== UserRole.CONSUMER) {
    return res.status(403).json({ message: 'Requires consumer role' });
  }
  next();
};

/**
 * Middleware to validate admin
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user.role !== UserRole.ADMIN) {
    return res.status(403).json({ message: 'Requires admin role' });
  }
  next();
}; 