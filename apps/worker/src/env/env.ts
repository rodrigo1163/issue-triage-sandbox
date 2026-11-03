import z from 'zod';

export const envSchema = z.object({
  AWS_REGION: z.string().min(1),
  SQS_QUEUE_URL: z.url(),
  AWS_PROFILE: z.string().min(1),
});

export type Env = z.infer<typeof envSchema>;
