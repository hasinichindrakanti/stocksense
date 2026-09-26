// Global Application State Management
const State = {
  currentUser: JSON.parse(localStorage.getItem('stocksense_user')) || {
    id: 1,
    name: 'Elena Vance',
    email: 'elena@stocksense.io',
    role: 'inventory_manager',
    department: 'Supply Chain & Operations',
    avatar: 'EV'
  },
  currentRoute: 'dashboard',
  sidebarCollapsed: localStorage.getItem('stocksense_sidebar_collapsed') === 'true',
  listeners: [],

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  },

  notify(event, data) {
    this.listeners.forEach(fn => fn(event, data));
  },

  setUser(user, token) {
    this.currentUser = user;
    if (user) {
      localStorage.setItem('stocksense_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('stocksense_user');
    }
    if (token) {
      localStorage.setItem('stocksense_token', token);
    } else if (!user) {
      localStorage.removeItem('stocksense_token');
    }
    this.notify('userChanged', user);
  },

  setRoute(route) {
    this.currentRoute = route;
    window.location.hash = `#${route}`;
    this.notify('routeChanged', route);
  },

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    localStorage.setItem('stocksense_sidebar_collapsed', this.sidebarCollapsed);
    this.notify('sidebarToggled', this.sidebarCollapsed);
  },

  isManager() {
    return this.currentUser && this.currentUser.role === 'inventory_manager';
  },

  // Instant switch for hackathon judges
  switchRole(role) {
    if (role === 'inventory_manager') {
      this.setUser({
        id: 1,
        name: 'Elena Vance',
        email: 'elena@stocksense.io',
        role: 'inventory_manager',
        department: 'Supply Chain & Operations',
        avatar: 'EV'
      }, 'demo_token_mgr');
      Toast.success('Switched to Inventory Manager (Elena Vance)');
    } else {
      this.setUser({
        id: 2,
        name: 'Marcus Chen',
        email: 'marcus@stocksense.io',
        role: 'warehouse_staff',
        department: 'Floor Operations & Logistics',
        avatar: 'MC'
      }, 'demo_token_staff');
      Toast.success('Switched to Warehouse Staff (Marcus Chen)');
    }
    App.render();
  }
};

window.State = State;
