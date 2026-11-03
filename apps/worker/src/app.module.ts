import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './controllers/health.controller';
import { EnvModule } from './env/env.module';
import { envSchema } from './env/env';
import { AwsModule } from './services/aws/aws.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    EnvModule,
    AwsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
