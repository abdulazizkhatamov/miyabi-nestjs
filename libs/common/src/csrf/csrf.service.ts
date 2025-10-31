import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { generateToken } from './csrf-sync';

@Injectable()
export class CsrfService {
  generateCsrfToken(req: Request): { token: string } {
    const token = generateToken(req);
    return { token };
  }
}
