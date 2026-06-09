import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, BarChart3, LogOut, Apple, PanelLeftClose, PanelLeftOpen, Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/sales', label: 'Sales', icon: ShoppingCart },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const closeMobile = () => setMobileOpen(false);

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className={cn('flex items-center gap-2 border-b border-gray-200', collapsed ? 'px-3 py-5 justify-center' : 'px-6 py-5')}>
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground shrink-0">
          <Apple className="w-5 h-5" />
        </div>
        {!collapsed && <span className="text-xl font-bold text-gray-900 truncate">FreshMart</span>}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={closeMobile}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md text-sm font-medium transition-colors',
                collapsed ? 'px-2 py-2.5 justify-center' : 'px-3 py-2.5',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t border-gray-200">
        {!collapsed && (
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-3 w-full rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors',
            collapsed ? 'px-2 py-2.5 justify-center' : 'px-3 py-2.5'
          )}
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={closeMobile} />
      )}

      {/* Sidebar — desktop */}
      <aside
        className={cn(
          'hidden lg:flex bg-white border-r border-gray-200 flex-col transition-all duration-200 shrink-0',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {sidebarContent}
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center h-10 border-t border-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </aside>

      {/* Sidebar — mobile */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-200 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Mobile close button */}
        <button
          onClick={closeMobile}
          className="absolute right-3 top-4 p-1 rounded-md text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
        {sidebarContent}
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary text-primary-foreground">
              <Apple className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold text-gray-900">FreshMart</span>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 flex-1">{children}</div>
      </main>
    </div>
  );
}
