/*
  Warnings:

  - You are about to drop the column `created_at` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `logo_url` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `owner_id` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `OrganizationMember` table. All the data in the column will be lost.
  - You are about to drop the column `invited_by` on the `OrganizationMember` table. All the data in the column will be lost.
  - You are about to drop the column `joined_at` on the `OrganizationMember` table. All the data in the column will be lost.
  - You are about to drop the column `organization_id` on the `OrganizationMember` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `OrganizationMember` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `OrganizationMember` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `OrganizationMember` table. All the data in the column will be lost.
  - The `role` column on the `OrganizationMember` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[userId,organizationId]` on the table `OrganizationMember` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Organization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `OrganizationMember` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `OrganizationMember` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OrganizationRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- DropForeignKey
ALTER TABLE "Organization" DROP CONSTRAINT "Organization_owner_id_fkey";

-- DropForeignKey
ALTER TABLE "OrganizationMember" DROP CONSTRAINT "OrganizationMember_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "OrganizationMember" DROP CONSTRAINT "OrganizationMember_user_id_fkey";

-- DropIndex
DROP INDEX "Organization_owner_id_idx";

-- DropIndex
DROP INDEX "OrganizationMember_organization_id_user_id_key";

-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "created_at",
DROP COLUMN "deleted_at",
DROP COLUMN "logo_url",
DROP COLUMN "owner_id",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "OrganizationMember" DROP COLUMN "created_at",
DROP COLUMN "invited_by",
DROP COLUMN "joined_at",
DROP COLUMN "organization_id",
DROP COLUMN "status",
DROP COLUMN "updated_at",
DROP COLUMN "user_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "organizationId" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" "OrganizationRole" NOT NULL DEFAULT 'MEMBER';

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMember_userId_organizationId_key" ON "OrganizationMember"("userId", "organizationId");

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
