import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';

export class OnboardingDto {
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  journey?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  triggers?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(200)
  supportContact?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  copingStrategies?: string[];
}
