import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import * as productService from '../services/product.service';

export const getProducts = catchAsync(async (req: Request, res: Response) => {
  const result = await productService.getProducts(req.query as Record<string, string>);
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

export const getProduct = catchAsync(async (req: Request, res: Response) => {
  const product = await productService.getProductById(req.params.id);
  res.status(200).json({
    status: 'success',
    data: { product },
  });
});

export const createProduct = catchAsync(async (req: Request, res: Response) => {
  const product = await productService.createProduct(req.body);
  res.status(201).json({
    status: 'success',
    data: { product },
  });
});

export const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  res.status(200).json({
    status: 'success',
    data: { product },
  });
});

export const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  await productService.deleteProduct(req.params.id);
  res.status(204).json({ status: 'success', data: null });
});