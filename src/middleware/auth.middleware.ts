import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

interface JwtPayload {
  id: string;
  iat: number;
  exp: number;
}

// ─── Protect: Require valid JWT ───────────────────────────────────────────────
export const protect = catchAsync(async (req: AuthRequest, _res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in. Please log in to get access.', 401));
  }

  const secret = process.env.JWT_SECRET!;
  const decoded = jwt.verify(token, secret) as JwtPayload;

  const currentUser = await User.findById(decoded.id).select('+active');
  if (!currentUser || !currentUser.active) {
    return next(new AppError('The user belonging to this token no longer exists.', 401));
  }

  req.user = { id: decoded.id, role: currentUser.role };
  next();
});

// ─── Restrict: Require specific roles ─────────────────────────────────────────
export const restrictTo = (...roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }
    next();
  };
};