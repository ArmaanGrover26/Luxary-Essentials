import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("=== STARTING WISHLIST / FAVORITES AUTOMATED VERIFICATION ===\n");

  if (!MONGODB_URI || !JWT_SECRET) {
    throw new Error("Missing MONGODB_URI or JWT_SECRET in environment");
  }

  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  console.log("✓ Connected to MongoDB.");

  const usersCollection = db.collection("users");
  const productsCollection = db.collection("products");
  const wishlistCollection = db.collection("wishlists");

  // Create two distinct test users to test privacy and isolation
  const userAId = new mongoose.Types.ObjectId();
  const userBId = new mongoose.Types.ObjectId();

  const tokenA = jwt.sign(
    { userId: userAId.toString(), email: "userA@test.com", role: "user" },
    JWT_SECRET,
    { expiresIn: "1d" }
  );

  const tokenB = jwt.sign(
    { userId: userBId.toString(), email: "userB@test.com", role: "user" },
    JWT_SECRET,
    { expiresIn: "1d" }
  );

  // Create 2 test products
  const product1 = {
    name: "Wishlist Test Product 1 - " + Date.now(),
    description: "Handcrafted resin item for wishlist testing.",
    price: 799,
    mrp: 1299,
    category: "resin-art",
    images: ["https://res.cloudinary.com/demo/image/upload/sample.jpg"],
    stock: 5,
    lowStockThreshold: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const product2 = {
    name: "Wishlist Test Product 2 - " + Date.now(),
    description: "Scented candle item for wishlist testing.",
    price: 549,
    mrp: 899,
    category: "candles",
    images: ["https://res.cloudinary.com/demo/image/upload/sample.jpg"],
    stock: 0,
    lowStockThreshold: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const resProd1 = await productsCollection.insertOne(product1);
  const resProd2 = await productsCollection.insertOne(product2);

  const prod1Id = resProd1.insertedId.toString();
  const prod2Id = resProd2.insertedId.toString();
  console.log(`✓ Created test products: ${prod1Id} (In stock) & ${prod2Id} (Out of stock)\n`);

  try {
    // TEST 1: Unauthenticated request to /api/wishlist
    console.log("TEST 1: Authentication Requirement for User Wishlist");
    const unauthRes = await fetch(`${BASE_URL}/api/wishlist`);
    if (unauthRes.status !== 401) {
      throw new Error(`Expected 401 for unauthenticated request, got ${unauthRes.status}`);
    }
    console.log("  ✓ Unauthenticated request rejected with 401 Unauthorized.\n");

    // TEST 2: Add to Wishlist for User A
    console.log("TEST 2: Add Product to Favorites (POST /api/wishlist)");
    const addRes1 = await fetch(`${BASE_URL}/api/wishlist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({ productId: prod1Id }),
    });
    const addData1 = await addRes1.json();
    if (!addData1.success) {
      throw new Error(`Failed to add product to wishlist: ${addData1.error}`);
    }
    console.log(`  ✓ Product ${prod1Id} added to User A wishlist.`);

    // TEST 3: Duplicate Prevention (Idempotent Add)
    console.log("TEST 3: Prevent Duplicate Favorites Entries");
    const addResDup = await fetch(`${BASE_URL}/api/wishlist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({ productId: prod1Id }),
    });
    const addDataDup = await addResDup.json();
    if (!addDataDup.success) {
      throw new Error(`Repeated add should be idempotent: ${addDataDup.error}`);
    }

    const countUserA = await wishlistCollection.countDocuments({
      userId: userAId,
      product: resProd1.insertedId,
    });
    if (countUserA !== 1) {
      throw new Error(`Expected exactly 1 document in DB, found ${countUserA}`);
    }
    console.log("  ✓ Duplicate add prevented; database contains exactly 1 unique record.\n");

    // TEST 4: Retrieve Wishlist with Live Data & Stock Privacy
    console.log("TEST 4: Retrieve Wishlist with Live Sanitized Data (GET /api/wishlist)");
    const getResA = await fetch(`${BASE_URL}/api/wishlist`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const getDataA = await getResA.json();
    if (!getDataA.success || getDataA.data.items.length !== 1) {
      throw new Error(`Expected 1 item for User A, got ${JSON.stringify(getDataA)}`);
    }

    const item = getDataA.data.items[0];
    if (item.product.stock !== undefined) {
      throw new Error(`Raw warehouse stock leaked in wishlist response: ${item.product.stock}`);
    }
    if (item.product.stockStatus !== "in_stock") {
      throw new Error(`Expected stockStatus 'in_stock', got ${item.product.stockStatus}`);
    }
    if (item.product.name !== product1.name) {
      throw new Error(`Product name mismatch: expected ${product1.name}, got ${item.product.name}`);
    }
    console.log("  ✓ Wishlist item populated with live database product.");
    console.log("  ✓ Customer-facing stock status ('in_stock') returned without leaking exact warehouse quantity.");
    console.log(`  ✓ Product ID list returned: [${getDataA.data.productIds.join(", ")}].\n`);

    // TEST 5: User Isolation (User B cannot see User A's wishlist)
    console.log("TEST 5: User Data Isolation & Security");
    const getResB = await fetch(`${BASE_URL}/api/wishlist`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    const getDataB = await getResB.json();
    if (!getDataB.success || getDataB.data.items.length !== 0) {
      throw new Error(`User B should have 0 items, got ${getDataB.data.items.length}`);
    }
    console.log("  ✓ User B cannot see User A's favorites (returns 0 items).\n");

    // TEST 6: Guest Wishlist Query via `?ids=...`
    console.log("TEST 6: Guest Mode Live Product Query");
    const guestRes = await fetch(`${BASE_URL}/api/wishlist?ids=${prod1Id},${prod2Id}`);
    const guestData = await guestRes.json();
    if (!guestData.success || guestData.data.items.length !== 2) {
      throw new Error(`Expected 2 items for guest query, got: ${JSON.stringify(guestData)}`);
    }
    const outOfStockItem = guestData.data.items.find((i) => i.product._id === prod2Id);
    if (!outOfStockItem || outOfStockItem.product.stockStatus !== "out_of_stock") {
      throw new Error("Guest query out of stock status incorrect");
    }
    console.log("  ✓ Guest query returned live product data for both saved IDs.");
    console.log(`  ✓ Item 2 correctly identified as '${outOfStockItem.product.stockStatus}'.\n`);

    // TEST 7: Guest Merge into Authenticated Wishlist on Login
    console.log("TEST 7: Merge Guest Favorites on Login (POST /api/wishlist/merge)");
    // User A currently has prod1Id. Guest wishlist has prod1Id (already has) and prod2Id (new).
    const mergeRes = await fetch(`${BASE_URL}/api/wishlist/merge`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({ productIds: [prod1Id, prod2Id] }),
    });
    const mergeData = await mergeRes.json();
    if (!mergeData.success) {
      throw new Error(`Merge failed: ${mergeData.error}`);
    }

    const countUserAAfterMerge = await wishlistCollection.countDocuments({ userId: userAId });
    if (countUserAAfterMerge !== 2) {
      throw new Error(`Expected 2 total items after merge, found ${countUserAAfterMerge}`);
    }
    console.log("  ✓ Guest favorites merged seamlessly into User A's account without duplicating prod1Id.");
    console.log(`  ✓ Total saved items in DB for User A: ${countUserAAfterMerge}.\n`);

    // TEST 8: Remove from Wishlist (DELETE /api/wishlist)
    console.log("TEST 8: Remove Product from Favorites (DELETE /api/wishlist)");
    const deleteRes = await fetch(`${BASE_URL}/api/wishlist?productId=${prod1Id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const deleteData = await deleteRes.json();
    if (!deleteData.success || !deleteData.data.removed) {
      throw new Error(`Delete failed: ${JSON.stringify(deleteData)}`);
    }

    const countUserAAfterDelete = await wishlistCollection.countDocuments({ userId: userAId });
    if (countUserAAfterDelete !== 1) {
      throw new Error(`Expected 1 item remaining after deletion, found ${countUserAAfterDelete}`);
    }
    console.log("  ✓ Product successfully removed from User A's wishlist.");
    console.log(`  ✓ Remaining items for User A: ${countUserAAfterDelete}.\n`);

    console.log("==================================================");
    console.log("🎉 ALL WISHLIST / FAVORITES TESTS PASSED PERFECTLY!");
    console.log("==================================================\n");

  } finally {
    // Cleanup test data
    await productsCollection.deleteOne({ _id: resProd1.insertedId });
    await productsCollection.deleteOne({ _id: resProd2.insertedId });
    await wishlistCollection.deleteMany({ userId: { $in: [userAId, userBId] } });
    await mongoose.disconnect();
    console.log("✓ Cleaned up test database records and disconnected.");
  }
}

runTests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
