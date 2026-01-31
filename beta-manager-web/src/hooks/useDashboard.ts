import { useQuery } from '@tanstack/react-query';
import { getStats, getFunnel, getActivity, getAlerts } from '../api/dashboard';

export function useStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: getStats,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useFunnel() {
  return useQuery({
    queryKey: ['dashboard', 'funnel'],
    queryFn: getFunnel,
    staleTime: 1000 * 60 * 2,
  });
}

export function useActivity(limit = 20) {
  return useQuery({
    queryKey: ['dashboard', 'activity', limit],
    queryFn: () => getActivity(limit),
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useAlerts() {
  return useQuery({
    queryKey: ['dashboard', 'alerts'],
    queryFn: getAlerts,
    staleTime: 1000 * 60, // 1 minute
  });
}
