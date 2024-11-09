import { IsString, IsNotEmpty, MaxLength, IsArray, ArrayNotEmpty, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Transform(({ value }) => value.toUpperCase())
  public name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  public description: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  public permissionsId: string[];
}
