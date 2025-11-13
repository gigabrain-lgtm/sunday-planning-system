import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { 
  LayoutDashboard, 
  Calendar as CalendarIcon,
  ClipboardCheck,
  CalendarDays,
  TrendingUp,
  LogOut,
  Briefcase,
  Building2,
  DollarSign,
  Users,
  CheckCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  children: React.ReactNode;
}

function LogoutButton() {
  const { logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation('/submissions');
  };

  return (
    <button
      className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-gray-900 hover:text-red-300 rounded-lg transition-colors w-full"
      onClick={handleLogout}
    >
      <LogOut className="w-5 h-5" />
      <span className="font-medium">Logout</span>
    </button>
  );
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
    name: "Agencies",
    path: "/org-chart",
    icon: Building2,
  },
  {
    name: "Payment Requests",
    path: "/payment-requests",
    icon: DollarSign,
  },
  {
    name: "Hiring",
    path: "/hiring",
    icon: Users,
  },
];

const adminNavItems = [
  {
    name: "Payment Requests Admin",
    path: "/payment-requests-admin",
    icon: DollarSign,
  },
  {
    name: "Payment Completion",
    path: "/payment-completion",
    icon: CheckCircle,
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
          
          {/* Admin Section */}
          <div className="mt-8">
            <div className="px-4 mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase">Admin</span>
            </div>
            <ul className="space-y-2">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                
                return (
                  <li key={item.path}>
                    <Link href={item.path}>
                      <a
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                          isActive
                            ? "bg-white text-black"
                            : "text-gray-300 hover:bg-gray-900 hover:text-white"
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
          </div>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-800">
          <LogoutButton />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
