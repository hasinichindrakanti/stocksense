// Main Application Bootloader & Router
const App = {
  async init() {
    console.log('[StockSense] Initializing application...');

    // Initialize Toast & Modals
    Toast.init();
    Modals.init();

    // Subscribe to state changes
    State.subscribe((event, data) => {
      if (event === 'routeChanged') {
        App.renderPage();
      } else if (event === 'sidebarToggled') {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
          sidebar.classList.toggle('collapsed', data);
        }
      }
    });

    // Hash change routing
    window.addEventListener('hashchange', () => {
      const route = window.location.hash.replace('#', '') || 'dashboard';
      if (route !== State.currentRoute) {
        State.currentRoute = route;
        App.renderPage();
      }
    });

    // Global keyboard shortcuts (Ctrl+K / Cmd+K)
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        Modals.openGlobalSearch();
      }
    });

    // Handle initial route
    const initialRoute = window.location.hash.replace('#', '') || 'dashboard';
    State.currentRoute = initialRoute;

    // Render Shell
    this.render();
  },

  render() {
    const container = document.getElementById('app-container');
    if (!container) return;

    // If user is not logged in, show Auth
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
    const container = document.getElementById('main-workspace');
    if (!container) return;

    // Update active state in sidebar
    const items = document.querySelectorAll('.nav-item');
    items.forEach(el => {
      const title = el.getAttribute('title');
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
