import 'express-session';

declare module 'express-session' {
  interface SessionData {
    user?: {
      id: string;
      email: string;
    };
    cart: {
      items: {
        id: string;
        name: string;
        price: string;
        quantity: number;
        image?: string;
      }[];
      totalQuantity: number;
      totalPrice: string;
    };
  }
}
