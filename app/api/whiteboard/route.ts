import { db, projects, WhiteboardData } from "@/db";
import { currentUser } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { projectId, elements, files, appState, previewImage } =
    await req.json();
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? "";

  if (!email) {
    // 401 so axios rejects on the client instead of silently "succeeding"
    return NextResponse.json({ error: "Unauthorized User" }, { status: 401 });
  }

  if (!projectId) {
    return NextResponse.json(
      { error: "Project information missing!" },
      { status: 400 },
    );
  }

  // Being signed in is not enough — projectId comes straight from the request
  // body, so without this any account could overwrite anyone else's canvas
  // just by guessing an id.
  const owned = await db
    .select()
    .from(projects)
    .where(
      and(eq(projects.projectId, projectId), eq(projects.userEmail, email)),
    );

  const project = owned[0];

  if (!project) {
    return NextResponse.json({ error: "Unauthorized User" }, { status: 403 });
  }

  // An archived board cannot be opened, so a save aimed at one can only come
  // from a stale tab. Refuse it rather than resurrecting old content.
  if (project.isDeleted) {
    return NextResponse.json(
      { error: "This board is archived", archived: true },
      { status: 410 },
    );
  }

  try {
    const result = await db
      .insert(WhiteboardData)
      .values({
        projectId: projectId,
        elements: elements,
        appState: appState,
        files: files,
        previewImage: previewImage ?? null,
      })
      .onConflictDoUpdate({
        target: WhiteboardData.projectId,
        set: {
          elements: elements,
          appState: appState,
          files: files,
          // Only overwrite the thumbnail when we actually generated one.
          // Otherwise an autosave on an empty canvas wipes a good preview.
          ...(previewImage ? { previewImage } : {}),
          updatedAt: new Date(),
        },
      })
      .returning({ projectId: WhiteboardData.projectId });

    return NextResponse.json(result[0]);
  } catch (e) {
    console.error("Whiteboard save failed:", e);
    return NextResponse.json(
      { error: "Internal Server Error!" },
      { status: 500 },
    );
  }
}
