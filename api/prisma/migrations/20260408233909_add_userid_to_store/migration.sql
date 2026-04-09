/*
  Warnings:

  - Added the required column `userId` to the `Store` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "userId" TEXT NOT NULL;
