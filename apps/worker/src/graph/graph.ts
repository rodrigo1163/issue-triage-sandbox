import { END, START, StateGraph } from '@langchain/langgraph';
import type { TriageLlmClient } from './services/triage-llm-client.js';
import { createIdentifyIntentNode } from './nodes/identifyIntentNode.js';
import { TriageGraphStateSchema, type TriageGraphState } from './types.js';

type GraphRoute =
  | 'BUG'
  | 'IMPROVEMENT'
  | 'QUESTION'
  | 'HUMAN_REVIEW'
  | 'ERROR';

function routeAfterIdentify(state: TriageGraphState): GraphRoute {
  if (state.error) {
    return 'ERROR';
  }

  return state.intent ?? 'HUMAN_REVIEW';
}

export function buildTriageGraph(llmClient: TriageLlmClient) {
  return new StateGraph(TriageGraphStateSchema)
    .addNode('identifyIntent', createIdentifyIntentNode(llmClient))
    .addEdge(START, 'identifyIntent')
    .addConditionalEdges('identifyIntent', routeAfterIdentify, {
      BUG: END,
      IMPROVEMENT: END,
      QUESTION: END,
      HUMAN_REVIEW: END,
      ERROR: END,
    })
    .compile();
}
