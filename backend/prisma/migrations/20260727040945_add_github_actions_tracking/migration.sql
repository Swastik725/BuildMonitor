/*
  Warnings:

  - A unique constraint covering the columns `[githubRunId]` on the table `Deployment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Deployment" ADD COLUMN     "dispatchedAt" TIMESTAMP(3),
ADD COLUMN     "githubRunId" TEXT,
ADD COLUMN     "workflowFile" TEXT;

-- AlterTable
ALTER TABLE "Repository" ADD COLUMN     "html_url" TEXT,
ADD COLUMN     "latest_commit_author" TEXT,
ADD COLUMN     "latest_commit_date" TIMESTAMP(3),
ADD COLUMN     "latest_commit_message" TEXT,
ADD COLUMN     "latest_commit_sha" TEXT,
ADD COLUMN     "workflowFile" TEXT DEFAULT 'deploy.yml';

-- CreateIndex
CREATE UNIQUE INDEX "Deployment_githubRunId_key" ON "Deployment"("githubRunId");
