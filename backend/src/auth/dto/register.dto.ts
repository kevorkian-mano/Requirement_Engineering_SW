import { IsEmail, IsString, MinLength, IsEnum, IsOptional, IsDateString, ValidateIf, IsNumber, Min, Max, IsArray, ArrayMinSize } from 'class-validator';
import { UserRole, AgeGroup } from '../../schemas/user.schema';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEnum(UserRole)
  role: UserRole;

  @ValidateIf((o) => o.role === 'child')
  @IsNumber()
  @Min(3)
  @Max(12)
  age?: number;

  @IsOptional()
  @IsEnum(AgeGroup)
  ageGroup?: AgeGroup; // Will be calculated from age if not provided

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  parentId?: string; // For child registration

  @ValidateIf((o) => o.role === 'teacher')
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  courseIds?: string[]; // For teacher registration - courses they will be assigned to
}

