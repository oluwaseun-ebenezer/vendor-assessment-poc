import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProject } from "@/hooks/useProject";
import { useProjects } from "@/api/projects";
import { useTasks } from "@/api/tasks";
import {
  Bell, LogOut, LayoutDashboard, BarChart3, CheckSquare,
  Users, FolderKanban, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Building2,
} from "lucide-react";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const { currentProject, setCurrentProject } = useProject();
  const { data: projects } = useProjects();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const { data: tasks } = useTasks({ status: "open" });
  const openTasksCount = tasks?.length || 0;

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/projects", label: "Projects", icon: FolderKanban },
    { path: "/metrics", label: "Metrics", icon: BarChart3 },
    { path: "/tasks", label: "Tasks", icon: CheckSquare, badge: openTasksCount },
    ...(user?.role === "admin"
      ? [{ path: "/admin/users", label: "Users", icon: Users }]
      : []),
  ];

  const roleColors: Record<string, string> = {
    admin: "bg-red-500",
    procurement: "bg-blue-500",
    it_security: "bg-purple-500",
    legal: "bg-amber-500",
    ai_innovation: "bg-emerald-500",
  };

  const roleLabels: Record<string, string> = {
    admin: "Admin",
    procurement: "Procurement",
    it_security: "IT Security",
    legal: "Legal",
    ai_innovation: "AI Innovation",
  };

  return (
    <div className="flex h-screen bg-[#F4F5F7] overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`flex flex-col bg-[#1C1C2E] text-white transition-all duration-300 ${
          collapsed ? "w-16" : "w-64"
        } flex-shrink-0`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <img src="/carlsberg-logo.svg" alt="Carlsberg" className="h-8" />
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 rounded-full bg-[#D4002A] flex items-center justify-center mx-auto">
              <Building2 className="h-4 w-4 text-white" />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-white/50 hover:text-white transition-colors ml-auto"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Project switcher */}
        {!collapsed && (
          <div className="px-3 pb-2">
            <button
              onClick={() => setProjectMenuOpen(o => !o)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left"
            >
              <FolderKanban className="h-3.5 w-3.5 text-[#D4002A] flex-shrink-0" />
              <span className="flex-1 text-xs text-white/80 truncate">
                {currentProject ? currentProject.name : "All Projects"}
              </span>
              {projectMenuOpen ? <ChevronUp className="h-3 w-3 text-white/40" /> : <ChevronDown className="h-3 w-3 text-white/40" />}
            </button>
            {projectMenuOpen && (
              <div className="mt-1 bg-[#2a2a40] rounded-lg overflow-hidden border border-white/10">
                <button
                  onClick={() => { setCurrentProject(null); setProjectMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-white/10 transition-colors flex items-center gap-2 ${!currentProject ? "text-white font-medium" : "text-white/60"}`}
                >
                  <Building2 className="h-3 w-3" />All Projects
                </button>
                {(projects || []).filter(p => p.status === "active").map(p => (
                  <button
                    key={p.id}
                    onClick={() => { setCurrentProject(p); setProjectMenuOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-white/10 transition-colors flex items-center gap-2 ${currentProject?.id === p.id ? "text-white font-medium bg-white/5" : "text-white/60"}`}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[#D4002A] flex-shrink-0" />
                    <span className="truncate">{p.name}</span>
                    <span className="ml-auto text-white/30">{p.vendor_count}</span>
                  </button>
                ))}
                <button
                  onClick={() => { navigate("/projects"); setProjectMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 text-xs text-[#D4002A] hover:bg-white/10 border-t border-white/10"
                >
                  + Manage Projects
                </button>
              </div>
            )}
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 py-2 space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#D4002A] text-white shadow-lg"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
                {!collapsed && item.badge && item.badge > 0 && (
                  <span className="ml-auto bg-[#D4002A] text-white text-xs px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
                {collapsed && item.badge && item.badge > 0 && (
                  <span className="absolute left-8 top-0 w-4 h-4 bg-[#D4002A] text-white text-xs rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                roleColors[user?.role || ""] || "bg-gray-500"
              }`}
            >
              {user?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-medium truncate">
                  {user?.full_name}
                </p>
                <p className="text-white/40 text-xs truncate">
                  {roleLabels[user?.role || ""] || user?.role}
                </p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={() => { logout(); navigate("/login"); }}
                className="text-white/40 hover:text-white transition-colors"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-sm text-gray-500 font-medium">
              {navItems.find((n) => location.pathname.startsWith(n.path))?.label || ""}
            </h2>
            {currentProject && (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 bg-red-50 border border-red-100 rounded-full text-xs text-[#D4002A] font-medium">
                <FolderKanban className="h-3 w-3" />
                {currentProject.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/tasks")}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Bell className="h-5 w-5 text-gray-500" />
              {openTasksCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#D4002A] text-white text-xs rounded-full flex items-center justify-center">
                  {openTasksCount > 9 ? "9+" : openTasksCount}
                </span>
              )}
            </button>
            <div className="text-sm text-gray-600">
              <span className="font-medium">{user?.full_name}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
