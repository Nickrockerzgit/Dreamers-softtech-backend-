-- CreateTable
CREATE TABLE `Testimonial` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `company` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL,
    `avatar` VARCHAR(191) NULL,
    `color` VARCHAR(191) NOT NULL,
    `avatarImage` VARCHAR(191) NULL,
    `rating` INTEGER NOT NULL DEFAULT 5,
    `text` TEXT NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'published',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
