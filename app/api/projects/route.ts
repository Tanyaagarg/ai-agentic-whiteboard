import { db, projects, WhiteboardData } from "@/db";
import { currentUser } from "@clerk/nextjs/server";
import { and, desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

/** Every route needs the signed-in user's email; this centralises that. */
async function getUserEmail() {
  const user = await currentUser();
  return user?.primaryEmailAddress?.emailAddress ?? "";
}

/**
 * A board is only touchable by the account that owns it. Returns the project
 * row, or null when it does not exist / belongs to someone else. Deliberately
 * does NOT filter on isDeleted — restore and purge act on archived boards.
 */
async function findOwnedProject(projectId: string, email: string) {
  const rows = await db
    .select()
    .from(projects)
    .where(
      and(eq(projects.projectId, projectId), eq(projects.userEmail, email)),
    );

  return rows[0] ?? null;
}

export async function POST(req: NextRequest) {
  const { projectName, projectId } = await req.json();
  const email = await getUserEmail();

  if (!email) {
    return NextResponse.json({ error: "Unauthorized User" }, { status: 401 });
  }

  if (!projectId || !projectName) {
    return NextResponse.json(
      { error: "Project Information missing" },
      { status: 400 },
    );
  }

  const result = await db
    .insert(projects)
    .values({ projectId, projectName, userEmail: email })
    .returning();

  return NextResponse.json(result[0]);
}

/**
 * GET /api/projects                  -> live boards (dashboard grid)
 * GET /api/projects?status=archived  -> archived boards (archive page)
 * GET /api/projects?projectId=abc123 -> one board's canvas data
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const projectId = searchParams.get("projectId");
  const status = searchParams.get("status");

  const email = await getUserEmail();

  if (!email) {
    return NextResponse.json({ error: "Unauthorized User" }, { status: 401 });
  }

  if (!projectId) {
    const archived = status === "archived";

    // Explicit select() because we need columns from BOTH tables; a bare
    // db.select().from(projects) could never include previewImage.
    // leftJoin because a project created 10 seconds ago has no whiteboardData
    // row yet and must still appear in the list.
    const projectList = await db
      .select({
        id: projects.id,
        projectId: projects.projectId,
        projectName: projects.projectName,
        userEmail: projects.userEmail,
        createdAt: projects.createdAt,
        archivedAt: projects.archivedAt,
        previewImage: WhiteboardData.previewImage,
        updatedAt: WhiteboardData.updatedAt,
      })
      .from(projects)
      .leftJoin(
        WhiteboardData,
        eq(projects.projectId, WhiteboardData.projectId),
      )
      .where(
        and(
          eq(projects.userEmail, email),
          eq(projects.isDeleted, archived),
        ),
      )
      // archive sorts by when it was binned, dashboard by when it was made
      .orderBy(archived ? desc(projects.archivedAt) : desc(projects.createdAt));

    return NextResponse.json(projectList);
  }

  const project = await findOwnedProject(projectId, email);

  if (!project) {
    return NextResponse.json({ error: "Unauthorized User" }, { status: 403 });
  }

  // An archived board must not be editable — restore it first.
  if (project.isDeleted) {
    return NextResponse.json(
      { error: "This board is archived", archived: true },
      { status: 410 },
    );
  }

  const result = await db
    .select()
    .from(WhiteboardData)
    .where(eq(WhiteboardData.projectId, projectId));

  // a project with nothing drawn yet has no row, which is not an error
  return NextResponse.json({
    ...(result[0] ?? { elements: [], appState: {}, files: {} }),
    projectName: project.projectName,
  });
}

/**
 * DELETE /api/projects
 * body: { projectId, permanent?: boolean }
 *
 * Default is a SOFT delete — flip isDeleted and stamp archivedAt, so the board
 * shows up on the archive page and can be brought back. Pass permanent: true
 * (only offered from the archive page) to actually destroy it.
 */
export async function DELETE(req: NextRequest) {
  const { projectId, permanent } = await req.json();
  const email = await getUserEmail();

  if (!email) {
    return NextResponse.json({ error: "Unauthorized User" }, { status: 401 });
  }

  if (!projectId) {
    return NextResponse.json({ error: "No projectId Found" }, { status: 400 });
  }

  const project = await findOwnedProject(projectId, email);

  if (!project) {
    return NextResponse.json({ error: "Unauthorized User" }, { status: 403 });
  }

  try {
    if (permanent) {
      // ORDER MATTERS. whiteboardData.projectId has a foreign key onto
      // projects.projectId, so deleting the parent first fails with
      // violates_foreign_key_constraint. Child row goes first.
      await db
        .delete(WhiteboardData)
        .where(eq(WhiteboardData.projectId, projectId));

      await db.delete(projects).where(eq(projects.projectId, projectId));

      return NextResponse.json({ projectId, permanent: true });
    }

    await db
      .update(projects)
      .set({ isDeleted: true, archivedAt: new Date() })
      .where(eq(projects.projectId, projectId));

    return NextResponse.json({ projectId, archived: true });
  } catch (e) {
    console.error("Project delete failed:", e);
    return NextResponse.json(
      { error: "Internal Server Error!" },
      { status: 500 },
    );
  }
}

/** Same rule the create dialog enforces, applied server-side too. */
const MAX_NAME_LENGTH = 30;

/**
 * PATCH /api/projects
 * body: { projectId, action: "restore" }
 *       { projectId, action: "rename", projectName }
 *
 * "restore" pulls a board back out of the archive; "rename" changes its name.
 */
export async function PATCH(req: NextRequest) {
  const { projectId, action, projectName } = await req.json();
  const email = await getUserEmail();

  if (!email) {
    return NextResponse.json({ error: "Unauthorized User" }, { status: 401 });
  }

  if (!projectId || (action !== "restore" && action !== "rename")) {
    console.warn("PATCH rejected — bad action:", { projectId, action });
    return NextResponse.json(
      { error: `Unsupported action: ${JSON.stringify(action)}` },
      { status: 400 },
    );
  }

  const project = await findOwnedProject(projectId, email);

  if (!project) {
    return NextResponse.json({ error: "Unauthorized User" }, { status: 403 });
  }

  if (action === "rename") {
    // The client trims before sending, but it is the client — a name is only
    // valid if the server says so.
    const name = typeof projectName === "string" ? projectName.trim() : "";

    if (!name || name.length > MAX_NAME_LENGTH) {
      console.warn("PATCH rejected — bad name:", {
        projectName,
        length: name.length,
      });
      return NextResponse.json(
        { error: `Name must be 1-${MAX_NAME_LENGTH} characters` },
        { status: 400 },
      );
    }

    await db
      .update(projects)
      .set({ projectName: name })
      .where(eq(projects.projectId, projectId));

    return NextResponse.json({ projectId, projectName: name });
  }

  await db
    .update(projects)
    .set({ isDeleted: false, archivedAt: null })
    .where(eq(projects.projectId, projectId));

  return NextResponse.json({ projectId, restored: true });
}