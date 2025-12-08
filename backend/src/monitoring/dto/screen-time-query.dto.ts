import { IsOptional, IsDateString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum TimeRange {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}

export class ScreenTimeQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(TimeRange)
  range?: TimeRange;
}

