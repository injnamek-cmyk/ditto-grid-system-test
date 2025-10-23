import { ApiResponse } from "../../dto";

// 로그인 요청 타입
export interface LoginReqDto {
  email: string;
  password: string;
}

export interface LoginResData {
  accessToken: string;
  expiresIn: string;
}

// 로그인 응답 타입
export type LoginResDto = ApiResponse<LoginResData>;
