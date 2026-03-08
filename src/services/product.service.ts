import { FilterQuery } from 'mongoose';
import { Product, IProduct } from '../models/product.model';
import { AppError } from '../utils/AppError';
import { CreateProductInput, UpdateProductInput } from '../validators/schemas';

interface ProductQuery {
  page?: string;
  limit?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  sortBy?: string;
  search?: string;
}

interface PaginatedProducts {
  products: IProduct[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export const getProducts = async (query: ProductQuery): Promise<PaginatedProducts> => {
  const page = parseInt(query.page || '1', 10);
  const limit = Math.min(parseInt(query.limit || '10', 10), 100);
  const skip = (page - 1) * limit;

  // Build filter
  const filter: FilterQuery<IProduct> = {};

  if (query.category) filter.category = query.category.toLowerCase();

  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = parseFloat(query.minPrice);
    if (query.maxPrice) filter.price.$lte = parseFloat(query.maxPrice);
  }

  if (query.search) {
    filter.$text = { $search: query.search };
  }

  // Build sort
  const sortMap: Record<string, Record<string, 1 | -1>> = {
    price: { price: 1 },
    '-price': { price: -1 },
    createdAt: { createdAt: 1 },
    '-createdAt': { createdAt: -1 },
  };
  const sort = sortMap[query.sortBy || '-createdAt'] || { createdAt: -1 };

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Product.countDocuments(filter),
  ]);

  return { products: products as IProduct[], total, page, totalPages: Math.ceil(total / limit), limit };
};

export const getProductById = async (id: string): Promise<IProduct> => {
  const product = await Product.findById(id);
  if (!product) throw new AppError('Product not found', 404);
  return product;
};

export const createProduct = async (data: CreateProductInput): Promise<IProduct> => {
  return Product.create(data);
};

export const updateProduct = async (id: string, data: UpdateProductInput): Promise<IProduct> => {
  const product = await Product.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!product) throw new AppError('Product not found', 404);
  return product;
};

export const deleteProduct = async (id: string): Promise<void> => {
  const product = await Product.findByIdAndDelete(id);
  if (!product) throw new AppError('Product not found', 404);
};