import { db, users } from "@/db";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

/**
 * Called once on app load. Returns the users row for the signed-in Clerk
 * account, creating it the first time they show up.
 */
export async function POST() {
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress;

  if (!user || !email) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  // eq(column, value) — the arguments used to be the other way round, which is
  // what the @ts-ignore here was hiding. A plain string is not a column, so
  // the lookup never matched and every load fell through to the insert below.
  const existing = await db.select().from(users).where(eq(users.email, email));

  if (existing.length > 0) {
    return NextResponse.json(existing[0]);
  }

  // React runs effects twice in dev, so two of these can be in flight at once.
  // users.email is unique, so the loser of that race would throw on insert —
  // onConflictDoNothing turns it into an empty result we can recover from.
  const inserted = await db
    .insert(users)
    .values({ name: user.fullName, email })
    .onConflictDoNothing()
    .returning();

  if (inserted.length > 0) {
    return NextResponse.json(inserted[0]);
  }

  const [row] = await db.select().from(users).where(eq(users.email, email));

  return NextResponse.json(row);
}
