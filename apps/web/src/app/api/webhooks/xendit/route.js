import { NextResponse } from "next/server";
import { handleXenditWebhook } from "@/lib/payments";

export async function POST(req) {
  try {
    const callbackToken = req.headers.get("x-callback-token") || "";
    const rawBody = await req.text();
    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Payload JSON tidak valid." }, { status: 400 });
    }

    const result = await handleXenditWebhook(payload, callbackToken);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("Xendit webhook error:", err);
    return NextResponse.json({ error: err.message || "Webhook processing error" }, { status: 400 });
  }
}

