"use client";

import { useEffect } from "react";
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
} from "lucide-react";
import { useRouter } from "next/navigation";

const ProfilePage = () => {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <Button
            onClick={() => router.push("/")}
            variant="ghost"
            className="text-white hover:bg-white/20"
          >
            ← Back
          </Button>
          <Button
            onClick={logout}
            variant="ghost"
            className="text-white hover:bg-white/20"
          >
            Logout
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
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
    </div>
  );
};

export default ProfilePage;
