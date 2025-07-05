"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/dialog";
import { ZapCell } from "@/components/base/ZapNode";
import { Button } from "@repo/ui/src/components/button";
import { AppBar } from "@/components/base/AppBar";
import { useSession } from "next-auth/react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { BACKEND_URL } from "@/config";

type Action = {
  id: string;
  name: string;
  index: number;
  image: string;
  metaData?: any;
};

type Trigger = {
  id: string;
  name: string;
  index: number;
  image: string;
  metaData?: any;
};

type ZapDialogCellProps = {
  index: number;
  selected: Trigger | Action;
  available: (Trigger | Action)[];
  onSelect: (item: Trigger | Action) => void;
  onRemove?: () => void;
};

export default function Page() {
  const user = useSession().data?.user;
  const router = useRouter();
  const [trigger, setTrigger] = useState<Trigger>();
  const [actions, setActions] = useState<Action[]>([]);
  const [availableActions, setAvailableActions] = useState<Action[]>([]);
  const [availableTriggers, setAvailableTriggers] = useState<Trigger[]>([]);

  const fetchAll = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/v1/trigger/available`);
      const res2 = await axios.get(`${BACKEND_URL}/api/v1/action/available`);
      setAvailableTriggers(res.data.availableTriggers);
      setAvailableActions(res2.data.availableActions);
    } catch (err) {
      console.error("Failed to fetch:", err);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleAddAction = () => {
    setActions((prev) => {
      const nextIndex = prev.reduce((max, a) => Math.max(max, a.index), 1) + 1;
      return [
        ...prev,
        {
          index: nextIndex,
          id: "",
          name: "",
          image: "",
        },
      ];
    });
  };

  const handleRemoveAction = (indexToRemove: number) => {
    setActions((prev) => prev.filter((a) => a.index !== indexToRemove));
  };

  const handlePublish = async () => {
    if (!trigger?.id) {
      alert("Please select a trigger");
      return;
    }
    if (actions.length === 0 || actions.some((a) => !a.id)) {
      alert("Please select at least one valid action");
      return;
    }

    console.log("Publishing zap with trigger:", trigger, "and actions:", actions);
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/v1/zap`,
        {
          availableTriggerId: trigger.id,
          actions: actions.map((action) => ({
            availableActionId: action.id,
            metaData: (action.metaData) || {},
          })),
        },
        {
          withCredentials: true,
        }
      );
      console.log(res.data);
      router.push("/home");
    } catch (err) {
      console.error("Publish failed:", err);
      alert("Something went wrong while publishing.");
    }
  };

  return (
    <>
      <AppBar auth={{ isAuthenticated: true, user }} />

      <div className="min-h-screen w-full bg-slate-200 flex flex-col items-center">
        <div className="ml-auto m-4">
          <Button
            variant="default"
            className="bg-amber-700 hover:bg-amber-800"
            onClick={handlePublish}
          >
            Publish
          </Button>
        </div>

        {/* Trigger */}
        <ZapDialogCell
          index={1}
          selected={trigger || { id: "", name: "Trigger", index: 1, image: "" }}
          available={availableTriggers}
          onSelect={(item) => setTrigger(item as Trigger)}
        />

        {/* Action Cells */}
        {actions.map((action, i) => (
          <ZapDialogCell
            key={i}
            index={action.index}
            selected={action}
            available={availableActions}
            onSelect={(item) =>
              setActions((prev) =>
                prev.map((a) =>
                  a.index === action.index
                    ? {
                        ...a,
                        id: item.id,
                        name: item.name,
                        image: item.image,
                        metaData: item.metaData || {},
                      }
                    : a
                )
              )
            }
            onRemove={() => handleRemoveAction(action.index)}
          />
        ))}

        <Button onClick={handleAddAction} className="mt-4 text-3xl">
          +
        </Button>
      </div>
    </>
  );
}

function ZapDialogCell({
  index,
  selected,
  available,
  onSelect,
  onRemove,
}: ZapDialogCellProps) {
  const isTrigger = index === 1;
  const [open, setOpen] = useState(false);
  const [metaOpen, setMetaOpen] = useState(false);
  const [tempMeta, setTempMeta] = useState<any>(selected.metaData || {});

  // 🔁 Update tempMeta if selected changes
  useEffect(() => {
    setTempMeta(selected.metaData || {});
  }, [selected]);

  const handleSelect = (item: Trigger | Action) => {
    const updatedItem = { ...item, metaData: item.metaData || {} };
    setTempMeta(updatedItem.metaData);
    onSelect(updatedItem);
    setOpen(false);
    if (!isTrigger) {
      setMetaOpen(true);
    }
  };

  const handleSaveMeta = () => {
    if (!isTrigger) {
      onSelect({ ...selected, metaData: tempMeta } as Action);
    }
    setMetaOpen(false);
  };

  const handleRemove = () => {
    onRemove?.();
    setOpen(false);
  };

  const renderMetaInputs = () => {
    if (selected.name === "Send-Email") {
      return (
        <>
          <input
            placeholder="email"
            value={tempMeta.email || ""}
            onChange={(e) => setTempMeta((m: any) => ({ ...m, email: e.target.value }))}
            className="border p-2 w-full"
          />
          <textarea
            placeholder="Body"
            value={tempMeta.body || ""}
            onChange={(e) => setTempMeta((m: any) => ({ ...m, body: e.target.value }))}
            className="border p-2 w-full mt-2"
          />
        </>
      );
    } else if (selected.name === "Send-Solana") {
      return (
        <>
          <input
            placeholder="address"
            value={tempMeta.address || ""}
            onChange={(e) =>
              setTempMeta((m: any) => ({ ...m, address: e.target.value }))
            }
            className="border p-2 w-full"
          />
          <input
            placeholder="Amount"
            value={tempMeta.amount || ""}
            onChange={(e) =>
              setTempMeta((m: any) => ({ ...m, amount: e.target.value }))
            }
            className="border p-2 w-full mt-2"
          />
        </>
      );
    } else {
      return <p className="text-gray-500">No metadata required.</p>;
    }
  };

  return (
    <div className="relative w-full flex justify-center">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <div className="cursor-pointer pt-10">
            <ZapCell
              name={selected?.name || (isTrigger ? "Trigger" : "Action")}
              index={index}
              image={selected?.image || ""}
            />
          </div>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select {isTrigger ? "Trigger" : "Action"}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto px-2">
            {available.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-3 rounded-md cursor-pointer hover:bg-slate-100 transition"
                onClick={() => handleSelect(item)}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-10 h-10 object-contain rounded"
                />
                <span className="text-base font-medium text-gray-800">{item.name}</span>
              </div>
            ))}
            {!isTrigger && onRemove && (
              <Button variant="destructive" onClick={handleRemove}>
                Remove
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Metadata Dialog */}
      {!isTrigger && (
        <Dialog open={metaOpen} onOpenChange={setMetaOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enter Metadata for {selected.name}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-2">{renderMetaInputs()}</div>
            <div className="flex justify-end pt-4">
              <Button onClick={handleSaveMeta}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}