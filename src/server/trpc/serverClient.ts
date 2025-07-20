import "server-only";
import { cache } from "react";
import { appRouter } from './router/_app';
import { createContext } from './index';

/**
 * Server-side tRPC caller
 * Next.js App Router'da server componentlerde kullanım için
 * React cache ile optimize edilmiş
 */
export const serverClient = cache(async () => {
  const context = await createContext({});
  return appRouter.createCaller(context);
});
