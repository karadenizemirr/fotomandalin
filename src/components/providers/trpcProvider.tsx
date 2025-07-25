"use client";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/server/trpc/router/_app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useState } from "react";

export const trpc = createTRPCReact<AppRouter>();

export function TrpcProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Cache verileri 5 dakika boyunca taze tut
            staleTime: 5 * 60 * 1000, // 5 minutes
            // Cache'den 30 dakika sonra temizle
            gcTime: 30 * 60 * 1000, // 30 minutes (was cacheTime)
            // Background refetch'i azalt
            refetchOnWindowFocus: false,
            refetchOnMount: true,
            refetchOnReconnect: true,
            // 🚨 404 için özel retry logic
            retry: (failureCount, error: any) => {
              // 404, 401, 403 hatalarında retry YAPMA
              if (
                error?.data?.httpStatus === 404 ||
                error?.data?.httpStatus === 401 ||
                error?.data?.httpStatus === 403 ||
                error?.code === "NOT_FOUND" ||
                error?.code === "UNAUTHORIZED" ||
                error?.code === "FORBIDDEN"
              ) {
                return false;
              }
              // Diğer hatalar için max 2 retry
              return failureCount < 2;
            },
            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            // Mutation retry azalt
            retry: (failureCount, error: any) => {
              // 404, 401, 403 hatalarında retry YAPMA
              if (
                error?.data?.httpStatus === 404 ||
                error?.data?.httpStatus === 401 ||
                error?.data?.httpStatus === 403 ||
                error?.code === "NOT_FOUND" ||
                error?.code === "UNAUTHORIZED" ||
                error?.code === "FORBIDDEN"
              ) {
                return false;
              }
              // Diğer hatalar için max 1 retry
              return failureCount < 1;
            },
            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex, 30000),
          },
        },
      })
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "/api/trpc",
          // Batch istekleri optimize et
          maxURLLength: 2048,
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
