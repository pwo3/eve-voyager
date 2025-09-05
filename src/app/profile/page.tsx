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
import { EVELocationResponse } from "@/types/auth";

const ProfilePage = () => {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [location, setLocation] = useState<EVELocationResponse | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

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
              <div className="space-y-4">
                <h3 className="text-white text-lg font-semibold mb-3">
                  Basic Information
                </h3>

                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-400" />
                  <span className="text-slate-300">Character ID:</span>
                  <Badge
                    variant="outline"
                    className="text-white border-white/30"
                  >
                    {user.character_id}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-400" />
                  <span className="text-slate-300">Token type:</span>
                  <Badge variant="secondary">{user.token_type}</Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-green-400" />
                  <span className="text-slate-300">Expires in:</span>
                  <span className="text-white">
                    {Math.floor(user.expires_in / 3600)}h{" "}
                    {Math.floor((user.expires_in % 3600) / 60)}m
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-white text-lg font-semibold mb-3">
                  Organization
                </h3>

                {user.corporation_id && (
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-300">Corporation ID:</span>
                    <Badge
                      variant="outline"
                      className="text-white border-white/30"
                    >
                      {user.corporation_id}
                    </Badge>
                  </div>
                )}

                {user.alliance_id && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-orange-400" />
                    <span className="text-slate-300">Alliance ID:</span>
                    <Badge
                      variant="outline"
                      className="text-white border-white/30"
                    >
                      {user.alliance_id}
                    </Badge>
                  </div>
                )}

                {user.faction_id && (
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-red-400" />
                    <span className="text-slate-300">Faction ID:</span>
                    <Badge
                      variant="outline"
                      className="text-white border-white/30"
                    >
                      {user.faction_id}
                    </Badge>
                  </div>
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
                        <span className="text-slate-300 w-32">Station:</span>
                        <Badge className="bg-green-600">
                          {location.station.name}
                        </Badge>
                      </div>
                    )}

                    {location.structure && (
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-purple-400 flex-shrink-0" />
                        <span className="text-slate-300 w-32">Structure:</span>
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

export default ProfilePage;
