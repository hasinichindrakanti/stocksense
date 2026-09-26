// Main Application Bootloader & Router
const App = {
  async init() {
    console.log('[StockSense] Initializing application...');

    // Initialize Toast & Modals
    Toast.init();
    Modals.init();

    // Check existing stored session
    State.initSession();

    // If there is a stored token, verify it with the server
    if (State.currentUser && State.getToken()) {
      try {
        const me = await API.getProfile();
        if (me && me.user) {
          State.currentUser = me.user;
        } else {
          State.setUser(null, null);
        }
      } catch (e) {
        console.warn('Session expired or invalid, requiring sign in');
        State.setUser(null, null);
      }
    }

    // Subscribe to state changes
    State.subscribe((event, data) => {
      if (event === 'routeChanged') {
        App.renderPage();
      } else if (event === 'userChanged') {
        App.render();
      } else if (event === 'sidebarToggled') {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
          sidebar.classList.toggle('collapsed', data);
        }
      }
    });

    // Hash change routing with strict authentication guard
    window.addEventListener('hashchange', () => {
      let route = window.location.hash.replace('#', '') || 'login';

      // Unauthenticated guard
      if (!State.currentUser) {
        if (!['login', 'signup', 'forgot', 'reset'].includes(route)) {
          window.location.hash = '#login';
          return;
        }
        State.currentRoute = route;
        AuthPage.viewMode = route;
        const container = document.getElementById('app-container');
        if (container) AuthPage.render(container);
        return;
      }

      // If authenticated and user navigates to an auth page, redirect to dashboard
      if (['login', 'signup', 'forgot', 'reset'].includes(route)) {
        window.location.hash = '#dashboard';
        return;
      }

      if (route !== State.currentRoute) {
        State.currentRoute = route;
        App.renderPage();
      }
    });

    // Global keyboard shortcuts (Ctrl+K / Cmd+K)
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        if (State.currentUser) {
          e.preventDefault();
          Modals.openGlobalSearch();
        }
      }
    });

    // Handle initial route: strictly force unauthenticated visitors to #login
    let initialRoute = window.location.hash.replace('#', '');
    if (!State.currentUser) {
      if (!['login', 'signup', 'forgot', 'reset'].includes(initialRoute)) {
        initialRoute = 'login';
        window.location.hash = '#login';
      }
      State.currentRoute = initialRoute;
      AuthPage.viewMode = initialRoute;
    } else {
      if (!initialRoute || ['login', 'signup', 'forgot', 'reset'].includes(initialRoute)) {
        initialRoute = 'dashboard';
        window.location.hash = '#dashboard';
      }
      State.currentRoute = initialRoute;
    }

    // Render Shell
    this.render();
  },

  render() {
    const container = document.getElementById('app-container');
    if (!container) return;

    // Strict Unauthenticated Guard: Show Auth Screen
    if (!State.currentUser) {
      AuthPage.render(container);
      return;
    }

    // Authenticated Shell: Sidebar + Main Wrapper (Navbar + Workspace)
    container.innerHTML = `
      ${Sidebar.render()}
      <div class="main-wrapper">
        ${Navbar.render()}
        <main id="main-workspace"></main>
      </div>
    `;

    // Render current active page
    this.renderPage();
  },

  async renderPage() {
    // If not authenticated, ensure AuthPage is rendered
    if (!State.currentUser) {
      this.render();
      return;
    }

    const container = document.getElementById('main-workspace');
    if (!container) return;

    // Update active state in sidebar
    const items = document.querySelectorAll('.nav-item');
    items.forEach(el => {
      const onclickAttr = el.getAttribute('onclick') || '';
      if (onclickAttr.includes(`'${State.currentRoute}'`)) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    // Route dispatch
    switch (State.currentRoute) {
      case 'dashboard':
        await DashboardPage.render(container);
        break;
      case 'products':
        await ProductsPage.render(container);
        break;
      case 'categories':
        await CategoriesPage.render(container);
        break;
      case 'reordering':
        await ReorderingPage.render(container);
        break;
      case 'receipts':
        await ReceiptsPage.render(container);
        break;
      case 'deliveries':
        await DeliveriesPage.render(container);
        break;
      case 'transfers':
        await TransfersPage.render(container);
        break;
      case 'adjustments':
        await AdjustmentsPage.render(container);
        break;
      case 'ledger':
        await LedgerPage.render(container);
        break;
      case 'warehouses':
      case 'locations':
        await WarehousesPage.render(container);
        break;
      case 'profile':
        ProfilePage.render(container);
        break;
      case 'guided_demo':
        await GuidedDemoPage.render(container);
        break;
      default:
        await DashboardPage.render(container);
        break;
    }
  }
};

window.App = App;

// Auto-run on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
