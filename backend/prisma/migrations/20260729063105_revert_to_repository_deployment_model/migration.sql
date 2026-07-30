/*
  Warnings:

  - You are about to drop the column `githubRepoFullName` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `githubWebhookSecret` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the `Pipeline` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PipelineRun` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PipelineRunLog` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "DeploymentStatus" AS ENUM ('QUEUED', 'RUNNING', 'SUCCESS', 'FAILED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "Pipeline" DROP CONSTRAINT "Pipeline_projectId_fkey";

-- DropForeignKey
ALTER TABLE "PipelineRun" DROP CONSTRAINT "PipelineRun_pipelineId_fkey";

-- DropForeignKey
ALTER TABLE "PipelineRunLog" DROP CONSTRAINT "PipelineRunLog_pipeline_run_id_fkey";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "githubRepoFullName",
DROP COLUMN "githubWebhookSecret";

-- DropTable
DROP TABLE "Pipeline";

-- DropTable
DROP TABLE "PipelineRun";

-- DropTable
DROP TABLE "PipelineRunLog";

-- CreateTable
CREATE TABLE "Deployment" (
    "id" TEXT NOT NULL,
    "environment_id" TEXT NOT NULL,
    "triggered_by" TEXT NOT NULL,
    "commit_sha" TEXT NOT NULL,
    "commit_message" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "status" "DeploymentStatus" NOT NULL,
    "duration" INTEGER,
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dispatchedAt" TIMESTAMP(3),
    "githubRunId" TEXT,
    "workflowFile" TEXT,

    CONSTRAINT "Deployment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeploymentLog" (
    "id" TEXT NOT NULL,
    "deployment_id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "log_level" "LogLevel" NOT NULL,
    "message" TEXT NOT NULL,

    CONSTRAINT "DeploymentLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Metric" (
    "id" TEXT NOT NULL,
    "deployment_id" TEXT NOT NULL,
    "metric_type" "MetricType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "recorded_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Metric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Repository" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "github_repository_id" TEXT NOT NULL,
    "github_owner" TEXT NOT NULL,
    "repository_name" TEXT NOT NULL,
    "clone_url" TEXT NOT NULL,
    "html_url" TEXT,
    "default_branch" TEXT NOT NULL,
    "visibility" "Visibility" NOT NULL,
    "webhook_secret" TEXT NOT NULL,
    "is_connected" BOOLEAN NOT NULL DEFAULT true,
    "last_sync" TIMESTAMP(3),
    "latest_commit_sha" TEXT,
    "latest_commit_message" TEXT,
    "latest_commit_author" TEXT,
    "latest_commit_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "workflowFile" TEXT DEFAULT 'deploy.yml',

    CONSTRAINT "Repository_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Deployment_githubRunId_key" ON "Deployment"("githubRunId");

-- CreateIndex
CREATE INDEX "Deployment_environment_id_idx" ON "Deployment"("environment_id");

-- CreateIndex
CREATE INDEX "Deployment_status_idx" ON "Deployment"("status");

-- CreateIndex
CREATE INDEX "Deployment_branch_idx" ON "Deployment"("branch");

-- CreateIndex
CREATE INDEX "Deployment_commit_sha_idx" ON "Deployment"("commit_sha");

-- CreateIndex
CREATE UNIQUE INDEX "Repository_project_id_key" ON "Repository"("project_id");

-- AddForeignKey
ALTER TABLE "Deployment" ADD CONSTRAINT "Deployment_environment_id_fkey" FOREIGN KEY ("environment_id") REFERENCES "Environment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deployment" ADD CONSTRAINT "Deployment_triggered_by_fkey" FOREIGN KEY ("triggered_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeploymentLog" ADD CONSTRAINT "DeploymentLog_deployment_id_fkey" FOREIGN KEY ("deployment_id") REFERENCES "Deployment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Metric" ADD CONSTRAINT "Metric_deployment_id_fkey" FOREIGN KEY ("deployment_id") REFERENCES "Deployment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repository" ADD CONSTRAINT "Repository_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
