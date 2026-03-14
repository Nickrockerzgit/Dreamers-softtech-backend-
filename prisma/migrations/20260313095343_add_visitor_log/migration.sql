-- AlterTable
ALTER TABLE `blog` ADD COLUMN `tags` TEXT NULL;

-- CreateTable
CREATE TABLE `VisitorLog` (
    `id` VARCHAR(191) NOT NULL,
    `month` VARCHAR(191) NOT NULL,
    `year` INTEGER NOT NULL,
    `count` INTEGER NOT NULL DEFAULT 0,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `VisitorLog_month_year_key`(`month`, `year`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
