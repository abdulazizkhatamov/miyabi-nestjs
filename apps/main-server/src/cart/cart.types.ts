// cart.types.ts
export interface Cart {
  items: {
    id: string;
    name: string;
    price: string;
    quantity: number;
    image?: string;
  }[];
  totalQuantity: number;
  totalPrice: string;
}
