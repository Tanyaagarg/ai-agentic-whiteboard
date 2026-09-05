import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  const route= useRouter();

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
    await axios.post("/api/projects", {
      projectName: workspaceName,
      projectId: projectId,
    });

    toast.add({
      type: "success",
      title: "New Workspace Created",
    });
    setLoading(false);
    setDialog(false);
    route.push('/workspace/' + projectId)
  };

  return (
    <Dialog open={dialog} onOpenChange={setDialog}>
      {/* Base UI's DialogTrigger renders a <button> of its own, so <Button>
          goes through `render` — as a child it produced a button inside a
          button, which is invalid HTML and broke hydration. */}
      <DialogTrigger render={<Button />}>
        <Plus />
        Create New Board
      </DialogTrigger>
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
            onChange={(e) => setWorkspaceName(e.target.value)}
          />
        </div>

        <DialogFooter>
          {/* same as the trigger above: DialogClose renders its own <button>,
              so the styled Button goes through `render` */}
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button
            disabled={workspaceName?.length == 0 || loading}
            onClick={handleCreateBoard}
          >
            {loading && <Loader2 className='animate-spin' />}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateNewBoardDialog;
