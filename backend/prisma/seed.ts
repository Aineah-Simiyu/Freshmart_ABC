import { config } from 'dotenv';
import { resolve } from 'path';
import bcrypt from 'bcrypt';
import prisma from '../src/core/database/prisma';

config({ path: resolve(__dirname, '../.env') });

async function seed() {
  console.log('seeding...');
  
  const password = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@freshmart.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@freshmart.com',
      password,
    },
  });
  
  console.log('admin:', admin.email);
  
  const products: [string, string, number, number] [] = [
    ['Apple', 'Fruits', 25, 100],
    ['Banana', 'Fruits', 15, 150],
    ['Orange', 'Fruits', 30, 80],
    ['Tomato', 'Vegetables', 18, 120],
    ['Potato', 'Vegetables', 10, 200],
  ];
  
  for (const [name, category, price, quantity] of products) {
    await prisma.product.create({
      data: { name, category, price, quantity },
    });
  }
  
  const items = await prisma.product.findMany();
  
  const sales = [
    { p: 0, q: 5, u: 25 },
    { p: 1, q: 10, u: 15 },
    { p: 3, q: 3, u: 18 },
  ];
  
  for (const s of sales) {
    const product = items[s.p];
    
    await prisma.sale.create({
      data: {
        productId: product.id,
        quantity: s.q,
        unitPrice: s.u,
        totalAmount: s.q * s.u,
      },
    });
    
    await prisma.product.update({
      where: { id: product.id },
      data: { quantity: { decrement: s.q } },
    });
  }
  
  console.log('done');
}

seed()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());