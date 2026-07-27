-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "monitoringEnabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "auth_providers" ADD COLUMN     "accessToken" TEXT;
