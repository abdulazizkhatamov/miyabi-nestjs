import { Controller, Get, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CsrfService } from './csrf.service';
import type { Request } from 'express';

@ApiTags('csrf')
@Controller('csrf')
export class CsrfController {
  constructor(private readonly csrfService: CsrfService) {}

  @Get()
  getCsrf(@Req() req: Request) {
    return this.csrfService.getToken(req);
  }
}
