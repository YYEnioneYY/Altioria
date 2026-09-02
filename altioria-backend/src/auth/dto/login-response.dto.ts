import { AdminResponseDto } from "./admin-response.dto";

export class LoginResponseDto {
  admin!: AdminResponseDto;
  expiresAt!: Date;
}