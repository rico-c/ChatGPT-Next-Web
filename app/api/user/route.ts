import { supabase } from "@/app/lib/supabase";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const InitialBalance = 2.0;

export async function GET(request: NextRequest) {
  try {
    let { userId } = await auth();
    const user = await currentUser();
    if (!userId) {
      throw new Error("needing login");
    }
    let email = user?.primaryEmailAddress?.emailAddress;
    const { data: resp, error } = await supabase
      .from("users")
      .select("*")
      .eq("user_id", userId)
      .single();
    console.log(resp);
    if (resp?.user_id) {
      return NextResponse.json(resp);
    } else {
      let meta_data: any = {
        user_id: userId,
        email,
        created_time: new Date().getTime(),
        balance: InitialBalance,
      };
      const { data, error } = await supabase
        .from("users")
        .insert(meta_data)
        .select()
        .single();
      console.log(error);
      return NextResponse.json(data);
    }
  } catch (err) {
    console.log(err);
    return NextResponse.json({ message: err, success: false });
  }
}
