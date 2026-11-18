import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import type { ZodType } from 'zod';
import { EnvService } from '../../env/env.service.js';
import type {
  StructuredGenerationResult,
  TriageLlmClient,
} from '../../graph/services/triage-llm-client.js';

@Injectable()
export class OpenRouterService implements TriageLlmClient {
  private readonly client: ChatOpenAI;

  constructor(private readonly env: EnvService) {
    this.client = new ChatOpenAI({
      apiKey: this.env.get('OPENROUTER_API_KEY'),
      model: this.env.get('OPENROUTER_MODEL'),
      temperature: 0,
      timeout: 20_000,
      maxRetries: 0,
      configuration: {
        baseURL: 'https://openrouter.ai/api/v1',
      },
    });
  }

  async generateStructured<T>(
    systemPrompt: string,
    userPrompt: string,
    schema: ZodType<T>,
  ): Promise<StructuredGenerationResult<T>> {
    try {
      const structuredClient = this.client.withStructuredOutput(schema, {
        name: 'issue_intent',
      });
      const data = (await structuredClient.invoke([
        ['system', systemPrompt],
        ['user', userPrompt],
      ])) as T;

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
