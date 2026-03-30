export interface WholesalerProfile {
  id: number;
  username: string;
  email: string;
  phone: string;
  businessName: string;
  address: string;
  gstNumber: string;
  isActive: boolean;
}

export interface UpdateWholesalerDTO {
  username?: string;
  phone?: string;
  businessName?: string;
  address?: string;
  gstNumber?: string;
}