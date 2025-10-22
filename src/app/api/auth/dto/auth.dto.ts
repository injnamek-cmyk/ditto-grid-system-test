// 회원가입 요청 타입
export interface SignUpReqDto {
  email: string;
  password: string;
  name: string;
}

// 로그인 요청 타입
export interface LoginReqDto {
  email: string;
  password: string;
}
