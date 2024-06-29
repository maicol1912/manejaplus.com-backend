import { ArrayNotEmpty, IsArray, IsNotEmpty, IsUUID } from 'class-validator';

export class AssignRoleDto {
  @IsUUID('4')
  @IsNotEmpty()
  public userId: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  public rolesId: string[];
}
