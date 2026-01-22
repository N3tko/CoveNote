CREATE TABLE "message" (
	"id" uuid PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp NOT NULL
);
