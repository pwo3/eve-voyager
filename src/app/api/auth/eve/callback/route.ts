import { NextRequest, NextResponse } from "next/server";
import { EVETokenResponse, EVEVerifyResponse, EVEUser } from "@/types/auth";

const EVE_TOKEN_URL = "https://login.eveonline.com/v2/oauth/token";
const EVE_VERIFY_URL = "https://login.eveonline.com/oauth/verify";
const CLIENT_ID = process.env.EVE_CLIENT_ID;
const CLIENT_SECRET = process.env.EVE_CLIENT_SECRET;

export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // Check if there's an error
    if (error) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL || "http://localhost:3000"}?error=${error}`
      );
    }

    // Check the authorization code
    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL || "http://localhost:3000"}?error=no_code`
      );
    }

    // Check the state (optional but recommended)
    const storedState = request.cookies.get("eve_sso_state")?.value;
    if (state !== storedState) {
      return NextResponse.redirect(
        `${
          process.env.NEXTAUTH_URL || "http://localhost:3000"
        }?error=invalid_state`
      );
    }

    if (!CLIENT_ID || !CLIENT_SECRET) {
      return NextResponse.redirect(
        `${
          process.env.NEXTAUTH_URL || "http://localhost:3000"
        }?error=config_error`
      );
    }

    // Exchange the code for an access token
    const tokenResponse = await fetch(EVE_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${CLIENT_ID}:${CLIENT_SECRET}`
        ).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("Token exchange failed:", errorData);
      return NextResponse.redirect(
        `${
          process.env.NEXTAUTH_URL || "http://localhost:3000"
        }?error=token_exchange_failed`
      );
    }

    const tokenData: EVETokenResponse = await tokenResponse.json();

    // Verify the token with the EVE API
    const verifyResponse = await fetch(EVE_VERIFY_URL, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!verifyResponse.ok) {
      return NextResponse.redirect(
        `${
          process.env.NEXTAUTH_URL || "http://localhost:3000"
        }?error=verification_failed`
      );
    }

    const verifyData: EVEVerifyResponse = await verifyResponse.json();

    // Create the user object
    const user: EVEUser = {
      character_id: verifyData.CharacterID,
      character_name: verifyData.CharacterName,
      character_owner_hash: verifyData.CharacterOwnerHash,
      scopes: verifyData.Scopes.split(" "),
      token_type: tokenData.token_type,
      expires_in: tokenData.expires_in,
      refresh_token: tokenData.refresh_token,
    };

    // Store session data
    const sessionData = {
      user,
      accessToken: tokenData.access_token,
      expires: new Date(Date.now() + tokenData.expires_in * 1000),
    };

    // Redirect to home page with session data
    const response = NextResponse.redirect(
      `${process.env.NEXTAUTH_URL || "http://localhost:3000"}?login=success`
    );

    // Store the session in a secure cookie
    response.cookies.set("eve_session", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: tokenData.expires_in,
    });

    // Clean up the state cookie
    response.cookies.delete("eve_sso_state");

    return response;
  } catch (error) {
    console.error("EVE SSO callback error:", error);
    return NextResponse.redirect(
      `${
        process.env.NEXTAUTH_URL || "http://localhost:3000"
      }?error=callback_error`
    );
  }
};
