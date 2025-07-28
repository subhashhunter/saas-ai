import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/primsa";

export async function POST(req: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;
  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature");
  const expectedSignature = crypto.createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  if (signature !== expectedSignature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body);

  if (event.event === "payment.captured") {
    const payment = event.payload.payment.entity;
    const userId = payment.notes.userId;
    const orderId = payment.order_id;

    await prisma.user.update({
      where: { id: userId },
      data: {
        isSubscribed: true,
        subscriptionEnds: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "completed",
      },
    });
  }

  return NextResponse.json(
    { message: "Payment completed successfully" },
    { status: 200 }
  );
}
