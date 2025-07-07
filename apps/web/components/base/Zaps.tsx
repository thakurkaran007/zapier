"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/table";
import { Checkbox } from "@repo/ui/checkbox";
import { Switch } from "@repo/ui/switch";
import {  useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {Zap} from "@repo/lib/types";
import axios from "axios";
import { BACKEND_URL, HOOKS_URL } from "@/config";
import { signOut } from "next-auth/react";
import Image from "next/image";



export const Zaps = () => {
  const [zaps, setZaps] = useState<Zap[]>([]);
  const router = useRouter();

  const fetchZaps = async () => {
      try {
          const response = await axios.get(`${BACKEND_URL}/api/v1/zap`, { withCredentials: true });
          console.log("Fetched zaps:", response.data);
          setZaps(response.data);
      } catch (error) {
          console.error("Error fetching zaps:", error);
          if (axios.isAxiosError(error) && error.response?.status === 401) {
            await signOut();
          }
      }
  }

  useEffect(() => {
    setTimeout(() => {
      fetchZaps().catch((error) => {
      console.error("Error fetching zaps:", error);
    })}
    , 5000);
  }, []);

  return (
    <div className="rounded-md border">
      <div className="flex justify-end px-4 py-3">
        <button
          onClick={() => router.push("/zap/create")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded flex items-center gap-2"
        >
          <span className="text-xl">+</span> Create
        </button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead />
            <TableHead>Name</TableHead>
            <TableHead>Last edit</TableHead>
            <TableHead>TriggerUrl</TableHead>
            <TableHead>Running</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {zaps.map((zap) => (
            <TableRow key={zap.id}>
              <TableCell className="flex items-center gap-3">
                <Checkbox />
                <Image
                  src={(zap.trigger.type.image)}
                  alt={zap.trigger.type.name}
                  width={20}
                  height={20}
                />
                {zap.actions
                  .sort((a, b) => a.sortingOrder - b.sortingOrder)
                  .map((action) => (
                    <Image
                      key={action.id}
                      src={(action.type.image)}
                      alt={action.type.name}
                      width={20}
                      height={20}
                    />
                  ))}
              </TableCell>
              <TableCell className="font-medium">
                {zap.name || "Untitled Zap"}
              </TableCell>
              <TableCell>
                {zap.lastEditedAt
                  ? new Date(zap.lastEditedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—"}
              </TableCell>
              <TableCell>
                  {`${HOOKS_URL}/hooks/catch/${zap.userId}/${zap.trigger.zapId}`}
              </TableCell>
              <TableCell>
                <Switch checked={false} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
