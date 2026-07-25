import { IsBoolean } from 'class-validator';

export class PrivacyAcceptanceDto {
  @IsBoolean()
  accepted: boolean;
}
