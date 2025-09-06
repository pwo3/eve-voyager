import { NextRequest, NextResponse } from "next/server";

const EVE_SSO_BASE_URL = "https://login.eveonline.com/v2/oauth/authorize";
const CLIENT_ID = process.env.EVE_CLIENT_ID;
const REDIRECT_URI =
  process.env.EVE_REDIRECT_URI || "http://localhost:3000/api/auth/eve/callback";
const SCOPES =
  "publicData esi-location.read_location.v1 esi-location.read_ship_type.v1 esi-location.read_online.v1 esi-skills.read_skills.v1 esi-skills.read_skillqueue.v1";

export const GET = async () => {
  if (!CLIENT_ID) {
    return NextResponse.json(
      { error: "EVE_CLIENT_ID not configured" },
      { status: 500 }
    );
  }

  const state = Math.random().toString(36).substring(2, 15);

  const authUrl = new URL(EVE_SSO_BASE_URL);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
  authUrl.searchParams.set("client_id", CLIENT_ID);
  authUrl.searchParams.set("scope", SCOPES);
  authUrl.searchParams.set("state", state);

  // Store the state in a cookie for verification
  const response = NextResponse.redirect(authUrl.toString());

  response.cookies.set("eve_sso_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
  });

  return response;
};
