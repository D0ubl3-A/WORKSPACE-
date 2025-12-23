import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function parseColors(colors: string | null) {
  if (!colors) return [];
  try {
    const parsed = JSON.parse(colors);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function GET() {
  const [categoryRows, productRows] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({ orderBy: { id: "asc" }, include: { category: true } }),
  ]);

  const products = productRows.map((product) => ({
    id: product.slug,
    name: product.name,
    description: product.description,
    price: product.priceCents / 100,
    category: product.category.name,
    badge: product.badge ?? undefined,
    rating: product.rating,
    reviews: product.reviews,
    colors: parseColors(product.colors),
    inventory: product.inventory,
    accent: product.accent,
  }));

  const categories = categoryRows.map((category) => category.name);
  const featured = products.slice(0, 3);

  return NextResponse.json({ products, categories, featured });
}
