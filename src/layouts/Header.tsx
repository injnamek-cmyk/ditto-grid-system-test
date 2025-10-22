import Image from "next/image";
import Link from "next/link";

export default function Header() {
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
    </header>
  );
}
