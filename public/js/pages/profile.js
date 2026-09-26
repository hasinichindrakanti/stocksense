// User Profile Page
const ProfilePage = {
  render(container) {
    const user = State.currentUser;
    const isMgr = State.isManager();

    container.innerHTML = `
      <div class="page-workspace">
        <div class="page-header">
          <div class="page-title-group">
            <h1>My Operator Profile</h1>
            <p>Authentication credentials, role-based capabilities, and security access keys</p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 320px 1fr; gap: 24px;">
          <!-- User Summary Card -->
          <div class="card" style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 16px;">
            <div class="user-avatar ${!isMgr ? 'staff' : ''}" style="width: 72px; height: 72px; font-size: 1.6rem; font-weight: 700;">
              ${user ? user.avatar : 'EV'}
            </div>
            <div>
              <h2 style="font-size: 1.25rem; font-weight: 700; color: #0f172a;">${user ? user.name : 'Elena Vance'}</h2>
              <div style="font-size: 0.85rem; color: #64748b;">${user ? user.email : 'elena@stocksense.io'}</div>
            </div>

            <span class="badge ${isMgr ? 'badge-ready' : 'badge-waiting'}" style="font-size: 0.82rem; padding: 4px 12px;">
              ${isMgr ? 'INVENTORY MANAGER' : 'WAREHOUSE STAFF'}
            </span>

            <div style="width: 100%; border-top: 1px solid #e2e8f0; padding-top: 16px; text-align: left; font-size: 0.82rem; color: #64748b; display: flex; flex-direction: column; gap: 8px;">
              <div><strong>Department:</strong> ${user ? user.department : 'Operations'}</div>
              <div><strong>System Clearance:</strong> Level 4 Production Floor</div>
              <div><strong>Active Session:</strong> Local Encrypted SQLite</div>
            </div>

            <button class="btn btn-secondary" style="width: 100%; color: #f43f5e;" onclick="AuthPage.logout()">
              ${renderIcon('log-out', 16)} Sign Out of Account
            </button>
          </div>

          <!-- Role Capabilities & Fast Demo Switcher -->
          <div style="display: flex; flex-direction: column; gap: 20px;">
            <div class="card">
              <h3 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 6px;">Role Capabilities & Privileges</h3>
              <p style="font-size: 0.82rem; color: #64748b; margin-bottom: 14px;">
                Permissions associated with <strong>${isMgr ? 'Inventory Manager' : 'Warehouse Staff'}</strong> role in StockSense.
              </p>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div style="display: flex; align-items: center; gap: 8px; font-size: 0.84rem; color: #334155;">
                  <span style="color: #10b981;">${renderIcon('check-circle', 16)}</span>
                  <span>Browse Products & Catalog</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; font-size: 0.84rem; color: #334155;">
                  <span style="color: #10b981;">${renderIcon('check-circle', 16)}</span>
                  <span>Draft Receipts & Deliveries</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; font-size: 0.84rem; color: #334155;">
                  <span style="color: #10b981;">${renderIcon('check-circle', 16)}</span>
                  <span>Execute Internal Relocations</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; font-size: 0.84rem; color: #334155;">
                  <span style="color: #10b981;">${renderIcon('check-circle', 16)}</span>
                  <span>Perform Cycle Count Adjustments</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; font-size: 0.84rem; color: #334155;">
                  <span style="color: #10b981;">${renderIcon('check-circle', 16)}</span>
                  <span>Inspect Audit Stock Ledger</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; font-size: 0.84rem; color: #334155;">
                  <span style="color: #10b981;">${renderIcon('check-circle', 16)}</span>
                  <span>Export Audited CSV Records</span>
                </div>
              </div>
            </div>

            <!-- Fast Role Switcher Box for Hackathon -->
            <div class="card" style="border-left: 4px solid #10b981;">
              <h3 style="font-size: 1.05rem; font-weight: 700; color: #0f172a; margin-bottom: 4px;">
                Hackathon Multi-Persona Simulation
              </h3>
              <p style="font-size: 0.82rem; color: #64748b; margin-bottom: 14px;">
                Toggle between different simulated corporate roles to test operational flows.
              </p>
              <div style="display: flex; gap: 12px;">
                <button class="btn ${isMgr ? 'btn-primary' : 'btn-secondary'}" onclick="State.switchRole('inventory_manager')">
                  ${renderIcon('shield-check', 16)} Elena Vance (Manager)
                </button>
                <button class="btn ${!isMgr ? 'btn-primary' : 'btn-secondary'}" onclick="State.switchRole('warehouse_staff')">
                  ${renderIcon('user', 16)} Marcus Chen (Warehouse Staff)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
};

window.ProfilePage = ProfilePage;
