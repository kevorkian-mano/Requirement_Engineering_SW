import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CoursesService, CreateCourseDto, UpdateCourseDto } from './courses.service';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  /**
   * POST /courses
   * Create a new course
   */
  @Post()
  async create(@Body() createCourseDto: CreateCourseDto) {
    if (!createCourseDto.name || !createCourseDto.code) {
      throw new HttpException(
        'name and code are required',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.coursesService.create(createCourseDto);
  }

  /**
   * GET /courses
   * Get all courses with optional filters
   */
  @Get()
  async findAll(
    @Query('isActive') isActive?: string,
    @Query('subject') subject?: string,
    @Query('level') level?: string,
  ) {
    const filters: any = {};
    if (isActive !== undefined) {
      filters.isActive = isActive === 'true';
    }
    if (subject) {
      filters.subject = subject;
    }
    if (level) {
      filters.level = level;
    }

    return this.coursesService.findAll(filters);
  }

  /**
   * GET /courses/:id
   * Get course by ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  /**
   * GET /courses/teacher/:teacherId
   * Get courses by teacher ID
   */
  @Get('teacher/:teacherId')
  async findByTeacherId(@Param('teacherId') teacherId: string) {
    if (!teacherId) {
      throw new HttpException('teacherId is required', HttpStatus.BAD_REQUEST);
    }
    return this.coursesService.findByTeacherId(teacherId);
  }

  /**
   * GET /courses/game/:gameId
   * Get courses by game ID
   */
  @Get('game/:gameId')
  async findByGameId(@Param('gameId') gameId: string) {
    if (!gameId) {
      throw new HttpException('gameId is required', HttpStatus.BAD_REQUEST);
    }
    return this.coursesService.findByGameId(gameId);
  }

  /**
   * PUT /courses/:id
   * Update course
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return this.coursesService.update(id, updateCourseDto);
  }

  /**
   * POST /courses/:courseId/teachers/:teacherId
   * Add teacher to course
   */
  @Post(':courseId/teachers/:teacherId')
  async addTeacher(
    @Param('courseId') courseId: string,
    @Param('teacherId') teacherId: string,
  ) {
    if (!courseId || !teacherId) {
      throw new HttpException(
        'courseId and teacherId are required',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.coursesService.addTeacher(courseId, teacherId);
  }

  /**
   * DELETE /courses/:courseId/teachers/:teacherId
   * Remove teacher from course
   */
  @Delete(':courseId/teachers/:teacherId')
  async removeTeacher(
    @Param('courseId') courseId: string,
    @Param('teacherId') teacherId: string,
  ) {
    if (!courseId || !teacherId) {
      throw new HttpException(
        'courseId and teacherId are required',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.coursesService.removeTeacher(courseId, teacherId);
  }

  /**
   * POST /courses/:courseId/games/:gameId
   * Add game to course
   */
  @Post(':courseId/games/:gameId')
  async addGame(
    @Param('courseId') courseId: string,
    @Param('gameId') gameId: string,
  ) {
    if (!courseId || !gameId) {
      throw new HttpException(
        'courseId and gameId are required',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.coursesService.addGame(courseId, gameId);
  }

  /**
   * DELETE /courses/:courseId/games/:gameId
   * Remove game from course
   */
  @Delete(':courseId/games/:gameId')
  async removeGame(
    @Param('courseId') courseId: string,
    @Param('gameId') gameId: string,
  ) {
    if (!courseId || !gameId) {
      throw new HttpException(
        'courseId and gameId are required',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.coursesService.removeGame(courseId, gameId);
  }

  /**
   * GET /courses/:courseId/games
   * Get all games for a course
   */
  @Get(':courseId/games')
  async getCourseGames(@Param('courseId') courseId: string) {
    if (!courseId) {
      throw new HttpException('courseId is required', HttpStatus.BAD_REQUEST);
    }
    return this.coursesService.getCourseGames(courseId);
  }

  /**
   * POST /courses/:id/deactivate
   * Deactivate course
   */
  @Post(':id/deactivate')
  async deactivate(@Param('id') id: string) {
    return this.coursesService.deactivate(id);
  }

  /**
   * DELETE /courses/:id
   * Delete course
   */
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.coursesService.delete(id);
  }
}
