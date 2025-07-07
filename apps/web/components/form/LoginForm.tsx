"use client";   
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema } from "@/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/src/components/form";
import { Input } from "@repo/ui/src/components/input";
import { Button } from "@repo/ui/src/components/button";
import { useEffect, useState, useTransition } from "react";
import { login } from "@/actions/login";
import { CardWrapper } from "./CardWrapper";
import { FormError, FormSuccess } from "./form-condition";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { Turnstile } from "@marsidev/react-turnstile";
import { BACKEND_URL } from "@/config";

export const LoginForm = () => {
    const router = useRouter();
    const [token, setToken] = useState<string>("");
    const searchParams = useSearchParams();
    const urlError = searchParams.get("error") === "OAuthAccountNotLinked" ? "Email already in use" : "";
    const [success, setSuccess] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [isPending, startTransition] = useTransition();
    
    const form = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: "",
            password: "",
        }
    });
    
    useEffect(() => {
        if (urlError === "Email already in use") setError(urlError);
    }, [urlError])

    interface LoginInput {
        email: string;
        password: string;
      }
      
    const sendCookie = async (data: LoginInput) => {
        try {
            const res = await axios.post(`${BACKEND_URL}/api/v1/user/signin`, data, { withCredentials: true });
            console.log("Response from server:", res);
            if (res.status === 200) {
                console.log("Cookie sent successfully");
                return { success: "Login Successful" };
            }
            console.log("Error:", res);
            return { error: "Unexpected error" };
        } catch (error: any) {
            console.log("Error sending cookie:", error);
            return { error: error?.response?.data?.message || "Something went wrong" };
        }
    }
      

    const submit = async (values: z.infer<typeof LoginSchema>) => {
        startTransition(() => {
            login(values, token)
                .then(async (response) => {
                    if (response?.error) {
                        setSuccess("");
                        setError(response.error);
                    }
                    if (response?.success) {
                            const cookieResponse = await sendCookie(values);
                            if (cookieResponse.error) {
                                setError(cookieResponse.error);
                                return;
                        }
                        setSuccess(response.success);
                        setError("");
                        form.reset();
                        router.push("/home");
                    }
                })
                .catch((error) => {
                    setError(error.message);
                    setSuccess("");
                });
        });
    };
    
    return (
        <CardWrapper
            headerLabel="Welcome Back"
            backButtonLabel="Don't have an account?"
            backButtonhref="/auth/signup"
            showSocial={true}
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(submit)} className="space-y-6">
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="john@gmail.com"
                                            type="email"
                                            disabled={isPending}
                                        />    
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="********"
                                            type="password"
                                            disabled={isPending}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    { <Turnstile siteKey="0x4AAAAAABkLrxkyiXYs22ve" onSuccess={(token) => setToken(token)}/>}
                    { error && !success && <FormError message={error}/>}
                    { success && !error && <FormSuccess message={success}/>}
                    <Button type="submit" className="w-full">   
                        Login
                    </Button>
                </form>
            </Form>
        </CardWrapper>
    )
}
