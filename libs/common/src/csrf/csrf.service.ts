import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { generateToken } from './csrf-sync';

@Injectable()
export class CsrfService {
  generateCsrfToken(req: Request): { token: string } {
    if (!req.session) {
      throw new Error('Session is missing');
    }

    const token = generateToken(req);
    return { token };
  }
}
