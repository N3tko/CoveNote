ALTER TABLE "chat_message" ADD COLUMN "parent_message_id" uuid;--> statement-breakpoint
ALTER TABLE "chat_message" ADD COLUMN "version_index" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX "chat_message_chat_id_idx" ON "chat_message" USING btree ("chat_id");--> statement-breakpoint
CREATE INDEX "chat_message_parent_id_idx" ON "chat_message" USING btree ("parent_message_id");