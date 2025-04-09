import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { WavesService } from './waves.service';
import { CreateWaveDto } from './dto/create-wave.dto';
import { UpdateWaveDto } from './dto/update-wave.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('waves')
export class WavesController {
  constructor(private readonly wavesService: WavesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createWaveDto: CreateWaveDto, @Request() req) {
    return this.wavesService.create(req.user.userId, createWaveDto);
  }

  @Get()
  findAll() {
    return this.wavesService.findAll();
  }

  @Get('creator/:creatorId')
  findByCreator(@Param('creatorId') creatorId: string) {
    return this.wavesService.findByCreator(creatorId);
  }

  @Get('charity/:charityId')
  findByCharity(@Param('charityId') charityId: string) {
    return this.wavesService.findByCharity(charityId);
  }

  @Get('/participant/part/users')
  @UseGuards(JwtAuthGuard)
  findByProfile(@Request() req) {
    return this.wavesService.findByParticipant(req.user.userId);
  }

  @Get('/participant/part/users/:userId')
  findByProfileId(@Request() req, @Param('userId') userId: string) {
    return this.wavesService.findByParticipant(userId);
  }

  @Get('cause/:causeName')
  findByCause(@Param('causeName') causeName: string) {
    return this.wavesService.findByCause(causeName);
  }

  @Get('hashtag/:hashtag')
  findByHashtag(@Param('hashtag') hashtag: string) {
    return this.wavesService.findByHashtag(hashtag);
  }

  @Get('tags')
  findByTags(@Query('tags') tags: string[]) {
    return this.wavesService.findByTags(Array.isArray(tags) ? tags : [tags]);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.wavesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateWaveDto: UpdateWaveDto) {
    // You might want to check if the user has permission to update this wave
    return this.wavesService.update(id, updateWaveDto);
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  addComment(
    @Param('id') id: string,
    @Body() commentData: { content: string; isApproved?: boolean },
    @Request() req,
  ) {
    // Get the profile ID from the authenticated user
    const profileId = req.user.profileId;
    return this.wavesService.addComment(id, {
      profileId,
      content: commentData.content,
      isApproved: commentData.isApproved,
    });
  }

  @Post('/part/:id/participants')
  @UseGuards(JwtAuthGuard)
  addParticipant(@Param('id') id: string, @Request() req) {
    // Get the profile ID from the authenticated user
    return this.wavesService.addParticipant(id, req.user.userId);
  }

  @Patch(':id/charity-approval')
  @UseGuards(JwtAuthGuard)
  updateCharityApprovalStatus(
    @Param('id') id: string,
    @Body() statusData: { status: string },
  ) {
    // You might want to check if the user is associated with the charity
    return this.wavesService.updateCharityApprovalStatus(id, statusData.status);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    // You might want to check if the user has permission to delete this wave
    return this.wavesService.remove(id);
  }

  @Get('/all/hashtags')
  async getAllHashtags(): Promise<string[]> {
    return this.wavesService.getAllHashTags();
  }

  @Get('/all/filter')
  async findWavesWithFilters(
    @Query('hashtags') hashtags: string[],
    @Query('title') title: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    // Convert hashtags to an array if it's a single string
    const hashtagsArray = Array.isArray(hashtags)
      ? hashtags
      : hashtags
        ? [hashtags]
        : [];

    return this.wavesService.findWavesWithFilters(
      {
        hashtags: hashtagsArray,
        title,
      },
      Number(page),
      Number(limit),
    );
  }
}
