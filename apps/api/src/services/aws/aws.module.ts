import { Module } from '@nestjs/common';
import { EnvModule } from '../../env/env.module';
import { SqsPublisher } from './sqs-publisher.service';

@Module({
  imports: [EnvModule],
  providers: [SqsPublisher],
  exports: [SqsPublisher],
})
export class AwsModule { }
