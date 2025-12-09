DROP INDEX "chat_message_chat_id_idx";--> statement-breakpoint
DROP INDEX "chat_message_parent_id_idx";--> statement-breakpoint
ALTER TABLE "chat_message" DROP COLUMN "parent_message_id";--> statement-breakpoint
ALTER TABLE "chat_message" DROP COLUMN "version_index";