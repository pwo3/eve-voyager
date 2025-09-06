"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  User,
  MapPin,
  Network,
  Menu,
  X,
  LogOut,
  BookOpen,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  onLogout?: () => Promise<void>;
}

const Sidebar = ({ onLogout }: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const [characterExpanded, setCharacterExpanded] = useState(true);
  const { user } = useAuth();

  const navigation = [
    {
      name: "Character",
      href: "/character",
      icon: User,
      subItems: [
        {
          name: "Skills",
          href: "/character/skills",
          icon: BookOpen,
        },
      ],
    },
    {
      name: "Visited Systems",
      href: "/visited-systems",
      icon: MapPin,
    },
    {
      name: "Interactive Map",
      href: "/system-map",
      icon: Network,
    },
  ];

  const isActive = (href: string) => pathname === href;
  const isCharacterActive = () => pathname === "/character";
  const isCharacterSectionActive = () => pathname.startsWith("/character");

  // Keep character menu open by default, only close if user manually closes it
  // No automatic closing when navigating to other pages

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-slate-800/50 text-white hover:bg-slate-700/50 border border-slate-600 cursor-pointer"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 h-full w-64 bg-slate-900/95 backdrop-blur-sm border-r border-white/10 z-50 transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <h1 className="text-xl font-bold text-white">EVE Voyager</h1>
            {user && (
              <p className="text-sm text-slate-300 mt-1">
                {user.character_name}
              </p>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const isItemActive = isActive(item.href);

              return (
                <div key={item.name}>
                  {hasSubItems ? (
                    <div>
                      <div
                        className={cn(
                          "flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                          isItemActive
                            ? "bg-blue-600 text-white"
                            : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                        )}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 flex-1 cursor-pointer"
                        >
                          <Icon className="h-5 w-5" />
                          {item.name}
                        </Link>
                        <button
                          onClick={() =>
                            setCharacterExpanded(!characterExpanded)
                          }
                          className="p-1 hover:bg-white/10 rounded cursor-pointer"
                        >
                          {characterExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {characterExpanded && (
                        <div className="ml-6 mt-1 space-y-1">
                          {item.subItems.map((subItem) => {
                            const SubIcon = subItem.icon;
                            return (
                              <Link
                                key={subItem.name}
                                href={subItem.href}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                                  isActive(subItem.href)
                                    ? "bg-blue-600 text-white"
                                    : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                                )}
                              >
                                <SubIcon className="h-4 w-4" />
                                {subItem.name}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                        isActive(item.href)
                          ? "bg-blue-600 text-white"
                          : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/10">
            <Button
              onClick={onLogout}
              variant="ghost"
              className="w-full justify-start text-slate-300 hover:bg-slate-700/50 hover:text-white cursor-pointer"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
