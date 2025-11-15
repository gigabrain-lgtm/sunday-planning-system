import { useState } from "react";
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
  CheckCircle,
  Package,
  UserCheck,
  UserPlus,
  UsersRound,
  FolderKanban,
  Grid3x3,
  AlertCircle,
  FileText,
  ShoppingCart,
  Box,
  Image as ImageIcon
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
    hasSubmenu: true,
  },
  {
    name: "Fulfilment",
    path: "/fulfilment",
    icon: Package,
    hasSubmenu: true,
  },
];

const hiringSubItems = [
  { name: "Dashboard", path: "/hiring", icon: LayoutDashboard },
  { name: "Roles", path: "/hiring/roles", icon: Briefcase },
  { name: "Recruitment Funnel", path: "/hiring/recruitment-funnel", icon: TrendingUp },
  { name: "CEO Review", path: "/hiring/ceo-review", icon: UserCheck },
  { name: "Recruiter Management", path: "/hiring/recruiter-management", icon: UsersRound },
  { name: "Recruiter Onboarding", path: "/hiring/recruiter-onboarding", icon: UserPlus },
  { name: "Jobs", path: "/hiring/jobs", icon: FolderKanban },
  { name: "Workable Jobs", path: "/hiring/workable-jobs", icon: Briefcase },
  { name: "Job Coverage Matrix", path: "/hiring/job-coverage", icon: Grid3x3 },
  { name: "Hiring Priority", path: "/hiring/priorities", icon: AlertCircle },
  { name: "Invoices", path: "/hiring/invoices", icon: FileText },
];

const fulfilmentSubItems = [
  { name: "Dashboard", path: "/fulfilment", icon: LayoutDashboard },
  { name: "Clients", path: "/fulfilment/clients", icon: Users },
  { name: "Products", path: "/fulfilment/products", icon: ShoppingCart },
  { name: "Inventory", path: "/fulfilment/inventory", icon: Box },
  { name: "Image Kitchen", path: "/fulfilment/image-kitchen", icon: ImageIcon },
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
  const [expandedSection, setExpandedSection] = useState<string | null>(() => {
    // Auto-expand based on current location
    if (location.startsWith('/hiring')) return 'hiring';
    if (location.startsWith('/fulfilment')) return 'fulfilment';
    return null;
  });

  const handleSectionClick = (sectionName: string, path: string) => {
    if (expandedSection === sectionName.toLowerCase()) {
      setExpandedSection(null);
    } else {
      setExpandedSection(sectionName.toLowerCase());
    }
  };

  const getSubItems = (sectionName: string) => {
    switch (sectionName.toLowerCase()) {
      case 'hiring':
        return hiringSubItems;
      case 'fulfilment':
        return fulfilmentSubItems;
      default:
        return [];
    }
  };

  const isInSection = (sectionName: string) => {
    return location.startsWith(`/${sectionName.toLowerCase()}`);
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Main Sidebar */}
      <div className="w-64 bg-black text-white flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Briefcase className="w-6 h-6" />
            <span className="text-xl font-bold">GIGABRANDS</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path || isInSection(item.name);
              
              return (
                <li key={item.path}>
                  {item.hasSubmenu ? (
                    <button
                      onClick={() => handleSectionClick(item.name, item.path)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-full text-left",
                        isActive
                          ? "bg-gray-800 text-white"
                          : "text-gray-400 hover:bg-gray-900 hover:text-white"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </button>
                  ) : (
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
                  )}
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
          </div>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-800">
          <LogoutButton />
        </div>
      </div>

      {/* Expandable Section Panel */}
      {expandedSection && (
        <div className="w-64 bg-gray-900 text-white flex flex-col flex-shrink-0 border-r border-gray-800">
          {/* Section Header */}
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              {expandedSection}
            </h2>
          </div>

          {/* Section Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-1">
              {getSubItems(expandedSection).map((subItem) => {
                const Icon = subItem.icon;
                const isActive = location === subItem.path;
                
                return (
                  <li key={subItem.path}>
                    <Link href={subItem.path}>
                      <a
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                          isActive
                            ? "bg-gray-800 text-white"
                            : "text-gray-400 hover:bg-gray-800 hover:text-white"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="font-medium text-sm">{subItem.name}</span>
                      </a>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
