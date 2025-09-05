// Types for EVE Online SSO authentication

export interface EVEUser {
  character_id: number;
  character_name: string;
  character_owner_hash: string;
  corporation_id?: number;
  alliance_id?: number;
  faction_id?: number;
  scopes: string[];
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

export interface EVETokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

export interface EVECharacterInfo {
  CharacterID: number;
  CharacterName: string;
  ExpiresOn: string;
  Scopes: string;
  TokenType: string;
  CharacterOwnerHash: string;
}

export interface EVEVerifyResponse {
  CharacterID: number;
  CharacterName: string;
  ExpiresOn: string;
  Scopes: string;
  TokenType: string;
  CharacterOwnerHash: string;
  IntellectualProperty: string;
}

export interface AuthSession {
  user: EVEUser;
  accessToken: string;
  expires: Date;
}

// Types for EVE Online location data
export interface EVELocation {
  solar_system_id: number;
  station_id?: number;
  structure_id?: number;
}

export interface EVESolarSystem {
  system_id: number;
  name: string;
  security_class?: string;
  security_status: number;
  constellation_id: number;
  star_id?: number;
  position: {
    x: number;
    y: number;
    z: number;
  };
}

export interface EVEStation {
  station_id: number;
  name: string;
  system_id: number;
  type_id: number;
  race_id?: number;
  owner?: number;
  position: {
    x: number;
    y: number;
    z: number;
  };
  reprocessing_efficiency?: number;
  reprocessing_stations_take?: number;
  max_dockable_ship_volume?: number;
  office_rental_cost?: number;
  services: string[];
}

export interface EVEStructure {
  structure_id: number;
  name: string;
  system_id: number;
  type_id: number;
  position: {
    x: number;
    y: number;
    z: number;
  };
  services: string[];
  state: string;
  unanchors_at?: string;
}

export interface EVELocationResponse {
  location: EVELocation;
  solar_system?: EVESolarSystem;
  station?: EVEStation;
  structure?: EVEStructure;
}

// Types for visited systems tracking
export interface VisitedSystem {
  system_id: number;
  system_name: string;
  security_status: number;
  security_class?: string;
  first_visited: string;
  last_visited: string;
  visit_count: number;
  position: {
    x: number;
    y: number;
    z: number;
  };
  constellation_id: number;
  region_id?: number;
}

export interface VisitedSystemsResponse {
  systems: VisitedSystem[];
  total_count: number;
  last_updated: string;
  error?: string;
}
