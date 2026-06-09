export interface ProductDTO {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductDTO {
  name: string;
  category: string;
  price: number;
  quantity: number;
}

export interface UpdateProductDTO {
  name?: string;
  category?: string;
  price?: number;
  quantity?: number;
}
