// libs/common/src/csrf/csrf.controller.ts
import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import { CsrfService } from './csrf.service';

@Controller('csrf')
export class CsrfController {
  constructor(private readonly csrfService: CsrfService) {}

  @Get()
  getCsrfToken(@Req() req: Request) {
    const { token } = this.csrfService.generateCsrfToken(req);
    return { token };
  }
}
