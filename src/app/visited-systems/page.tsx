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
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MapPin,
  Shield,
  Calendar,
  RefreshCw,
  Search,
  Filter,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { VisitedSystem, VisitedSystemsResponse } from "@/types/auth";

const VisitedSystemsPage = () => {
  const { user, loading } = useAuth();
  const [systems, setSystems] = useState<VisitedSystem[]>([]);
  const [loadingSystems, setLoadingSystems] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] =
    useState<keyof VisitedSystem>("last_visited");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    if (user && !loading) {
      fetchVisitedSystems();
    }
  }, [user, loading]);

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

  const filteredSystems = systems.filter((system) =>
    system.system_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedSystems = [...filteredSystems].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  const handleSort = (field: keyof VisitedSystem) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSecurityBadgeVariant = (security: number) => {
    if (security >= 0.5) return "default";
    if (security >= 0.0) return "secondary";
    return "destructive";
  };

  const getSecurityBadgeColor = (security: number) => {
    if (security >= 0.5) return "bg-green-600";
    if (security >= 0.0) return "bg-yellow-600";
    return "bg-red-600";
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
            Visited Systems
          </h1>
          <p className="text-slate-300">
            History of your travels in the EVE Online universe
          </p>
        </div>

        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <CardTitle className="text-white">
                  Systems List ({systems.length})
                </CardTitle>
                <CardDescription className="text-slate-300">
                  {filteredSystems.length} system(s) matching your search
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={fetchVisitedSystems}
                  disabled={loadingSystems}
                  variant="outline"
                  size="sm"
                  className="text-white border-white/30 hover:bg-white/10"
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${
                      loadingSystems ? "animate-spin" : ""
                    }`}
                  />
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search and filters */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search for a system..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-slate-400"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded mb-6">
                Error: {error}
              </div>
            )}

            {loadingSystems ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-2 text-slate-400">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  Loading systems...
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10">
                      <TableHead className="text-slate-300">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("system_name")}
                          className="text-slate-300 hover:text-white p-0 h-auto font-semibold"
                        >
                          System
                          {sortField === "system_name" &&
                            (sortDirection === "asc" ? (
                              <SortAsc className="ml-2 h-4 w-4" />
                            ) : (
                              <SortDesc className="ml-2 h-4 w-4" />
                            ))}
                        </Button>
                      </TableHead>
                      <TableHead className="text-slate-300">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("security_status")}
                          className="text-slate-300 hover:text-white p-0 h-auto font-semibold"
                        >
                          Security
                          {sortField === "security_status" &&
                            (sortDirection === "asc" ? (
                              <SortAsc className="ml-2 h-4 w-4" />
                            ) : (
                              <SortDesc className="ml-2 h-4 w-4" />
                            ))}
                        </Button>
                      </TableHead>
                      <TableHead className="text-slate-300">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("visit_count")}
                          className="text-slate-300 hover:text-white p-0 h-auto font-semibold"
                        >
                          Visits
                          {sortField === "visit_count" &&
                            (sortDirection === "asc" ? (
                              <SortAsc className="ml-2 h-4 w-4" />
                            ) : (
                              <SortDesc className="ml-2 h-4 w-4" />
                            ))}
                        </Button>
                      </TableHead>
                      <TableHead className="text-slate-300">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("last_visited")}
                          className="text-slate-300 hover:text-white p-0 h-auto font-semibold"
                        >
                          Last Visited
                          {sortField === "last_visited" &&
                            (sortDirection === "asc" ? (
                              <SortAsc className="ml-2 h-4 w-4" />
                            ) : (
                              <SortDesc className="ml-2 h-4 w-4" />
                            ))}
                        </Button>
                      </TableHead>
                      <TableHead className="text-slate-300">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("first_visited")}
                          className="text-slate-300 hover:text-white p-0 h-auto font-semibold"
                        >
                          First Visited
                          {sortField === "first_visited" &&
                            (sortDirection === "asc" ? (
                              <SortAsc className="ml-2 h-4 w-4" />
                            ) : (
                              <SortDesc className="ml-2 h-4 w-4" />
                            ))}
                        </Button>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedSystems.map((system) => (
                      <TableRow
                        key={system.system_id}
                        className="border-white/10 hover:bg-white/5"
                      >
                        <TableCell className="text-white font-medium">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-blue-400" />
                            {system.system_name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={`${getSecurityBadgeColor(
                                system.security_status
                              )} text-white border-white/30`}
                            >
                              {system.security_status.toFixed(1)}
                            </Badge>
                            {system.security_class && (
                              <Badge variant="secondary" className="text-xs">
                                {system.security_class}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-white">
                          {system.visit_count}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {new Date(system.last_visited).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {new Date(system.first_visited).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {sortedSystems.length === 0 && !loadingSystems && (
                  <div className="text-center py-12">
                    <MapPin className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-400 text-lg">
                      {searchTerm ? "No systems found" : "No systems visited"}
                    </p>
                    {searchTerm && (
                      <p className="text-slate-500 text-sm mt-2">
                        Try modifying your search
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VisitedSystemsPage;
