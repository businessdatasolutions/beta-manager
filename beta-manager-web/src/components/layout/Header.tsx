import { LogOut, User, Menu } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';

export function Header() {
  const { email, logout } = useAuthStore();
  const { openSidebar } = useUIStore();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side: hamburger menu (mobile only) */}
        <button
          onClick={openSidebar}
          className="md:hidden p-2 -ml-2 hover:bg-gray-100 rounded-lg"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Spacer for desktop */}
        <div className="hidden md:block" />

        {/* Right side: user info + logout */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* User info */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">{email}</span>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-2 md:px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
