// export interface Product {
//   _id: string;
//   name: string;
//   slug: string;
//   price: number;
//   discountPrice?: number;
//   image: string;
//   rating?: number;
//   reviewCount?: number;
//   vendorName?: string;
//   isFeatured?: boolean;
// }

export interface Product {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: number;
  salePrice?: number | null;
  currency: string;
  sku?: string;
  discountPrice?: number | null;
  brand?: string;
  categories: string[]; // ref to Category (optional)
  createdBy: string;
  tags: string[];
  images: string[];
  variants: IProductVariant[];
  stock: number;
  reservedStock: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  averageRating: string;
  reviewCount: number;
  vendor: string;
  store: string;
  // NEW
}

export interface IProductVariant {
  sku: string;
  attributes?: Record<string, string>; // e.g. { size: "M", color: "red" }
  price?: number;
  stock: number;
  images?: string[];
  reservedStock: number;
}
