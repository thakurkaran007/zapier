import { Button } from "@repo/ui/src/components/button"
import { FcGoogle } from "react-icons/fc"

export const Hero = ({ onClick1, onClick2 }: {
    onClick1: () => void,
    onClick2: () => void
}) => {
    return <div className="flex flex-col h-full justify-center items-center">
        <div>
            <div className="text-7xl font-bold text-gray-900 dark:text-white">
                Automate without <br /> limits
            </div>
            <div className="text-2xl text-gray-500 dark:text-gray-400 mt-4">
                Turn chaos into     smooth operations by automating <br /> workflows yourself—no developers, no IT tickets, no <br /> delays. The only limit is your imagination.
            </div>
        </div>
        <div className="flex gap-x-7 pt-5 m-2">
            <Button variant="default" className="bg-amber-700 hover:bg-amber-800 text-xl p-7 rounded-full" onClick={onClick1}>Start free with email</Button>
            <Button variant="outline" className="rounded-full bg-white text-xl p-7 border-2 border-gray-300 hover:border-gray-800" onClick={onClick2}>
                <FcGoogle/>
                <span className=" text-black">Start free with Google</span>
            </Button>
        </div>
    </div>
}