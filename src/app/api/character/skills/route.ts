import { NextRequest, NextResponse } from "next/server";
import { EVESkillsResponse } from "@/types/auth";

const ESI_BASE_URL = "https://esi.evetech.net/latest";

async function getAccessToken(request: NextRequest): Promise<string | null> {
  const sessionCookie = request.cookies.get("eve_session");
  if (!sessionCookie) {
    return null;
  }

  try {
    const session = JSON.parse(sessionCookie.value);
    return session.accessToken;
  } catch {
    return null;
  }
}

async function fetchCharacterSkills(characterId: number, accessToken: string) {
  const response = await fetch(
    `${ESI_BASE_URL}/characters/${characterId}/skills/`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch character skills: ${response.status}`);
  }

  return await response.json();
}

export async function GET(request: NextRequest) {
  try {
    const accessToken = await getAccessToken(request);
    if (!accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const sessionCookie = request.cookies.get("eve_session");
    if (!sessionCookie) {
      return NextResponse.json({ error: "No session found" }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    const characterId = session.user.character_id;

    const skillsData = await fetchCharacterSkills(characterId, accessToken);

    const response: EVESkillsResponse = {
      skills: skillsData.skills || [],
      total_sp: skillsData.total_sp || 0,
      unallocated_sp: skillsData.unallocated_sp || 0,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching character skills:", error);
    return NextResponse.json(
      { error: "Failed to fetch character skills" },
      { status: 500 }
    );
  }
}
