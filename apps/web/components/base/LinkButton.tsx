"use client";

export const LinkButton = ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => {
    return <div className="px-2 py-2 pointer font-extralight cursor-pointer hover:bg-neutral-200 rounded-md text-gray-700 text-sm" onClick={onClick}>
        {children}
    </div>
}