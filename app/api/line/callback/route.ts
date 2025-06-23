import axios from "axios";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

  try {
    const body = {
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.NEXT_PUBLIC_LINE_LOGIN_REDIRECT_URI,
      client_id: process.env.NEXT_PUBLIC_LINE_CHANNEL_ID,
      client_secret: process.env.LINE_CHANNEL_SECRET,
    };

    const tokenResponse = await axios.post(
      "https://api.line.me/oauth2/v2.1/token",
      body,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const tokenData = tokenResponse.data;

    const profileResponse = await axios.get("https://api.line.me/v2/profile", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const profile = await profileResponse.data;

    const url = process.env.NEXT_PUBLIC_API_URL + "/n8n/webhook";
    const data = {
      displayName: profile.displayName,
      uid: profile.userId,
      from: "line",
    };

    await axios.post(url, data);

    const cookieStore = await cookies();
    cookieStore.set("profile", JSON.stringify(profile), {
      maxAge: 60 * 60 * 24,
      httpOnly: false,
    });

    return NextResponse.redirect(new URL(baseUrl, req.url));
  } catch (error) {
    return NextResponse.json(error);
  }
}
