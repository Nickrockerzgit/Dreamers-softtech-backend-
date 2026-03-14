-- CreateTable
CREATE TABLE `Blog` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `author` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `excerpt` TEXT NOT NULL,
    `content` LONGTEXT NOT NULL,
    `coverImage` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'draft',
    `views` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Blog_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
