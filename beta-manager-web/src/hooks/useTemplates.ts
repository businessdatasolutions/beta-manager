import { useQuery } from '@tanstack/react-query';
import { getTemplates, getTemplateByName } from '../api/templates';

export function useTemplates() {
  return useQuery({
    queryKey: ['templates'],
    queryFn: getTemplates,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useTemplate(name: string) {
  return useQuery({
    queryKey: ['templates', name],
    queryFn: () => getTemplateByName(name),
    staleTime: 1000 * 60 * 5,
    enabled: !!name,
  });
}
