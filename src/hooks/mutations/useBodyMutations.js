import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bodyProgressRepository } from '../../lib/local/bodyProgressRepository';
import { profileRepository } from '../../lib/local/profileRepository';
import { setCachedProfile, getCachedProfile } from '../../storage/profile-storage';

export const useRegisterWeight = (profile_id) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const weight = data.weight;
      const pid = data.profile_id || profile_id;

      // Update local profile
      const existing = await profileRepository.getById(pid);
      if (existing) {
        await profileRepository.update(pid, { weight });
      } else {
        const cached = getCachedProfile();
        await profileRepository.add({
          id: pid,
          name: cached?.name ?? null,
          email: cached?.email ?? null,
          weight,
          size: cached?.size ?? null,
          timeForWeek: cached?.time_for_week ?? null,
          restTime: cached?.rest_time ?? null,
          createdAt: cached?.created_at || new Date().toISOString(),
        });
      }

      // Progress history entry
      await bodyProgressRepository.add({
        profileId: pid,
        weight,
        setsId: data.sets_id ?? null,
      });

      // Keep auth cache / query in sync for UI that reads profile.weight
      const cached = getCachedProfile() || {};
      const updatedProfile = { ...cached, profile_id: pid, weight };
      setCachedProfile(updatedProfile);
      queryClient.setQueryData(['auth-user'], (old) =>
        old ? { ...old, weight } : old,
      );

      return { profile: updatedProfile };
    },
  });
};
