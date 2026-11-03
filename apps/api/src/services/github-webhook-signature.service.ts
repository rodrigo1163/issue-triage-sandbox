
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'node:crypto';

@Injectable()
export class GithubWebhookSignatureService {
  private readonly secret: string;

  constructor(configService: ConfigService) {
    this.secret = configService.getOrThrow<string>(
      'GITHUB_WEBHOOK_SECRET',
    );

    if (!this.secret.trim()) {
      throw new Error('GitHub webhook secret must not be empty');
    }
  }

  verify(payload: Buffer | undefined, signature?: string): void {
    if (!payload || !signature || !/^sha256=[a-fA-F0-9]{64}$/.test(signature)) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    const expectedSignature = createHmac('sha256', this.secret)
      .update(payload)
      .digest();

    const receivedSignature = Buffer.from(
      signature.slice('sha256='.length),
      'hex',
    );

    if (!timingSafeEqual(expectedSignature, receivedSignature)) {
      throw new UnauthorizedException('Invalid webhook signature');
    }
  }
}
