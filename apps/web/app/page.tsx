"use client";

import { useRouter } from "next/navigation";
import { getUser } from "@/hooks/getUser";
import { AppBar } from "@/components/base/AppBar";
import { Hero } from "@/components/base/Hero";
import { signIn } from "next-auth/react";
import { DEFAULT_LOGIN_REDIRECT } from "@/route";
import Image from "next/image";

const Home = () => {
  const user = getUser();
  const router = useRouter();

  const onClick2 = () => {
    signIn("google", {
      callbackUrl: DEFAULT_LOGIN_REDIRECT,
    });
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <AppBar auth={{ isAuthenticated: !!user }} />
      <div className="grid grid-cols-2 h-full">
        <div>
          <Hero onClick1={() => router.push("/auth/signup")} onClick2={onClick2} />
        </div>
        <div className="relative w-full h-full p-10">
          <Image
            src="/image.png"
            alt="App illustration"
            fill
            className="object-cover"
          />
        </div>

      </div>
    </div>
  );
};

export default Home;
