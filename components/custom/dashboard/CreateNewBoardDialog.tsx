import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";

function CreateNewBoardDialog() {
    
    const [workspaceName,setWorkspaceName] = useState("");

    const handleCreateBoard = () =>{
        if(workspaceName.trim()==="" || workspaceName?.length>30){
            toast.add({
                type:"error",
                title:"Invalid Workspace Name",
                description: "Please enter a valid workspace name (1-30 characters)."
            })
        }
    }

  return (
      <Dialog>
        <DialogTrigger>
            <Button>
                <Plus/>Create New Board
            </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">WhiteBoard Workspace Name</DialogTitle>
          </DialogHeader>
          <div>
            <label className="text-gray-500">Enter WhiteBoard Workspace Name</label>
            <Input placeholder="Workspace Name" className="mt-2"
            onChange={(e)=>setWorkspaceName(e.target.value)}
            />
          </div>

          <DialogFooter>
            <DialogClose>
                <Button variant="outline">
                    Cancel
                </Button>
            </DialogClose>
            <Button disabled={workspaceName?.length==0} onClick={handleCreateBoard}>
                Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  );
}

export default CreateNewBoardDialog;
