"use client";

import { useState, useEffect } from "react";
import { LogIn, LogOut, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";

const Home = () => {
  const {
    user,
    loading: authLoading,
    login,
    logout,
    refreshSession,
  } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const loginStatus = urlParams.get("login");
    const errorParam = urlParams.get("error");

    if (loginStatus === "success") {
      refreshSession();

      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (errorParam) {
      setError(`Erreur de connexion: ${errorParam}`);

      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [refreshSession]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex justify-between items-center mb-8">
            <div></div>
            <h1 className="text-4xl font-bold text-white">EVE Voyager</h1>
            <div className="flex items-center gap-2">
              {user ? (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => (window.location.href = "/profile")}
                    variant="ghost"
                    className="text-white hover:bg-white/20 p-1"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={`https://images.evetech.net/characters/${user.character_id}/portrait`}
                      />
                      <AvatarFallback>
                        <UserCircle className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                  <span className="text-white text-sm">
                    {user.character_name}
                  </span>
                  <Button
                    onClick={logout}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={login}
                  className="bg-slate-600 hover:bg-slate-700 text-white"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Connexion EVE
                </Button>
              )}
            </div>
          </div>

          <p className="text-xl text-slate-300 mb-8">
            Connect with your EVE Online account to explore the universe
          </p>
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-6">
            <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
              <p className="text-red-400 text-center">{error}</p>
            </div>
          </div>
        )}

        {/* Welcome Message */}
        {!user && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white/10 border border-white/20 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-4">
                Welcome to EVE Voyager
              </h2>
              <p className="text-slate-300 mb-6">
                Connect with your EVE Online account to access your profile and
                explore the application features.
              </p>
              <Button
                onClick={login}
                className="bg-slate-600 hover:bg-slate-700 text-white px-8 py-3 text-lg"
              >
                <LogIn className="h-5 w-5 mr-2" />
                Connect with EVE Online
              </Button>
            </div>
          </div>
        )}

        {user && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white/10 border border-white/20 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-4">
                Welcome, {user.character_name}!
              </h2>
              <p className="text-slate-300 mb-6">
                You are successfully connected. Access your profile to see your
                detailed information.
              </p>
              <Button
                onClick={() => (window.location.href = "/profile")}
                className="bg-slate-600 hover:bg-slate-700 text-white px-8 py-3 text-lg"
              >
                View my profile
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
