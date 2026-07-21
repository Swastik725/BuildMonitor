import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';

type AuthenticatedRequest = {
  user: {
    userId: string;
    email: string;
  };
};

@UseGuards(JwtAuthGuard)
@Controller('organizations')
export class OrganizationsController {
  constructor(
    private organizationsService: OrganizationsService,
  ) {}

  @Post()
  create(
    @Body() dto: CreateOrganizationDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.organizationsService.create(dto, req.user.userId);
  }

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.organizationsService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.organizationsService.findOne(id, req.user.userId);
  }

  @Get(':id/members')
  findMembers(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.organizationsService.findMembers(id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: { name?: string; slug?: string },
  ) {
    return this.organizationsService.update(
      id,
      req.user.userId,
      dto,
    );
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.organizationsService.delete(id, req.user.userId);
  }

  @Post(':id/members')
  addMember(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: {
      email: string;
      role?: 'ADMIN' | 'MEMBER';
    },
  ) {
    return this.organizationsService.addMember(
      id,
      req.user.userId,
      dto.email,
      dto.role,
    );
  }

  @Delete(':id/members/:userId')
  removeMember(
    @Param('id') id: string,
    @Param('userId') memberUserId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.organizationsService.removeMember(
      id,
      req.user.userId,
      memberUserId,
    );
  }
}