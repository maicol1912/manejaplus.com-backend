import { IsString, IsNotEmpty, MaxLength, IsArray, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Transform(({ value }) => value.toUpperCase())
  public name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  public description: string;
}
