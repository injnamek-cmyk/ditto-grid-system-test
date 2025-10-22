import { z } from "zod";

// 회원가입 요청 폼 스키마
export const signupFormSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
  name: z.string().min(1),
});
export type SignUpFormSchemaType = z.infer<typeof signupFormSchema>;

// 로그인 요청 폼 스키마
export const loginFormSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
});
export type LoginFormShemaType = z.infer<typeof loginFormSchema>;
