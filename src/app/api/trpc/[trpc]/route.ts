import { createContext } from '@/server/trpc/index';
import { appRouter } from '@/server/trpc/router/_app';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { NextRequest } from 'next/server';

const handler = async (req: NextRequest) => {
  try {
    return await fetchRequestHandler({
      endpoint: '/api/trpc',
      req,
      router: appRouter,
      createContext: () => createContext({ req }),
      onError({ error, path }) {
        console.error('TRPC Error:', { path, error: error.message });

        // Log connection errors specifically
        if (error.message.includes('too many connections') ||
            error.message.includes('connection')) {
          console.error('Database connection error detected:', error.message);
        }
      },
    });
  } catch (error) {
    console.error('TRPC Handler Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};

export { handler as GET, handler as POST };