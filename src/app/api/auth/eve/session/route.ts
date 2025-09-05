import { NextRequest, NextResponse } from "next/server";
import { AuthSession } from "@/types/auth";

export const GET = async (request: NextRequest) => {
  try {
    const sessionCookie = request.cookies.get("eve_session");

    if (!sessionCookie) {
      return NextResponse.json({ user: null });
    }

    const sessionData: AuthSession = JSON.parse(sessionCookie.value);

    // Check if the session has expired
    if (new Date() > sessionData.expires) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user: sessionData.user });
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json({ user: null });
  }
};
