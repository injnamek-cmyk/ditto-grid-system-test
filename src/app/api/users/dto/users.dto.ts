// 회원가입 요청 타입
export interface SignUpReqDto {
  email: string;
  password: string;
  name: string;
}

// 회원가입 응답 타입
export interface SignUpResDto {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
