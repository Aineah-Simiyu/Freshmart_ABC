import { Request, Response, NextFunction } from 'express';
import productService from './service';
import { createProductSchema, updateProductSchema } from './validation';
import { ValidationError } from '@core/utils/errors';
import { ApiResponse } from '@core/types';
import { ProductDTO } from './dto';

class ProductController {
  async getAll(
    _req: Request,
    res: Response<ApiResponse<ProductDTO[]>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const products = await productService.getAllProducts();

      res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(
    req: Request,
    res: Response<ApiResponse<ProductDTO>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const parsed = createProductSchema.safeParse(req.body);

      if (!parsed.success) {
        throw new ValidationError(parsed.error);
      }

      const product = await productService.createProduct(parsed.data);

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(
    req: Request,
    res: Response<ApiResponse<ProductDTO>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const parsed = updateProductSchema.safeParse(req.body);

      if (!parsed.success) {
        throw new ValidationError(parsed.error);
      }

      const product = await productService.updateProduct(req.params.id as string, parsed.data);

      res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      await productService.deleteProduct(req.params.id as string);

      res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ProductController();
