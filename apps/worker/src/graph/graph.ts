import { END, START, StateGraph } from '@langchain/langgraph';
import type { TriageLlmClient } from './services/triage-llm-client.js';
import { IdentifyIntentNode } from './nodes/identifyIntentNode.js';
import { TriageGraphStateSchema, type TriageGraphState } from './types.js';

type GraphRoute =
  | 'BUG'
  | 'IMPROVEMENT'
  | 'QUESTION'
  | 'HUMAN_REVIEW'
  | 'ERROR';

export class TriageGraph {
  private readonly identifyIntentNode: IdentifyIntentNode;

  constructor(llmClient: TriageLlmClient) {
    this.identifyIntentNode = new IdentifyIntentNode(llmClient);
  }

  build() {
    return new StateGraph(TriageGraphStateSchema)
      .addNode(
        'identifyIntent',
        this.identifyIntentNode.execute.bind(this.identifyIntentNode),
      )
      .addEdge(START, 'identifyIntent')
      .addConditionalEdges(
        'identifyIntent',
        this.routeAfterIdentify.bind(this),
        {
          BUG: END,
          IMPROVEMENT: END,
          QUESTION: END,
          HUMAN_REVIEW: END,
          ERROR: END,
        },
      )
      .compile();
  }

  private routeAfterIdentify(state: TriageGraphState): GraphRoute {
    if (state.error) {
      return 'ERROR';
    }

    return state.intent ?? 'HUMAN_REVIEW';
  }
}
