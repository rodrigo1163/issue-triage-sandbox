import z from 'zod'

export const envSchema = z.object({
	GITHUB_WEBHOOK_SECRET: z.string().min(1),
})

export type Env = z.infer<typeof envSchema>
