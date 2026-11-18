import { Injectable } from '@nestjs/common';
import { OpenRouterService } from '../services/ai/open-router.service.js';
import { TriageGraphFactory } from './factory.js';
import type {
  TriageGraphInput,
  TriageGraphState,
} from './types.js';

@Injectable()
export class TriageGraphService {
  private readonly graph;

  constructor(openRouterService: OpenRouterService) {
    this.graph = new TriageGraphFactory(openRouterService).build();
  }

  async analyze(input: TriageGraphInput): Promise<TriageGraphState> {
    return this.graph.invoke(input);
  }
}
