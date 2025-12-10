import { Injectable, Logger, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course, CourseDocument } from '../schemas/course.schema';
import { Game, GameDocument } from '../schemas/game.schema';

export interface CreateCourseDto {
  name: string;
  code: string;
  description?: string;
  nameArabic?: string;
  descriptionArabic?: string;
  level?: string;
  subject?: string;
  topics?: string[];
  academicYear?: string;
  teacherIds?: string[];
  gameIds?: string[];
  settings?: {
    enableGameBasedLearning?: boolean;
    enableLeaderboard?: boolean;
    enableTeamWork?: boolean;
    minGamesRequired?: number;
  };
}

export interface UpdateCourseDto {
  name?: string;
  description?: string;
  nameArabic?: string;
  descriptionArabic?: string;
  level?: string;
  subject?: string;
  topics?: string[];
  academicYear?: string;
  teacherIds?: string[];
  gameIds?: string[];
  settings?: {
    enableGameBasedLearning?: boolean;
    enableLeaderboard?: boolean;
    enableTeamWork?: boolean;
    minGamesRequired?: number;
  };
}

@Injectable()
export class CoursesService {
  private readonly logger = new Logger(CoursesService.name);

  constructor(
    @InjectModel(Course.name)
    private courseModel: Model<CourseDocument>,
    @InjectModel(Game.name)
    private gameModel: Model<GameDocument>,
  ) {}

  /**
   * Create a new course
   */
  async create(createCourseDto: CreateCourseDto): Promise<CourseDocument> {
    // Check if course code already exists
    const existingCourse = await this.courseModel.findOne({ code: createCourseDto.code });
    if (existingCourse) {
      throw new ConflictException(`Course with code "${createCourseDto.code}" already exists`);
    }

    // Convert teacher IDs to ObjectIds
    const teacherIds = createCourseDto.teacherIds
      ? createCourseDto.teacherIds.map(id => new Types.ObjectId(id))
      : [];

    // Validate game IDs exist
    if (createCourseDto.gameIds && createCourseDto.gameIds.length > 0) {
      const gameIds = createCourseDto.gameIds.map(id => new Types.ObjectId(id));
      const games = await this.gameModel.find({ _id: { $in: gameIds } });
      if (games.length !== gameIds.length) {
        throw new BadRequestException('One or more game IDs are invalid');
      }
    }

    const gameIds = createCourseDto.gameIds
      ? createCourseDto.gameIds.map(id => new Types.ObjectId(id))
      : [];

    const course = new this.courseModel({
      ...createCourseDto,
      teacherIds,
      gameIds,
    });

    return course.save();
  }

  /**
   * Get all courses
   */
  async findAll(filters?: { isActive?: boolean; subject?: string; level?: string }): Promise<CourseDocument[]> {
    const query: any = {};

    if (filters?.isActive !== undefined) {
      query.isActive = filters.isActive;
    }
    if (filters?.subject) {
      query.subject = filters.subject;
    }
    if (filters?.level) {
      query.level = filters.level;
    }

    return this.courseModel
      .find(query)
      .populate('teacherIds', 'firstName lastName email')
      .populate('gameIds', 'title category difficulty')
      .sort({ createdAt: -1 });
  }

  /**
   * Get course by ID
   */
  async findOne(id: string): Promise<CourseDocument> {
    const course = await this.courseModel
      .findById(id)
      .populate('teacherIds', 'firstName lastName email')
      .populate('gameIds', 'title category difficulty pointsReward');

    if (!course) {
      throw new NotFoundException(`Course with ID "${id}" not found`);
    }

    return course;
  }

  /**
   * Get course by code
   */
  async findByCode(code: string): Promise<CourseDocument | null> {
    return this.courseModel
      .findOne({ code })
      .populate('teacherIds', 'firstName lastName email')
      .populate('gameIds', 'title category difficulty');
  }

  /**
   * Get courses by teacher ID
   */
  async findByTeacherId(teacherId: string): Promise<CourseDocument[]> {
    return this.courseModel
      .find({ teacherIds: new Types.ObjectId(teacherId), isActive: true })
      .populate('gameIds', 'title category difficulty pointsReward')
      .sort({ createdAt: -1 });
  }

  /**
   * Get courses by game ID
   */
  async findByGameId(gameId: string): Promise<CourseDocument[]> {
    return this.courseModel
      .find({ gameIds: new Types.ObjectId(gameId), isActive: true })
      .populate('teacherIds', 'firstName lastName email')
      .sort({ createdAt: -1 });
  }

  /**
   * Update course
   */
  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<CourseDocument> {
    const course = await this.courseModel.findById(id);
    if (!course) {
      throw new NotFoundException(`Course with ID "${id}" not found`);
    }

    // If updating code, check if new code already exists
    if (updateCourseDto.name && updateCourseDto.name !== course.code) {
      const existingCourse = await this.courseModel.findOne({
        code: updateCourseDto.name,
        _id: { $ne: id },
      });
      if (existingCourse) {
        throw new ConflictException(`Course code already exists`);
      }
    }

    // Validate game IDs if provided
    if (updateCourseDto.gameIds && updateCourseDto.gameIds.length > 0) {
      const gameIds = updateCourseDto.gameIds.map(gid => new Types.ObjectId(gid));
      const games = await this.gameModel.find({ _id: { $in: gameIds } });
      if (games.length !== gameIds.length) {
        throw new BadRequestException('One or more game IDs are invalid');
      }
      updateCourseDto.gameIds = updateCourseDto.gameIds;
    }

    // Convert teacher IDs to ObjectIds
    if (updateCourseDto.teacherIds) {
      updateCourseDto.teacherIds = updateCourseDto.teacherIds;
    }

    const updated = await this.courseModel.findByIdAndUpdate(
      id,
      { $set: updateCourseDto },
      { new: true },
    );

    if (!updated) {
      throw new NotFoundException(`Course with ID "${id}" not found`);
    }

    return (await updated.populate([
      { path: 'teacherIds', select: 'firstName lastName email' },
      { path: 'gameIds', select: 'title category difficulty pointsReward' },
    ])) as CourseDocument;
  }

  /**
   * Add teacher to course
   */
  async addTeacher(courseId: string, teacherId: string): Promise<CourseDocument> {
    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new NotFoundException(`Course with ID "${courseId}" not found`);
    }

    const teacherObjectId = new Types.ObjectId(teacherId);
    if (course.teacherIds.includes(teacherObjectId)) {
      throw new BadRequestException('Teacher is already assigned to this course');
    }

    course.teacherIds.push(teacherObjectId);
    return course.save();
  }

  /**
   * Remove teacher from course
   */
  async removeTeacher(courseId: string, teacherId: string): Promise<CourseDocument> {
    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new NotFoundException(`Course with ID "${courseId}" not found`);
    }

    course.teacherIds = course.teacherIds.filter(
      (id) => id.toString() !== teacherId,
    );

    return course.save();
  }

  /**
   * Add game to course
   */
  async addGame(courseId: string, gameId: string): Promise<CourseDocument> {
    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new NotFoundException(`Course with ID "${courseId}" not found`);
    }

    // Verify game exists
    const game = await this.gameModel.findById(gameId);
    if (!game) {
      throw new NotFoundException(`Game with ID "${gameId}" not found`);
    }

    const gameObjectId = new Types.ObjectId(gameId);
    if (course.gameIds.includes(gameObjectId)) {
      throw new BadRequestException('Game is already assigned to this course');
    }

    course.gameIds.push(gameObjectId);
    return course.save();
  }

  /**
   * Remove game from course
   */
  async removeGame(courseId: string, gameId: string): Promise<CourseDocument> {
    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new NotFoundException(`Course with ID "${courseId}" not found`);
    }

    course.gameIds = course.gameIds.filter(
      (id) => id.toString() !== gameId,
    );

    return course.save();
  }

  /**
   * Get all games for a course
   */
  async getCourseGames(courseId: string): Promise<GameDocument[]> {
    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new NotFoundException(`Course with ID "${courseId}" not found`);
    }

    return this.gameModel.find({ _id: { $in: course.gameIds } });
  }

  /**
   * Deactivate course
   */
  async deactivate(id: string): Promise<CourseDocument> {
    const course = await this.courseModel.findByIdAndUpdate(
      id,
      { $set: { isActive: false } },
      { new: true },
    );

    if (!course) {
      throw new NotFoundException(`Course with ID "${id}" not found`);
    }

    return course;
  }

  /**
   * Update game IDs for a course (replaces existing game IDs)
   */
  async updateGameIds(courseId: string, gameIds: string[]): Promise<CourseDocument> {
    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new NotFoundException(`Course with ID "${courseId}" not found`);
    }

    // Validate game IDs exist
    if (gameIds && gameIds.length > 0) {
      const gameObjectIds = gameIds.map(id => new Types.ObjectId(id));
      const games = await this.gameModel.find({ _id: { $in: gameObjectIds } });
      if (games.length !== gameObjectIds.length) {
        throw new BadRequestException('One or more game IDs are invalid');
      }
      course.gameIds = gameObjectIds;
    } else {
      course.gameIds = [];
    }

    return course.save();
  }

  /**
   * Delete course
   */
  async delete(id: string): Promise<any> {
    const course = await this.courseModel.findByIdAndDelete(id);
    if (!course) {
      throw new NotFoundException(`Course with ID "${id}" not found`);
    }
    return { message: 'Course deleted successfully', courseId: id };
  }
}
