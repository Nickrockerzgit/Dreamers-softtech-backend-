-- AlterTable
ALTER TABLE `admin` ADD COLUMN `otpCode` VARCHAR(191) NULL,
    ADD COLUMN `otpExpiresAt` DATETIME(3) NULL,
    ADD COLUMN `twoFactorEnabled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `twoFactorSecret` VARCHAR(191) NULL;
