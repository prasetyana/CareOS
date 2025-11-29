
import React from 'react';
// FIX: Re-typed import to fix "no exported member" errors.
import { NavLink, Link } from "react-router-dom";
import { useAuth } from '@core/hooks/useAuth';
import {
  LayoutDashboard,
  Utensils,
  ClipboardList,
  Calendar,
  Users,
  Megaphone,
  BarChart,
  Palette,
  Settings,
  ChevronLeft,
  LogOut,
  UserCog
} from 'lucide-react';
import { logoDataUri } from '@ui/Logo';
import { useLiveChat } from '@core/contexts/LiveChatContext';
import AgentStatusControl from '@modules/cs/components/AgentStatusControl';
import TeamStatusList from '@modules/cs/components/TeamStatusList';
import { useTenantParam } from '@core/hooks/useTenantParam';
import { useTenant } from '@core/tenant';

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const { attentionRequiredCount } = useLiveChat();
  const { withTenant } = useTenantParam();
  const { tenant } = useTenant();

  const logoSrc = tenant?.logoUrl || logoDataUri;
  const businessName = tenant?.businessName || 'DineOS';

  const navItems = [
    { to: "/admin/dasbor", icon: LayoutDashboard, text: "Dasbor" },
    { to: "/admin/menu", icon: Utensils, text: "Menu" },
    { to: "/admin/pesanan", icon: ClipboardList, text: "Pesanan" },
    { to: "/admin/reservasi", icon: Calendar, text: "Reservasi" },
    { to: "/admin/pelanggan", icon: Users, text: "Pelanggan" },
    { to: "/admin/promosi", icon: Megaphone, text: "Promosi" },
    { to: "/admin/analitik", icon: BarChart, text: "Analitik" },
    { to: "/admin/tampilan", icon: Palette, text: "Tampilan" },
    { to: "/admin/pengaturan", icon: Settings, text: "Pengaturan" },
  ];

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-3 py-2.5 rounded-xl transition-all duration-300 ease-out gap-3 ${isActive
      ? 'bg-accent/10 text-accent'
      : 'text-text-muted hover:bg-black/5 dark:hover:bg-white/10 hover:text-text-primary dark:hover:text-gray-200'
    }`;

  const collapsedNavLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `relative flex items-center justify-center px-3 py-2.5 rounded-xl transition-all duration-300 ease-out ${isActive
      ? 'bg-accent/10 text-accent'
      : 'text-text-muted hover:bg-black/5 dark:hover:bg-white/10 hover:text-text-primary dark:hover:text-gray-200'
    }`;

  const iconClasses = "w-5 h-5 flex-shrink-0";

  const SidebarContent = ({ isCollapsedProp = false }) => (
    <div
      className={`bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-lg p-4 flex flex-col justify-between border border-white/20 dark:border-gray-700/50 h-full
        ${isCollapsedProp ? 'w-20' : 'w-64'}
      `}
    >
      <div>
        <div className={`flex items-center mb-8 transition-all duration-300 ${isCollapsedProp ? 'justify-center' : 'justify-between'}`}>
          <div className={`flex items-center transition-all duration-300 ${isCollapsedProp ? '' : 'justify-between w-full'}`}>
            <Link
              to={withTenant("/home")}
              className={`flex items-center gap-3 overflow-hidden whitespace-nowrap transition-all duration-200 ${isCollapsedProp ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}
            >
              <img src={logoSrc} alt={businessName} className="h-8 w-8 text-text-primary dark:text-gray-100 flex-shrink-0 object-cover rounded-full" />
              <span className="text-xl font-semibold text-text-primary dark:text-gray-100">
                {businessName}
              </span>
            </Link>
            <button
              onClick={toggleSidebar}
              className={`p-1 rounded-full text-text-muted hover:bg-black/5 dark:hover:bg-white/10`}
              aria-label={isCollapsedProp ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <ChevronLeft className={`w-5 h-5 transition-transform duration-300 ${isCollapsedProp ? 'rotate-180' : 'rotate-0'}`} />
            </button>
          </div>
        </div>

        <nav className="space-y-2">
          {navItems.map(item => {
            return (
              <div key={item.to} className="relative group">
                <NavLink to={withTenant(item.to)} className={isCollapsedProp ? collapsedNavLinkClasses : navLinkClasses}>
                  <item.icon className={iconClasses} />
                  <span
                    className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-200 ${isCollapsedProp ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}
                  >
                    {item.text}
                  </span>
                  {item.text === 'Pelanggan' && attentionRequiredCount > 0 && !isCollapsedProp && (
                    <span className="ml-auto w-2 h-2 bg-danger rounded-full"></span>
                  )}
                  {item.text === 'Pelanggan' && attentionRequiredCount > 0 && isCollapsedProp && (
                    <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-danger ring-2 ring-white/70 dark:ring-gray-800/70"></span>
                  )}
                </NavLink>
                {isCollapsedProp && (
                  <div className="absolute left-full ml-4 px-2 py-1 text-sm font-medium text-white bg-text-primary dark:bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none z-50">
                    {item.text}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {!isCollapsedProp && (
          <div className="mt-6 border-t border-black/5 dark:border-white/10 pt-4">
            <TeamStatusList />
          </div>
        )}
      </div>

      {user && (
        <div className={`border-t border-black/5 dark:border-white/10 ${isCollapsed ? 'pt-4' : 'pt-2'}`}>
          {!isCollapsed && (
            <div className="p-2">
              <AgentStatusControl />
            </div>
          )}
          <div className={`flex items-center transition-all duration-300 ${isCollapsed ? 'justify-center' : 'justify-between gap-3 px-3 pb-2'}`}>
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center font-bold text-white flex-shrink-0 overflow-hidden">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name || user.email} className="w-full h-full object-cover" />
                ) : (
                  user.email.charAt(0).toUpperCase()
                )}
              </div>
              <div className={`overflow-hidden transition-all duration-200 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                <p className="text-sm font-medium text-text-primary dark:text-gray-200 truncate">{user.name || user.email}</p>
                <p className="text-xs text-text-muted capitalize">{user.role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className={`p-2 rounded-full text-text-muted hover:bg-black/5 dark:hover:bg-white/10 transition-opacity duration-200 ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar - Sticky positioning within 1440px container */}
      <aside className={`hidden lg:block sticky top-4 h-[calc(100vh-2rem)] rounded-3xl transition-all duration-300 ease-in-out z-40 ml-4 my-4`}>
        <SidebarContent isCollapsedProp={isCollapsed} />
      </aside>
    </>
  );
};

export default Sidebar;
