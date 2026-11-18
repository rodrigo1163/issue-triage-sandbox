import { Module } from '@nestjs/common';
import { AiModule } from '../services/ai/ai.module.js';
import { TriageGraphService } from './triage-graph.service.js';

@Module({
  imports: [AiModule],
  providers: [TriageGraphService],
  exports: [TriageGraphService],
})
export class GraphModule {}
