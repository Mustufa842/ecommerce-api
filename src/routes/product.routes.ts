import { Router } from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
} from '../validators/schemas';

const router = Router();

/**
 * @route  GET  /api/v1/products
 * @desc   Get all products with filtering, sorting, pagination
 * @access Public
 * @query  page, limit, category, minPrice, maxPrice, sortBy, search
 */
router.get('/', validate(productQuerySchema), getProducts);

/**
 * @route  GET  /api/v1/products/:id
 * @desc   Get a single product
 * @access Public
 */
router.get('/:id', getProduct);

/**
 * @route  POST /api/v1/products
 * @desc   Create a new product
 * @access Private (Admin only)
 */
router.post('/', protect, restrictTo('admin'), validate(createProductSchema), createProduct);

/**
 * @route  PATCH /api/v1/products/:id
 * @desc   Update a product
 * @access Private (Admin only)
 */
router.patch('/:id', protect, restrictTo('admin'), validate(updateProductSchema), updateProduct);

/**
 * @route  DELETE /api/v1/products/:id
 * @desc   Delete a product
 * @access Private (Admin only)
 */
router.delete('/:id', protect, restrictTo('admin'), deleteProduct);

export default router;