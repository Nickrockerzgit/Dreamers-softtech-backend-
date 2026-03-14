-- CreateTable
CREATE TABLE `Proposal` (
    `id` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `company` VARCHAR(191) NULL,
    `projectType` VARCHAR(191) NOT NULL,
    `budgetRange` VARCHAR(191) NOT NULL,
    `timeline` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `source` VARCHAR(191) NOT NULL DEFAULT 'client',
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `magicToken` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `sentAt` DATETIME(3) NULL,
    `confirmedAt` DATETIME(3) NULL,

    UNIQUE INDEX `Proposal_magicToken_key`(`magicToken`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
