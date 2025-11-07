import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Calendar as CalendarIcon,
  ClipboardCheck,
  CalendarDays,
  TrendingUp,
  LogOut,
  Briefcase,
  Send,
  Building2,
  Network
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  children: React.ReactNode;
}

const navItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Sunday Planning",
    path: "/",
    icon: CalendarIcon,
  },
  {
    name: "Check-ins",
    path: "/checkins",
    icon: ClipboardCheck,
  },
  {
    name: "Calendar",
    path: "/calendar",
    icon: CalendarDays,
  },
  {
    name: "Marketing",
    path: "/marketing",
    icon: TrendingUp,
  },
  {
    name: "External Submissions",
    path: "/submissions",
    icon: Send,
  },
  {
    name: "Agencies",
    path: "/agencies",
    icon: Building2,
  },
  {
    name: "Org Chart",
    path: "/org-chart",
    icon: Network,
  },
];

export function Sidebar({ children }: SidebarProps) {
  const [location] = useLocation();

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="w-64 bg-black text-white flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Briefcase className="w-6 h-6" />
            <span className="text-xl font-bold">GIGABRANDS</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              
              return (
                <li key={item.path}>
                  <Link href={item.path}>
                    <a
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                        isActive
                          ? "bg-gray-800 text-white"
                          : "text-gray-400 hover:bg-gray-900 hover:text-white"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </a>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-800">
          <button
            className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-gray-900 hover:text-red-300 rounded-lg transition-colors w-full"
            onClick={() => {
              // Add logout logic here if needed
              console.log("Logout clicked");
            }}
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
