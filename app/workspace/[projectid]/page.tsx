"use client";
import SmartDoc from "@/components/custom/workspace/SmartDoc";
import Whiteboard from "@/components/custom/workspace/Whiteboard";
import WorkspaceHeader from "@/components/custom/workspace/WorkspaceHeader";
import { exportToBlob } from "@excalidraw/excalidraw";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import axios from "axios";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

/**
 * appState comes back as plain JSON, but Excalidraw expects live objects for
 * some fields and derives others from the current window. Feeding those back
 * in throws or leaves the canvas mispositioned, so drop them.
 */
const normalizeAppState = (appState: any) => {
  if (!appState) return {};

  const {
    collaborators,
    width,
    height,
    offsetLeft,
    offsetTop,
    isLoading,
    errorMessage,
    ...rest
  } = appState;

  return rest;
};

function Workspace() {
  const [activeTab, setActiveTab] = useState("whiteboard");
  const [api, setApi] = useState<ExcalidrawImperativeAPI | null>(null);
  const [projectName, setProjectName] = useState("");
  const { projectid } = useParams<{ projectid: string }>();

  // needs both: an id to fetch with, and a canvas to load into
  useEffect(() => {
    if (projectid && api) {
      getWhiteboardData();
    }
  }, [projectid, api]);

  const getWhiteboardData = async () => {
    try {
      const result = await axios.get("/api/projects?projectId=" + projectid);
      const board = result.data;

      if (!board || board.error) {
        console.log("No saved whiteboard for this project", board?.error ?? "");
        return;
      }

      setProjectName(board.projectName ?? "");

      api?.updateScene({
        elements: board.elements || [],
        appState: normalizeAppState(board.appState),
      });

      if (board.files) {
        api?.addFiles(Object.values(board.files));
      }
    } catch (error) {
      console.error("Failed to load whiteboard:", error);
    }
  };

  const handleSave = async () => {
    if (!api) return;

    try {
      const result = await axios.post("/api/whiteboard", {
        projectId: projectid,
        elements: api.getSceneElements(),
        appState: api.getAppState(),
        files: api.getFiles(),
      });

      console.log("Saved:", result.data);
    } catch (error) {
      console.error("Save failed:", error);
    }
  };

  const handleExportImage = async () => {
    if (!api) return;

    const blob = await exportToBlob({
      elements: api.getSceneElements(),
      appState: {
        ...api.getAppState(),
        exportBackground: true,
      },
      files: api.getFiles(),
      mimeType: "image/png",
      quality: 1,
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "whiteboard.png";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <WorkspaceHeader
        selectedTab={(value: string) => setActiveTab(value)}
        onExport={() => handleExportImage()}
        onSave={() => handleSave()}
        projectName={projectName}
      />

      {activeTab == "whiteboard" ? (
        <Whiteboard onApiReady={(api) => setApi(api)} />
      ) : (
        <SmartDoc />
      )}
    </div>
  );
}

export default Workspace;