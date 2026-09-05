"use client";
import React, { useEffect, useRef, useState } from "react";
import { Excalidraw, exportToBlob } from "@excalidraw/excalidraw";
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
  Sparkles,
} from "lucide-react";
import FloatingProperties from "./FloatingProperties";
import ToolProperties from "./ToolProperties";
import { Button } from "@/components/ui/button";
import AIFloatingSidebar from "./AIFloatingSidebar";
import BottomToolbar from "./Bottomtoolbar";

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

/** Largest box a dashboard thumbnail is allowed to occupy. */
const PREVIEW_MAX_WIDTH = 400;
const PREVIEW_MAX_HEIGHT = 300;

/** FileReader gives us the "data:image/webp;base64,..." string we store in Postgres. */
const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

type Props = {
  onApiReady: (api: ExcalidrawImperativeAPI) => void;
};

function Whiteboard({ onApiReady }: Props) {
  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);
  const saveTimeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { projectid } = useParams<{ projectid: string }>();
  const [activeTool, setActiveTool] = useState("selection");
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [canvasState, setCanvasState] = useState<any>(null);
  const [ShowAiSidebar, setShowAiSidebar] = useState(false);

  useEffect(() => {
    return () => {
      if (saveTimeRef.current) clearTimeout(saveTimeRef.current);
    };
  }, []);

  /**
   * Render the whole canvas down to a small webp and return it as a base64
   * data URL. Returns null when there is nothing worth showing, in which case
   * the API leaves any existing thumbnail alone.
   */
  const generatePreviewBase64 = async (): Promise<string | null> => {
    if (!excalidrawAPI) return null;

    const elements = excalidrawAPI
      .getSceneElements()
      .filter((el: any) => !el.isDeleted);

    if (!elements.length) return null;

    const appState = excalidrawAPI.getAppState();
    const files = excalidrawAPI.getFiles();

    try {
      const blob = await exportToBlob({
        elements,
        appState: {
          ...appState,
          exportBackground: true,
          exportWithDarkMode: false,
        },
        files,
        mimeType: "image/webp",
        quality: 0.5,
        exportPadding: 10,
        /**
         * Excalidraw passes in the drawing's real bounding-box size and wants
         * back the canvas size AND the scale to draw at. Returning a fixed
         * size with scale 1 crops to the top-left corner instead of shrinking
         * the board — that is what produced zoomed-in thumbnails. Scaling both
         * together fits the entire drawing into the frame.
         */
        getDimensions: (width: number, height: number) => {
          const scale = Math.min(
            PREVIEW_MAX_WIDTH / width,
            PREVIEW_MAX_HEIGHT / height,
            1, // never blow a tiny sketch up past 1:1
          );

          return {
            width: Math.round(width * scale),
            height: Math.round(height * scale),
            scale,
          };
        },
      });

      return await blobToBase64(blob);
    } catch (error) {
      // A broken thumbnail must never block the actual save.
      console.error("Preview generation failed:", error);
      return null;
    }
  };

  const saveCanvasChanges = async (
    elements: readonly any[],
    appState: any,
    files: any,
  ) => {
    try {
      const previewImage = await generatePreviewBase64();

      const result = await axios.post("/api/whiteboard", {
        elements,
        appState,
        files,
        projectId: projectid,
        previewImage,
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
    setCanvasState(appState);

    // Only ids with a truthy value are actually selected —
    // Excalidraw leaves deselected ids in the map set to false
    const selectedIds = Object.keys(appState.selectedElementIds || {}).filter(
      (id) => appState.selectedElementIds[id],
    );

    if (selectedIds.length === 1) {
      const element = elements.find(
        (el) => el.id === selectedIds[0] && !el.isDeleted,
      );
      setSelectedElement(element ?? null);
    } else {
      setSelectedElement(null);
    }

    setActiveTool(appState.activeTool.type);

    if (saveTimeRef.current) {
      clearTimeout(saveTimeRef.current);
    }

    const snapshot = [...elements];
    // 10s was long enough to lose work on a quick refresh
    saveTimeRef.current = setTimeout(() => {
      saveCanvasChanges(snapshot, appState, files);
    }, 2000);
  };

  const changeTool = (tool: string) => {
    if (!excalidrawAPI) return;
    setActiveTool(tool);
    excalidrawAPI.setActiveTool({ type: tool as any });
  };

  /** Patch a single property on the currently selected element */
  const handlePropertyChange = (property: string, value: any) => {
    if (!excalidrawAPI || !selectedElement) return;

    const elements = excalidrawAPI.getSceneElements();

    const updatedElements = elements.map((el: any) => {
      if (el.id !== selectedElement.id) {
        return el;
      }

      return {
        ...el,
        [property]: value,
        version: el.version + 1,
        versionNonce: Math.floor(Math.random() * 1000000),
        updated: Date.now(),
      };
    });

    excalidrawAPI.updateScene({ elements: updatedElements });
  };

  /** Set defaults for the NEXT element drawn with the active tool */
  const handleToolPropertyChange = (property: string, value: any) => {
    if (!excalidrawAPI) return;

    excalidrawAPI.updateScene({
      appState: {
        ...excalidrawAPI.getAppState(),
        [property]: value,
      },
    });
  };

  const getFloatingPosition = () => {
    if (!selectedElement || !canvasState) {
      return { left: 0, top: 0 };
    }

    const zoom = canvasState.zoom?.value ?? 1;
    const scrollX = canvasState.scrollX ?? 0;
    const scrollY = canvasState.scrollY ?? 0;

    const width = Math.abs(selectedElement.width ?? 0);
    const centerX = selectedElement.x + width / 2;

    const screenX = (centerX + scrollX) * zoom;
    const screenY = (selectedElement.y + scrollY) * zoom;

    return {
      left: Math.max(100, screenX),
      top: Math.max(10, screenY - 60),
    };
  };

  const floatingPosition = getFloatingPosition();

  return (
    <div className="relative" style={{ height: "90vh" }}>
      <Excalidraw
        excalidrawAPI={(api) => {
          setExcalidrawAPI(api);
          onApiReady(api);
        }}
        onChange={handleCanvasChange}
        initialData={{
          appState: {
            currentItemRoughness: 0,
          },
        }}
      />

      {/* LEFT TOOLBAR */}
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

      {/* TOOL DEFAULTS — shown while a drawing tool is active */}
      {!selectedElement && (
        <ToolProperties
          activeTool={activeTool}
          appState={canvasState}
          onToolPropertyChange={handleToolPropertyChange}
        />
      )}

      {/* SELECTED ELEMENT PROPERTIES */}
      <FloatingProperties
        selectedElement={selectedElement}
        position={floatingPosition}
        excalidrawAPI={excalidrawAPI}
        onPropertyChange={handlePropertyChange}
      />

      <BottomToolbar
        excalidrawApi={excalidrawAPI}
        aiOpen={ShowAiSidebar}
        onToggleAi={() => setShowAiSidebar(!ShowAiSidebar)}
      />

      {ShowAiSidebar && (
        <AIFloatingSidebar
          excalidrawApi={excalidrawAPI}
          onClose={() => setShowAiSidebar(false)}
        />
      )}
    </div>
  );
}

export default Whiteboard;