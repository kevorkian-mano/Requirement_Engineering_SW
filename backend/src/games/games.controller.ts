import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { GamesService } from './games.service';
import { CreateGameDto } from './dto/create-game.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, AgeGroup } from '../schemas/user.schema';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserDocument } from '../schemas/user.schema';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Query('category') category?: string,
    @CurrentUser() user?: UserDocument,
  ) {
    const ageGroup = user?.ageGroup;
    return this.gamesService.findAll(ageGroup, category);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return this.gamesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  async create(@Body() createGameDto: CreateGameDto) {
    return this.gamesService.create(createGameDto);
  }

  @Post(':id/play')
  @UseGuards(JwtAuthGuard)
  async playGame(@Param('id') id: string) {
    await this.gamesService.incrementPlayCount(id);
    return this.gamesService.findOne(id);
  }
}

