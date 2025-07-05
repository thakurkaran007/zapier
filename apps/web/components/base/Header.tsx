"use client";

export const Header = ({label}: { label: string }) => {
    return (
        <div className="flex flex-col items-center justify-center space-y-1">
            <h6 className="text-3xl font-bold">
                <span className="text-amber-700">__</span>
                <span className="text-4xl">Zapier</span>
            </h6>
            <p className="font-extralight text-sm">{label}</p>
        </div>
    );
}