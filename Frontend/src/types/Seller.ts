export interface SellerProfile {
  id: number;
  username: string;
  email: string;
  phone: string;
  shopName: string;
  address: string;
  isActive: boolean;
}

export interface UpdateSellerDTO {
  username?: string;
  email?: string;
  phone?: string;
  shopName?: string;
  address?: string;
}