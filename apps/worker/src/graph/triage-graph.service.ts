import { Injectable } from '@nestjs/common';
import { OpenRouterService } from '../services/ai/open-router.service.js';
import { buildGraph } from './factory.js';
import type {
  TriageGraphInput,
  TriageGraphState,
} from './types.js';

@Injectable()
export class TriageGraphService {
  private readonly graph;

  constructor(openRouterService: OpenRouterService) {
    this.graph = buildGraph(openRouterService);
  }

  async analyze(input: TriageGraphInput): Promise<TriageGraphState> {
    return this.graph.invoke(input);
  }
}
