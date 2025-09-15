/*
  Warnings:

  - You are about to drop the column `image` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `Product` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."ImageType" AS ENUM ('category', 'product');

-- AlterTable
ALTER TABLE "public"."Category" DROP COLUMN "image";

-- AlterTable
ALTER TABLE "public"."Product" DROP COLUMN "image";

-- CreateTable
CREATE TABLE "public"."Image" (
    "id" TEXT NOT NULL,
    "src" TEXT NOT NULL,
    "type" "public"."ImageType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "product_id" TEXT,
    "category_id" TEXT,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Image" ADD CONSTRAINT "Image_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Image" ADD CONSTRAINT "Image_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
