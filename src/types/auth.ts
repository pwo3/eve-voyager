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
