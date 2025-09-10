// src/common/utils/slug.util.ts
import slugify from 'slugify';
import { PrismaClient } from '@prisma/client';

/**
 * Generate a unique slug for a given model + field.
 *
 * @param prisma - Prisma client instance
 * @param model - Prisma model name (e.g. "category", "product")
 * @param field - Field to check uniqueness against (default: "slug")
 * @param text - Source text to slugify
 */
export async function generateUniqueSlug(
  prisma: PrismaClient,
  model: keyof PrismaClient,
  text: string,
  field: string = 'slug',
): Promise<string> {
  const baseSlug = slugify(text, { lower: true, strict: true });
  let slug = baseSlug;
  let counter = 1;

  // dynamic query for uniqueness check
  const modelDelegate = prisma[model] as {
    findUnique: (args: any) => Promise<any>;
  };
  while (await modelDelegate.findUnique({ where: { [field]: slug } })) {
    slug = `${baseSlug}-${counter++}`;
  }

  return slug;
}
