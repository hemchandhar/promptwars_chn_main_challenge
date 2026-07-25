import { IsMongoId, IsString, MaxLength, MinLength } from 'class-validator';

export class SendEncouragementDto {
  @IsMongoId()
  individualId: string;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  message: string;
}
