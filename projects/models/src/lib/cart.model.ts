export interface FrontendCartItem {
  productId: string;
  title: string;
  image: string;
  variantSku: string;
  variantLabel: string; // e.g. "Size: M · Color: Red"
  price: number;
  quantity: number;
}

export interface GuestWishlistItem {
  productId: string;
  title: string;
  image: string;
  price: number;
}
