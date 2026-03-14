/*
  Warnings:

  - You are about to drop the column `adminId` on the `session` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `session` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sid]` on the table `Session` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `data` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sid` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `session` DROP FOREIGN KEY `Session_adminId_fkey`;

-- AlterTable
ALTER TABLE `session` DROP COLUMN `adminId`,
    DROP COLUMN `createdAt`,
    ADD COLUMN `data` TEXT NOT NULL,
    ADD COLUMN `sid` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `Message` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'unread',
    `receivedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SiteStats` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `projectsCompleted` INTEGER NOT NULL DEFAULT 0,
    `happyClients` INTEGER NOT NULL DEFAULT 0,
    `yearsExperience` INTEGER NOT NULL DEFAULT 1,
    `satisfactionRate` INTEGER NOT NULL DEFAULT 98,
    `teamMembersCount` INTEGER NOT NULL DEFAULT 0,
    `technologiesCount` INTEGER NOT NULL DEFAULT 0,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Session_sid_key` ON `Session`(`sid`);
