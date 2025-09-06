"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogIn, MapPin, Network, User, Shield, Zap } from "lucide-react";

const Home = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // User is logged in, redirect to character
      router.push("/character");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect to profile
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-6">
            Welcome to EVE Voyager
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
            Explore the EVE Online universe with advanced tracking and
            visualization tools. Monitor your travels, analyze visited systems,
            and navigate the stars like never before.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white/10 border-white/20 hover:bg-white/15 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3">
                <User className="h-8 w-8 text-blue-400" />
                <CardTitle className="text-white text-xl">
                  Character Profile
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-300">
                View detailed information about your EVE Online character,
                including corporation, alliance, and current location data.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 hover:bg-white/15 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3">
                <MapPin className="h-8 w-8 text-green-400" />
                <CardTitle className="text-white text-xl">
                  Visited Systems
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-300">
                Track and analyze all the solar systems you've visited during
                your EVE Online adventures.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 hover:bg-white/15 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Network className="h-8 w-8 text-purple-400" />
                <CardTitle className="text-white text-xl">
                  Interactive Map
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-300">
                Visualize your travels on an interactive 3D map, similar to
                Tripwire and Pathfinder tools.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="bg-white/10 border-white/20 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-white text-2xl mb-2">
                Ready to Explore?
              </CardTitle>
              <CardDescription className="text-slate-300 text-lg">
                Connect with your EVE Online account to start tracking your
                journey through the stars.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => (window.location.href = "/api/auth/eve/login")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg cursor-pointer"
                size="lg"
              >
                <LogIn className="h-5 w-5 mr-2" />
                Connect with EVE Online
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features List */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-white mb-6">Features</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-slate-300">
                <Shield className="h-5 w-5 text-blue-400" />
                Real-time character information
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <MapPin className="h-5 w-5 text-green-400" />
                System visit tracking and history
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <Network className="h-5 w-5 text-purple-400" />
                Interactive 3D system mapping
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <Zap className="h-5 w-5 text-yellow-400" />
                Security status analysis
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-6">
              Getting Started
            </h3>
            <ol className="space-y-4 text-slate-300">
              <li className="flex items-start gap-3">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                  1
                </span>
                Click "Connect with EVE Online" to authenticate
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                  2
                </span>
                Grant the necessary permissions to the application
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                  3
                </span>
                Start exploring your character data and travel history
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
