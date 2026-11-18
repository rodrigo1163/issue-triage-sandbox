import { OpenRouterService } from '../services/ai/open-router.service.js';
import { buildTriageGraph } from './graph.js';

export function buildGraph(llmClient: OpenRouterService) {
  return buildTriageGraph(llmClient);
}
