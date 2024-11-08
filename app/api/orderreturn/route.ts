import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
// @ts-expect-error
import md5 from "md5";
import clientPromise from "@/app/lib/mongodb";
require("dotenv").config();

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
        const client = await clientPromise;
        const orders = client.db("newbuygpt").collection("orders");
        const users = client.db("newbuygpt").collection("users");
        const user_id = out_trade_no.split("-")[1];
        await orders.updateOne(
          {
            orderId: out_trade_no,
          },
          {
            $set: {
              ...resp.data,
              userId: user_id,
            },
          },
          {
            upsert: true,
          },
        );
        const target: any = users.findOne({
          user_id: user_id,
        });
        await users.updateOne(
          {
            user_id: user_id,
          },
          {
            $set: {
              balance: target.balance + Number(resp.data.money),
            },
          },
        );
      }
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ message: err, success: false });
  }
}
