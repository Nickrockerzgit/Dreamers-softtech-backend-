/*
  Warnings:

  - You are about to drop the column `adminId` on the `session` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `session` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sid]` on the table `Session` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `data` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sid` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
CREATE TABLE IF NOT EXISTS `Session` (
  `id` VARCHAR(191) NOT NULL,
  `sid` VARCHAR(191) NOT NULL,
  `data` TEXT NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `Session_sid_key`(`sid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
