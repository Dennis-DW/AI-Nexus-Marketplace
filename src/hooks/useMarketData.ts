import { useQuery } from '@tanstack/react-query';
import { marketAPI, MarketStats, ChartData } from '../services/api';

export function useMarketStats() {
  return useQuery<MarketStats>({
    queryKey: ['marketStats'],
    queryFn: async () => {
      const response = await marketAPI.getStats();
      return response.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 20000, // Consider data stale after 20 seconds
    retry: 3,
    retryDelay: 1000,
  });
}

export function useChartData(days: number = 30) {
  return useQuery<ChartData[]>({
    queryKey: ['chartData', days],
    queryFn: async () => {
      const response = await marketAPI.getChartData(days);
      return response.data;
    },
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000, // Consider data stale after 30 seconds
    retry: 3,
    retryDelay: 1000,
  });
}