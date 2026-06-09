export interface SaleDTO {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  soldAt: Date;
}

export interface CreateSaleDTO {
  productId: string;
  quantity: number;
}
