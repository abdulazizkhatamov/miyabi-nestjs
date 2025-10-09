import { PrismaClient, Prisma } from '@prisma/client';
import * as argon2 from 'argon2';
import * as dotenv from 'dotenv';
import { faker } from '@faker-js/faker';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SUPER_ADMIN_EMAIL as string;
  const password = process.env.SUPER_ADMIN_PASSWORD as string;

  if (!email || !password) {
    throw new Error(
      '❌ SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD not set in .env',
    );
  }

  // Hash the password
  const hashedPassword = await argon2.hash(password);

  // Check if admin exists
  const existingAdmin = await prisma.admin.findUnique({ where: { email } });
  if (!existingAdmin) {
    await prisma.admin.create({
      data: {
        first_name: 'Super',
        last_name: 'Admin',
        email,
        password: hashedPassword,
      },
    });
    console.log(`✅ Super admin created: ${email}`);
  } else {
    console.log(`ℹ️ Admin with email ${email} already exists.`);
  }

  // --- Seed Categories ---
  const categoriesCount = 20;
  const categories = Array.from({ length: categoriesCount }).map(() => ({
    id: faker.string.uuid(),
    slug: faker.lorem.slug(),
    name: faker.commerce.department(),
    description: faker.commerce.productDescription(),
    status: true,
    created_at: new Date(),
    updated_at: new Date(),
  }));

  await prisma.category.createMany({ data: categories, skipDuplicates: true });
  console.log(`✅ ${categoriesCount} categories created.`);

  const dbCategories = await prisma.category.findMany();

  // --- Seed Products ---
  const productsCount = 100;
  const products = Array.from({ length: productsCount }).map(() => {
    const category =
      dbCategories[Math.floor(Math.random() * dbCategories.length)];
    return {
      id: faker.string.uuid(),
      slug: faker.lorem.slug(),
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      weight: faker.number.int({ min: 100, max: 2000 }),
      price: new Prisma.Decimal(
        faker.commerce.price({ min: 5, max: 500, dec: 2 }),
      ),
      status: true,
      created_at: new Date(),
      updated_at: new Date(),
      category_id: category.id,
    };
  });

  await prisma.product.createMany({ data: products, skipDuplicates: true });
  console.log(`✅ ${productsCount} products created.`);

  // --- Index products in Meilisearch ---
  await prisma.product.findMany({
    include: { category: true },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
