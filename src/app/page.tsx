"use client";

import { useUserStore } from "@/store/useUserStore";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const { accessToken } = useUserStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-8 max-w-2xl">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <Image src="/ditto.svg" width={80} height={80} alt="ditto_logo" />
          <Image
            src="/ditto_text.svg"
            width={140}
            height={80}
            alt="ditto_text"
          />
        </div>

        {/* Title and Description */}
        <div className="text-center space-y-3">
          <h1 className="text-5xl font-bold text-gray-900">Welcome to Ditto</h1>
          <p className="text-xl text-gray-600">
            Create beautiful pages with our intuitive grid-based editor
          </p>
        </div>

        {/* CTA Button */}
        <button
          onClick={() => router.push("/studio")}
          className="mt-4 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold rounded-lg shadow-lg hover:shadow-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105"
        >
          Start Creating →
        </button>
        {!accessToken && (
          <button
            onClick={() => router.push("/login")}
            className="mt-4 px-8 py-2 bg-white text-lg font-semibold rounded-lg shadow-lg hover:shadow-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105"
          >
            Login
          </button>
        )}

        {/* Features */}
        <div className="grid grid-cols-3 gap-6 mt-12 w-full">
          <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg shadow-sm">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"
              />
            </svg>
            <h3 className="font-semibold text-gray-900">Grid Layout</h3>
            <p className="text-sm text-gray-600 text-center">
              24x24 grid system
            </p>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg shadow-sm">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              />
            </svg>
            <h3 className="font-semibold text-gray-900">Drag & Drop</h3>
            <p className="text-sm text-gray-600 text-center">
              Intuitive interactions
            </p>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg shadow-sm">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <h3 className="font-semibold text-gray-900">Fast & Secure</h3>
            <p className="text-sm text-gray-600 text-center">
              Client-side only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
