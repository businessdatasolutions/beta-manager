import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getIncidents,
  getIncidentById,
  createIncident,
  updateIncident,
  deleteIncident,
  type ListIncidentsParams,
} from '../api/incidents';
import type { CreateIncidentInput, UpdateIncidentInput } from '../types/incident';

export function useIncidentsList(params: ListIncidentsParams = {}) {
  return useQuery({
    queryKey: ['incidents', params],
    queryFn: () => getIncidents(params),
    staleTime: 1000 * 60 * 2,
  });
}

export function useIncident(id: number) {
  return useQuery({
    queryKey: ['incidents', id],
    queryFn: () => getIncidentById(id),
    staleTime: 1000 * 60 * 2,
    enabled: !!id,
  });
}

export function useCreateIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateIncidentInput) => createIncident(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateIncidentInput }) =>
      updateIncident(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['incidents', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteIncident(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
