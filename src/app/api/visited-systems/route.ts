import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { VisitedSystemsResponse } from "@/types/auth";

// Mock data for now - in a real implementation, this would come from a database
const mockVisitedSystems: VisitedSystemsResponse = {
  systems: [
    {
      system_id: 1,
      system_name: "Jita",
      security_status: 0.9,
      security_class: "A",
      first_visited: "2024-01-15T10:30:00Z",
      last_visited: "2024-01-20T14:22:00Z",
      visit_count: 15,
      position: { x: -1.3e17, y: 6.1e16, z: 1.5e17 },
      constellation_id: 20000020,
      region_id: 10000002,
    },
    {
      system_id: 2,
      system_name: "Amarr",
      security_status: 0.9,
      security_class: "A",
      first_visited: "2024-01-16T08:15:00Z",
      last_visited: "2024-01-19T16:45:00Z",
      visit_count: 8,
      position: { x: 1.1e17, y: 1.2e17, z: -1.1e17 },
      constellation_id: 20000020,
      region_id: 10000043,
    },
    {
      system_id: 3,
      system_name: "Dodixie",
      security_status: 0.8,
      security_class: "B",
      first_visited: "2024-01-17T12:00:00Z",
      last_visited: "2024-01-18T09:30:00Z",
      visit_count: 3,
      position: { x: 1.7e17, y: 1.1e17, z: -1.1e17 },
      constellation_id: 20000020,
      region_id: 10000032,
    },
    {
      system_id: 4,
      system_name: "Rens",
      security_status: 0.8,
      security_class: "B",
      first_visited: "2024-01-18T14:20:00Z",
      last_visited: "2024-01-20T11:10:00Z",
      visit_count: 5,
      position: { x: 1.2e17, y: 1.3e17, z: -1.0e17 },
      constellation_id: 20000020,
      region_id: 10000030,
    },
    {
      system_id: 5,
      system_name: "Hek",
      security_status: 0.7,
      security_class: "C",
      first_visited: "2024-01-19T16:00:00Z",
      last_visited: "2024-01-20T13:25:00Z",
      visit_count: 2,
      position: { x: 1.4e17, y: 1.0e17, z: -1.2e17 },
      constellation_id: 20000020,
      region_id: 10000042,
    },
  ],
  total_count: 5,
  last_updated: "2024-01-20T13:25:00Z",
};

export async function GET(request: NextRequest) {
  try {
    // In a real implementation, you would:
    // 1. Get the user session
    // 2. Verify the user is authenticated
    // 3. Query the database for visited systems
    // 4. Return the actual data

    // For now, return mock data
    return NextResponse.json(mockVisitedSystems);
  } catch (error) {
    console.error("Error fetching visited systems:", error);
    return NextResponse.json(
      { error: "Failed to fetch visited systems" },
      { status: 500 }
    );
  }
}
