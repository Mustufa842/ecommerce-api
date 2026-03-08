import { Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { AuthRequest } from '../middleware/auth.middleware';
import * as orderService from '../services/order.service';
import { OrderStatus } from '../models/order.model';

export const createOrder = catchAsync(async (req: AuthRequest, res: Response) => {
  const order = await orderService.createOrder(req.user!.id, req.body);
  res.status(201).json({ status: 'success', data: { order } });
});

export const getMyOrders = catchAsync(async (req: AuthRequest, res: Response) => {
  const orders = await orderService.getUserOrders(req.user!.id);
  res.status(200).json({ status: 'success', results: orders.length, data: { orders } });
});

export const getOrder = catchAsync(async (req: AuthRequest, res: Response) => {
  const order = await orderService.getOrderById(req.params.id, req.user!.id, req.user!.role);
  res.status(200).json({ status: 'success', data: { order } });
});

export const updateOrderStatus = catchAsync(async (req: AuthRequest, res: Response) => {
  const order = await orderService.updateOrderStatus(req.params.id, req.body.status as OrderStatus);
  res.status(200).json({ status: 'success', data: { order } });
});

export const getAllOrders = catchAsync(async (_req: AuthRequest, res: Response) => {
  const orders = await orderService.getAllOrders();
  res.status(200).json({ status: 'success', results: orders.length, data: { orders } });
});