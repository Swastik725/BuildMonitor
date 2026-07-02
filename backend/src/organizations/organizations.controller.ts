import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
  constructor(private readonly orgService: OrganizationsService) {}

  @Post()
  create(@Req() req: any, @Body() body: { name: string }) {
    return this.orgService.createOrganization(req.user.userId, body.name);
  }

  @Get()
  getMyOrgs(@Req() req: any) {
    return this.orgService.getMyOrganizations(req.user.userId);
  }
}