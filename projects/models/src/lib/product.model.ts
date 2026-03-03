export interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number;
  image: string;
  rating?: number;
  reviewCount?: number;
  vendorName?: string;
  isFeatured?: boolean;
}
