"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Settings,
  Info,
} from "lucide-react";
import { VisitedSystem, VisitedSystemsResponse } from "@/types/auth";

const SystemMapPage = () => {
  const { user, loading } = useAuth();
  const [systems, setSystems] = useState<VisitedSystem[]>([]);
  const [loadingSystems, setLoadingSystems] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSystem, setSelectedSystem] = useState<VisitedSystem | null>(
    null
  );
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (user && !loading) {
      fetchVisitedSystems();
    }
  }, [user, loading]);

  useEffect(() => {
    if (systems.length > 0) {
      drawMap();
    }
  }, [systems, zoom, pan, selectedSystem]);

  const fetchVisitedSystems = async () => {
    setLoadingSystems(true);
    setError(null);

    try {
      const response = await fetch("/api/visited-systems");
      const data: VisitedSystemsResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch visited systems");
      }

      setSystems(data.systems);
    } catch (error) {
      console.error("Error fetching visited systems:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setLoadingSystems(false);
    }
  };

  const drawMap = () => {
    const canvas = canvasRef.current;
    if (!canvas || systems.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set background
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate bounds
    const positions = systems.map((s) => s.position);
    const minX = Math.min(...positions.map((p) => p.x));
    const maxX = Math.max(...positions.map((p) => p.x));
    const minY = Math.min(...positions.map((p) => p.y));
    const maxY = Math.max(...positions.map((p) => p.y));

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const rangeX = maxX - minX;
    const rangeY = maxY - minY;
    const maxRange = Math.max(rangeX, rangeY);

    // Scale factor to fit the map in canvas
    const scale = (Math.min(canvas.width, canvas.height) / maxRange) * 0.8;

    // Draw connections between systems
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    for (let i = 0; i < systems.length; i++) {
      for (let j = i + 1; j < systems.length; j++) {
        const system1 = systems[i];
        const system2 = systems[j];

        const x1 =
          (system1.position.x - centerX) * scale * zoom +
          canvas.width / 2 +
          pan.x;
        const y1 =
          (system1.position.y - centerY) * scale * zoom +
          canvas.height / 2 +
          pan.y;
        const x2 =
          (system2.position.x - centerX) * scale * zoom +
          canvas.width / 2 +
          pan.x;
        const y2 =
          (system2.position.y - centerY) * scale * zoom +
          canvas.height / 2 +
          pan.y;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    }

    ctx.setLineDash([]);

    // Draw systems
    systems.forEach((system) => {
      const x =
        (system.position.x - centerX) * scale * zoom + canvas.width / 2 + pan.x;
      const y =
        (system.position.y - centerY) * scale * zoom +
        canvas.height / 2 +
        pan.y;

      // Skip if outside canvas
      if (
        x < -50 ||
        x > canvas.width + 50 ||
        y < -50 ||
        y > canvas.height + 50
      ) {
        return;
      }

      // System color based on security status
      let color = "#ef4444"; // Red for low sec
      if (system.security_status >= 0.5) {
        color = "#22c55e"; // Green for high sec
      } else if (system.security_status >= 0.0) {
        color = "#eab308"; // Yellow for low sec
      }

      // Highlight selected system
      if (selectedSystem && selectedSystem.system_id === system.system_id) {
        ctx.fillStyle = "#3b82f6";
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, 2 * Math.PI);
        ctx.fill();
      }

      // Draw system
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();

      // Draw system name
      if (zoom > 0.5) {
        ctx.fillStyle = "#ffffff";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(system.system_name, x, y - 10);
      }
    });
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Find clicked system
    const positions = systems.map((s) => s.position);
    const minX = Math.min(...positions.map((p) => p.x));
    const maxX = Math.max(...positions.map((p) => p.x));
    const minY = Math.min(...positions.map((p) => p.y));
    const maxY = Math.max(...positions.map((p) => p.y));

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const rangeX = maxX - minX;
    const rangeY = maxY - minY;
    const maxRange = Math.max(rangeX, rangeY);
    const scale = (Math.min(canvas.width, canvas.height) / maxRange) * 0.8;

    for (const system of systems) {
      const systemX =
        (system.position.x - centerX) * scale * zoom + canvas.width / 2 + pan.x;
      const systemY =
        (system.position.y - centerY) * scale * zoom +
        canvas.height / 2 +
        pan.y;

      const distance = Math.sqrt((x - systemX) ** 2 + (y - systemY) ** 2);
      if (distance <= 10) {
        setSelectedSystem(system);
        break;
      }
    }
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: event.clientX - pan.x, y: event.clientY - pan.y });
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setPan({
        x: event.clientX - dragStart.x,
        y: event.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedSystem(null);
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
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Interactive Systems Map
          </h1>
          <p className="text-slate-300">
            Visualize your travels in the EVE Online universe
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map Controls */}
          <Card className="bg-white/10 border-white/20 lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-white text-lg">Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  onClick={() => setZoom(zoom * 1.2)}
                  variant="outline"
                  size="sm"
                  className="text-white border-white/30 hover:bg-white/10"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => setZoom(zoom / 1.2)}
                  variant="outline"
                  size="sm"
                  className="text-white border-white/30 hover:bg-white/10"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button
                  onClick={resetView}
                  variant="outline"
                  size="sm"
                  className="text-white border-white/30 hover:bg-white/10"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-sm text-slate-300">
                <p>Zoom: {Math.round(zoom * 100)}%</p>
                <p>Systems: {systems.length}</p>
              </div>

              <Button
                onClick={fetchVisitedSystems}
                disabled={loadingSystems}
                variant="outline"
                size="sm"
                className="w-full text-white border-white/30 hover:bg-white/10"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${
                    loadingSystems ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </Button>
            </CardContent>
          </Card>

          {/* Map Canvas */}
          <Card className="bg-white/10 border-white/20 lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-white text-lg">Systems Map</CardTitle>
              <CardDescription className="text-slate-300">
                Click on a system to see its details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded mb-4">
                  Error: {error}
                </div>
              )}

              {loadingSystems ? (
                <div className="flex items-center justify-center h-96">
                  <div className="flex items-center gap-2 text-slate-400">
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    Loading map...
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    width={800}
                    height={600}
                    className="border border-white/20 rounded cursor-move"
                    onClick={handleCanvasClick}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  />

                  {/* Legend */}
                  <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-sm rounded-lg p-3 text-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-white">High Security</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-white">Low Security</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-white">Null Security</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Selected System Details */}
        {selectedSystem && (
          <Card className="mt-6 bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {selectedSystem.system_name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="text-slate-300 text-sm font-medium mb-2">
                    Security
                  </h4>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`${
                        selectedSystem.security_status >= 0.5
                          ? "bg-green-600"
                          : selectedSystem.security_status >= 0.0
                          ? "bg-yellow-600"
                          : "bg-red-600"
                      } text-white border-white/30`}
                    >
                      {selectedSystem.security_status.toFixed(1)}
                    </Badge>
                    {selectedSystem.security_class && (
                      <Badge variant="secondary" className="text-xs">
                        {selectedSystem.security_class}
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-slate-300 text-sm font-medium mb-2">
                    Visits
                  </h4>
                  <p className="text-white">{selectedSystem.visit_count}</p>
                </div>
                <div>
                  <h4 className="text-slate-300 text-sm font-medium mb-2">
                    Last Visited
                  </h4>
                  <p className="text-white text-sm">
                    {new Date(selectedSystem.last_visited).toLocaleDateString(
                      "en-US"
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SystemMapPage;
