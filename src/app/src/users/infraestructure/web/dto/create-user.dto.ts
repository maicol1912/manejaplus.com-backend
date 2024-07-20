import { Transform } from 'class-transformer';
import { IsString, IsEmail, IsNotEmpty, MinLength, MaxLength, Matches } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => value.toUpperCase())
  name: string;

  @IsNotEmpty()
  @IsEmail()
  @MaxLength(100)
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password is too easy'
  })
  password: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  @Matches(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/, {
    message: 'Phone number is not valid'
  })
  phone: string;
}
