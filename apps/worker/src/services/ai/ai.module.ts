import { Module } from '@nestjs/common';
import { EnvModule } from '../../env/env.module.js';
import { OpenRouterService } from './open-router.service.js';

@Module({
  imports: [EnvModule],
  providers: [OpenRouterService],
  exports: [OpenRouterService],
})
export class AiModule {}
