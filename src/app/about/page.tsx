import { FaTelegram } from "react-icons/fa6";
import { siteConfig } from "@/config/site";
import Link from "next/link";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { NextPage } from "next";
const FAQ = dynamic(() => import("@/components/sections/About/FAQ"));

export const metadata: Metadata = {
  title: `About | ${siteConfig.name}`,
};

const AboutPage: NextPage = () => {
  return (
    <div className="flex w-full justify-center">
      <div className="flex w-full max-w-2xl flex-col gap-5">
        <Suspense>
          <FAQ />
        </Suspense>
        <div className="flex flex-col gap-3 items-center text-center">
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-semibold">Created by</h3>
            <p className="text-lg">@makethman777</p>
          </div>
        </div>
        <Link target="_blank" href="https://t.me/makethman777" className="flex justify-center">
          <FaTelegram size={30} />
        </Link>
      </div>
    </div>
  );
};

export default AboutPage;
