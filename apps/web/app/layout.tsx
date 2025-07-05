import { auth } from "@/auth";
import { cn } from "@repo/ui/src/lib/utils";
import "@repo/ui/src/styles/globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "@repo/ui/src/components/toaster";
import ClientSessionProvider from "@/components/ClientSessionProvider";

const font = Inter({
  subsets: ["vietnamese"],
  weight: "400",
});

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth(); // Fetch session on the server only once

  return (
    <html lang="en">
      <body className={cn(font.className)}>
        <ClientSessionProvider session={session}>
          <main>{children}</main>
          <Toaster />
        </ClientSessionProvider>
      </body>
    </html>
  );
}
