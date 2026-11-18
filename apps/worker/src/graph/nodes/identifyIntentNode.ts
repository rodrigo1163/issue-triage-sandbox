import type { TriageLlmClient } from '../services/triage-llm-client.js';
import { getSystemPrompt, getUserPromptTemplate } from '../prompts/v1/identifyIntent.js';
import { IssueIntentSchema, type TriageGraphState } from '../types.js';

export function createIdentifyIntentNode(llmClient: TriageLlmClient) {
  return async (
    state: TriageGraphState,
  ): Promise<Partial<TriageGraphState>> => {
    try {
      const result = await llmClient.generateStructured(
        getSystemPrompt(),
        getUserPromptTemplate(state),
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
  };
}
