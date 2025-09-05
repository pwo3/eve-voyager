import { NextRequest, NextResponse } from "next/server";
import {
  AuthSession,
  EVELocationResponse,
  EVELocation,
  EVESolarSystem,
  EVEStation,
  EVEStructure,
} from "@/types/auth";

const EVE_API_BASE = "https://esi.evetech.net/latest";

export const GET = async (request: NextRequest) => {
  try {
    // Get session from cookie
    const sessionCookie = request.cookies.get("eve_session");

    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const sessionData: AuthSession = JSON.parse(sessionCookie.value);

    // Check if the session has expired
    if (new Date() > sessionData.expires) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    // Check if user has the required scope for location
    if (!sessionData.user.scopes.includes("esi-location.read_location.v1")) {
      return NextResponse.json(
        {
          error:
            "Insufficient permissions. Required scope: esi-location.read_location.v1",
        },
        { status: 403 }
      );
    }

    const accessToken = sessionData.accessToken;
    const characterId = sessionData.user.character_id;

    // Fetch character location
    const locationResponse = await fetch(
      `${EVE_API_BASE}/characters/${characterId}/location/`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!locationResponse.ok) {
      const errorData = await locationResponse.text();
      console.error("EVE API location error:", errorData);
      return NextResponse.json(
        {
          error: "Failed to fetch location from EVE API",
        },
        { status: locationResponse.status }
      );
    }

    const location: EVELocation = await locationResponse.json();

    // Fetch solar system information
    let solarSystem: EVESolarSystem | undefined;
    try {
      const solarSystemResponse = await fetch(
        `${EVE_API_BASE}/universe/systems/${location.solar_system_id}/`
      );

      if (solarSystemResponse.ok) {
        solarSystem = await solarSystemResponse.json();
      }
    } catch (error) {
      console.error("Error fetching solar system:", error);
    }

    // Fetch station information if the character is in a station
    let station: EVEStation | undefined;
    if (location.station_id) {
      try {
        const stationResponse = await fetch(
          `${EVE_API_BASE}/universe/stations/${location.station_id}/`
        );

        if (stationResponse.ok) {
          station = await stationResponse.json();
        }
      } catch (error) {
        console.error("Error fetching station:", error);
      }
    }

    // Fetch structure information if the character is in a structure
    let structure: EVEStructure | undefined;
    if (location.structure_id) {
      try {
        const structureResponse = await fetch(
          `${EVE_API_BASE}/universe/structures/${location.structure_id}/`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (structureResponse.ok) {
          structure = await structureResponse.json();
        }
      } catch (error) {
        console.error("Error fetching structure:", error);
      }
    }

    const response: EVELocationResponse = {
      location,
      solar_system: solarSystem,
      station,
      structure,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Location API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
};
