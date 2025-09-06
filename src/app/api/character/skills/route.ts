import { NextRequest, NextResponse } from "next/server";
import { EVESkillsResponse, EVESkillQueueResponse } from "@/types/auth";

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

async function fetchSkillQueue(characterId: number, accessToken: string) {
  const response = await fetch(
    `${ESI_BASE_URL}/characters/${characterId}/skillqueue/`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch skill queue: ${response.status}`);
  }

  const data = await response.json();
  console.log(
    "Raw skill queue response from ESI:",
    JSON.stringify(data, null, 2)
  );

  // Log individual skill dates
  if (data && data.length > 0) {
    console.log("First skill dates:", {
      start_date: data[0].start_date,
      finish_date: data[0].finish_date,
      start_parsed: new Date(data[0].start_date),
      finish_parsed: new Date(data[0].finish_date),
      start_timestamp: new Date(data[0].start_date).getTime(),
      finish_timestamp: new Date(data[0].finish_date).getTime(),
    });
  }

  return data;
}

async function fetchSkillTypeName(skillTypeId: number): Promise<string> {
  const response = await fetch(
    `${ESI_BASE_URL}/universe/types/${skillTypeId}/`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch skill type ${skillTypeId}: ${response.status}`
    );
  }

  const data = await response.json();
  return data.name;
}

async function fetchSkillTypeNames(
  skillTypeIds: number[]
): Promise<Map<number, string>> {
  if (skillTypeIds.length === 0) return new Map();

  // Fetch all skill names in parallel (individual requests)
  const skillNames = await Promise.all(
    skillTypeIds.map(async (skillTypeId) => {
      try {
        const name = await fetchSkillTypeName(skillTypeId);
        return { skillTypeId, name };
      } catch (error) {
        console.warn(
          `Failed to fetch name for skill type ${skillTypeId}:`,
          error
        );
        return { skillTypeId, name: `Unknown Skill ${skillTypeId}` };
      }
    })
  );

  // Create a map for quick lookup
  const nameMap = new Map<number, string>();
  skillNames.forEach(({ skillTypeId, name }) => {
    nameMap.set(skillTypeId, name);
  });

  return nameMap;
}

async function enrichSkillQueueWithNames(skillQueue: any[]): Promise<any[]> {
  if (skillQueue.length === 0) return skillQueue;

  // Get unique skill IDs - skill queue uses skill_id, not skill_type_id
  console.log("First skill queue item structure:", skillQueue[0]);

  const skillIds = [
    ...new Set(
      skillQueue.map((item) => item.skill_id).filter((id) => id !== undefined)
    ),
  ];

  console.log("Skill queue items:", skillQueue);
  console.log("Skill IDs to fetch:", skillIds);

  try {
    // Fetch all skill names in parallel
    const nameMap = await fetchSkillTypeNames(skillIds);

    console.log("Fetched skill names:", nameMap);

    // Enrich the skill queue with names
    const enriched = skillQueue.map((item) => {
      return {
        ...item,
        skill_name:
          nameMap.get(item.skill_id) || `Unknown Skill ${item.skill_id}`,
      };
    });

    console.log("Enriched skill queue:", enriched);
    return enriched;
  } catch (error) {
    console.warn("Failed to fetch skill names, using fallback:", error);

    // Fallback: return with skill_id as name
    return skillQueue.map((item) => {
      return {
        ...item,
        skill_name: `Skill ${item.skill_id}`,
      };
    });
  }
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

    const [skillsData, skillQueueData] = await Promise.all([
      fetchCharacterSkills(characterId, accessToken),
      fetchSkillQueue(characterId, accessToken),
    ]);

    console.log("Raw skill queue data from ESI:", skillQueueData);

    // Enrich skill queue with skill names
    const enrichedSkillQueue = await enrichSkillQueueWithNames(
      skillQueueData || []
    );

    const response: EVESkillQueueResponse = {
      queue: enrichedSkillQueue,
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
