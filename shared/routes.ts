import { z } from 'zod';
import { 
  insertFeedbackSchema, 
  feedback, 
  insertHistorySchema, 
  history, 
  insertDownloadSchema, 
  downloads 
} from './schema';

export const api = {
  proxy: {
    fetch: {
      method: 'GET' as const,
      path: '/api/proxy',
      input: z.object({
        url: z.string().url(),
      }),
      // Response is raw HTML/content, not JSON validated here usually, but we define a generic success
      responses: {
        200: z.any(),
        400: z.object({ message: z.string() }),
        500: z.object({ message: z.string() }),
      },
    },
    search: {
      method: 'POST' as const,
      path: '/api/search',
      input: z.object({
        query: z.string(),
      }),
      responses: {
        200: z.object({
          answer: z.string(),
          results: z.array(z.object({
            title: z.string(),
            url: z.string(),
            snippet: z.string(),
          })).optional(),
        }),
        400: z.object({ message: z.string() }),
        500: z.object({ message: z.string() }),
      },
    },
  },
  feedback: {
    create: {
      method: 'POST' as const,
      path: '/api/feedback',
      input: insertFeedbackSchema,
      responses: {
        201: z.custom<typeof feedback.$inferSelect>(),
        400: z.object({ message: z.string() }),
      },
    },
  },
  history: {
    list: {
      method: 'GET' as const,
      path: '/api/history',
      responses: {
        200: z.array(z.custom<typeof history.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/history',
      input: insertHistorySchema,
      responses: {
        201: z.custom<typeof history.$inferSelect>(),
      },
    },
  },
  downloads: {
    list: {
      method: 'GET' as const,
      path: '/api/downloads',
      responses: {
        200: z.array(z.custom<typeof downloads.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/downloads',
      input: insertDownloadSchema,
      responses: {
        201: z.custom<typeof downloads.$inferSelect>(),
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/downloads/:id',
      input: z.object({
        status: z.string(),
        progress: z.number().optional(),
      }),
      responses: {
        200: z.custom<typeof downloads.$inferSelect>(),
      },
    },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
