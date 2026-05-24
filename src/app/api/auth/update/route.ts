import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}));

  return NextResponse.json({
    message: "Profile update is handled locally in this template",
    payload,
    success: true,
  });
}
