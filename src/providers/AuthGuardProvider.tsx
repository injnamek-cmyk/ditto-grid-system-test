"use client";

import { useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";

interface AuthGuardProviderProps {
  children: ReactNode;
}

export default function AuthGuardProvider({
  children,
}: AuthGuardProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { accessToken } = useUserStore();

  useEffect(() => {
    // const isLoggedIn = !!accessToken;
    const isLoggedIn = true;

    // 인증이 필요한 페이지 목록
    const protectedRoutes = ["/studio"];
    const publicRoutes = ["/login", "/signup"];

    const isProtectedRoute = protectedRoutes.some((route) =>
      pathname.startsWith(route)
    );
    const isPublicRoute = publicRoutes.some((route) =>
      pathname.startsWith(route)
    );

    // 로그인하지 않았는데 보호된 페이지 접근 시도
    if (!isLoggedIn && isProtectedRoute) {
      router.push("/login");
      return;
    }

    // 로그인했는데 공개 페이지(login/signup) 접근 시도
    if (isLoggedIn && isPublicRoute) {
      router.push("/");
      return;
    }
  }, [pathname, router, accessToken]);

  return <>{children}</>;
}
