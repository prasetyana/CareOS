
const CustomerSidebar: React.FC<CustomerSidebarProps> = ({ isCollapsed, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const { mode, toggleMode } = useTheme();
  const { cart, toggleCart, closeCart } = useCart();
  const { toggleChat, closeChat } = useChat();
  const { unreadCount, toggleNotificationPanel, closeNotificationPanel } = useNotifications();
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const { withTenant } = useTenantParam();
  const { tenant } = useTenant();

  const checkIsOpen = () => {
    if (!tenant?.operatingHours) return false;


    const now = new Date();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = days[now.getDay()];
    const todayHours = tenant.operatingHours[dayName];

    if (!todayHours?.isOpen) return false;

    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [openHour, openMinute] = todayHours.openTime.split(':').map(Number);
    const [closeHour, closeMinute] = todayHours.closeTime.split(':').map(Number);
    const openTime = openHour * 60 + openMinute;
    const closeTime = closeHour * 60 + closeMinute;

    return currentTime >= openTime && currentTime < closeTime;
  };

  const isOpen = checkIsOpen();

  const navItems = [
    { to: withTenant('/akun/beranda'), icon: Home, text: 'Beranda', end: true },
    { to: withTenant('/akun/menu'), icon: Utensils, text: 'Menu', end: false },
    { to: withTenant('/akun/pesanan'), icon: ShoppingBag, text: 'Pesanan', end: false },
    { to: withTenant('/akun/reservasi'), icon: Calendar, text: 'Reservasi', end: false },
    { to: withTenant('/akun/favorit'), icon: Star, text: 'Favorit', end: false },
    { to: withTenant('/akun/poin-hadiah'), icon: Gift, text: 'Poin & Hadiah', end: false },
    { to: withTenant('/akun/pengaturan'), icon: Settings, text: 'Akun', end: false },
  ];

  const navLinkClasses = ({ isActive }: { isActive: boolean }) => {
    const baseClasses = 'flex items-center gap-3 transition-all duration-200 cursor-pointer';

    if (isActive) {
      const activeBase = 'bg-white dark:bg-neutral-700 shadow-md shadow-black/10 text-blue-600 dark:text-blue-400 font-semibold';
      if (isCollapsed) {
        // Collapsed + Active: Perfect circle
        return `${baseClasses} ${activeBase} w-12 h-12 rounded-full justify-center`;
      } else {
        // Expanded + Active: Rounded rectangle
        return `${baseClasses} ${activeBase} px-4 py-2.5 rounded-xl`;
      }
    } else {
      // Inactive states
      const inactiveBase = 'text-neutral-700 dark:text-neutral-300 font-medium text-sm hover:bg-white/80 dark:hover:bg-white/10';
      if (isCollapsed) {
        // Collapsed + Inactive: Square for alignment
        return `${baseClasses} ${inactiveBase} w-12 h-12 rounded-xl justify-center`;
      } else {
        // Expanded + Inactive
        return `${baseClasses} ${inactiveBase} px-4 py-2.5 rounded-xl`;
      }
    }
  };

  const handleChatClick = () => {
    closeCart();
    closeNotificationPanel();
    toggleChat();
  };

  const handleNotificationClick = () => {
    closeCart();
    closeChat();
    toggleNotificationPanel();
  };

  const handleCartClick = () => {
    closeChat();
    closeNotificationPanel();
    toggleCart();
  };

  const iconClasses = "size-5 flex-shrink-0";
  const iconButtonClasses = "p-2 rounded-full text-neutral-600 dark:text-neutral-400 hover:bg-white/80 dark:hover:bg-white/10 relative";


  return (
    <aside className={`h-full rounded-3xl bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-xl border border-white/40 dark:border-neutral-700/40 shadow-2xl shadow-black/10 p-4 flex flex-col font-sans transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex-grow">
        <div className={`flex items-center transition-all duration-300 mb-6 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className={`flex items-center gap-3 overflow-hidden whitespace-nowrap transition-all duration-200 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
            <img src={logoDataUri} alt="DineOS Logo" className="h-8 w-8 text-neutral-800 dark:text-neutral-100 flex-shrink-0" />
            <div>
              <h1 className="font-semibold text-lg text-neutral-800 dark:text-neutral-100 leading-tight">
                DineOS
              </h1>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
                  {isOpen ? 'Buka' : 'Tutup'}
                </span>
              </div>

            </div>
          </div>
          <button onClick={toggleSidebar} className="p-1 rounded-full text-neutral-500 dark:text-neutral-400 hover:bg-white/80 dark:hover:bg-white/10" aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            <ChevronLeft className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : 'rotate-0'}`} />
          </button>
        </div>

        <nav className="mt-4 space-y-2">
          {navItems.map(item => (
            <div key={item.to} className="relative group">
              <NavLink
                to={item.to}
                className={navLinkClasses}
                end={item.end}
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`${iconClasses} ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-neutral-600 dark:text-neutral-400'}`} />
                    <span className={`whitespace-nowrap overflow-hidden transition-all duration-200 ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>{item.text}</span>
                  </>
                )}
              </NavLink>
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-3 py-1.5 text-sm font-medium text-white bg-neutral-800 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none z-50">
                  {item.text}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Icon Actions Box */}
      <div className={`mb-4 transition-all duration-300 ${isCollapsed ? 'px-1' : ''}`}>
        <div className={`bg-black/5 dark:bg-white/10 rounded-xl p-1.5 flex items-center transition-all duration-300 ${isCollapsed ? 'flex-col gap-1.5' : 'justify-around'}`}>
          <button onClick={toggleMode} className={iconButtonClasses} aria-label="Toggle theme">
            {mode === 'light' ? <Moon className={iconClasses} /> : <Sun className={iconClasses} />}
          </button>
          <button onClick={handleChatClick} className={iconButtonClasses} aria-label="Chat">
            <MessageSquare className={iconClasses} />
          </button>
          <button onClick={handleNotificationClick} className={iconButtonClasses} aria-label="Notifications">
            <Bell className={iconClasses} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-danger"></span>
              </span>
            )}
          </button>
          <div className="relative">
            <button onClick={handleCartClick} className={iconButtonClasses} aria-label="Cart">
              <ShoppingCart className={iconClasses} />
            </button>
            {cartItemCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white pointer-events-none">
                {cartItemCount}
              </span>
            )}
          </div>
        </div>
      </div>

      {user && (
        <div className="pt-4 border-t border-white/80 dark:border-neutral-700/50">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center font-bold text-white flex-shrink-0 text-sm overflow-hidden">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className={`overflow-hidden transition-all duration-200 ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
                <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">{user.name}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{user.email}</p>
              </div>
            </div>
            <button onClick={logout} className={`p-2 rounded-full text-neutral-500 dark:text-neutral-400 hover:bg-white/80 dark:hover:bg-white/10 transition-opacity duration-200 ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`} aria-label="Keluar">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

export default CustomerSidebar;