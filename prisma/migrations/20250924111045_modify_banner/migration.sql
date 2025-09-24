/*
  Warnings:

  - You are about to drop the column `path` on the `Banner` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Banner" DROP COLUMN "path";

-- AlterTable
ALTER TABLE "public"."Image" ADD COLUMN     "banner_id" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Image" ADD CONSTRAINT "Image_banner_id_fkey" FOREIGN KEY ("banner_id") REFERENCES "public"."Banner"("id") ON DELETE SET NULL ON UPDATE CASCADE;
