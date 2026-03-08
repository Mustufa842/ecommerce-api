import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getOrder,
  updateOrderStatus,
  getAllOrders,
} from '../controllers/order.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createOrderSchema, updateOrderStatusSchema } from '../validators/schemas';

const router = Router();

// All order routes require authentication
router.use(protect);

/**
 * @route  POST /api/v1/orders
 * @desc   Create a new order (decrements stock)
 * @access Private (User)
 */
router.post('/', validate(createOrderSchema), createOrder);

/**
 * @route  GET  /api/v1/orders/my-orders
 * @desc   Get current user's orders
 * @access Private (User)
 */
router.get('/my-orders', getMyOrders);

/**
 * @route  GET  /api/v1/orders
 * @desc   Get all orders (admin dashboard)
 * @access Private (Admin)
 */
router.get('/', restrictTo('admin'), getAllOrders);

/**
 * @route  GET  /api/v1/orders/:id
 * @desc   Get a single order (own orders for users, any for admin)
 * @access Private
 */
router.get('/:id', getOrder);

/**
 * @route  PATCH /api/v1/orders/:id/status
 * @desc   Update order status (workflow: pending→processing→shipped→delivered)
 * @access Private (Admin)
 */
router.patch('/:id/status', restrictTo('admin'), validate(updateOrderStatusSchema), updateOrderStatus);

export default router;