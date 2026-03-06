export interface ReviewUser {
  _id: string;
  name: string;
}

export interface ProductReview {
  _id: string;
  user: ReviewUser;
  product: string;
  rating: number;
  comment?: string;
  isApproved: boolean;
  createdAt: string;
}
