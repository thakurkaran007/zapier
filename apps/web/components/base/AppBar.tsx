"use client";

import { Button } from "@repo/ui/src/components/button"
import { LinkButton } from "./LinkButton"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu"
import { LogOut } from "lucide-react"
import { ExtendedUser } from "@/next-auth";

export const AppBar = ({ auth }: { auth: {
    isAuthenticated: boolean;
    user?: ExtendedUser
} }) => {
    const router = useRouter();
    

    return (
        <div className="flex border-b justify-between items-center p-2">
            <div className="text-4xl cursor-pointer">
                <span className="text-amber-700">__</span>
                <span className="font-extrabold text-5xl">Zapier</span>
            </div>
            <div className="flex gap-x-4 items-center">
                <LinkButton onClick={() => {}}>{
                    auth.isAuthenticated && auth.user ? `${auth.user.name}` : "Contact Sales"
                }</LinkButton>
                {
                    auth.isAuthenticated && auth.user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Avatar className="cursor-pointer">
                                    <AvatarImage src={auth.user.image || ""} alt={auth.user.name || ""} />
                                    <AvatarFallback>
                                        {auth.user.name?.[0]}
                                    </AvatarFallback>
                                </Avatar>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-40">
                                <DropdownMenuItem
                                    className="flex items-center gap-2 cursor-pointer"
                                    onClick={() => signOut()}
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span>Logout</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <>
                            <LinkButton onClick={() => router.push("/auth/login")}>LogIn</LinkButton>
                            <Button variant="default" className="bg-amber-700 hover:bg-amber-800" onClick={() => router.push("/auth/signup")}>SignUp</Button>
                        </>
                    )
                }
            </div>
        </div>
    )
}
