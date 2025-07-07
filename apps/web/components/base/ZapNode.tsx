"use client";
import Image from "next/image";

export const ZapCell = ({
  name,
  index,
  image
}: {
  name: string;
  index: number;
  image: string;
}) => {
  return (
    <div className="border border-black rounded-2xl p-6 m-2 flex flex-col items-center shadow-md bg-white hover:shadow-lg transition duration-300 cursor-pointer max-w-sm">
      <div className="flex items-center justify-center mb-4">
        <Image
          width={64}
          height={64}
          src={image || '/question.png'}
          alt={name}
          className="w-16 h-16 rounded-full border border-gray-300"
        />
      </div>
      <div className="text-xl font-semibold mb-1 text-gray-700">
        {index}.
      </div>
      <div className="text-lg text-gray-900">{name}</div>
    </div>
  );
};
