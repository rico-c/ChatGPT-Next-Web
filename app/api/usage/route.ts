import { model_price, price_quantity } from "@/app/constant";
import { supabase } from "@/app/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { model_name, usage } = await request.json();
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Auth fail");
    }
    const price_info = (model_price as any)[model_name];
    const out_tokens = usage.completion_tokens;
    const in_tokens = usage.prompt_tokens;
    const price_consume =
      (price_info.input / price_quantity) * in_tokens +
      (price_info.output / price_quantity) * out_tokens;

    const { data: target }: any = await supabase
      .from("users")
      .select("*")
      .eq("user_id", userId)
      .single();

    console.log(222, target);
    const remain_balance = target.balance - Number(price_consume);
    const { error } = await supabase
      .from("users")
      .update({
        balance: remain_balance,
      })
      .eq("user_id", userId);
    return NextResponse.json({
      consume: price_consume,
      remain: remain_balance,
    });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ message: err, success: false });
  }
}
