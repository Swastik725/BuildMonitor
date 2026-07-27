import { Controller, Get } from '@nestjs/common';

@Controller()
export class PublicHealthController {
  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'buildmonitor-backend',
      timestamp: new Date().toISOString(),
    };
  }
}
