import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const phone = String(body.phone || "").trim();

    if (!phone) {
      return NextResponse.json(
        {
          error: "Phone number is required.",
        },
        {
          status: 400,
        }
      );
    }

    const adminPhone = process.env.ADMIN_PHONE;

    if (!adminPhone) {
      console.error("ADMIN_PHONE is not configured.");

      return NextResponse.json(
        {
          error: "Admin login is not configured.",
        },
        {
          status: 500,
        }
      );
    }

    // Check whether entered number matches
    // the authorized admin number.
    if (phone !== adminPhone.trim()) {
      return NextResponse.json(
        {
          error: "Unauthorized. You are not an admin.",
        },
        {
          status: 401,
        }
      );
    }

    /*
      Create a simple signed admin token.

      The token contains:
      - admin = true
      - phone number
      - timestamp

      It is signed using ADMIN_SECRET.
    */

    const secret =
      process.env.ADMIN_SECRET || "parkease-development-secret";

    const payload = Buffer.from(
      JSON.stringify({
        admin: true,
        phone: phone,
        timestamp: Date.now(),
      })
    ).toString("base64url");

    const signature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("base64url");

    const token = `${payload}.${signature}`;

    const response = NextResponse.json({
      success: true,
      message: "Admin login successful.",
    });

    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 hours
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);

    return NextResponse.json(
      {
        error: "Invalid request.",
      },
      {
        status: 400,
      }
    );
  }
}