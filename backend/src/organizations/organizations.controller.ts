import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';

@UseGuards(JwtAuthGuard)
@Controller('organizations')
export class OrganizationsController {
  constructor(
    private readonly organizationsService: OrganizationsService,
  ) {}

  @Post()
  create(
    @Body() dto: CreateOrganizationDto,
    @CurrentUser() user: any,
  ) {
    return this.organizationsService.create(dto, user.id);
  }

  @Get()
  findAll(
    @CurrentUser() user: any,
  ) {
    return this.organizationsService.findAll(user.id);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.organizationsService.findOne(id, user.id);
  }

  @Get(':id/members')
  findMembers(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.organizationsService.findMembers(id, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: { name?: string; slug?: string },
  ) {
    return this.organizationsService.update(
      id,
      user.id,
      dto,
    );
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.organizationsService.delete(
      id,
      user.id,
    );
  }

  @Post(':id/members')
  addMember(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: {
      email: string;
      role?: 'ADMIN' | 'MEMBER';
    },
  ) {
    return this.organizationsService.addMember(
      id,
      user.id,
      dto.email,
      dto.role,
    );
  }

  @Delete(':id/members/:userId')
  removeMember(
    @Param('id') id: string,
    @Param('userId') memberUserId: string,
    @CurrentUser() user: any,
  ) {
    return this.organizationsService.removeMember(
      id,
      user.id,
      memberUserId,
    );
  }

  @Patch(':id/members/:userId/role')
  updateMemberRole(
    @Param('id') id: string,
    @Param('userId') memberUserId: string,
    @Body() dto: {
      role: 'OWNER' | 'ADMIN' | 'MEMBER';
    },
    @CurrentUser() user: any,
  ) {
    return this.organizationsService.updateMemberRole(
      id,
      user.id,
      memberUserId,
      dto.role,
    );
  }

  @Post(':id/leave')
  leaveOrganization(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.organizationsService.leaveOrganization(
      id,
      user.id,
    );
  }

  @Post(':id/transfer')
  transferOwnership(
    @Param('id') id: string,
    @Body() dto: {
      newOwnerId: string;
    },
    @CurrentUser() user: any,
  ) {
    return this.organizationsService.transferOwnership(
      id,
      user.id,
      dto.newOwnerId,
    );
  }
}