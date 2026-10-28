import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

const BASE_URL = "http://localhost:3000";

let JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  try {
    const envContent = fs.readFileSync(path.resolve(process.cwd(), ".env.local"), "utf8");
    const match = envContent.match(/JWT_SECRET\s*=\s*(.*)/);
    if (match) JWT_SECRET = match[1].trim();
  } catch {}
}

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is required to run tests");
}

async function runTests() {
  console.log("=== Testing Dynamic Category System ===");

  // Create admin token for tests
  const adminToken = jwt.sign(
    { userId: "650000000000000000000001", role: "admin", email: "admin@luxuryessentials.com" },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  // 1. Test public GET /api/categories (triggers auto-seeding if empty)
  console.log("\n[Test 1] Public GET /api/categories");
  const res1 = await fetch(`${BASE_URL}/api/categories`);
  const data1 = await res1.json();
  if (!data1.success || !Array.isArray(data1.data) || data1.data.length === 0) {
    throw new Error(`Public GET failed: ${JSON.stringify(data1)}`);
  }
  console.log(`✓ Public categories loaded successfully (${data1.data.length} categories found)`);
  console.log(`  Categories: ${data1.data.map((c) => c.name).join(", ")}`);

  // 2. Test Admin GET /api/categories?all=true
  console.log("\n[Test 2] Admin GET /api/categories?all=true");
  const res2 = await fetch(`${BASE_URL}/api/categories?all=true`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const data2 = await res2.json();
  if (!data2.success || !Array.isArray(data2.data)) {
    throw new Error(`Admin GET failed: ${JSON.stringify(data2)}`);
  }
  console.log(`✓ Admin categories loaded with product counts (${data2.data.length} categories)`);

  // 3. Test creating a new category
  console.log("\n[Test 3] Admin POST /api/categories (Creating 'Crystal Geodes')");
  const testCatName = `Test Crystal Geodes ${Date.now()}`;
  const res3 = await fetch(`${BASE_URL}/api/categories`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${adminToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: testCatName,
      description: "Handcrafted crystal geodes and mineral art",
      order: 99,
      isActive: true,
    }),
  });
  const data3 = await res3.json();
  if (!data3.success || !data3.data?._id) {
    throw new Error(`Create category failed: ${JSON.stringify(data3)}`);
  }
  const createdCat = data3.data;
  console.log(`✓ Category created: "${createdCat.name}" (slug: ${createdCat.slug}, order: ${createdCat.order})`);

  // 4. Verify new category appears in public GET /api/categories
  console.log("\n[Test 4] Verify new category appears in storefront tabs");
  const res4 = await fetch(`${BASE_URL}/api/categories`);
  const data4 = await res4.json();
  const existsInPublic = data4.data?.some((c) => c.slug === createdCat.slug);
  if (!existsInPublic) {
    throw new Error(`Newly created category "${createdCat.slug}" not found in public categories list!`);
  }
  console.log(`✓ Confirmed: Newly created category is immediately visible to customers`);

  // 5. Test updating category to inactive
  console.log("\n[Test 5] Admin PUT /api/categories/[id] (Deactivating category)");
  const res5 = await fetch(`${BASE_URL}/api/categories/${createdCat._id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${adminToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      isActive: false,
    }),
  });
  const data5 = await res5.json();
  if (!data5.success || data5.data.isActive !== false) {
    throw new Error(`Update category failed: ${JSON.stringify(data5)}`);
  }
  console.log(`✓ Category successfully deactivated`);

  // 6. Verify inactive category is hidden from storefront
  console.log("\n[Test 6] Verify inactive category is hidden from storefront tabs");
  const res6 = await fetch(`${BASE_URL}/api/categories`);
  const data6 = await res6.json();
  const existsAfterDeactivate = data6.data?.some((c) => c.slug === createdCat.slug);
  if (existsAfterDeactivate) {
    throw new Error(`Deactivated category "${createdCat.slug}" is still visible on storefront!`);
  }
  console.log(`✓ Confirmed: Inactive category is automatically hidden from customer storefront`);

  // 7. Test deleting the category
  console.log("\n[Test 7] Admin DELETE /api/categories/[id]");
  const res7 = await fetch(`${BASE_URL}/api/categories/${createdCat._id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });
  const data7 = await res7.json();
  if (!data7.success) {
    throw new Error(`Delete category failed: ${JSON.stringify(data7)}`);
  }
  console.log(`✓ Category successfully deleted: ${data7.data?.message}`);

  // 8. Test deletion safety check (cannot delete category with products)
  console.log("\n[Test 8] Test deletion protection on category with products");
  const resinCat = data2.data?.find((c) => (c.productCount || 0) > 0);
  if (resinCat) {
    const res8 = await fetch(`${BASE_URL}/api/categories/${resinCat._id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data8 = await res8.json();
    if (res8.status === 400 && !data8.success) {
      console.log(`✓ Confirmed: Deletion blocked as expected for category with products: "${data8.error}"`);
    } else {
      throw new Error(`Expected deletion block for category with products, but got: ${JSON.stringify(data8)}`);
    }
  } else {
    console.log("  (Skipping category with products test: no category with products found)");
  }

  console.log("\n=== ALL CATEGORY TESTS PASSED! ===");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
