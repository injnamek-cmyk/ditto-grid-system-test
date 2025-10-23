import axios from "@/app/api/apiClient";
import { SignUpReqDto, SignUpResDto } from "./dto/users.dto";

// users
const USERS_URL = "/users";

export const usersApi = {
  /**
   * 로그인 요청
   */
  login: async (data: SignUpReqDto): Promise<SignUpResDto> => {
    const res = await axios.post(`${USERS_URL}`, data);
    return res.data;
  },
};
