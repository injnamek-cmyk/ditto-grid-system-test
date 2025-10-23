import axios from "@/app/api/apiClient";
import { LoginReqDto, LoginResDto } from "./dto/auth.dto";

// auth
const AUTH_URL = "/auth";

export const authApi = {
  /**
   * 회원가입 요청
   */
  login: async (data: LoginReqDto): Promise<LoginResDto> => {
    const res = await axios.post(`${AUTH_URL}/login`, data);
    return res.data;
  },
};
