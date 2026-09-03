/**
 * fix-mrn-index.js
 * ─────────────────────────────────────────────────────────
 * One-time migration: drops the old non-sparse `mrn_1` unique
 * index from the `users` collection, then lets Mongoose
 * recreate it correctly as a sparse unique index on next
 * server start.
 *
 * Run once from inside the backend_server directory:
 *   node src/migrations/fix-mrn-index.js
 * ─────────────────────────────────────────────────────────
 */
require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });
const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI || process.env.DB_URL || process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error(
    "❌  No MongoDB connection string found.\n" +
      "    Set MONGO_URI (or DB_URL / MONGODB_URI) in your .env file."
  );
  process.exit(1);
}

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅  Connected to MongoDB:", mongoose.connection.name);

    const db = mongoose.connection.db;
    const collection = db.collection("users");

    // List current indexes on the users collection
    const indexes = await collection.indexes();
    console.log(
      "\nCurrent indexes on `users`:\n",
      indexes.map((i) => `  ${i.name} → unique:${!!i.unique} sparse:${!!i.sparse}`).join("\n")
    );

    // Drop the old non-sparse mrn index if it exists
    const mrnIndex = indexes.find((i) => i.name === "mrn_1");
    if (mrnIndex) {
      if (mrnIndex.sparse) {
        console.log("\n✅  mrn_1 index is already sparse — no action needed.");
      } else {
        await collection.dropIndex("mrn_1");
        console.log("\n✅  Dropped old non-sparse `mrn_1` index.");
        console.log(
          "   Mongoose will recreate it as a SPARSE unique index on next server start."
        );
      }
    } else {
      console.log("\nℹ️  No `mrn_1` index found — nothing to do.");
    }
  } catch (err) {
    console.error("❌  Migration failed:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("\n✅  Disconnected. Migration complete.");
  }
})();
