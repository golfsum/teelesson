import { QueryClient } from "@tanstack/react-query";

/**
 * Shared TanStack Query client. Most live data flows through Firestore
 * `onSnapshot` listeners (wired in the hooks), so default staleness is
 * relaxed — Query is mainly used here for cache plumbing and mutations.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      gcTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
