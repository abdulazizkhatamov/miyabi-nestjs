import {
  Controller,
  Get,
  Req,
  InternalServerErrorException,
} from '@nestjs/common';
import type { Request } from 'express';
import { CsrfService } from './csrf.service';

@Controller('csrf')
export class CsrfController {
  constructor(private readonly csrfService: CsrfService) {}

  @Get()
  async getCsrfToken(@Req() req: Request) {
    if (!req.session) {
      throw new InternalServerErrorException('Session not initialized');
    }

    const { token } = this.csrfService.generateCsrfToken(req);
    req.session.csrfToken = token;

    await new Promise<void>((resolve, reject) => {
      req.session.save((err: unknown) => {
        if (err) {
          const message =
            err instanceof Error
              ? err.message
              : typeof err === 'string'
                ? err
                : 'Unknown session save error';
          reject(new Error(message));
        } else {
          resolve();
        }
      });
    }).catch(() => {
      throw new InternalServerErrorException('Failed to save session');
    });

    return { token };
  }
}
