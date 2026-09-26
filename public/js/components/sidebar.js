// Dark Navy Sidebar Component
const Sidebar = {
  render() {
    const current = State.currentRoute;
    const collapsed = State.sidebarCollapsed;
    const user = State.currentUser;
    const isMgr = State.isManager();

    const navItems = [
      {
        section: 'Overview',
        items: [
          { route: 'dashboard', label: 'Dashboard', icon: 'sliders' },
          { route: 'guided_demo', label: 'Guided Demo Tour', icon: 'sparkles', highlight: true }
        ]
      },
      {
        section: 'Products',
        items: [
          { route: 'products', label: 'All Products', icon: 'package' },
          { route: 'categories', label: 'Product Categories', icon: 'layers' },
          { route: 'reordering', label: 'Reordering Rules', icon: 'bell' }
        ]
      },
      {
        section: 'Operations',
        items: [
          { route: 'receipts', label: 'Receipts (In)', icon: 'arrow-down-left' },
          { route: 'deliveries', label: 'Delivery Orders (Out)', icon: 'truck' },
          { route: 'transfers', label: 'Internal Transfers', icon: 'arrow-left-right' },
          { route: 'adjustments', label: 'Inventory Adjustments', icon: 'clipboard-check' },
          { route: 'ledger', label: 'Move History / Ledger', icon: 'history' }
        ]
      },
      {
        section: 'Settings & Storage',
        items: [
          { route: 'warehouses', label: 'Warehouses', icon: 'warehouse' },
          { route: 'locations', label: 'Locations & Racks', icon: 'map-pin' }
        ]
      }
    ];

    let sectionsHtml = '';
    navItems.forEach(sec => {
      const itemsHtml = sec.items.map(item => `
        <div class="nav-item ${current === item.route ? 'active' : ''} ${item.highlight ? 'text-emerald-400' : ''}"
             onclick="State.setRoute('${item.route}')"
             title="${item.label}">
          <span class="nav-item-icon">${renderIcon(item.icon, 18)}</span>
          <span class="nav-item-text">${item.label}</span>
          ${item.highlight ? '<span style="width:6px;height:6px;border-radius:50%;background:#10b981;"></span>' : ''}
        </div>
      `).join('');

      sectionsHtml += `
        <div class="nav-section">
          <div class="nav-section-title">${sec.section}</div>
          ${itemsHtml}
        </div>
      `;
    });

    return `
      <aside class="sidebar ${collapsed ? 'collapsed' : ''}">
        <!-- Brand Header -->
        <div class="sidebar-header">
          <div class="brand-wrapper" onclick="State.setRoute('dashboard')" style="cursor: pointer;">
            <div class="brand-icon">
              ${renderIcon('box', 22)}
            </div>
            <div class="brand-info">
              <span class="brand-title">StockSense</span>
              <span class="brand-tagline">Smart Inventory</span>
            </div>
          </div>
          <button class="sidebar-collapse-btn" onclick="State.toggleSidebar()" title="Toggle sidebar">
            ${renderIcon(collapsed ? 'chevron-right' : 'chevron-down', 16)}
          </button>
        </div>

        <!-- Nav Navigation Modules -->
        <nav class="sidebar-nav">
          ${sectionsHtml}
        </nav>

        <!-- Sidebar User Footer -->
        <div class="sidebar-footer">
          <div class="user-profile-badge" onclick="State.setRoute('profile')">
            <div class="user-avatar ${!isMgr ? 'staff' : ''}">
              ${user ? user.avatar : 'EV'}
            </div>
            <div class="user-info">
              <div class="user-name">${user ? user.name : 'Elena Vance'}</div>
              <div class="user-role-label ${!isMgr ? 'staff' : ''}">
                ${isMgr ? 'Inventory Manager' : 'Warehouse Staff'}
              </div>
            </div>
          </div>

          <div style="display: flex; gap: 8px; margin-top: 10px;">
            <button class="btn btn-secondary btn-sm" style="flex: 1; font-size: 0.76rem; background: rgba(255,255,255,0.05); color: #cbd5e1; border: 1px solid #1e293b;" onclick="State.setRoute('profile')">
              ${renderIcon('user', 14)} My Profile
            </button>
            <button class="btn btn-secondary btn-sm" style="background: rgba(239,68,68,0.1); color: #f87171; border: 1px solid rgba(239,68,68,0.2);" onclick="AuthPage.logout()" title="Logout">
              ${renderIcon('log-out', 14)}
            </button>
          </div>
        </div>
      </aside>
    `;
  }
};

window.Sidebar = Sidebar;
