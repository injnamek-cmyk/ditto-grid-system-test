import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";
import { ApiResponse } from "./dto";

// 싱글톤 패턴 axios instance
class ApiClient {
  // 멤버 선언
  private static instance: ApiClient; // 외부에서 접근하게 하는 객체(싱글톤 패턴의 결과물)
  private axiosInstance: AxiosInstance; // 내부용 (http 통신 도구)

  private constructor() {
    // axiosInstance 초기화
    this.axiosInstance = axios.create({
      baseURL:
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        "https://ditto-api.mxlab.kr/api/v1",
      timeout: 10000, // 10초
      headers: {
        "Content-Type": "application/json",
      },
    });

    // 인터셉터 설정
    this.setupInterceptors();
  }

  // 싱글톤 인스턴스 반환 메서드 (외부 접근은 이걸로만 가능)
  public static getInstance(): ApiClient {
    // 최초에 instance 생성 안 되어 있다면 생성
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    // 생성되어 있다면 그대로 반환
    return ApiClient.instance;
  }

  // 모든 인터셉터 설정
  private setupInterceptors(): void {
    this.setupRequestInterceptor();
    this.setupResponseInterceptor();
  }

  // 요청 인터셉터 설정
  private setupRequestInterceptor(): void {
    this.axiosInstance.interceptors.request.use(
      // 성공 콜백
      (config) => {
        // SSR 환경 체크
        if (typeof window !== "undefined") {
          // 저장된 토큰 가져오기
          const token = localStorage.getItem("accessToken");
          if (token && config.headers) {
            // 요청 헤더에 토큰 추가
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config; // 수정된 설정 반환
      },

      // 실패 콜백
      (error) => {
        console.error("API Request Error: ", error);
        return Promise.reject(error);
      }
    );
  }

  // 응답 인터셉터 설정
  private setupResponseInterceptor(): void {
    this.axiosInstance.interceptors.response.use(
      // 성공 응답
      (res) => {
        console.log("API Response: ", res);
        return res;
      },
      // 실패 응답
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
          // 재시도 여부 추적
          _retry?: boolean;
        };

        // 401 토큰 만료 처리
        if (error.response?.status === 401 && !originalRequest._retry) {
          // 한 번만 요청하도록 _retry 플래그 설정
          originalRequest._retry = true;

          try {
            // 새 토큰 받아서 저장
            const refreshResponse = await this.axiosInstance.post(
              "/auth/refresh",
              {}
            );
            const newToken = refreshResponse.data.accessToken;
            if (typeof window !== "undefined") {
              localStorage.setItem("accessToken", newToken);
            }

            // 원래 요청 토큰 업데이트
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }

            // 원래 요청 재전송
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            // 토큰 갱신 실패 : 로그아웃
            if (typeof window !== "undefined") {
              localStorage.removeItem("accessToken");
            }
            return Promise.reject(refreshError);
          }
        }

        // 다른 에러는 그냥 거부 처리
        console.error("API Response Error: ", error);
        return Promise.reject(error);
      }
    );
  }

  /**
   * HTTP 메서드 정의. 모든 메서드를 하나의 클래스 안에 묶기 위함(캡슐화).
   */
  /* eslint-disable @typescript-eslint/no-explicit-any */
  public async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  public async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.put<ApiResponse<T>>(
      url,
      data,
      config
    );
    return response.data;
  }

  public async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.put<ApiResponse<T>>(
      url,
      data,
      config
    );
    return response.data;
  }

  public async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.patch<ApiResponse<T>>(
      url,
      data,
      config
    );
    return response.data;
  }

  public async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.delete<ApiResponse<T>>(
      url,
      config
    );
    return response.data;
  }
}

export default ApiClient.getInstance();
