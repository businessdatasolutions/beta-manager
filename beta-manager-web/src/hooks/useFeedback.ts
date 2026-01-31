import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getFeedback,
  getFeedbackById,
  createFeedback,
  updateFeedback,
  deleteFeedback,
  type ListFeedbackParams,
} from '../api/feedback';
import type { CreateFeedbackInput, UpdateFeedbackInput } from '../types/feedback';

export function useFeedbackList(params: ListFeedbackParams = {}) {
  return useQuery({
    queryKey: ['feedback', params],
    queryFn: () => getFeedback(params),
    staleTime: 1000 * 60 * 2,
  });
}

export function useFeedback(id: number) {
  return useQuery({
    queryKey: ['feedback', id],
    queryFn: () => getFeedbackById(id),
    staleTime: 1000 * 60 * 2,
    enabled: !!id,
  });
}

export function useCreateFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFeedbackInput) => createFeedback(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateFeedbackInput }) =>
      updateFeedback(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      queryClient.invalidateQueries({ queryKey: ['feedback', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteFeedback(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
