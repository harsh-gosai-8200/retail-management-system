import { api } from "./api";
import type { WholesalerProfile, UpdateWholesalerDTO } from "../types/wholesaler";

export const wholesalerService = {
  async getProfile(): Promise<WholesalerProfile> {
    return api.request<WholesalerProfile>("/wholesaler/profile", {
      method: "GET",
    });
  },

  async updateProfile(data: UpdateWholesalerDTO): Promise<WholesalerProfile> {
    return api.request<WholesalerProfile>("/wholesaler/profile", {
      method: "PUT",
      data,
    });
  },
};