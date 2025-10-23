import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface UserStore {
  accessToken: string | null;
  setUser: (accessToken: string) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      accessToken: null,
      setUser: (accessToken: string) => set({ accessToken }),
      clearUser: () => set({ accessToken: null }),
    }),
    {
      name: "user", // 로컬 스토리지 key 지정
      storage: createJSONStorage(() => sessionStorage), // 기본 로컬 스토리지 사용
    }
  )
);
