import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { generateToken } from '../libs/csrf-sync';

@Injectable()
export class CsrfService {
  getToken(req: Request) {
    return { token: generateToken(req) };
  }
}
