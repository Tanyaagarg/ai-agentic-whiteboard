"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import axios from "axios";
import { useRouter } from "next/navigation";

function CreateNewBoardDialog() {
  const [workspaceName, setWorkspaceName] = useState("");
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState(false);
  const route = useRouter();

  const handleCreateBoard = async () => {
    if (workspaceName.trim() === "" || workspaceName?.length > 30) {
      toast.add({
        type: "error",
        title: "Invalid Workspace Name",
        description: "Please enter a valid workspace name (1-30 characters).",
      });

      return;
    }

    setLoading(true);
    const projectId = crypto.randomUUID();

    try {
      await axios.post("/api/projects", {
        projectName: workspaceName.trim(),
        projectId: projectId,
      });

      toast.add({ type: "success", title: "New Workspace Created" });

      setDialog(false);
      route.push("/workspace/" + projectId);
    } catch (error) {
      // Without this, a failed request left the spinner running forever
      console.error("Create board failed:", error);
      toast.add({ type: "error", title: "Could not create board" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={dialog} onOpenChange={setDialog}>
      {/*
        Base UI, not Radix. DialogTrigger renders its OWN <button>, so nesting
        <Button> inside it produced <button><button>, which the browser splits
        apart while parsing — that is why clicking did nothing. Pass the button
        as `render` and Base UI merges its trigger props into it instead.
      */}
      <DialogTrigger
        render={
          <Button>
            <Plus />
            Create New Board
          </Button>
        }
      />

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            WhiteBoard Workspace Name
          </DialogTitle>
        </DialogHeader>

        <div>
          <label className="text-gray-500">
            Enter WhiteBoard Workspace Name
          </label>
          <Input
            placeholder="Workspace Name"
            className="mt-2"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            // Enter should submit, same as clicking Create
            onKeyDown={(e) => {
              if (e.key === "Enter" && workspaceName.trim() && !loading) {
                handleCreateBoard();
              }
            }}
          />
        </div>

        <DialogFooter>
          {/* same nesting problem as the trigger */}
          <DialogClose render={<Button variant="outline">Cancel</Button>} />

          <Button
            disabled={workspaceName.trim().length == 0 || loading}
            onClick={handleCreateBoard}
          >
            {loading && <Loader2 className="animate-spin" />}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateNewBoardDialog;