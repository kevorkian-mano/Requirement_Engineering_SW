import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument, AgeGroup } from '../schemas/user.schema';
import { Course, CourseDocument } from '../schemas/course.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LevelProgressionService } from '../levels/level-progression.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    private jwtService: JwtService,
    private levelProgressionService: LevelProgressionService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, age, courseIds, ...rest } = registerDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Validate courses if teacher is registering
    if (registerDto.role === 'teacher' && courseIds && courseIds.length > 0) {
      const courseObjectIds = courseIds.map(id => new Types.ObjectId(id));
      const courses = await this.courseModel.find({ _id: { $in: courseObjectIds } });
      if (courses.length !== courseObjectIds.length) {
        throw new BadRequestException('One or more course IDs are invalid');
      }
    }

    // Calculate age group from age if provided
    let ageGroup = registerDto.ageGroup;
    if (age && !ageGroup) {
      if (age >= 3 && age <= 5) {
        ageGroup = AgeGroup.AGES_3_5;
      } else if (age >= 6 && age <= 8) {
        ageGroup = AgeGroup.AGES_6_8;
      } else if (age >= 9 && age <= 12) {
        ageGroup = AgeGroup.AGES_9_12;
      } else {
        throw new ConflictException('Age must be between 3 and 12 years');
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Prepare user data
    const userData: any = {
      email,
      password: hashedPassword,
      ageGroup,
      ...rest,
    };

    // Add courseIds if teacher
    if (registerDto.role === 'teacher' && courseIds && courseIds.length > 0) {
      userData.courseIds = courseIds.map(id => new Types.ObjectId(id));
    }

    // Create user
    const user = new this.userModel(userData);

    // Link child to parent if parentId is provided
    if (registerDto.parentId && registerDto.role === 'child') {
      const parent = await this.userModel.findById(registerDto.parentId);
      if (parent) {
        user.parentId = registerDto.parentId;
        if (!parent.childrenIds) {
          parent.childrenIds = [];
        }
        parent.childrenIds.push(user._id.toString());
        await parent.save();
      }
    }

    // Add teacher to courses if teacher registering
    if (registerDto.role === 'teacher' && courseIds && courseIds.length > 0) {
      await Promise.all(
        courseIds.map((courseId) =>
          this.courseModel.findByIdAndUpdate(
            courseId,
            { $addToSet: { teacherIds: user._id } },
            { new: true },
          ),
        ),
      );
    }

    await user.save();

    // Initialize player level for children
    if (registerDto.role === 'child' && ageGroup) {
      await this.levelProgressionService.initializePlayerLevel(user._id.toString(), ageGroup);
    }

    // Remove password from response
    const userObject = user.toObject();
    delete userObject.password;

    // Generate JWT token
    const token = this.jwtService.sign({ sub: user._id, email: user.email, role: user.role });

    return {
      user: userObject,
      token,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update login streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastLogin = user.lastLoginDate ? new Date(user.lastLoginDate) : null;
    const lastLoginDate = lastLogin ? new Date(lastLogin.setHours(0, 0, 0, 0)) : null;

    if (!lastLoginDate || lastLoginDate.getTime() !== today.getTime()) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastLoginDate && lastLoginDate.getTime() === yesterday.getTime()) {
        user.loginStreak += 1;
      } else {
        user.loginStreak = 1;
      }

      user.lastLoginDate = new Date();
      await user.save();
    }

    // Remove password from response
    const userObject = user.toObject();
    delete userObject.password;

    // Generate JWT token
    const token = this.jwtService.sign({ sub: user._id, email: user.email, role: user.role });

    return {
      user: userObject,
      token,
    };
  }

  async validateUser(userId: string): Promise<UserDocument | null> {
    return this.userModel.findById(userId).select('-password');
  }
}

