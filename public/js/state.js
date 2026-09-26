// Global Application State Management
const State = {
  currentUser: null,
  currentRoute: 'login',
  sidebarCollapsed: localStorage.getItem('stocksense_sidebar_collapsed') === 'true',
  listeners: [],

  initSession() {
    const userStr = localStorage.getItem('stocksense_user') || sessionStorage.getItem('stocksense_user');
    const token = localStorage.getItem('stocksense_token') || sessionStorage.getItem('stocksense_token');
    if (userStr && token) {
      try {
        this.currentUser = JSON.parse(userStr);
      } catch (e) {
        this.currentUser = null;
        localStorage.removeItem('stocksense_user');
        sessionStorage.removeItem('stocksense_user');
      }
    } else {
      this.currentUser = null;
    }
    return this.currentUser;
  },

  getToken() {
    return localStorage.getItem('stocksense_token') || sessionStorage.getItem('stocksense_token') || null;
  },

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  },

  notify(event, data) {
    this.listeners.forEach(fn => fn(event, data));
  },

  setUser(user, token, rememberMe = true) {
    this.currentUser = user;
    if (user && token) {
      if (rememberMe) {
        localStorage.setItem('stocksense_user', JSON.stringify(user));
        localStorage.setItem('stocksense_token', token);
        sessionStorage.removeItem('stocksense_user');
        sessionStorage.removeItem('stocksense_token');
      } else {
        sessionStorage.setItem('stocksense_user', JSON.stringify(user));
        sessionStorage.setItem('stocksense_token', token);
        localStorage.removeItem('stocksense_user');
        localStorage.removeItem('stocksense_token');
      }
    } else {
      localStorage.removeItem('stocksense_user');
      localStorage.removeItem('stocksense_token');
      sessionStorage.removeItem('stocksense_user');
      sessionStorage.removeItem('stocksense_token');
    }
    this.notify('userChanged', user);
  },

  setRoute(route) {
    // If not authenticated, only allow login or signup
    if (!this.currentUser && route !== 'login' && route !== 'signup' && route !== 'forgot' && route !== 'reset') {
      route = 'login';
    }
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

  // Instant persona switch using real server-side authentication
  async switchRole(role) {
    try {
      const email = role === 'inventory_manager' ? 'elena@stocksense.io' : 'marcus@stocksense.io';
      const res = await API.login({ email, password: 'password123', rememberMe: true });
      this.setUser(res.user, res.token, true);
      Toast.success(`Switched to ${res.user.name} (${res.user.role})`);
      App.render();
    } catch (e) {
      Toast.error('Role switch failed: ' + e.message);
    }
  }
};

window.State = State;
