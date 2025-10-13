"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/utils/helpers";

export interface BrandLogoProps {
  animate?: boolean;
  className?: string;
}

const BrandLogo: React.FC<BrandLogoProps> = ({ animate = false, className }) => {
  return (
    <Link href="/" className="group inline-flex">
      <div
        className={cn(
          "relative flex items-center justify-start transition-all duration-300 group-hover:scale-105",
          {
            "animate-pulse": animate,
          },
          className,
        )}
      >
        <Image
          src="/icons/dadologo.png"
          alt="Cinemadadok Logo"
          width={50}
          height={50}
          className="h-10 w-auto object-contain sm:h-12"
          priority
        />
      </div>
    </Link>
  );
};

export default BrandLogo;
