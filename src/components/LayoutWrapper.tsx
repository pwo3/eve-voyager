"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "./Sidebar";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

const LayoutWrapper = ({ children }: LayoutWrapperProps) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Don't show sidebar on home page for non-logged users
  const isHomePage =
    typeof window !== "undefined" && window.location.pathname === "/";
  const shouldShowSidebar = user || !isHomePage;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {shouldShowSidebar && (
        <Sidebar
          onLogout={
            user
              ? async () => {
                  try {
                    const response = await fetch("/api/auth/eve/logout", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                    });

                    if (response.ok) {
                      // Redirect to home page after successful logout
                      window.location.href = "/";
                    } else {
                      console.error("Logout failed");
                    }
                  } catch (error) {
                    console.error("Logout error:", error);
                  }
                }
              : undefined
          }
        />
      )}
      <div className={shouldShowSidebar ? "lg:ml-64" : ""}>{children}</div>
    </div>
  );
};

export default LayoutWrapper;
