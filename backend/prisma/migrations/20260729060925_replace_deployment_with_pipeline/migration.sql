/*
  Warnings:

  - You are about to drop the `Deployment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DeploymentLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Metric` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Repository` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Deployment" DROP CONSTRAINT "Deployment_environment_id_fkey";

-- DropForeignKey
ALTER TABLE "Deployment" DROP CONSTRAINT "Deployment_triggered_by_fkey";

-- DropForeignKey
ALTER TABLE "DeploymentLog" DROP CONSTRAINT "DeploymentLog_deployment_id_fkey";

-- DropForeignKey
ALTER TABLE "Metric" DROP CONSTRAINT "Metric_deployment_id_fkey";

-- DropForeignKey
ALTER TABLE "Repository" DROP CONSTRAINT "Repository_project_id_fkey";

-- DropTable
DROP TABLE "Deployment";

-- DropTable
DROP TABLE "DeploymentLog";

-- DropTable
DROP TABLE "Metric";

-- DropTable
DROP TABLE "Repository";

-- DropEnum
DROP TYPE "DeploymentStatus";

-- CreateTable
CREATE TABLE "PipelineRunLog" (
    "id" TEXT NOT NULL,
    "pipeline_run_id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "log_level" "LogLevel" NOT NULL,
    "message" TEXT NOT NULL,

    CONSTRAINT "PipelineRunLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PipelineRunLog_pipeline_run_id_idx" ON "PipelineRunLog"("pipeline_run_id");

-- AddForeignKey
ALTER TABLE "PipelineRunLog" ADD CONSTRAINT "PipelineRunLog_pipeline_run_id_fkey" FOREIGN KEY ("pipeline_run_id") REFERENCES "PipelineRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
