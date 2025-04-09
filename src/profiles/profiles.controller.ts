import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Query,
  Req,
  HttpStatus,
  HttpCode,
  Patch,
} from '@nestjs/common';

import { CharitySupportDto, CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfilesService } from './profiles.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ParseMongoIdPipe } from 'pipes/parse-mongo-id.pipe';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfilesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req, @Body() createProfileDto: CreateProfileDto) {
    return this.profileService.create(
      req.user.userId,
      req.user.email,
      createProfileDto,
    );
  }

  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('industry') industry?: string,
    @Query('location') location?: string,
  ) {
    const filters = {};
    if (industry) filters['industry'] = industry;
    if (location) filters['location'] = location;

    return this.profileService.findAll(page, limit, filters);
  }

  @Get('search')
  search(
    @Query('q') query: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.profileService.search(query, page, limit);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  findMyProfile(@Req() req) {
    return this.profileService.findByUserId(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseMongoIdPipe) id: string) {
    return this.profileService.findOne(id);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.profileService.findBySlug(slug);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    // In a real application, you'd want to verify ownership or admin rights here
    return this.profileService.update(id, updateProfileDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseMongoIdPipe) id: string) {
    return this.profileService.remove(id);
  }

  @Post(':id/charities')
  @UseGuards(JwtAuthGuard)
  addCharitySupport(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() charitySupport: CharitySupportDto,
  ) {
    return this.profileService.addCharitySupport(id, charitySupport);
  }

  @Patch(':id/charities/:charityId')
  @UseGuards(JwtAuthGuard)
  updateCharitySupport(
    @Param('id', ParseMongoIdPipe) id: string,
    @Param('charityId', ParseMongoIdPipe) charityId: string,
    @Body('status') status: 'pending' | 'approved' | 'rejected',
  ) {
    return this.profileService.updateCharitySupport(id, charityId, status);
  }

  @Delete(':id/charities/:charityId')
  @UseGuards(JwtAuthGuard)
  removeCharitySupport(
    @Param('id', ParseMongoIdPipe) id: string,
    @Param('charityId', ParseMongoIdPipe) charityId: string,
  ) {
    return this.profileService.removeCharitySupport(id, charityId);
  }

  @Get('all/charities')
  getAllCharities() {
    return this.profileService.getAllCharities();
  }

  @Get('metrics/:userId')
  getUserMetrics(@Param('userId', ParseMongoIdPipe) userId: string) {
    return this.profileService.getUserMetrics(userId);
  }
}
