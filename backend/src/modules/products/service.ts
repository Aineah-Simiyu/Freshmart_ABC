import productRepository from './repository';
import { ProductDTO, CreateProductDTO, UpdateProductDTO } from './dto';
import { NotFoundError, AppError } from '@core/utils/errors';
import { Prisma } from '@prisma/client';

function toProductDTO(p: {
  id: string;
  name: string;
  category: string;
  price: Prisma.Decimal | number;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}): ProductDTO {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    price: Number(p.price),
    quantity: p.quantity,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

class ProductService {
  async getAllProducts(): Promise<ProductDTO[]> {
    const products = await productRepository.findAll();
    return products.map(toProductDTO);
  }

  async getProductById(id: string): Promise<ProductDTO> {
    const product = await productRepository.findById(id);

    if (!product) {
      throw new NotFoundError('Product');
    }

    return toProductDTO(product);
  }

  async createProduct(data: CreateProductDTO): Promise<ProductDTO> {
    const product = await productRepository.create(data);
    return toProductDTO(product);
  }

  async updateProduct(id: string, data: UpdateProductDTO): Promise<ProductDTO> {
    await this.getProductById(id);
    const product = await productRepository.update(id, data);
    return toProductDTO(product);
  }

  async deleteProduct(id: string): Promise<void> {
    await this.getProductById(id);

    try {
      await productRepository.delete(id);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new AppError(
          'Cannot delete this product because it has associated sales records',
          409
        );
      }
      throw error;
    }
  }
}

export default new ProductService();
