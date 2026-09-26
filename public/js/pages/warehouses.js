// Multi-Warehouse & Storage Locations Management Page
const WarehousesPage = {
  warehouses: [],
  locations: [],

  async render(container) {
    container.innerHTML = `
      <div style="display:flex; justify-content:center; align-items:center; padding: 100px 0;">
        <span style="color:#10b981;">${renderIcon('refresh-cw', 32)}</span>
        <span style="margin-left: 12px; font-weight: 500; color: #64748b;">Loading warehouse topology...</span>
      </div>
    `;

    try {
      const [whRes, locRes] = await Promise.all([
        API.getWarehouses(),
        API.getLocations()
      ]);

      this.warehouses = whRes.warehouses || [];
      this.locations = locRes.locations || [];

      container.innerHTML = `
        <div class="page-workspace">
          <!-- Page Header -->
          <div class="page-header">
            <div class="page-title-group">
              <h1>Multi-Warehouse Management</h1>
              <p>Physical distribution centers, high-bay racks, assembly floors, and bin locations</p>
            </div>
            <div class="page-actions">
              <button class="btn btn-secondary btn-sm" onclick="WarehousesPage.openAddLocationModal()">
                ${renderIcon('plus', 14)} Add Location / Rack
              </button>
              <button class="btn btn-primary btn-sm" onclick="WarehousesPage.openAddWarehouseModal()">
                ${renderIcon('plus', 15)} New Facility
              </button>
            </div>
          </div>

          <!-- Warehouses Cards Grid -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 20px;">
            ${this.renderWarehouseCards()}
          </div>

          <!-- Detailed Locations Table -->
          <div class="card" style="margin-top: 10px;">
            <div class="chart-header">
              <div>
                <h3 class="chart-title">Configured Storage Locations & Racks</h3>
                <p class="chart-subtitle">All active zones, shelves, bays, and pallets across facilities</p>
              </div>
            </div>

            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Location Code</th>
                    <th>Name / Label</th>
                    <th>Warehouse Facility</th>
                    <th>Type / Classification</th>
                    <th>Current Stored Units</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${this.renderLocationRows()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    } catch (e) {
      container.innerHTML = `<div class="empty-state">Failed to load warehouses: ${e.message}</div>`;
    }
  },

  renderWarehouseCards() {
    if (!this.warehouses || this.warehouses.length === 0) {
      return `<div class="empty-state">No warehouses configured</div>`;
    }

    return this.warehouses.map(w => {
      const locCount = (w.locations || []).length;

      return `
        <div class="card" style="display: flex; flex-direction: column; gap: 16px;">
          <div style="display: flex; align-items: flex-start; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 44px; height: 44px; border-radius: var(--radius-md); background: #eff6ff; color: #2563eb; display: flex; align-items: center; justify-content: center;">
                ${renderIcon('warehouse', 24)}
              </div>
              <div>
                <h3 style="font-size: 1.15rem; font-weight: 700; color: #0f172a;">${w.name}</h3>
                <span style="font-family: monospace; font-size: 0.76rem; font-weight: 700; color: #2563eb; background: #dbeafe; padding: 2px 6px; border-radius: 4px;">
                  ${w.code}
                </span>
              </div>
            </div>
            <span class="badge badge-done">ACTIVE</span>
          </div>

          <div style="font-size: 0.82rem; color: #64748b; display: flex; flex-direction: column; gap: 4px;">
            <div><strong>Address:</strong> ${w.address || 'Address pending'}</div>
            <div><strong>Operations Manager:</strong> ${w.manager_name || 'Staff Supervisor'}</div>
          </div>

          <!-- Mini Metrics -->
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; background: #f8fafc; padding: 12px; border-radius: var(--radius-md); border: 1px solid #e2e8f0; text-align: center;">
            <div>
              <div style="font-size: 0.7rem; color: #64748b; font-weight: 600; text-transform: uppercase;">Total Stock</div>
              <div style="font-size: 1.15rem; font-weight: 800; color: #10b981;">${w.total_stock.toLocaleString()}</div>
            </div>
            <div>
              <div style="font-size: 0.7rem; color: #64748b; font-weight: 600; text-transform: uppercase;">Unique SKUs</div>
              <div style="font-size: 1.15rem; font-weight: 800; color: #0f172a;">${w.unique_products}</div>
            </div>
            <div>
              <div style="font-size: 0.7rem; color: #64748b; font-weight: 600; text-transform: uppercase;">Racks / Bays</div>
              <div style="font-size: 1.15rem; font-weight: 800; color: #6366f1;">${locCount}</div>
            </div>
          </div>

          <!-- Locations in this warehouse -->
          <div>
            <div style="font-size: 0.76rem; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 6px;">
              Configured Storage Nodes:
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
              ${(w.locations || []).map(l => `
                <span style="font-size: 0.74rem; background: white; border: 1px solid #cbd5e1; padding: 3px 8px; border-radius: 4px; color: #334155;">
                  <strong>${l.code}</strong>: ${l.name} (${l.location_stock} units)
                </span>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  renderLocationRows() {
    if (!this.locations || this.locations.length === 0) {
      return `<tr><td colspan="6" class="empty-state">No locations configured</td></tr>`;
    }

    return this.locations.map(l => `
      <tr>
        <td style="font-family: monospace; font-weight: 700; color: #0f172a;">${l.code}</td>
        <td style="font-weight: 600; color: #334155;">${l.name}</td>
        <td>${l.warehouse_name} (${l.warehouse_code})</td>
        <td>
          <span style="font-size: 0.76rem; text-transform: uppercase; font-weight: 600; color: #475569; background: #f1f5f9; padding: 2px 7px; border-radius: 4px;">
            ${l.type}
          </span>
        </td>
        <td style="font-weight: 700; color: #10b981;">${l.total_stock} units</td>
        <td><span class="badge badge-done">ONLINE</span></td>
      </tr>
    `).join('');
  },

  openAddWarehouseModal() {
    Modals.open({
      title: 'Add New Warehouse Facility',
      content: `
        <form id="add-wh-form" class="form-grid-2">
          <div class="form-field">
            <label class="form-label">Facility Code *</label>
            <input type="text" id="wh-code" class="form-input" required placeholder="e.g. WH-SFO" />
          </div>
          <div class="form-field">
            <label class="form-label">Warehouse Name *</label>
            <input type="text" id="wh-name" class="form-input" required placeholder="e.g. West Coast Fulfillment Center" />
          </div>
          <div class="form-field" style="grid-column: span 2;">
            <label class="form-label">Physical Address</label>
            <input type="text" id="wh-addr" class="form-input" placeholder="e.g. 500 Airport Logistics Blvd, San Francisco, CA" />
          </div>
          <div class="form-field" style="grid-column: span 2;">
            <label class="form-label">Operations Manager</label>
            <input type="text" id="wh-mgr" class="form-input" placeholder="e.g. Sarah Jenkins" />
          </div>
        </form>
      `,
      footer: `
        <button class="btn btn-secondary" onclick="Modals.close()">Cancel</button>
        <button class="btn btn-primary" id="btn-save-wh">Create Facility</button>
      `
    });

    document.getElementById('btn-save-wh').addEventListener('click', async () => {
      const code = document.getElementById('wh-code').value.trim();
      const name = document.getElementById('wh-name').value.trim();
      if (!code || !name) return Toast.error('Warehouse code and name are required');

      try {
        await API.createWarehouse({
          code,
          name,
          address: document.getElementById('wh-addr').value.trim(),
          manager_name: document.getElementById('wh-mgr').value.trim()
        });
        Toast.success(`Warehouse "${name}" (${code}) added`);
        Modals.close();
        WarehousesPage.refresh();
      } catch (e) {}
    });
  },

  openAddLocationModal() {
    const whOptions = (this.warehouses || []).map(w => `<option value="${w.id}">${w.name} (${w.code})</option>`).join('');

    Modals.open({
      title: 'Add Storage Location / Rack',
      content: `
        <form id="add-loc-form" class="form-grid-2">
          <div class="form-field" style="grid-column: span 2;">
            <label class="form-label">Parent Warehouse Facility *</label>
            <select id="loc-wh" class="form-select">${whOptions}</select>
          </div>
          <div class="form-field">
            <label class="form-label">Location Code *</label>
            <input type="text" id="loc-code" class="form-input" required placeholder="e.g. RACK-C03" />
          </div>
          <div class="form-field">
            <label class="form-label">Location Label *</label>
            <input type="text" id="loc-name" class="form-input" required placeholder="e.g. Cold Storage Bay 3" />
          </div>
          <div class="form-field" style="grid-column: span 2;">
            <label class="form-label">Location Type</label>
            <select id="loc-type" class="form-select">
              <option value="rack">High-Bay Rack</option>
              <option value="shelf">Pick Shelf</option>
              <option value="bay">Receiving Inbound Bay</option>
              <option value="pallet">Pallet Zone</option>
              <option value="production">Production Floor Buffer</option>
              <option value="dispatch">Dispatch Staging</option>
            </select>
          </div>
        </form>
      `,
      footer: `
        <button class="btn btn-secondary" onclick="Modals.close()">Cancel</button>
        <button class="btn btn-primary" id="btn-save-loc">Create Location</button>
      `
    });

    document.getElementById('btn-save-loc').addEventListener('click', async () => {
      const whId = document.getElementById('loc-wh').value;
      const code = document.getElementById('loc-code').value.trim();
      const name = document.getElementById('loc-name').value.trim();
      const type = document.getElementById('loc-type').value;

      if (!code || !name) return Toast.error('Location code and name are required');

      try {
        await API.createLocation({
          warehouse_id: whId,
          code,
          name,
          type
        });
        Toast.success(`Location "${name}" (${code}) added`);
        Modals.close();
        WarehousesPage.refresh();
      } catch (e) {}
    });
  },

  async refresh() {
    const main = document.getElementById('main-workspace');
    if (main) await this.render(main);
  }
};

window.WarehousesPage = WarehousesPage;
