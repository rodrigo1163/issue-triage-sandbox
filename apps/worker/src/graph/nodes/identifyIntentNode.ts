import type { TriageLlmClient } from '../services/triage-llm-client.js';
import { IdentifyIntentPrompt } from '../prompts/v1/identifyIntent.js';
import { IssueIntentSchema, type TriageGraphState } from '../types.js';

export class IdentifyIntentNode {
  private readonly prompt = new IdentifyIntentPrompt();

  constructor(private readonly llmClient: TriageLlmClient) {}

  async execute(state: TriageGraphState): Promise<Partial<TriageGraphState>> {
    try {
      const result = await this.llmClient.generateStructured(
        this.prompt.getSystemPrompt(),
        this.prompt.getUserPromptTemplate(state),
        IssueIntentSchema,
      );

      if (!result.success) {
        return { error: result.error };
      }

      return result.data;
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
