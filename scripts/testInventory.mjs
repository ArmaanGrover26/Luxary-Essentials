import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/luxury-essentials";
const JWT_SECRET = process.env.JWT_SECRET || "luxury-essentials-dev-secret-key-123456789012345678901234";

const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("=== STARTING INVENTORY MANAGEMENT AUTOMATED VERIFICATION ===\n");
  
  // 1. Connect to MongoDB to inspect live collections and set up test items
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  console.log("✓ Connected to MongoDB for test assertions.");

  const productCollection = db.collection("products");
  const usersCollection = db.collection("users");

  // Create an admin JWT token
  const adminUser = await usersCollection.findOne({ role: "admin" });
  let adminToken = "";
  if (adminUser) {
    adminToken = jwt.sign(
      { userId: adminUser._id.toString(), email: adminUser.email, role: "admin" },
      JWT_SECRET,
      { expiresIn: "1d" }
    );
  } else {
    adminToken = jwt.sign(
      { userId: "000000000000000000000001", email: "admin@test.com", role: "admin" },
      JWT_SECRET,
      { expiresIn: "1d" }
    );
  }

  // Set up a temporary test product with exactly 3 units and threshold 5
  const testProduct = {
    name: "Automated Test Inventory Item " + Date.now(),
    description: "Item to test inventory limits, stock hiding, and overselling.",
    price: 499,
    mrp: 999,
    category: "resin-art",
    images: ["https://res.cloudinary.com/demo/image/upload/sample.jpg"],
    stock: 3,
    lowStockThreshold: 5,
    rating: 5,
    numReviews: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const insertResult = await productCollection.insertOne(testProduct);
  const testProductId = insertResult.insertedId.toString();
  console.log(`✓ Created test product: ${testProductId} with stock: 3, lowStockThreshold: 5\n`);

  try {
    // TEST 1: Public API stock privacy
    console.log("TEST 1: Customer Public API Stock Hiding");
    const publicRes = await fetch(`${BASE_URL}/api/products/${testProductId}`);
    const publicData = await publicRes.json();
    
    if (publicData.data.stock !== undefined) {
      throw new Error(`FAILED: Customer response leaked raw stock: ${publicData.data.stock}`);
    }
    if (publicData.data.stockStatus !== "low_stock") {
      throw new Error(`FAILED: Expected stockStatus 'low_stock' since 3 <= 5, got '${publicData.data.stockStatus}'`);
    }
    if (publicData.data.maxPurchasable !== 3) {
      throw new Error(`FAILED: Expected maxPurchasable 3, got '${publicData.data.maxPurchasable}'`);
    }
    console.log("  ✓ Raw 'stock' property is completely omitted from public API payload.");
    console.log(`  ✓ Friendly status '${publicData.data.stockStatus}' returned without revealing warehouse count.`);
    console.log(`  ✓ maxPurchasable correctly calculated as ${publicData.data.maxPurchasable}.\n`);

    // TEST 2: Admin API provides raw stock
    console.log("TEST 2: Admin Authorized View Retains Exact Stock");
    const adminRes = await fetch(`${BASE_URL}/api/products/${testProductId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const adminData = await adminRes.json();
    if (adminData.data.stock !== 3) {
      throw new Error(`FAILED: Admin was not provided raw stock. Got: ${adminData.data.stock}`);
    }
    if (adminData.data.lowStockThreshold !== 5) {
      throw new Error(`FAILED: Admin was not provided lowStockThreshold. Got: ${adminData.data.lowStockThreshold}`);
    }
    console.log(`  ✓ Admin API returned exact stock: ${adminData.data.stock} units.`);
    console.log(`  ✓ Admin API returned lowStockThreshold: ${adminData.data.lowStockThreshold}.\n`);

    // TEST 3: Cart Stock Revalidation API
    console.log("TEST 3: Live Cart Validation (Cart Boundary & Excess Adjustment)");
    // Case A: Request within boundary (2 units <= 3)
    const validCartRes = await fetch(`${BASE_URL}/api/cart/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: [{ product: testProductId, quantity: 2 }] })
    });
    const validCartData = await validCartRes.json();
    if (!validCartData.success || !validCartData.data.allValid || validCartData.data.results[0].allowedQuantity !== 2) {
      throw new Error(`FAILED: Expected valid cart of 2 units, got: ${JSON.stringify(validCartData)}`);
    }
    console.log("  ✓ Cart within available boundary accepted without adjustments.");

    // Case B: Request exceeding boundary (5 units > 3 available)
    const excessCartRes = await fetch(`${BASE_URL}/api/cart/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: [{ product: testProductId, quantity: 5 }] })
    });
    const excessCartData = await excessCartRes.json();
    if (!excessCartData.success || excessCartData.data.allValid) {
      throw new Error(`FAILED: Excess cart should have allValid: false`);
    }
    const excessItem = excessCartData.data.results[0];
    if (excessItem.allowedQuantity !== 3) {
      throw new Error(`FAILED: Allowed quantity should be capped to 3, got: ${excessItem.allowedQuantity}`);
    }
    if (!excessItem.adjusted) {
      throw new Error(`FAILED: adjusted flag should be true`);
    }
    console.log(`  ✓ Excess cart (5 units) properly adjusted to available ceiling (${excessItem.allowedQuantity}).`);
    console.log(`  ✓ Adjustment reason received: "${excessItem.message}".\n`);

    // TEST 4: Concurrency Safety & Race Condition Prevention
    console.log("TEST 4: Concurrent Purchase Overselling Protection");
    // Product currently has 3 units. We fire 2 simultaneous order requests, each requesting 2 units (total 4 units requested).
    // Exactly ONE must succeed and the other MUST fail because 2 + 2 = 4 > 3.
    const createOrderPayload = (name) => ({
      items: [{ productId: testProductId, quantity: 2, price: 499 }],
      shippingAddress: {
        name,
        phone: "9876543210",
        address: "123 Marine Drive",
        city: "Mumbai",
        pincode: "400001",
      },
    });

    const [orderRes1, orderRes2] = await Promise.all([
      fetch(`${BASE_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(createOrderPayload("Buyer A")),
      }),
      fetch(`${BASE_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(createOrderPayload("Buyer B")),
      }),
    ]);

    const orderData1 = await orderRes1.json();
    const orderData2 = await orderRes2.json();

    const successes = [orderData1, orderData2].filter((o) => o.success);
    const failures = [orderData1, orderData2].filter((o) => !o.success);

    if (successes.length !== 1 || failures.length !== 1) {
      throw new Error(`FAILED Concurrency Test! Successes: ${successes.length}, Failures: ${failures.length}. Expected exactly 1 success and 1 rejection.`);
    }

    const updatedDoc = await productCollection.findOne({ _id: insertResult.insertedId });
    if (updatedDoc.stock !== 1) {
      throw new Error(`FAILED: Expected remaining stock to be 1 (3 - 2), but found: ${updatedDoc.stock}`);
    }
    console.log(`  ✓ Concurrency test passed: 1 order succeeded, 1 order safely rejected without overselling.`);
    console.log(`  ✓ Remaining stock in database is exactly ${updatedDoc.stock} (non-negative).`);
    console.log(`  ✓ Rejection message: "${failures[0].error}".\n`);

    // TEST 5: Order Cancellation & Inventory Restock
    console.log("TEST 5: Order Cancellation Automatic Restocking");
    const successfulOrderId = successes[0].data._id;
    const cancelRes = await fetch(`${BASE_URL}/api/admin/orders/${successfulOrderId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ orderStatus: "cancelled" }),
    });
    const cancelData = await cancelRes.json();
    if (!cancelData.success) {
      throw new Error(`FAILED to cancel order: ${cancelData.error}`);
    }

    const restockedDoc = await productCollection.findOne({ _id: insertResult.insertedId });
    if (restockedDoc.stock !== 3) {
      throw new Error(`FAILED: Expected stock to be restocked back to 3, but found: ${restockedDoc.stock}`);
    }
    console.log(`  ✓ Order ${successfulOrderId} cancelled and inventory automatically restored to ${restockedDoc.stock} units.\n`);

    console.log("=================================================");
    console.log("🎉 ALL INVENTORY MANAGEMENT TESTS PASSED PERFECTLY!");
    console.log("=================================================\n");

  } finally {
    // Cleanup test product and any created orders
    await productCollection.deleteOne({ _id: insertResult.insertedId });
    await db.collection("orders").deleteMany({ "items.product": insertResult.insertedId });
    await mongoose.disconnect();
    console.log("✓ Cleaned up test data and disconnected from DB.");
  }
}

runTests().catch((err) => {
  console.error("❌ Test execution failed with error:", err);
  process.exit(1);
});
