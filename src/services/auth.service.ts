import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/user.model';
import { AppError } from '../utils/AppError';
import { RegisterInput, LoginInput } from '../validators/schemas';

const signToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  } as jwt.SignOptions);
};

export const registerUser = async (data: RegisterInput): Promise<{ user: Partial<IUser>; token: string }> => {
  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) {
    throw new AppError('Email already in use', 409);
  }

  const user = await User.create({
    name: data.name,
    email: data.email,
    password: data.password,
    role: data.role || 'user',
  });

  const token = signToken(user.id as string);

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token,
  };
};

export const loginUser = async (data: LoginInput): Promise<{ user: Partial<IUser>; token: string }> => {
  const user = await User.findOne({ email: data.email }).select('+password +active');

  if (!user || !user.active) {
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordCorrect = await user.comparePassword(data.password);
  if (!isPasswordCorrect) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = signToken(user.id as string);

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token,
  };
};