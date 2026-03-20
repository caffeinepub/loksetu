import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IssueCategory, UserRole } from "../backend";
import type { Issue, MarketRates, News, UserStats } from "../backend.d";
import { useActor } from "./useActor";

export type { Issue, MarketRates, News, UserStats };
export { IssueCategory, UserRole };

export function usePublicIssues() {
  const { actor, isFetching } = useActor();
  return useQuery<Issue[]>({
    queryKey: ["publicIssues"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPublicIssues();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMarketRates() {
  const { actor, isFetching } = useActor();
  return useQuery<MarketRates>({
    queryKey: ["marketRates"],
    queryFn: async () => {
      if (!actor) {
        return {
          petrol: "94.72",
          diesel: "87.62",
          cng: "76.59",
          lpg: "903.00",
          onion: "28.50",
          tomato: "32.00",
          potato: "22.00",
        };
      }
      return actor.getMarketRates();
    },
    enabled: !!actor && !isFetching,
    placeholderData: {
      petrol: "94.72",
      diesel: "87.62",
      cng: "76.59",
      lpg: "903.00",
      onion: "28.50",
      tomato: "32.00",
      potato: "22.00",
    },
  });
}

export function useNews() {
  const { actor, isFetching } = useActor();
  return useQuery<News[]>({
    queryKey: ["news"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNews();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserStats() {
  const { actor, isFetching } = useActor();
  return useQuery<UserStats>({
    queryKey: ["userStats"],
    queryFn: async () => {
      if (!actor)
        return { reportsCount: BigInt(12), unlockedCertificate: false };
      return actor.getUserStats();
    },
    enabled: !!actor && !isFetching,
    placeholderData: { reportsCount: BigInt(12), unlockedCertificate: false },
  });
}

export function useCallerRole() {
  const { actor, isFetching } = useActor();
  return useQuery<UserRole>({
    queryKey: ["callerRole"],
    queryFn: async () => {
      if (!actor) return UserRole.guest;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
    placeholderData: UserRole.user,
  });
}

export function useCreateIssue() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      title: string;
      description: string;
      category: IssueCategory;
      gpsLocation: string;
      photoBlobId: string | null;
      isVigilance: boolean;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createIssue(
        params.title,
        params.description,
        params.category,
        params.gpsLocation,
        params.photoBlobId,
        params.isVigilance,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publicIssues"] });
      queryClient.invalidateQueries({ queryKey: ["userStats"] });
    },
  });
}

export function useUpvoteIssue() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (issueId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.upvoteIssue(issueId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publicIssues"] });
    },
  });
}
