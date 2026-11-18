import type { ZodType } from 'zod';

export type StructuredGenerationResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
    };

export interface TriageLlmClient {
  generateStructured<T>(
    systemPrompt: string,
    userPrompt: string,
    schema: ZodType<T>,
  ): Promise<StructuredGenerationResult<T>>;
}
