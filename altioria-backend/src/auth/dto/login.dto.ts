import {
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class LoginDto {
  @IsString()
  @Length(3, 50)
  @Matches(/^[a-zA-Z0-9._-]+$/)
  username!: string;

  @IsString()
  @Length(12, 128)
  password!: string;
}