'use client';

import { Home, Gamepad2, User, Settings } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

interface NavigationMenuProps {
  language: 'en' | 'ar';
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function NavigationMenu({ language, activeTab, onTabChange }: NavigationMenuProps) {
  const router = useRouter();
  const pathname = usePathname();

  const texts = {
    en: {
      home: "Home",
      games: "Games",
      profile: "Profile",
      settings: "Settings"
    },
    ar: {
      home: "الرئيسية",
      games: "الألعاب",
      profile: "الملف الشخصي",
      settings: "الإعدادات"
    }
  };

  const t = texts[language];

  const menuItems = [
    { id: 'home', icon: Home, label: t.home, color: '#FF6B6B', path: '/dashboard' },
    { id: 'games', icon: Gamepad2, label: t.games, color: '#4ECDC4', path: '/games' },
    { id: 'profile', icon: User, label: t.profile, color: '#FF8C42', path: '/profile' },
    { id: 'settings', icon: Settings, label: t.settings, color: '#A8DADC', path: '/settings' }
  ];

  const handleClick = (item: typeof menuItems[0]) => {
    if (onTabChange) {
      onTabChange(item.id);
    }
    router.push(item.path);
  };

  const getActiveTab = () => {
    if (activeTab) return activeTab;
    if (pathname?.includes('/games')) return 'games';
    if (pathname?.includes('/profile')) return 'profile';
    if (pathname?.includes('/settings')) return 'settings';
    return 'home';
  };

  const currentActive = getActiveTab();

  return (
    <div className="bg-white rounded-3xl p-3 shadow-lg mb-6">
      <div className="flex justify-around items-center gap-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentActive === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleClick(item)}
              className={`flex flex-col items-center gap-2 px-6 py-4 rounded-2xl transition-all ${
                isActive ? 'shadow-md transform scale-105' : 'hover:bg-gray-50'
              }`}
              style={{
                backgroundColor: isActive ? item.color : 'transparent',
                color: isActive ? 'white' : '#666'
              }}
            >
              <Icon className="w-7 h-7" />
              <span className="text-sm whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
