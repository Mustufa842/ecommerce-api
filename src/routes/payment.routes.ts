import { Router } from 'express';
import { initiatePayment } from '../controllers/payment.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { paymentSchema } from '../validators/schemas';

const router = Router();

/**
 * @route  POST /api/v1/payments/pay
 * @desc   Process payment for an order
 * @access Private (User)
 */
router.post('/pay', protect, validate(paymentSchema), initiatePayment);

export default router;