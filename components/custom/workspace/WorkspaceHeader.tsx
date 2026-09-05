"use client"
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DownloadIcon, Save, Share } from "lucide-react";

type Props = {
  selectedTab: any,
  onExport: any,
  onSave: any,
  projectName: string
}

function WorkspaceHeader({ selectedTab, onExport, onSave, projectName }: Props) {
  return (
    <div className="p-3 border-b flex justify-between items-center">
      <Link href={"/dashboard"}>
        <div className="flex gap-2 items-center">
          <Image src={"/logo.svg"} alt="logo" width={35} height={35} />
          <h2>{projectName}</h2>
        </div>
      </Link>
      {/* Switch */}
      <div>
        <Tabs defaultValue="whiteboard"
        onValueChange={(value) => selectedTab(value)}>
          <TabsList>
            <TabsTrigger value="whiteboard">Whiteboard</TabsTrigger>
            <TabsTrigger value="doc">Doc</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Extra Button */}
      <div className="flex gap-2">
        <Button onClick={onSave}><Save/>Save</Button>
        <Button variant={"outline"}><Share/>Share</Button>
        <Button onClick={onExport}><DownloadIcon/>Export</Button>
      </div>
    </div>
  );
}

export default WorkspaceHeader;