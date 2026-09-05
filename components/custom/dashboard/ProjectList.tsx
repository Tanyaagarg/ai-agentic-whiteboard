"use client";

import { Archive, Folder, Loader2, Pencil, SearchX } from "lucide-react";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { toast } from "@/components/ui/toast";
import CreateNewBoardDialog from "./CreateNewBoardDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { notifyBoardsChanged, type Project } from "./types";
import { matchesQuery, useBoardSearch } from "@/context/BoardSearchContext";

/** "Edited 2 hours ago", or a sensible fallback for a board never opened. */
const editedLabel = (updatedAt: string | null) => {
  if (!updatedAt) return "Not edited yet";

  const date = new Date(updatedAt);
  if (isNaN(date.getTime())) return "Not edited yet";

  return "Edited " + formatDistanceToNow(date, { addSuffix: true });
};

function ProjectList() {
  // Typing the state is what fixes "Property 'previewImage' does not exist on
  // type 'never'" — useState([]) alone infers never[].
  const [projectList, setProjectList] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const { query, setQuery } = useBoardSearch();
  // The board being renamed, or null when the dialog is closed.
  const [renameTarget, setRenameTarget] = useState<Project | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renaming, setRenaming] = useState(false);

  // Filter for display only — projectList stays the full set, so clearing the
  // search brings everything back without a refetch.
  const visibleProjects = projectList.filter((project) =>
    matchesQuery(project.projectName, query),
  );

  useEffect(() => {
    GetProjectList();
  }, []);

  const GetProjectList = async () => {
    try {
      const result = await axios.get("/api/projects");
      // the list endpoint returns an array; the error shape is an object
      setProjectList(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveProject = async (
    e: React.MouseEvent,
    project: Project,
  ) => {
    // the card is a <Link>, so stop the click from navigating into the board
    e.preventDefault();
    e.stopPropagation();

    setBusyId(project.projectId);

    try {
      // axios.delete puts the body under `data`, not as a second argument
      await axios.delete("/api/projects", {
        data: { projectId: project.projectId },
      });

      // drop it from local state instead of refetching — instant, no flicker
      setProjectList((prev) =>
        prev.filter((p) => p.projectId !== project.projectId),
      );
      notifyBoardsChanged();

      toast.add({
        type: "success",
        title: "Moved to Archive",
        description: "You can restore it from the Archived page.",
      });
    } catch (error) {
      console.error("Archive failed:", error);
      toast.add({ type: "error", title: "Could not archive board" });
    } finally {
      setBusyId(null);
    }
  };

  const openRename = (e: React.MouseEvent, project: Project) => {
    // the card is a <Link>, so stop the click from navigating into the board
    e.preventDefault();
    e.stopPropagation();

    setRenameTarget(project);
    setRenameValue(project.projectName);
  };

  const handleRename = async () => {
    if (!renameTarget) return;

    const name = renameValue.trim();

    if (!name || name.length > 30) {
      toast.add({
        type: "error",
        title: "Invalid board name",
        description: "Please enter a name between 1 and 30 characters.",
      });
      return;
    }

    // nothing to do, just close
    if (name === renameTarget.projectName) {
      setRenameTarget(null);
      return;
    }

    setRenaming(true);

    try {
      await axios.patch("/api/projects", {
        projectId: renameTarget.projectId,
        action: "rename",
        projectName: name,
      });

      // patch local state rather than refetching — same reason as archiving
      setProjectList((prev) =>
        prev.map((p) =>
          p.projectId === renameTarget.projectId
            ? { ...p, projectName: name }
            : p,
        ),
      );

      toast.add({ type: "success", title: "Board renamed" });
      setRenameTarget(null);
    } catch (error: any) {
      console.error("Rename failed:", error);
      toast.add({
        type: "error",
        title: "Could not rename board",
        // surface what the API actually said, so a 400 is not a mystery
        description: error?.response?.data?.error ?? "Please try again.",
      });
    } finally {
      setRenaming(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (projectList.length === 0) {
    return (
      // Was <Image src="/folder.png" />, but public/folder.png does not exist
      // in this project — that is the broken-image icon. The lucide Folder
      // component needs no asset at all.
      <div className="mt-5 flex flex-col items-center gap-3 rounded-xl border p-10">
        <div className="rounded-2xl bg-muted p-5">
          <Folder className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold">No Boards Found</h2>
        <p className="text-muted-foreground">
          Create your first board to start brainstorming, Planning !
        </p>
        <CreateNewBoardDialog />
      </div>
    );
  }

  return (
    <div className="mt-10">
      <div>
        <h2 className="text-2xl font-bold">Your Boards</h2>
        <p className="mt-1 text-sm text-gray-400">
          {query.trim()
            ? `${visibleProjects.length} of ${projectList.length} ${
                projectList.length === 1 ? "board" : "boards"
              } match "${query.trim()}"`
            : "Create, organize and continue working on your ideas"}
        </p>
      </div>

      {/* Distinct from the "No Boards Found" state above: you do have boards,
          none of them just happen to match what you typed. */}
      {visibleProjects.length === 0 && (
        <div className="mt-5 flex flex-col items-center gap-3 rounded-xl border p-10">
          <div className="rounded-2xl bg-muted p-5">
            <SearchX className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold">No matching boards</h2>
          <p className="text-muted-foreground">
            Nothing here is called &quot;{query.trim()}&quot;.
          </p>
          <button
            type="button"
            onClick={() => setQuery("")}
            className="mt-2 rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
          >
            Clear search
          </button>
        </div>
      )}

      <div className="mt-5 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
        {visibleProjects.map((project) => (
          <Link
            href={"/workspace/" + project.projectId}
            key={project.projectId}
            className="group relative overflow-hidden rounded-xl border transition hover:cursor-pointer hover:shadow-md"
          >
            {/*
              Preview. Parent must be relative for <Image fill>.
              object-contain, not object-cover: thumbnails keep the board's own
              aspect ratio, so cover would crop a wide or tall drawing.
            */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-50 p-2">
              {project.previewImage ? (
                <Image
                  src={project.previewImage}
                  alt={project.projectName}
                  fill
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Folder className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="flex items-end justify-between gap-2 border-t p-4">
              <div className="min-w-0">
                <h2 className="truncate font-medium">{project.projectName}</h2>
                <p className="mt-0.5 text-xs text-gray-400">
                  {editedLabel(project.updatedAt)}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-0.5">
                <button
                  onClick={(e) => openRename(e, project)}
                  title="Rename board"
                  aria-label={`Rename ${project.projectName}`}
                  className="rounded-md p-1.5 text-muted-foreground opacity-0 transition hover:bg-blue-50 hover:text-blue-600 focus:opacity-100 group-hover:opacity-100"
                >
                  <Pencil className="h-4 w-4" />
                </button>

                <button
                  onClick={(e) => handleArchiveProject(e, project)}
                  disabled={busyId === project.projectId}
                  title="Move to archive"
                  aria-label={`Archive ${project.projectName}`}
                  className="rounded-md p-1.5 text-muted-foreground opacity-0 transition hover:bg-amber-50 hover:text-amber-600 focus:opacity-100 group-hover:opacity-100 disabled:opacity-50"
                >
                  {busyId === project.projectId ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Archive className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/*
        Controlled, with no DialogTrigger — it is opened by the pencil on
        whichever card was clicked, not by a button of its own.
      */}
      <Dialog
        open={renameTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRenameTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Rename board</DialogTitle>
          </DialogHeader>

          <div>
            <label className="text-gray-500">Board name</label>
            <Input
              autoFocus
              value={renameValue}
              placeholder="Board name"
              className="mt-2"
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename();
              }}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRenameTarget(null)}
              disabled={renaming}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRename}
              disabled={renaming || renameValue.trim().length === 0}
            >
              {renaming && <Loader2 className="animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ProjectList;