import { IsString, IsNumber, IsBoolean, IsOptional, IsObject } from 'class-validator';

export class SaveProgressDto {
  @IsString()
  gameId: string;

  @IsNumber()
  score: number;

  @IsNumber()
  pointsEarned: number;

  @IsNumber()
  timeSpent: number; // in seconds

  @IsBoolean()
  isCompleted: boolean;

  @IsNumber()
  completionPercentage: number;

  @IsOptional()
  @IsObject()
  gameData?: Record<string, any>;
}

