import { create } from "zustand";

interface UserType {
  email: string;
}

export interface UserStore {
  user: UserType | null;
  setUser: (user: UserType) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user: UserType) => set({ user }),
}));
