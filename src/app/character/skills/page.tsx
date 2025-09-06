"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, BookOpen, Pause, Info } from "lucide-react";
import { EVESkillQueueItem, EVESkillQueueResponse } from "@/types/auth";

export default function SkillsPage() {
  const [skillQueue, setSkillQueue] = useState<EVESkillQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSkillQueue = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/character/skills");
      const data: EVESkillQueueResponse = await response.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      setSkillQueue(data.queue || []);
    } catch (error) {
      console.error("Error fetching skill queue:", error);
      setError("Failed to fetch skill queue data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkillQueue();
  }, []);

  const formatTime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const parts = [];
    if (days > 0) parts.push(`${days}D`);
    if (hours > 0) parts.push(`${hours}H`);
    if (minutes > 0) parts.push(`${minutes}M`);
    if (remainingSeconds > 0 || parts.length === 0)
      parts.push(`${remainingSeconds}S`);

    return parts.join(" ");
  };

  const getTotalTrainingTime = () => {
    if (skillQueue.length === 0) return 0;

    const now = new Date().getTime();
    const lastSkill = skillQueue[skillQueue.length - 1];
    const finishTime = new Date(lastSkill.finish_date).getTime();

    if (isNaN(finishTime) || isNaN(now)) return 0;

    const remainingMs = finishTime - now;
    const remainingSeconds = Math.floor(remainingMs / 1000);

    return Math.max(0, remainingSeconds);
  };

  const getOverallProgress = () => {
    if (skillQueue.length === 0) return { currentSkill: null };

    const now = new Date().getTime();

    // Find currently training skill
    const currentSkill = skillQueue.find((skill) => {
      const skillStart = new Date(skill.start_date).getTime();
      const skillFinish = new Date(skill.finish_date).getTime();
      return now >= skillStart && now < skillFinish;
    });

    return { currentSkill };
  };

  const getTimeRemaining = (item: EVESkillQueueItem) => {
    const start = new Date(item.start_date).getTime();
    const finish = new Date(item.finish_date).getTime();

    if (isNaN(finish) || isNaN(start)) return 0;

    const remainingMs = finish - start;
    const remainingSeconds = Math.floor(remainingMs / 1000);

    return Math.max(0, remainingSeconds);
  };

  const getCurrentSkillTimeRemaining = (item: EVESkillQueueItem) => {
    const now = new Date().getTime();
    const finish = new Date(item.finish_date).getTime();

    if (isNaN(finish) || isNaN(now)) return 0;

    const remainingMs = finish - now;
    const remainingSeconds = Math.floor(remainingMs / 1000);

    return Math.max(0, remainingSeconds);
  };

  const isCurrentlyTraining = (item: EVESkillQueueItem) => {
    const now = new Date().getTime();
    const start = new Date(item.start_date).getTime();
    const finish = new Date(item.finish_date).getTime();

    return now >= start && now < finish;
  };

  const getLevelProgress = (item: EVESkillQueueItem) => {
    const now = new Date().getTime();
    const start = new Date(item.start_date).getTime();
    const finish = new Date(item.finish_date).getTime();

    if (isNaN(start) || isNaN(finish) || isNaN(now)) return 0;
    if (now <= start) return 0;
    if (now >= finish) return 1;

    const totalTime = finish - start;
    const elapsedTime = now - start;

    return Math.min(1, Math.max(0, elapsedTime / totalTime));
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
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header - EVE Style */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-100">Training Queue</h1>
        </div>

        {/* Overall Progress Info - EVE Style */}
        {skillQueue.length > 0 &&
          (() => {
            const { currentSkill } = getOverallProgress();
            return (
              <div className="mb-6 bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold text-gray-100">
                      Training Status
                    </h2>
                    <span className="text-sm text-gray-400 bg-gray-700 px-2 py-1 rounded">
                      {skillQueue.length} skill
                      {skillQueue.length !== 1 ? "s" : ""} in queue
                    </span>
                    {currentSkill && (
                      <span className="text-sm text-blue-400 bg-blue-500/20 px-2 py-1 rounded">
                        Currently: {currentSkill.skill_name} (Level{" "}
                        {currentSkill.finished_level})
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-mono text-blue-400">
                      {formatTime(getTotalTrainingTime())}
                    </div>
                    <div className="text-xs text-gray-400">
                      Completes:{" "}
                      {skillQueue.length > 0
                        ? new Date(
                            skillQueue[skillQueue.length - 1].finish_date
                          ).toLocaleDateString()
                        : "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

        {/* Skill Queue List - EVE Style */}
        <div className="bg-gray-800 rounded-lg">
          {error ? (
            <div className="text-red-400 text-center py-8">
              <p>Error: {error}</p>
              <Button
                onClick={fetchSkillQueue}
                className="mt-4 bg-gray-700 hover:bg-gray-600 text-gray-200"
              >
                Try Again
              </Button>
            </div>
          ) : skillQueue.length === 0 ? (
            <div className="text-gray-400 text-center py-12">
              <Pause className="h-16 w-16 mx-auto mb-4 text-gray-500" />
              <p className="text-xl mb-2">No skills in queue</p>
              <p className="text-sm">
                Add skills to your training queue to see them here
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {skillQueue.map((item) => {
                const isCurrentlyTrainingSkill = isCurrentlyTraining(item);
                return (
                  <div
                    key={`${item.skill_id}-${item.queue_position}`}
                    className={`p-4 hover:bg-gray-750 transition-colors ${
                      isCurrentlyTrainingSkill ? "bg-blue-900/20" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Skill Icon - Small square like in EVE */}
                      <div
                        className={`w-6 h-6 rounded-sm flex items-center justify-center ${
                          isCurrentlyTrainingSkill
                            ? "bg-blue-500"
                            : "bg-gray-500"
                        }`}
                      >
                        <BookOpen className="h-4 w-4 text-gray-300" />
                      </div>

                      {/* Skill Name and Level */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3
                            className={`font-medium truncate ${
                              isCurrentlyTrainingSkill
                                ? "text-blue-300"
                                : "text-gray-100"
                            }`}
                          >
                            {item.skill_name}
                          </h3>
                          <span className="text-gray-400 text-sm">
                            Level {item.finished_level}
                          </span>
                          {isCurrentlyTrainingSkill && (
                            <span className="text-blue-400 text-xs font-semibold px-2 py-1 bg-blue-500/20 rounded">
                              TRAINING
                            </span>
                          )}
                        </div>

                        {/* Time Remaining */}
                        <div
                          className={`text-sm font-mono mb-2 ${
                            isCurrentlyTrainingSkill
                              ? "text-blue-300"
                              : "text-gray-400"
                          }`}
                        >
                          {isCurrentlyTrainingSkill
                            ? formatTime(getCurrentSkillTimeRemaining(item))
                            : formatTime(getTimeRemaining(item))}
                        </div>

                        {/* Progress Bar - Only for currently training skill */}
                        {isCurrentlyTrainingSkill && (
                          <div className="mb-3">
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${getLevelProgress(item) * 100}%`,
                                }}
                              />
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {Math.round(getLevelProgress(item) * 100)}%
                              complete
                            </div>
                          </div>
                        )}

                        {/* Level Progress Squares - EVE Style */}
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((level) => {
                            const isCompleted = level < item.finished_level;
                            const isCurrent = level === item.finished_level;
                            const progress = isCurrent
                              ? getLevelProgress(item)
                              : 0;

                            return (
                              <div
                                key={level}
                                className={`w-3 h-3 rounded-sm relative overflow-hidden ${
                                  isCompleted ? "bg-blue-500" : "bg-gray-600"
                                }`}
                              >
                                {isCurrent && progress > 0 && (
                                  <div
                                    className="absolute inset-0 bg-blue-500"
                                    style={{ width: `${progress * 100}%` }}
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Info Icon */}
                      <button className="p-1 hover:bg-gray-600 rounded-full">
                        <Info className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
