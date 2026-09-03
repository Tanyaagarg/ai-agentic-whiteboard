"use client";
import React, { useEffect, useRef, useState } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { useParams } from "next/navigation";
import axios from "axios";
import { toast } from "@/components/ui/toast";
import "./whiteboard.css";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

import {
  MousePointer2,
  Hand,
  Square,
  Diamond,
  Circle,
  ArrowRight,
  Minus,
  Pencil,
  Type,
  Image as ImageIcon,
  Eraser,
} from "lucide-react";

const tools = [
  { name: "selection", icon: MousePointer2, color: "text-blue-600" },
  { name: "hand", icon: Hand, color: "text-cyan-600" },
  { name: "rectangle", icon: Square, color: "text-blue-600" },
  { name: "diamond", icon: Diamond, color: "text-emerald-500" },
  { name: "ellipse", icon: Circle, color: "text-amber-500" },
  { name: "arrow", icon: ArrowRight, color: "text-violet-500" },
  { name: "line", icon: Minus, color: "text-pink-500" },
  { name: "freedraw", icon: Pencil, color: "text-orange-500" },
  { name: "text", icon: Type, color: "text-indigo-500" },
  { name: "image", icon: ImageIcon, color: "text-green-500" },
  { name: "eraser", icon: Eraser, color: "text-rose-500" },
];

function Whiteboard() {
  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);
  const saveTimeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { projectid } = useParams<{ projectid: string }>();
  const [activeTool, setActiveTool] = useState("selection");

  // Clear any pending save when the component unmounts
  useEffect(() => {
    return () => {
      if (saveTimeRef.current) clearTimeout(saveTimeRef.current);
    };
  }, []);

  const saveCanvasChanges = async (
    elements: readonly any[],
    appState: any,
    files: any,
  ) => {
    try {
      await axios.post("/api/whiteboard", {
        elements,
        appState,
        files,
        projectId: projectid,
      });
    } catch (error) {
      console.error("Autosave failed:", error);
      toast.add({ title: "Save failed", type: "error" });
    }
  };

  const handleCanvasChange = (
    elements: readonly any[],
    appState: any,
    files: any,
  ) => {
    // Keep the toolbar highlight in sync with keyboard shortcuts
    // and Excalidraw's auto-revert to selection after drawing
    setActiveTool(appState.activeTool.type);

    if (saveTimeRef.current) {
      clearTimeout(saveTimeRef.current);
    }

    const snapshot = [...elements];
    saveTimeRef.current = setTimeout(() => {
      saveCanvasChanges(snapshot, appState, files);
    }, 10000);
  };

  const changeTool = (tool: string) => {
    if (!excalidrawAPI) return;

    setActiveTool(tool);
    excalidrawAPI.setActiveTool({ type: tool as any });
  };

  return (
    <div className="relative" style={{ height: "90vh" }}>
      <Excalidraw
        excalidrawAPI={(api) => setExcalidrawAPI(api)}
        onChange={handleCanvasChange}
      />
      <div className="absolute left-4 top-1/2 z-50 flex -translate-y-1/2 flex-col gap-0.5 rounded-xl border bg-white p-1 shadow-lg">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.name}
              title={tool.name}
              onClick={() => changeTool(tool.name)}
              className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition hover:bg-primary/10 ${
                activeTool === tool.name ? "bg-primary/10" : ""
              }`}
            >
              <Icon size={18} className={tool.color} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Whiteboard;