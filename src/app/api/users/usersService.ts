import axios from "@/app/api/apiClient";
import { SignUpReqDto, SignUpResDto } from "./dto/users.dto";
import { AxiosError } from "axios";

// users
const USERS_URL = "/users";

export const usersService = {
  /**
   * 회원가입 요청
   */
  signUp: async (data: SignUpReqDto): Promise<SignUpResDto> => {
    try {
      const res = await axios.post<SignUpResDto>(`${USERS_URL}`, data);

      // 추후 에러 메시지 입력
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
