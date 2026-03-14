-- AlterTable
ALTER TABLE `admin` ADD COLUMN `emailVerified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `name` VARCHAR(191) NULL,
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'pending';
