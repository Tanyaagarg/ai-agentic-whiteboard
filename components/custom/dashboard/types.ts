export type Project = {
  id: number;
  projectId: string;
  projectName: string;
  userEmail: string;
  createdAt: string;
  archivedAt: string | null;
  // leftJoin: both are null until the board has been saved at least once
  previewImage: string | null;
  updatedAt: string | null;
};
/**
 * Fired on `window` whenever a board is archived, restored or deleted, so the
 * sidebar's board count can refresh without the lists having to know it exists.
 */
export const BOARDS_CHANGED = "boards:changed";

export const notifyBoardsChanged = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(BOARDS_CHANGED));
  }
};
