import mongoose from 'mongoose';
import { Order, IOrder, OrderStatus } from '../models/order.model';
import { Product } from '../models/product.model';
import { AppError } from '../utils/AppError';
import { CreateOrderInput } from '../validators/schemas';

export const createOrder = async (userId: string, data: CreateOrderInput): Promise<IOrder> => {
  // Use a session for atomicity: stock decrement + order creation
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Fetch all products in a single query
    const productIds = data.items.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } }).session(session);

    if (products.length !== data.items.length) {
      throw new AppError('One or more products not found', 404);
    }

    // Validate stock and build order items
    const orderItems = [];
    let totalPrice = 0;

    for (const item of data.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new AppError(`Product ${item.productId} not found`, 404);

      if (product.stock < item.quantity) {
        throw new AppError(
          `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`,
          400
        );
      }

      orderItems.push({
        product: product.id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
      });

      totalPrice += product.price * item.quantity;
    }

    // Decrement stock for all items
    const stockUpdates = data.items.map((item) =>
      Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity, sold: item.quantity } },
        { session }
      )
    );
    await Promise.all(stockUpdates);

    // Create order
    const [order] = await Order.create(
      [
        {
          user: userId,
          items: orderItems,
          totalPrice: Math.round(totalPrice * 100) / 100,
          shippingAddress: data.shippingAddress,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    return order;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

export const getUserOrders = async (userId: string): Promise<IOrder[]> => {
  return Order.find({ user: userId })
    .populate('items.product', 'name images category')
    .sort({ createdAt: -1 });
};

export const getOrderById = async (orderId: string, userId: string, role: string): Promise<IOrder> => {
  const order = await Order.findById(orderId).populate('items.product', 'name images');
  if (!order) throw new AppError('Order not found', 404);

  // Users can only view their own orders; admins can view all
  if (role !== 'admin' && order.user.toString() !== userId) {
    throw new AppError('You do not have permission to view this order', 403);
  }

  return order;
};

export const updateOrderStatus = async (
  orderId: string,
  newStatus: OrderStatus
): Promise<IOrder> => {
  const order = await Order.findById(orderId);
  if (!order) throw new AppError('Order not found', 404);

  // Enforce valid status transitions
  const transitions: Record<OrderStatus, OrderStatus[]> = {
    pending: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: [],
  };

  if (!transitions[order.status].includes(newStatus)) {
    throw new AppError(
      `Cannot transition order from '${order.status}' to '${newStatus}'`,
      400
    );
  }

  // If cancelling a paid order, restore stock
  if (newStatus === 'cancelled' && order.paymentStatus === 'paid') {
    const stockRestores = order.items.map((item) =>
      Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, sold: -item.quantity },
      })
    );
    await Promise.all(stockRestores);
  }

  order.status = newStatus;
  await order.save();
  return order;
};

export const getAllOrders = async (): Promise<IOrder[]> => {
  return Order.find()
    .populate('user', 'name email')
    .populate('items.product', 'name')
    .sort({ createdAt: -1 });
};