import { IsMongoId } from 'class-validator';

export class LinkIndividualDto {
  @IsMongoId()
  individualId: string;
}
