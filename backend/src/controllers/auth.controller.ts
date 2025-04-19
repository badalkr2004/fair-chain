import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import prisma from '../lib/prisma';
import authConfig from '../config/auth.config';

// Register a new user
export const signup = async (req: Request, res: Response) => {
  try {
    const { 
      email, 
      password, 
      name, 
      role, 
      phone, 
      address, 
      location,
      profileData 
    } = req.body;

    if (!email || !password || !name || !role || !phone || !address || !location || !profileData) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, authConfig.saltRounds);

    // Create transaction to handle both user and profile creation
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role,
          phone,
          address,
          location
        },
      });

      // Create specific profile based on user role
      if (role === 'FARMER' && profileData) {
        await tx.farmerProfile.create({
          data: {
            userId: user.id,
            farmSize: profileData.farmSize,
            farmLocation: profileData.farmLocation,
            farmCoordinates: profileData.farmCoordinates,
            cropTypes: profileData.cropTypes || [],
            certifications: profileData.certifications || [],
            bankDetails: profileData.bankDetails || {}
          }
        });
      } else if (role === 'INTERMEDIARY' && profileData) {
        await tx.intermediaryProfile.create({
          data: {
            userId: user.id,
            type: profileData.type,
            serviceAreas: profileData.serviceAreas || [],
            capacity: profileData.capacity || {},
            services: profileData.services || [],
            licenseNumber: profileData.licenseNumber
          }
        });
      } else if (role === 'CONSUMER' && profileData) {
        await tx.consumerProfile.create({
          data: {
            userId: user.id,
            type: profileData.type,
            businessName: profileData.businessName,
            taxId: profileData.taxId,
            preferences: profileData.preferences || []
          }
        });
      }

      return user;
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: result.id, role: result.role },
      authConfig.jwtSecret,
      { expiresIn: authConfig.jwtExpiresIn }
    );

    // Return user info without password
    const { password: _, ...userData } = result;
    
    res.status(201).json({
      message: 'User registered successfully',
      user: userData,
      token
    });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ 
      message: 'Error registering user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      authConfig.jwtSecret,
      { expiresIn: authConfig.jwtExpiresIn }
    );

    // Generate refresh token with longer expiry
    const refreshToken = jwt.sign(
      { id: user.id, tokenType: authConfig.tokenTypes.REFRESH },
      authConfig.jwtSecret,
      { expiresIn: authConfig.jwtRefreshExpiresIn }
    );

    // Return user info without password
    const { password: _, ...userData } = user;

    res.status(200).json({
      user: userData,
      token,
      refreshToken
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ 
      message: 'Error logging in',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Refresh token
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    // Verify refresh token
    const decoded: any = jwt.verify(refreshToken, authConfig.jwtSecret);

    // Check if token type is refresh
    if (decoded.tokenType !== authConfig.tokenTypes.REFRESH) {
      return res.status(401).json({ message: 'Invalid token type' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate new JWT token
    const newToken = jwt.sign(
      { id: user.id, role: user.role },
      authConfig.jwtSecret,
      { expiresIn: authConfig.jwtExpiresIn }
    );

    // Generate new refresh token
    const newRefreshToken = jwt.sign(
      { id: user.id, tokenType: authConfig.tokenTypes.REFRESH },
      authConfig.jwtSecret,
      { expiresIn: authConfig.jwtRefreshExpiresIn }
    );

    res.status(200).json({
      token: newToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Refresh token expired' });
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    
    console.error('Error refreshing token:', error);
    res.status(500).json({ 
      message: 'Error refreshing token',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get current user profile
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        farmerProfile: req.user.role === 'FARMER',
        intermediaryProfile: req.user.role === 'INTERMEDIARY',
        consumerProfile: req.user.role === 'CONSUMER'
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove password from response
    const { password, ...userData } = user;

    res.status(200).json({ user: userData });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ 
      message: 'Error getting user profile',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update user profile
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { name, phone, address, location, profileData } = req.body;
    
    // Update user in a transaction with their profile
    const result = await prisma.$transaction(async (tx) => {
      // Update basic user info
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          name: name,
          phone: phone,
          address: address,
          location: location
        }
      });
      
      // Update specific profile based on user role
      if (req.user.role === 'FARMER' && profileData) {
        await tx.farmerProfile.update({
          where: { userId },
          data: {
            farmSize: profileData.farmSize,
            farmLocation: profileData.farmLocation,
            farmCoordinates: profileData.farmCoordinates,
            cropTypes: profileData.cropTypes,
            certifications: profileData.certifications,
            bankDetails: profileData.bankDetails
          }
        });
      } else if (req.user.role === 'INTERMEDIARY' && profileData) {
        await tx.intermediaryProfile.update({
          where: { userId },
          data: {
            type: profileData.type,
            serviceAreas: profileData.serviceAreas,
            capacity: profileData.capacity,
            services: profileData.services,
            licenseNumber: profileData.licenseNumber
          }
        });
      } else if (req.user.role === 'CONSUMER' && profileData) {
        await tx.consumerProfile.update({
          where: { userId },
          data: {
            type: profileData.type,
            businessName: profileData.businessName,
            taxId: profileData.taxId,
            preferences: profileData.preferences
          }
        });
      }
      
      return updatedUser;
    });
    
    // Remove password from response
    const { password, ...userData } = result;
    
    res.status(200).json({
      message: 'Profile updated successfully',
      user: userData
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ 
      message: 'Error updating user profile',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Change password
export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    
    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify current password
    const passwordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!passwordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, authConfig.saltRounds);
    
    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });
    
    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ 
      message: 'Error changing password',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 