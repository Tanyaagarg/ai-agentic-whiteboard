"use client";

import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { Sparkle } from "lucide-react";
import React from "react";
import CreateNewBoardDialog from "./CreateNewBoardDialog";

function WelcomeBanner() {
  const { user } = useUser();
  return (
    <div>
      <div className="p-10 border rounded-xl bg-gradient-to-r from-blue-200 to-purple-200">
        <h2 className="text-2xl font-bold">Welcome Back, {user?.fullName}</h2>
        <p>Bring Your Ideas to Life on infinite canvas</p>
        <div className="flex items-center gap-2 mt-5">
         <CreateNewBoardDialog/>
          <Button variant="outline" size="lg"><Sparkle/> AI Helper </Button>
        </div>
      </div>
    </div>
  );
}

export default WelcomeBanner;
