import z from 'zod';

export const envSchema = z.object({
  AWS_REGION: z.string().min(1),
  SQS_QUEUE_URL: z.url(),
  AWS_PROFILE: z.string().min(1),
  DATABASE_URL: z.url(),
});

export type Env = z.infer<typeof envSchema>;
