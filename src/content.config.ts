import { defineCollection } from 'astro:content';
import { z } from 'zod';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    mcqs: z
      .array(
        z.object({
          question: z.string(),
          options: z.array(z.string()),
          answer: z.number().int().min(0),
          explanation: z.string().optional(),
        })
      )
      .optional(),
    references: z
      .array(
        z.object({
          title: z.string(),
          url: z.string(),
        })
      )
      .optional(),
  }),
});

export const collections = { blog };
