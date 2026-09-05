import { boolean, integer, jsonb, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  credits: integer('credits').default(3),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projects = pgTable('projects', {
  id: serial("id").primaryKey(),
  projectId: varchar('projectId').notNull().unique(),
  projectName: varchar('projectName').notNull(),
  userEmail: varchar('userEmail').notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  // Soft delete. The row stays put so the board can be restored; every query
  // that lists "live" boards must filter on this.
  isDeleted: boolean('isDeleted').default(false).notNull(),
  // When it was archived — powers "Archived 3 days ago" and lets you add an
  // auto-purge job later ("delete anything archived over 30 days ago").
  archivedAt: timestamp('archivedAt'),
});

export const WhiteboardData = pgTable('whiteboardData', {
  id: serial("id").primaryKey(),
  projectId: varchar('projectid').notNull().unique().references(() => projects.projectId),
  elements: jsonb('elements'),
  appState: jsonb('appState'),
  files: jsonb('files'),
  // data:image/webp;base64,... thumbnail of the canvas, shown on the dashboard.
  // Nullable: a board with nothing drawn on it has no preview.
  previewImage: text('previewImage'),
  // NOTE: the DB column is literally named "created_at" even though this field
  // holds an updated-at value. Left as-is so drizzle-kit push doesn't try to
  // rename a column on your existing Neon database.
  updatedAt: timestamp("created_at").defaultNow().notNull(),
})

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content"),
  authorId: serial("author_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});


export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;