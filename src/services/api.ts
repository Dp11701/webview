import type { VipMoviesResponse } from "../types/movie";

const BASE_URL = "https://short-movie.begamob.com";

export const api = {
  async getVipExclusiveMovies(): Promise<VipMoviesResponse> {
    try {
      const response = await fetch(
        `${BASE_URL}/api/v2/movies/vip-exclusive-iap`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Add any required headers like authorization if needed
            // 'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching VIP exclusive movies:", error);
      throw error;
    }
  },
  async getComingSoonMovies(): Promise<VipMoviesResponse> {
    try {
      const response = await fetch(
        `${BASE_URL}/api/v2/movies/coming-soon-vip-iap`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Add any required headers like authorization if needed
            // 'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data, "data");
      return data;
    } catch (error) {
      console.error("Error fetching coming soon movies:", error);
      throw error;
    }
  },
};
