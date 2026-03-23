import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  LogOut,
  Menu,
  User,
  X,
  Users,
  Package,
  Home,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { SalesmanProfile } from '../../types/salesman';
import { salesmanSelfService } from '../../services/salesmanSelfService';
import { ProfileModal } from './ProfileModal';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/salesman', icon: LayoutDashboard },
  { name: 'Assigned Sellers', href: '/salesman/assigned-sellers', icon: Users },
  { name: 'All Orders', href: '/salesman/orders', icon: Package },
];

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="space-y-2 px-4 py-6">
      {navigation.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

        return (
          <button
            key={item.name}
            onClick={() => {
              window.location.href = item.href;
              onNavigate?.();
            }}
            className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-blue-50 text-blue-900'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </button>
        );
      })}
    </nav>
  );
}

export function SalesmanLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState<SalesmanProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  useEffect(() => {
    if (profileOpen && !profile) {
      loadProfile();
    }
  }, [profileOpen]);

  const loadProfile = async () => {
    setLoadingProfile(true);
    try {
      const data = await salesmanSelfService.getProfile();
      setProfile(data);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleUpdateProfile = async (data: any) => {
    setUpdatingProfile(true);
    try {
      const updated = await salesmanSelfService.updateProfile(data);
      setProfile(updated);
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    } finally {
      setUpdatingProfile(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-transparent text-slate-600 hover:bg-slate-100 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-blue-900 sm:text-xl">
                Salesman Panel
              </h1>
              <p className="text-xs text-slate-500 sm:text-sm">
                {user?.username ? `${user.username}` : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setProfileOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100"
              title="View Profile"
            >
              <User className="h-5 w-5" />
            </button>
            <button
              onClick={logout}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-red-600 hover:bg-red-50"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden border-r border-slate-200 bg-white lg:block lg:w-64">
          <NavLinks pathname={location.pathname} />
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              className="absolute inset-0 bg-black/30"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="absolute inset-y-0 left-0 w-64 border-r border-slate-200 bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <h2 className="text-base font-semibold text-blue-900">Menu</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <NavLinks
                pathname={location.pathname}
                onNavigate={() => setSidebarOpen(false)}
              />
            </aside>
          </div>
        )}

        <main className="min-w-0 flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
        profile={profile}
        onUpdate={handleUpdateProfile}
        isUpdating={updatingProfile}
      />
    </div>
  );
}