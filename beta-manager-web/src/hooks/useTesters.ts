import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTesters,
  getTester,
  createTester,
  updateTester,
  deleteTester,
  updateTesterStage,
  getTesterTimeline,
  type ListTestersParams,
} from '../api/testers';
import type { CreateTesterInput, UpdateTesterInput, TesterStage } from '../types/tester';

export function useTesters(params: ListTestersParams = {}) {
  return useQuery({
    queryKey: ['testers', params],
    queryFn: () => getTesters(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useTester(id: number) {
  return useQuery({
    queryKey: ['testers', id],
    queryFn: () => getTester(id),
    staleTime: 1000 * 60 * 2,
    enabled: !!id,
  });
}

export function useTesterTimeline(id: number) {
  return useQuery({
    queryKey: ['testers', id, 'timeline'],
    queryFn: () => getTesterTimeline(id),
    staleTime: 1000 * 60, // 1 minute
    enabled: !!id,
  });
}

export function useCreateTester() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTesterInput) => createTester(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateTester() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTesterInput }) =>
      updateTester(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['testers'] });
      queryClient.invalidateQueries({ queryKey: ['testers', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteTester() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteTester(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateTesterStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, stage }: { id: number; stage: TesterStage }) =>
      updateTesterStage(id, stage),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['testers'] });
      queryClient.invalidateQueries({ queryKey: ['testers', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
