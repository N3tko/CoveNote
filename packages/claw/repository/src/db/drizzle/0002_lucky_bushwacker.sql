DROP TABLE "llm_byok" CASCADE;--> statement-breakpoint
ALTER TABLE "llm_model" ALTER COLUMN "provider" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."provider";--> statement-breakpoint
CREATE TYPE "public"."provider" AS ENUM('openai', 'anthropic', 'google');--> statement-breakpoint
ALTER TABLE "llm_model" ALTER COLUMN "provider" SET DATA TYPE "public"."provider" USING "provider"::"public"."provider";