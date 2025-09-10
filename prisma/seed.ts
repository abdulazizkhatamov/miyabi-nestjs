import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import * as dotenv from 'dotenv';

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

  // hash the password with argon2
  const hashedPassword = await argon2.hash(password);

  // check if admin already exists
  const existingAdmin = await prisma.admin.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    console.log(`ℹ️ Admin with email ${email} already exists.`);
    return;
  }

  // create new super admin
  await prisma.admin.create({
    data: {
      first_name: 'Super',
      last_name: 'Admin',
      email,
      password: hashedPassword,
    },
  });

  console.log(`✅ Super admin created: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  .finally(async () => {
    await prisma.$disconnect();
  });
