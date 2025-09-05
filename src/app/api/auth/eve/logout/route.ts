import { NextResponse } from "next/server";

export const POST = async () => {
  try {
    const response = NextResponse.json({ success: true });

    // Delete the session cookie
    response.cookies.delete("eve_session");

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
};
