// Amanora Plus activation codes (run on YOUR computer only; never upload keys/plus-private.json)
//   node scripts/plus-codes.mjs issue --device A1B2-C3D4 --plan monthly
//   node scripts/plus-codes.mjs issue --device A1B2-C3D4 --plan yearly
//   node scripts/plus-codes.mjs issue --device A1B2-C3D4 --plan monthly --days 45
//   node scripts/plus-codes.mjs init        (only if you want to create a brand new key pair)
import { createPrivateKey, generateKeyPairSync, sign } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const KEY_FILE = "keys/plus-private.json";
const APP_FILE = "src/services/plusCodes.ts";
const EPOCH = Date.UTC(2024, 0, 1);
const DAY = 86400000;
const arg = (n) => { const i = process.argv.indexOf("--" + n); return i > -1 ? process.argv[i + 1] : undefined; };
const cmd = process.argv[2];

if (cmd === "init") {
  const { publicKey, privateKey } = generateKeyPairSync("ec", { namedCurve: "P-256" });
  const pub = publicKey.export({ format: "jwk" });
  mkdirSync("keys", { recursive: true });
  writeFileSync(KEY_FILE, JSON.stringify(privateKey.export({ format: "jwk" }), null, 2));
  const line = `const PUBLIC_KEY: JsonWebKey = ${JSON.stringify({ kty: pub.kty, crv: pub.crv, x: pub.x, y: pub.y })};`;
  writeFileSync(APP_FILE, readFileSync(APP_FILE, "utf8").replace(/const PUBLIC_KEY: JsonWebKey = .*;/, line));
  console.log("New key pair created. Private key saved to " + KEY_FILE + ". Rebuild the app. Old codes stop working.");
} else if (cmd === "issue") {
  const device = (arg("device") || "").replace(/[^0-9a-f]/gi, "").toUpperCase();
  const plan = arg("plan");
  if (device.length !== 8 || !["monthly", "yearly"].includes(plan)) {
    console.error("Usage: node scripts/plus-codes.mjs issue --device A1B2-C3D4 --plan monthly|yearly [--days N]");
    process.exit(1);
  }
  if (!existsSync(KEY_FILE)) { console.error("Missing " + KEY_FILE + ". Put your private key file there."); process.exit(1); }
  const days = Number(arg("days")) || (plan === "yearly" ? 365 : 31);
  const endDays = Math.floor((Date.now() - EPOCH) / DAY) + days - 1;
  const payload = Buffer.alloc(8);
  payload[0] = 1; payload[1] = plan === "yearly" ? 2 : 1;
  Buffer.from(device, "hex").copy(payload, 2);
  payload.writeUInt16BE(endDays, 6);
  const key = createPrivateKey({ key: JSON.parse(readFileSync(KEY_FILE, "utf8")), format: "jwk" });
  const sig = sign("sha256", payload, { key, dsaEncoding: "ieee-p1363" });
  const code = "AMN1." + Buffer.concat([payload, sig]).toString("base64url");
  const end = new Date(EPOCH + (endDays + 1) * DAY - 1).toISOString().slice(0, 10);
  console.log("\nDevice: " + device.slice(0, 4) + "-" + device.slice(4) + "   Plan: " + plan + "   Active until: " + end + "\n\n" + code + "\n");
} else {
  console.log("Commands: issue | init   (see the comments at the top of this file)");
}
