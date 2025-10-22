import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface UserType {
  email: string;
}

export interface UserStore {
  user: UserType | null;
  setUser: (user: UserType) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user: UserType) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: "user", // 로컬 스토리지 key 지정
      storage: createJSONStorage(() => sessionStorage), // 기본 로컬 스토리지 사용
    }
  )
);
