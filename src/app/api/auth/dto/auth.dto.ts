// 로그인 요청 타입
export interface LoginReqDto {
  email: string;
  password: string;
}

// 로그인 응답 타입
export interface LoginResDto {
  data: {
    accessToken: string;
    expiresIn: string;
  };
  meta: {
    requestId: string;
    timestamp: string;
  };
  error: null;
}
