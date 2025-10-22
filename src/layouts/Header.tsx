"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface HeaderProps {
  savePage?: () => void;
}

export default function Header({ savePage }: HeaderProps) {
  const pathname = usePathname();
  const isStudioPage = pathname === "/studio";

  return (
    <header className="flex items-center border-b border-gray-200 h-[70px] px-5 sticky top-0 z-10 bg-white">
      <section>
        <Link className="flex gap-2" href={"/"}>
          <Image src="/ditto.svg" width={40} height={40} alt="ditto_logo" />
          <Image
            src="/ditto_text.svg"
            width={70}
            height={40}
            alt="ditto_logo"
          />
        </Link>
      </section>
      {isStudioPage && (
        <div className="ml-auto">
          <button
            onClick={savePage}
            className="w-12 h-12 bg-white text-gray-700 rounded-md shadow-lg hover:shadow-xl transition-all flex items-center justify-center border border-gray-200"
            title="페이지 저장"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
              />
            </svg>
          </button>
        </div>
      )}
    </header>
  );
}
