/*
  Warnings:

  - You are about to drop the column `response_time` on the `HealthCheck` table. All the data in the column will be lost.
  - You are about to drop the column `status_code` on the `HealthCheck` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "HealthStatus" AS ENUM ('HEALTHY', 'UNHEALTHY');

-- DropForeignKey
ALTER TABLE "HealthCheck" DROP CONSTRAINT "HealthCheck_environment_id_fkey";

-- AlterTable
ALTER TABLE "HealthCheck" DROP COLUMN "response_time",
DROP COLUMN "status_code",
ADD COLUMN     "message" TEXT,
ADD COLUMN     "responseTime" INTEGER,
ADD COLUMN     "statusCode" INTEGER,
ALTER COLUMN "checked_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "branch" TEXT DEFAULT 'main',
ADD COLUMN     "checkInterval" INTEGER NOT NULL DEFAULT 60,
ADD COLUMN     "expectedBody" TEXT,
ADD COLUMN     "expectedStatus" INTEGER NOT NULL DEFAULT 200,
ADD COLUMN     "healthEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "healthUrl" TEXT,
ADD COLUMN     "productionUrl" TEXT,
ADD COLUMN     "repositoryUrl" TEXT,
ADD COLUMN     "timeout" INTEGER NOT NULL DEFAULT 5000;

-- CreateIndex
CREATE INDEX "HealthCheck_environment_id_idx" ON "HealthCheck"("environment_id");

-- AddForeignKey
ALTER TABLE "HealthCheck" ADD CONSTRAINT "HealthCheck_environment_id_fkey" FOREIGN KEY ("environment_id") REFERENCES "Environment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
