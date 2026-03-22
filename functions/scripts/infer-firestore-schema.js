/* eslint-disable no-console */

const fs = require("node:fs");
const path = require("node:path");
const admin = require("firebase-admin");

const outputDir = path.resolve(__dirname, "../exports");
const outputFile = path.join(outputDir, "firestore-schema.json");
const projectId = process.env.GOOGLE_CLOUD_PROJECT || "ssr-juniors";

const maxDocsPerCollection = Number.parseInt(process.env.MAX_DOCS || "200", 10);
const collectionFilter = (process.env.COLLECTIONS || "")
  .split(",")
  .map((name) => name.trim())
  .filter(Boolean);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require("../serviceAccount.json")),
  });
}

const db = admin.firestore();

function mergeType(map, fieldPath, type) {
  if (!map[fieldPath]) {
    map[fieldPath] = new Set();
  }
  map[fieldPath].add(type);
}

function detectType(value) {
  if (value === null) return "null";
  if (value === undefined) return "undefined";

  if (value instanceof admin.firestore.Timestamp) return "timestamp";
  if (value instanceof admin.firestore.GeoPoint) return "geopoint";
  if (value instanceof admin.firestore.DocumentReference) return "reference";
  if (value instanceof Uint8Array || Buffer.isBuffer(value)) return "bytes";

  if (Array.isArray(value)) {
    if (value.length === 0) return "array<empty>";
    const elementTypes = [...new Set(value.map(detectType))].sort();
    return `array<${elementTypes.join("|")}>`;
  }

  if (typeof value === "object") return "map";
  return typeof value;
}

function walkObject(value, prefix, schemaMap) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return;
  }

  for (const [key, child] of Object.entries(value)) {
    const fieldPath = prefix ? `${prefix}.${key}` : key;
    const type = detectType(child);
    mergeType(schemaMap, fieldPath, type);

    if (type === "map") {
      walkObject(child, fieldPath, schemaMap);
    }

    if (Array.isArray(child)) {
      for (const item of child) {
        if (item && typeof item === "object" && !Array.isArray(item)) {
          walkObject(item, `${fieldPath}[]`, schemaMap);
        }
      }
    }
  }
}

async function inferCollectionSchema(collectionName) {
  const snap = await db
    .collection(collectionName)
    .limit(maxDocsPerCollection)
    .get();
  const schemaMap = {};

  for (const doc of snap.docs) {
    walkObject(doc.data(), "", schemaMap);
  }

  const fields = Object.fromEntries(
    Object.entries(schemaMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([fieldPath, typeSet]) => [fieldPath, [...typeSet].sort()]),
  );

  return {
    sampledDocs: snap.size,
    fields,
  };
}

async function main() {
  const allCollections = await db.listCollections();
  const selectedCollections =
    collectionFilter.length > 0
      ? allCollections
          .map((col) => col.id)
          .filter((name) => collectionFilter.includes(name))
      : allCollections.map((col) => col.id);

  const report = {
    generatedAt: new Date().toISOString(),
    maxDocsPerCollection,
    collections: {},
  };

  for (const collectionName of selectedCollections.sort()) {
    process.stdout.write(`Analyzing ${collectionName}...\n`);
    report.collections[collectionName] =
      await inferCollectionSchema(collectionName);
  }

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputFile, JSON.stringify(report, null, 2));

  process.stdout.write(`Schema report saved: ${outputFile}\n`);
}

main().catch((error) => {
  console.error("Failed to infer schema:", error);
  process.exitCode = 1;
});
