export class LoginAdminDto {
  id!: string;
  username!: string;
  createdAt!: Date;
}

export class LoginResponseDto {
  admin!: LoginAdminDto;
  expiresAt!: Date;
}