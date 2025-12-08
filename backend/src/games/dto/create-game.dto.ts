import { IsString, IsEnum, IsNumber, IsOptional, IsArray, IsBoolean, IsObject } from 'class-validator';
import { GameCategory, DifficultyLevel } from '../../schemas/game.schema';
import { AgeGroup } from '../../schemas/user.schema';

export class CreateGameDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  titleArabic?: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  descriptionArabic?: string;

  @IsEnum(GameCategory)
  category: GameCategory;

  @IsEnum(DifficultyLevel)
  difficulty: DifficultyLevel;

  @IsArray()
  @IsEnum(AgeGroup, { each: true })
  ageGroups: AgeGroup[];

  @IsNumber()
  pointsReward: number;

  @IsOptional()
  @IsString()
  thumbnail?: string;

  @IsOptional()
  @IsString()
  gameUrl?: string;

  @IsOptional()
  @IsObject()
  gameConfig?: Record<string, any>;
}

