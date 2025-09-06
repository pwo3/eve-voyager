import { NextRequest, NextResponse } from "next/server";
import {
  EVEProfileResponse,
  EVECharacterDetails,
  EVECorporation,
  EVEAlliance,
  EVEShip,
} from "@/types/auth";

const ESI_BASE_URL = "https://esi.evetech.net/latest";

async function getAccessToken(request: NextRequest): Promise<string | null> {
  // Get the session cookie
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

async function fetchCharacterDetails(
  characterId: number,
  accessToken: string
): Promise<EVECharacterDetails> {
  const response = await fetch(`${ESI_BASE_URL}/characters/${characterId}/`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch character details: ${response.status}`);
  }

  return await response.json();
}

async function fetchCorporationDetails(
  corporationId: number,
  accessToken: string
): Promise<EVECorporation> {
  const response = await fetch(
    `${ESI_BASE_URL}/corporations/${corporationId}/`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch corporation details: ${response.status}`);
  }

  return await response.json();
}

async function fetchAllianceDetails(
  allianceId: number,
  accessToken: string
): Promise<EVEAlliance> {
  const response = await fetch(`${ESI_BASE_URL}/alliances/${allianceId}/`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch alliance details: ${response.status}`);
  }

  return await response.json();
}

async function fetchShipDetails(
  characterId: number,
  accessToken: string
): Promise<EVEShip | null> {
  try {
    const response = await fetch(
      `${ESI_BASE_URL}/characters/${characterId}/ship/`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      return null; // Ship info might not be available
    }

    const shipData = await response.json();

    // Get ship type name
    const shipTypeResponse = await fetch(
      `${ESI_BASE_URL}/universe/types/${shipData.ship_type_id}/`
    );
    const shipTypeData = await shipTypeResponse.json();

    return {
      ship_item_id: shipData.ship_item_id,
      ship_name: shipData.ship_name || shipTypeData.name,
      ship_type_id: shipData.ship_type_id,
      ship_type_name: shipTypeData.name,
    };
  } catch {
    return null;
  }
}

async function fetchOnlineStatus(
  characterId: number,
  accessToken: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `${ESI_BASE_URL}/characters/${characterId}/online/`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.online || false;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get access token from session
    const accessToken = await getAccessToken(request);
    if (!accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get character ID from session
    const sessionCookie = request.cookies.get("eve_session");
    if (!sessionCookie) {
      return NextResponse.json({ error: "No session found" }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    const characterId = session.user.character_id;

    // Fetch character details first to get corporation ID
    const character = await fetchCharacterDetails(characterId, accessToken);

    // Fetch all other data in parallel
    const [corporation, onlineStatus, ship] = await Promise.all([
      fetchCorporationDetails(character.corporation_id, accessToken),
      fetchOnlineStatus(characterId, accessToken),
      fetchShipDetails(characterId, accessToken),
    ]);

    // Fetch alliance if corporation has one
    let alliance: EVEAlliance | undefined;
    if (corporation.alliance_id) {
      try {
        alliance = await fetchAllianceDetails(
          corporation.alliance_id,
          accessToken
        );
      } catch (error) {
        console.warn("Failed to fetch alliance details:", error);
      }
    }

    const profileData: EVEProfileResponse = {
      character,
      corporation,
      alliance,
      ship: ship || undefined,
      online_status: onlineStatus,
    };

    return NextResponse.json(profileData);
  } catch (error) {
    console.error("Error fetching profile data:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile data" },
      { status: 500 }
    );
  }
}
