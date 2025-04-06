import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/charities')
  @UseGuards(JwtAuthGuard)
  getAllCharities() {
    return this.usersService.getAllCharities();
  }
}
