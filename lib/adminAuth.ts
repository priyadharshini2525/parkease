import { cookies } from "next/headers";
import crypto from "crypto";

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!token) {
    return false;
  }

  const parts = token.split(".");

  if (parts.length !== 2) {
    return false;
  }

  const [payload, signature] = parts;

  const secret =
    process.env.ADMIN_SECRET || "parkease-development-secret";

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");

  if (signature !== expectedSignature) {
    return false;
  }

  try {
    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString()
    );

    if (decoded.admin !== true) {
      return false;
    }

    // Session expires after 8 hours
    if (
      Date.now() - decoded.timestamp >
      8 * 60 * 60 * 1000
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}