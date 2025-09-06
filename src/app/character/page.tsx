"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  UserCircle,
  Shield,
  Zap,
  Calendar,
  Building,
  Users,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { EVELocationResponse, EVEProfileResponse } from "@/types/auth";

const CharacterPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [location, setLocation] = useState<EVELocationResponse | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<EVEProfileResponse | null>(
    null
  );
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  // Fetch location automatically when user is loaded
  useEffect(() => {
    if (user && !location && !locationLoading) {
      fetchLocation();
    }
  }, [user, location, locationLoading]);

  // Fetch profile data automatically when user is loaded
  useEffect(() => {
    if (user && !profileData && !profileLoading) {
      fetchProfileData();
    }
  }, [user, profileData, profileLoading]);

  const fetchLocation = async () => {
    if (!user) return;

    setLocationLoading(true);
    setLocationError(null);

    try {
      const response = await fetch("/api/location");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch location");
      }

      setLocation(data);
    } catch (error) {
      console.error("Error fetching location:", error);
      setLocationError(
        error instanceof Error ? error.message : "Unknown error"
      );
    } finally {
      setLocationLoading(false);
    }
  };

  const fetchProfileData = async () => {
    try {
      setProfileLoading(true);
      setProfileError(null);

      const response = await fetch("/api/profile");
      if (!response.ok) {
        throw new Error("Failed to fetch profile data");
      }

      const data: EVEProfileResponse = await response.json();
      setProfileData(data);
    } catch (error) {
      console.error("Error fetching profile data:", error);
      setProfileError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setProfileLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Show loader while data is being fetched
  const isDataLoading = profileLoading || locationLoading;
  const hasData = profileData && location;
  const hasErrors = profileError || locationError;

  if (isDataLoading && !hasData && !hasErrors) {
    return (
      <div className="min-h-screen bg-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              <div className="text-slate-300 text-lg">
                Loading character data...
              </div>
              <div className="text-slate-400 text-sm">
                Fetching profile and location information
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Character Profile
          </h1>
          <p className="text-slate-300">
            Information about your EVE Online character
          </p>
          {isDataLoading && (
            <div className="mt-2 flex items-center gap-2 text-slate-400 text-sm">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Updating data...</span>
            </div>
          )}
        </div>

        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={`https://images.evetech.net/characters/${user.character_id}/portrait`}
                />
                <AvatarFallback>
                  <UserCircle className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-white text-3xl mb-2">
                  {user.character_name}
                </CardTitle>
                <CardDescription className="text-slate-300 text-lg">
                  EVE Online Character
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Status */}
              <div className="space-y-4">
                <h3 className="text-white text-lg font-semibold mb-3">
                  Status
                </h3>
                {profileData && (
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        profileData.online_status
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    ></div>
                    <span className="text-slate-300">Status:</span>
                    <Badge
                      variant="outline"
                      className={`${
                        profileData.online_status
                          ? "bg-green-600"
                          : "bg-red-600"
                      } text-white border-white/30`}
                    >
                      {profileData.online_status ? "Online" : "Offline"}
                    </Badge>
                  </div>
                )}
                {profileData && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-400" />
                    <span className="text-slate-300">Birthday:</span>
                    <span className="text-white">
                      {new Date(
                        profileData.character.birthday
                      ).toLocaleDateString("en-US")}
                    </span>
                  </div>
                )}
                {profileError && (
                  <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded">
                    Error: {profileError}
                  </div>
                )}
                {profileLoading && (
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Loading profile data...
                  </div>
                )}
              </div>

              {/* Corporation */}
              <div className="space-y-4">
                <h3 className="text-white text-lg font-semibold mb-3">
                  Corporation
                </h3>

                {profileData && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center">
                        <Building className="h-6 w-6 text-blue-400" />
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          {profileData.corporation.name}
                        </div>
                        <div className="text-slate-400 text-sm">
                          Ticker:{" "}
                          <span className="text-blue-300 font-mono">
                            [{profileData.corporation.ticker}]
                          </span>
                        </div>
                      </div>
                    </div>
                    {profileData.corporation.member_count && (
                      <div className="text-slate-300 text-sm">
                        Members:{" "}
                        {profileData.corporation.member_count.toLocaleString()}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Alliance */}
              <div className="space-y-4">
                <h3 className="text-white text-lg font-semibold mb-3">
                  Alliance
                </h3>

                {profileData?.alliance ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center">
                        <Users className="h-6 w-6 text-orange-400" />
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          {profileData.alliance.name}
                        </div>
                        <div className="text-slate-400 text-sm">
                          Ticker:{" "}
                          <span className="text-orange-300 font-mono">
                            [{profileData.alliance.ticker}]
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-400 text-sm">No alliance</div>
                )}
              </div>

              {/* Location Information */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white text-lg font-semibold">
                    Current Location
                  </h3>
                </div>

                {locationError && (
                  <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded">
                    Error: {locationError}
                  </div>
                )}

                {location && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-400 flex-shrink-0" />
                      <span className="text-slate-300 w-32">Solar System:</span>
                      <Badge className="bg-blue-600">
                        {location.solar_system?.name ||
                          `ID: ${location.location.solar_system_id}`}
                      </Badge>
                    </div>

                    {location.solar_system && (
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-4"></div>
                          <span className="text-slate-300 w-32">
                            Security Status:
                          </span>
                          <span className="text-white font-medium">
                            {location.solar_system.security_status.toFixed(1)}
                          </span>
                        </div>
                        {location.solar_system.security_class && (
                          <div className="flex items-center gap-2">
                            <div className="w-4"></div>
                            <span className="text-slate-300 w-32">
                              Security Class:
                            </span>
                            <span className="text-white font-medium">
                              {location.solar_system.security_class}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {location.station && (
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-green-400 flex-shrink-0" />
                        <span className="text-slate-300 w-32">Docked at:</span>
                        <Badge className="bg-green-600">
                          {location.station.name}
                        </Badge>
                      </div>
                    )}

                    {location.structure && (
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-purple-400 flex-shrink-0" />
                        <span className="text-slate-300 w-32">Docked at:</span>
                        <Badge className="bg-purple-600">
                          {location.structure.name}
                        </Badge>
                      </div>
                    )}

                    {!location.station && !location.structure && (
                      <div className="text-slate-400 text-sm ml-6">
                        Currently in space
                      </div>
                    )}
                  </div>
                )}

                {!location && !locationLoading && !locationError && (
                  <div className="text-slate-400 text-sm">
                    Loading location...
                  </div>
                )}

                {locationLoading && (
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Loading location...
                  </div>
                )}
              </div>

              {/* Current Ship */}
              <div className="space-y-4">
                <h3 className="text-white text-lg font-semibold mb-3">
                  Current Ship
                </h3>
                {profileData?.ship ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center">
                        <Shield className="h-6 w-6 text-yellow-400" />
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          {profileData.ship.ship_name}
                        </div>
                        <div className="text-slate-400 text-sm">
                          {profileData.ship.ship_type_name}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-400 text-sm">
                    No ship information available
                  </div>
                )}
              </div>

              {/* Scopes and Permissions */}
              <div className="space-y-4">
                <h3 className="text-white text-lg font-semibold mb-3">
                  Permissions
                </h3>

                <div className="space-y-2">
                  <span className="text-slate-300 text-sm">
                    Granted scopes:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {user.scopes.map((scope, index) => (
                      <Badge key={index} className="bg-green-600 text-xs">
                        {scope}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-slate-300 text-sm">Owner hash:</span>
                  <div className="text-white text-xs font-mono bg-black/20 p-2 rounded mt-1 break-all">
                    {user.character_owner_hash}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CharacterPage;
