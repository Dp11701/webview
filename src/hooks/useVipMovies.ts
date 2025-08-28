import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import type { VipMoviesResponse } from "../types/movie";

export const useVipMovies = () => {
  return useQuery<VipMoviesResponse, Error>({
    queryKey: ["vip-movies"],
    queryFn: api.getVipExclusiveMovies,
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
  });
};

export const useComingSoonMovies = () => {
  return useQuery<VipMoviesResponse, Error>({
    queryKey: ["coming-soon-movies"],
    queryFn: api.getComingSoonMovies,
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
  });
};
