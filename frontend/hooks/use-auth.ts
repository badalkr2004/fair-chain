import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as authService from '@/services/auth.service';

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => authService.getProfile(),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile'] }),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: authService.changePassword,
  });
}
