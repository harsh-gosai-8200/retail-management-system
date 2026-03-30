import { api } from "./api";
import type { SellerProfile, UpdateSellerDTO } from "../types/Seller";

export const sellerService = {
  async getProfile(): Promise<SellerProfile> {
    return api.request<SellerProfile>("/local-seller/profile", {
      method: "GET",
    });
  },

  async updateProfile(data: UpdateSellerDTO): Promise<SellerProfile> {
    return api.request<SellerProfile>("/local-seller/profile", {
      method: "PUT",
      data,
    });
  },
};
