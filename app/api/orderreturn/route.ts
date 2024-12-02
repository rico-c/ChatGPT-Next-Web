import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
// @ts-expect-error
import md5 from "md5";
import { supabase } from "@/app/lib/supabase";
// require("dotenv").config();

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const out_trade_no = searchParams.get("out_trade_no");
    const trade_status = searchParams.get("trade_status");

    if (trade_status !== "TRADE_SUCCESS") {
      return;
    }
    if (out_trade_no) {
      const url = `act=order&out_trade_no=${out_trade_no}&pid=${25770}&key=${
        process.env.RAINBOW_PAY
      }`;
      const sign = md5(url + process.env.RAINBOW_PAY);
      const resp = await axios.get(
        `https://pay.v8jisu.cn/api.php?${url}&sign=${sign}`,
      );
      if (resp.status === 200 && resp.data.status == "1") {
        // 成功付款
        const user_id = out_trade_no.split("-")[1];
        const target: any = await supabase
          .from("users")
          .select("*")
          .eq("user_id", user_id)
          .single();

        const { error } = await supabase
          .from("users")
          .update({
            balance: Number(resp.data.money) + target.data.balance,
          })
          .eq("user_id", user_id);
      }
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ message: err, success: false });
  }
}
