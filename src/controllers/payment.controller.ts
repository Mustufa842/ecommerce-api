import { Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { AuthRequest } from '../middleware/auth.middleware';
import { processPayment } from '../services/payment.service';
import { Order } from '../models/order.model';
import { AppError } from '../utils/AppError';

export const initiatePayment = catchAsync(async (req: AuthRequest, res: Response) => {
  const { orderId, paymentMethod, cardDetails } = req.body;

  const order = await Order.findById(orderId);
  if (!order) throw new AppError('Order not found', 404);

  // Users can only pay for their own orders
  if (order.user.toString() !== req.user!.id && req.user!.role !== 'admin') {
    throw new AppError('You are not authorized to pay for this order', 403);
  }

  if (order.paymentStatus === 'paid') {
    throw new AppError('This order has already been paid', 400);
  }

  if (order.status === 'cancelled') {
    throw new AppError('Cannot process payment for a cancelled order', 400);
  }

  // Process payment through mock (or real) payment service
  const result = await processPayment(order.totalPrice, { paymentMethod, cardDetails });

  if (!result.success) {
    return res.status(402).json({
      status: 'fail',
      message: result.errorMessage || 'Payment failed',
    });
  }

  // Update order on successful payment
  order.paymentStatus = 'paid';
  order.paymentTransactionId = result.transactionId;
  order.status = 'processing'; // Auto-advance from pending → processing
  await order.save();

  res.status(200).json({
    status: 'success',
    message: 'Payment processed successfully',
    data: {
      transactionId: result.transactionId,
      orderId: order.id,
      amountCharged: order.totalPrice,
      orderStatus: order.status,
    },
  });
});