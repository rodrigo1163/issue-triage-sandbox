import { z } from 'zod';

export const IssueIntentSchema = z.object({
  intent: z.enum(['BUG', 'IMPROVEMENT', 'QUESTION', 'HUMAN_REVIEW']),
  reason: z.string().trim().min(1),
  missingInformation: z.array(z.string().trim().min(1)).default([]),
});

const TriageIssueSchema = z.object({
  repository: z.string().min(1),
  issueNumber: z.number().int().positive(),
  title: z.string().min(1),
  description: z.string().nullable(),
});

const ProjectContextSchema = z.object({
  repository: z.string().min(1),
  responsibles: z.array(z.string()),
  triageInstructions: z.array(z.string()),
});

export const TriageGraphStateSchema = z.object({
  issue: TriageIssueSchema,
  projectContext: ProjectContextSchema.nullable().optional(),
  intent: IssueIntentSchema.shape.intent.optional(),
  reason: z.string().optional(),
  missingInformation: z.array(z.string()).default([]),
  error: z.string().optional(),
});

export type IssueIntent = z.infer<typeof IssueIntentSchema>;
export type TriageIssue = z.infer<typeof TriageIssueSchema>;
export type TriageGraphInput = z.input<typeof TriageGraphStateSchema>;
export type TriageGraphState = z.infer<typeof TriageGraphStateSchema>;
