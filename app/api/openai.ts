import { type OpenAIListModelResponse } from "@/app/client/platforms/openai";
import { getServerSideConfig } from "@/app/config/server";
import { ModelProvider, OpenaiPath } from "@/app/constant";
import { prettyObject } from "@/app/utils/format";
import { NextRequest, NextResponse } from "next/server";
import { requestOpenai } from "./common";
import { auth as clerkAuth } from "@clerk/nextjs/server";
import { supabase } from "../lib/supabase";
import { auth } from "./auth";

const ALLOWED_PATH = new Set(Object.values(OpenaiPath));

function getModels(remoteModelRes: OpenAIListModelResponse) {
  const config = getServerSideConfig();

  if (config.disableGPT4) {
    remoteModelRes.data = remoteModelRes.data.filter(
      (m) =>
        !(m.id.startsWith("gpt-4") || m.id.startsWith("chatgpt-4o")) ||
        m.id.startsWith("gpt-4o-mini"),
    );
  }

  return remoteModelRes;
}

export async function handle(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  console.log("[OpenAI Route] params ", params);

  if (req.method === "OPTIONS") {
    return NextResponse.json({ body: "OK" }, { status: 200 });
  }

  const subpath = params.path.join("/");

  if (!ALLOWED_PATH.has(subpath)) {
    console.log("[OpenAI Route] forbidden path ", subpath);
    return NextResponse.json(
      {
        error: true,
        msg: "you are not allowed to request " + subpath,
      },
      {
        status: 403,
      },
    );
  }

  const authResult = auth(req, ModelProvider.GPT);
  if (authResult.error) {
    return NextResponse.json(authResult, {});
  }

  const { userId } = await clerkAuth();
  const { data: userInfo, error } = await supabase
    .from("users")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!userId) {
    return NextResponse.json("请登录后重试", {
      status: 401,
    });
  }

  if (userInfo?.balance <= 0) {
    return NextResponse.json("余额不足请充值", {
      status: 598,
    });
  }
  try {
    const response = await requestOpenai(req, userId);

    // list models
    if (subpath === OpenaiPath.ListModelPath && response.status === 200) {
      const resJson = (await response.json()) as OpenAIListModelResponse;
      const availableModels = getModels(resJson);
      return NextResponse.json(availableModels, {
        status: response.status,
      });
    }

    return response;
  } catch (e) {
    return NextResponse.json(prettyObject(e));
  }
}
