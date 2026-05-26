import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { flow_id } = body;

    if (!flow_id) {
      return NextResponse.json(
        { error: "flow_id is required" },
        { status: 400 },
      );
    }

    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      process.env.NEXT_PUBLIC_URL ||
      "http://localhost:3006/api";
    const apiUrl = `${backendUrl.replace(/\/+$/, "")}/chat/start`;

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flow_id }),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("[Chat API] Error starting session:", error);
    return NextResponse.json(
      { error: "Failed to start chat session" },
      { status: 500 },
    );
  }
}
