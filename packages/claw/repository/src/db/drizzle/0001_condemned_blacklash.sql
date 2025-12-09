ALTER TABLE "llm_byok" DROP CONSTRAINT "llm_byok_model_id_llm_model_id_fk";
--> statement-breakpoint
ALTER TABLE "llm_byok" DROP COLUMN "model_id";