import { NextResponse } from "next/server";
import { stripe, PRICE_IDS } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { priceKey } = (await req.json()) as { priceKey: keyof typeof PRICE_IDS };
  const origin = process.env.NEXT_PUBLIC_APP_URL!;
  const price = PRICE_IDS[priceKey];

  if (!price) {
    return NextResponse.json({ error: "Invalid price key" }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price, quantity: 1 }],
    success_url: `${origin}/billing?success=1`,
    cancel_url: `${origin}/billing?canceled=1`,
    customer_email: user.email,
    metadata: {
      user_id: user.id,
      price_key: priceKey,
    },
  });

  return NextResponse.json({ url: session.url });
}
