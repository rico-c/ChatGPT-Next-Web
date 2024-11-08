import clientPromise from "@/app/lib/mongodb";
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
    const client = await clientPromise;
    const users_db = client.db("newbuygpt").collection("users");
    const resp = await users_db.findOne({
      user_id: userId,
    });
    if (resp?.user_id) {
      return NextResponse.json(resp);
    } else {
      let data: any = {
        user_id: userId,
        email,
        created_time: new Date().getTime(),
        balance: InitialBalance,
      };
      await users_db.insertOne(data);
      return NextResponse.json(data);
    }
  } catch (err) {
    console.log(err);
    return NextResponse.json({ message: err, success: false });
  }
}
