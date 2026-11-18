import type { TriageLlmClient } from './services/triage-llm-client.js';
import { TriageGraph } from './graph.js';

export class TriageGraphFactory {
  constructor(private readonly llmClient: TriageLlmClient) {}

  build() {
    return new TriageGraph(this.llmClient).build();
  }
}
