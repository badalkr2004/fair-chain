import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import authConfig from "../config/auth.config";
import prisma from "../lib/prisma";
import type { StringValue } from "ms";

// Since we may not have Prisma client generated yet, define UserRole enum here
enum UserRole {
  FARMER = "FARMER",
  INTERMEDIARY = "INTERMEDIARY",
  CONSUMER = "CONSUMER",
  ADMIN = "ADMIN",
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
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const bearerToken = typeof authHeader === 'string' ? authHeader : undefined;
    
    if (!bearerToken || !bearerToken.startsWith("Bearer ")) {
      res.status(401).json({ message: "No token provided" });
      return;
    }

    const token = bearerToken.split(" ")[1]!;

    // Verify token
    const decoded: any = jwt.verify(token, authConfig.jwtSecret);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: "Token expired" });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: "Invalid token" });
      return;
    }

    res.status(500).json({ message: "Authentication error" });
  }
};

/**
 * Middleware to check if user has required role
 */
export const authorize = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res
        .status(403)
        .json({ message: "Unauthorized - Insufficient permissions" });
      return;
    }

    next();
  };
};

/**
 * Middleware to validate farmer
 */
export const isFarmer = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (req.user.role !== UserRole.FARMER) {
    res.status(403).json({ message: "Requires farmer role" });
    return;
  }
  next();
};

/**
 * Middleware to validate intermediary
 */
export const isIntermediary = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (req.user.role !== UserRole.INTERMEDIARY) {
    res.status(403).json({ message: "Requires intermediary role" });
    return;
  }
  next();
};

/**
 * Middleware to validate consumer
 */
export const isConsumer = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (req.user.role !== UserRole.CONSUMER) {
    res.status(403).json({ message: "Requires consumer role" });
    return;
  }
  next();
};

/**
 * Middleware to validate admin
 */
export const isAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (req.user.role !== UserRole.ADMIN) {
    res.status(403).json({ message: "Requires admin role" });
    return;
  }
  next();
};
