import { AppBar } from "@/components/base/AppBar";
import { Zaps } from "@/components/base/Zaps";
import { Skeleton } from "@repo/ui/skeleton";
import { auth } from "@/auth";

const HomePage = async () => {
    const session = await auth();
    const user = session?.user;

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <Skeleton className="w-1/2 h-10 mb-4" />
                <Skeleton className="w-full h-10 mb-4" />
                <Skeleton className="w-full h-10 mb-4" />
            </div>
        );
    }

    return (
        <div>
            <AppBar auth={{ isAuthenticated: !!user, user }} />
            <Zaps user={user}/>
        </div>
    );
};

export default HomePage;
