"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RefreshCw, Search, BookOpen, Clock, Star } from "lucide-react";
import { EVESkill, EVESkillsResponse } from "@/types/auth";

export default function SkillsPage() {
  const [skills, setSkills] = useState<EVESkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof EVESkill>("skill_name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [totalSP, setTotalSP] = useState(0);
  const [unallocatedSP, setUnallocatedSP] = useState(0);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/character/skills");
      const data: EVESkillsResponse = await response.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      setSkills(data.skills || []);
      setTotalSP(data.total_sp || 0);
      setUnallocatedSP(data.unallocated_sp || 0);
    } catch (error) {
      console.error("Error fetching skills:", error);
      setError("Failed to fetch skills data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const filteredSkills = skills.filter((skill) =>
    skill.skill_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedSkills = [...filteredSkills].sort((a, b) => {
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

  const handleSort = (field: keyof EVESkill) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSkillLevelColor = (level: number) => {
    if (level === 5) return "bg-purple-600";
    if (level === 4) return "bg-blue-600";
    if (level === 3) return "bg-green-600";
    if (level === 2) return "bg-yellow-600";
    return "bg-gray-600";
  };

  const formatSP = (sp: number) => {
    if (sp >= 1000000) {
      return `${(sp / 1000000).toFixed(1)}M`;
    }
    if (sp >= 1000) {
      return `${(sp / 1000).toFixed(1)}K`;
    }
    return sp.toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-2 text-slate-400">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span>Loading skills...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Character Skills
          </h1>
          <p className="text-slate-400">
            View and manage your character's skill training progress
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm font-medium flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-400" />
                Total Skill Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {formatSP(totalSP)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-400" />
                Unallocated SP
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {formatSP(unallocatedSP)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-green-400" />
                Skills Trained
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {skills.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-600 text-white placeholder-slate-400"
            />
          </div>
          <Button
            onClick={fetchSkills}
            className="bg-slate-800/50 text-white border-slate-600 hover:bg-slate-700/50 cursor-pointer"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Skills Table */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Skills List</CardTitle>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-red-400 text-center py-8">
                <p>Error: {error}</p>
                <Button
                  onClick={fetchSkills}
                  className="mt-4 bg-slate-800/50 text-white border-slate-600 hover:bg-slate-700/50 cursor-pointer"
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead
                        className="text-slate-300 cursor-pointer hover:text-white"
                        onClick={() => handleSort("skill_name")}
                      >
                        Skill Name
                        {sortField === "skill_name" && (
                          <span className="ml-1">
                            {sortDirection === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </TableHead>
                      <TableHead
                        className="text-slate-300 cursor-pointer hover:text-white"
                        onClick={() => handleSort("active_skill_level")}
                      >
                        Level
                        {sortField === "active_skill_level" && (
                          <span className="ml-1">
                            {sortDirection === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </TableHead>
                      <TableHead
                        className="text-slate-300 cursor-pointer hover:text-white"
                        onClick={() => handleSort("skillpoints_in_skill")}
                      >
                        Skill Points
                        {sortField === "skillpoints_in_skill" && (
                          <span className="ml-1">
                            {sortDirection === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </TableHead>
                      <TableHead className="text-slate-300">Progress</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedSkills.map((skill) => (
                      <TableRow
                        key={skill.skill_id}
                        className="border-slate-700"
                      >
                        <TableCell className="text-white font-medium">
                          {skill.skill_name}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${getSkillLevelColor(
                              skill.active_skill_level
                            )} text-white border-white/30`}
                          >
                            Level {skill.active_skill_level}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {formatSP(skill.skillpoints_in_skill)}
                        </TableCell>
                        <TableCell>
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getSkillLevelColor(
                                skill.active_skill_level
                              )}`}
                              style={{
                                width: `${
                                  (skill.active_skill_level / 5) * 100
                                }%`,
                              }}
                            ></div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
