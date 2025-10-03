import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { 
  Home, 
  FileText, 
  Users, 
  Scale, 
  MessageCircle, 
  Settings,
  Menu,
  X,
  LogOut
} from 'lucide-react';

const navigationItems = [
  { path: '/dashboard', icon: Home, label: 'Главная' },
  { path: '/orders', icon: FileText, label: 'Заказы' },
  { path: '/directories', icon: Users, label: 'Справочники' },
  { path: '/weighing', icon: Scale, label: 'Взвешивание' },
  { path: '/messenger', icon: MessageCircle, label: 'Сообщения' },
  { path: '/profile', icon: Settings, label: 'Профиль' }
];

export default function MobileNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Верхняя панель */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-mono-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-black">BetonApp</h1>
          <button
            onClick={toggleMenu}
            className="p-2 rounded-lg hover:bg-mono-100"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Боковое меню */}
      <div className={`fixed inset-0 z-40 transform transition-transform duration-300 ${
        isMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Overlay */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={toggleMenu}
        />
        
        {/* Menu */}
        <div className="relative w-64 h-full bg-white shadow-xl">
          <div className="p-6">
            <h2 className="text-xl font-bold text-black mb-6">Навигация</h2>
            
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={toggleMenu}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-black text-white' 
                        : 'text-mono-700 hover:bg-mono-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
              
              {/* Кнопка выхода */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-mono-600 hover:bg-mono-50"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Выйти</span>
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Нижняя навигация */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-mono-200">
        <div className="grid grid-cols-4 gap-1">
          {navigationItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center py-2 px-1 transition-colors ${
                  isActive 
                    ? 'text-black' 
                    : 'text-mono-500'
                }`}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
