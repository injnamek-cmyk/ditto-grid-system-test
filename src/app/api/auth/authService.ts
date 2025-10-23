import axios from "@/app/api/apiClient";
import { LoginReqDto, LoginResDto } from "./dto/auth.dto";
import { AxiosError } from "axios";

// auth
const AUTH_URL = "/auth";

export const authService = {
  /**
   * 로그인 요청
   */
  login: async (data: LoginReqDto): Promise<LoginResDto> => {
    try {
      const res = await axios.post<LoginResDto>(`${AUTH_URL}/login`, data);

      // API 응답이 올바른지 검증
      if (!res.data.data.accessToken) {
        throw new Error("토큰이 응답에 없습니다.");
      }
      return res.data;
    } catch (err) {
      // 기술적 에러 처리
      if (err instanceof AxiosError) {
        console.error("API Error: ", err);
      }
      throw err;
    }
  },
};
