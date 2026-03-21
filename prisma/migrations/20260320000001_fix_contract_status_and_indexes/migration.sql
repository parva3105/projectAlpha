-- AlterEnum: rename PENDING -> NOT_SENT in ContractStatus
BEGIN;
CREATE TYPE "ContractStatus_new" AS ENUM ('NOT_SENT', 'SENT', 'SIGNED');
ALTER TABLE "Deal" ALTER COLUMN "contractStatus" DROP DEFAULT;
ALTER TABLE "Deal" ALTER COLUMN "contractStatus" TYPE "ContractStatus_new" USING ("contractStatus"::text::"ContractStatus_new");
ALTER TYPE "ContractStatus" RENAME TO "ContractStatus_old";
ALTER TYPE "ContractStatus_new" RENAME TO "ContractStatus";
DROP TYPE "ContractStatus_old";
ALTER TABLE "Deal" ALTER COLUMN "contractStatus" SET DEFAULT 'NOT_SENT';
COMMIT;

-- DropIndex (old trgm indexes from prior session)
DROP INDEX IF EXISTS "creator_handle_trgm_idx";
DROP INDEX IF EXISTS "creator_name_trgm_idx";
DROP INDEX IF EXISTS "creator_niche_tags_gin_idx";
DROP INDEX IF EXISTS "creator_platforms_gin_idx";

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Brief_agencyClerkId_status_idx" ON "Brief"("agencyClerkId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ContentSubmission_dealId_idx" ON "ContentSubmission"("dealId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Creator_isPublic_idx" ON "Creator"("isPublic");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Creator_nicheTags_idx" ON "Creator"("nicheTags");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Deal_agencyClerkId_stage_idx" ON "Deal"("agencyClerkId", "stage");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Deal_creatorId_idx" ON "Deal"("creatorId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Deal_deadline_idx" ON "Deal"("deadline");

-- CreateUniqueIndex
CREATE UNIQUE INDEX IF NOT EXISTS "PartnershipRequest_agencyClerkId_creatorId_key" ON "PartnershipRequest"("agencyClerkId", "creatorId");
