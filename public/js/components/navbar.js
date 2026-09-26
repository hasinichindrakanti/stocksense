// Top Navbar Component
const Navbar = {
  render() {
    const user = State.currentUser;
    const isMgr = State.isManager();

    return `
      <header class="top-navbar">
        <div class="navbar-left">
          <button class="mobile-toggle" onclick="document.querySelector('.sidebar').classList.toggle('mobile-open')">
            ${renderIcon('menu', 20)}
          </button>

          <!-- Global Search Trigger -->
          <div class="global-search-trigger" onclick="Modals.openGlobalSearch()">
            ${renderIcon('search', 16)}
            <span>Search products, documents, locations...</span>
            <span class="search-shortcut">Ctrl+K</span>
          </div>
        </div>

        <div class="navbar-right">
          <!-- 1-Click Guided Lifecycle Demo Button -->
          <button class="btn-guided-demo" onclick="State.setRoute('guided_demo')">
            ${renderIcon('sparkles', 16)}
            <span>Guided Demo Scenario</span>
          </button>

          <!-- Quick Demo Role Switcher for Hackathon Judges -->
          <div style="display: flex; align-items: center; gap: 6px;">
            <select class="role-switcher-dropdown" onchange="State.switchRole(this.value)">
              <option value="inventory_manager" ${isMgr ? 'selected' : ''}>Manager: Elena Vance</option>
              <option value="warehouse_staff" ${!isMgr ? 'selected' : ''}>Staff: Marcus Chen</option>
            </select>
          </div>

          <!-- Reset Demo Data -->
          <button class="demo-reset-btn" title="Reset all demo data to baseline" onclick="Navbar.resetDemoData()">
            ${renderIcon('refresh-cw', 14)}
            <span>Reset Data</span>
          </button>

          <!-- User Avatar Profile Trigger -->
          <div class="user-avatar ${!isMgr ? 'staff' : ''}" style="cursor: pointer;" title="Open Profile" onclick="State.setRoute('profile')">
            ${user ? user.avatar : 'EV'}
          </div>
        </div>
      </header>
    `;
  },

  async resetDemoData() {
    Modals.confirm(
      'Reset Demo Database',
      'This will reset all inventory, receipts, deliveries, transfers, and ledger entries back to the clean hackathon demo baseline. Continue?',
      async () => {
        try {
          await API.resetDemo();
          Toast.success('Demo data restored successfully!');
          App.render();
        } catch (e) {}
      }
    );
  }
};

window.Navbar = Navbar;
