"use client";

import { Archive, ArchiveRestore, Folder, Loader2, SearchX, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { toast } from "@/components/ui/toast";
import { notifyBoardsChanged, type Project } from "./types";
import { matchesQuery, useBoardSearch } from "@/context/BoardSearchContext";

const archivedLabel = (archivedAt: string | null) => {
  if (!archivedAt) return "Archived";

  const date = new Date(archivedAt);
  if (isNaN(date.getTime())) return "Archived";

  return "Archived " + formatDistanceToNow(date, { addSuffix: true });
};

function ArchivedList() {
  const [projectList, setProjectList] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  // The header search box is shared with the dashboard, so it has to filter
  // here too — otherwise it looks broken on this page.
  const { query, setQuery } = useBoardSearch();

  const visibleProjects = projectList.filter((project) =>
    matchesQuery(project.projectName, query),
  );

  useEffect(() => {
    GetArchivedList();
  }, []);

  const GetArchivedList = async () => {
    try {
      const result = await axios.get("/api/projects?status=archived");
      setProjectList(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      console.error("Failed to load archived projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (project: Project) => {
    setBusyId(project.projectId);

    try {
      await axios.patch("/api/projects", {
        projectId: project.projectId,
        action: "restore",
      });

      setProjectList((prev) =>
        prev.filter((p) => p.projectId !== project.projectId),
      );
      notifyBoardsChanged();

      toast.add({
        type: "success",
        title: "Board restored",
        description: `"${project.projectName}" is back on your dashboard.`,
      });
    } catch (error) {
      console.error("Restore failed:", error);
      toast.add({ type: "error", title: "Could not restore board" });
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteForever = async (project: Project) => {
    // This one really is gone — the canvas rows get dropped too.
    if (
      !confirm(
        `Permanently delete "${project.projectName}"?\n\nThis cannot be undone.`,
      )
    ) {
      return;
    }

    setBusyId(project.projectId);

    try {
      await axios.delete("/api/projects", {
        data: { projectId: project.projectId, permanent: true },
      });

      setProjectList((prev) =>
        prev.filter((p) => p.projectId !== project.projectId),
      );
      notifyBoardsChanged();

      toast.add({ type: "success", title: "Board deleted permanently" });
    } catch (error) {
      console.error("Permanent delete failed:", error);
      toast.add({ type: "error", title: "Could not delete board" });
    } finally {
      setBusyId(null);
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
      <div>
        <div>
          <h2 className="text-2xl font-bold">Archived</h2>
          <p className="mt-1 text-sm text-gray-400">
            Boards you have archived. Restore them any time.
          </p>
        </div>

        <div className="mt-5 flex flex-col items-center gap-3 rounded-xl border p-10">
          <Archive className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-2xl font-bold">Archive is empty</h2>
          <p className="text-muted-foreground">
            Archived boards will show up here instead of disappearing.
          </p>
          <Link
            href="/dashboard"
            className="mt-2 rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
          >
            Back to your boards
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div>
        <h2 className="text-2xl font-bold">Archived</h2>
        <p className="mt-1 text-sm text-gray-400">
          {query.trim()
            ? `${visibleProjects.length} of ${projectList.length} archived ${
                projectList.length === 1 ? "board" : "boards"
              } match "${query.trim()}"`
            : `${projectList.length} archived ${
                projectList.length === 1 ? "board" : "boards"
              }. Restore one to keep working on it.`}
        </p>
      </div>

      {visibleProjects.length === 0 && (
        <div className="mt-5 flex flex-col items-center gap-3 rounded-xl border p-10">
          <SearchX className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-2xl font-bold">No matching boards</h2>
          <p className="text-muted-foreground">
            Nothing in the archive is called &quot;{query.trim()}&quot;.
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
        {visibleProjects.map((project) => {
          const busy = busyId === project.projectId;

          return (
            /*
              Not a <Link>: an archived board cannot be opened, and the API
              returns 410 for it anyway. Restore first.
            */
            <div
              key={project.projectId}
              className="group overflow-hidden rounded-xl border bg-muted/30"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-50 p-2">
                {project.previewImage ? (
                  <Image
                    src={project.previewImage}
                    alt={project.projectName}
                    fill
                    // greyed out to read as inactive
                    className="object-contain opacity-50 grayscale transition group-hover:opacity-80 group-hover:grayscale-0"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Folder className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="border-t p-4">
                <h2 className="truncate font-medium text-muted-foreground">
                  {project.projectName}
                </h2>
                <p className="mt-0.5 text-xs text-gray-400">
                  {archivedLabel(project.archivedAt)}
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => handleRestore(project)}
                    disabled={busy}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-md border bg-background px-2 py-1.5 text-xs font-medium transition hover:bg-muted disabled:opacity-50"
                  >
                    {busy ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <ArchiveRestore className="h-3.5 w-3.5" />
                    )}
                    Restore
                  </button>

                  <button
                    onClick={() => handleDeleteForever(project)}
                    disabled={busy}
                    title="Delete permanently"
                    className="shrink-0 rounded-md border p-1.5 text-muted-foreground transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ArchivedList;