import { generateToken } from '@app/common';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class CsrfService {
  getToken(req: Request) {
    return { token: generateToken(req) };
  }
}
