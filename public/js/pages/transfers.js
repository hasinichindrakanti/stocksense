// Internal Transfers Page
const TransfersPage = {
  transfers: [],
  filters: {
    status: 'all',
    search: ''
  },

  async render(container) {
    container.innerHTML = `
      <div style="display:flex; justify-content:center; align-items:center; padding: 100px 0;">
        <span style="color:#10b981;">${renderIcon('refresh-cw', 32)}</span>
        <span style="margin-left: 12px; font-weight: 500; color: #64748b;">Loading internal transfers...</span>
      </div>
    `;

    try {
      const res = await API.getTransfers(this.filters);
      this.transfers = res.transfers || [];

      container.innerHTML = `
        <div class="page-workspace">
          <!-- Page Header -->
          <div class="page-header">
            <div class="page-title-group">
              <h1>Internal Stock Transfers</h1>
              <p>Relocation between warehouses, production racks, and bin bays with company total invariant verification</p>
            </div>
            <div class="page-actions">
              <button class="btn btn-secondary btn-sm" onclick="TransfersPage.refresh()">
                ${renderIcon('refresh-cw', 14)} Refresh
              </button>
              <button class="btn btn-primary btn-sm" onclick="TransfersPage.openCreateModal()">
                ${renderIcon('plus', 15)} New Internal Transfer
              </button>
            </div>
          </div>

          <!-- Filter Toolbar -->
          <div class="filter-bar">
            <div style="position: relative; flex: 1; min-width: 240px;">
              <input type="text" class="form-input" style="width: 100%; padding-left: 34px;"
                     placeholder="Search transfer reference, warehouse..."
                     value="${this.filters.search}"
                     oninput="TransfersPage.onSearchInput(this.value)" />
              <div style="position: absolute; left: 10px; top: 9px; color: #94a3b8;">
                ${renderIcon('search', 16)}
              </div>
            </div>

            <div class="filter-group">
              <span class="filter-label">Status:</span>
              <select class="filter-select" onchange="TransfersPage.onFilterChange('status', this.value)">
                <option value="all" ${this.filters.status === 'all' ? 'selected' : ''}>All Statuses</option>
                <option value="draft" ${this.filters.status === 'draft' ? 'selected' : ''}>Draft</option>
                <option value="ready" ${this.filters.status === 'ready' ? 'selected' : ''}>Ready in Transit</option>
                <option value="done" ${this.filters.status === 'done' ? 'selected' : ''}>Validated (Completed)</option>
              </select>
            </div>
          </div>

          <!-- Transfers Table -->
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Transfer Ref</th>
                  <th>Source Location</th>
                  <th>Destination Location</th>
                  <th>SKU Lines</th>
                  <th>Units Moving</th>
                  <th>Status</th>
                  <th>Scheduled Date</th>
                  <th style="text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody id="transfers-tbody">
                ${this.renderRows()}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } catch (e) {
      container.innerHTML = `<div class="empty-state">Failed to load transfers: ${e.message}</div>`;
    }
  },

  renderRows() {
    if (!this.transfers || this.transfers.length === 0) {
      return `<tr><td colspan="8" class="empty-state" style="padding: 36px;">No internal transfers found</td></tr>`;
    }

    return this.transfers.map(t => {
      const isDone = t.status === 'done';

      return `
        <tr>
          <td>
            <div style="font-family: monospace; font-weight: 700; color: #0f172a;">${t.reference}</div>
            <div style="font-size: 0.74rem; color: #64748b;">${t.line_count} items</div>
          </td>
          <td>
            <div style="font-weight: 600; color: #334155;">${t.source_warehouse_name}</div>
            <div style="font-size: 0.74rem; color: #64748b;">${t.source_location_name} (${t.source_location_code})</div>
          </td>
          <td>
            <div style="font-weight: 600; color: #10b981;">${t.dest_warehouse_name}</div>
            <div style="font-size: 0.74rem; color: #64748b;">${t.dest_location_name} (${t.dest_location_code})</div>
          </td>
          <td>${t.line_count}</td>
          <td style="font-weight: 700; color: #6366f1;">${t.total_quantity} units</td>
          <td><span class="badge badge-${t.status}">${t.status.toUpperCase()}</span></td>
          <td style="font-size: 0.78rem; color: #64748b;">${t.created_at.slice(0, 16)}</td>
          <td style="text-align: right;">
            <div style="display: inline-flex; gap: 6px; align-items: center;">
              ${!isDone ? `
                <button class="btn btn-primary btn-sm" onclick="TransfersPage.validateTransfer(${t.id}, '${t.reference}')">
                  ${renderIcon('check', 13)} Validate Transfer
                </button>
              ` : `
                <span style="font-size: 0.76rem; color: #10b981; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
                  ${renderIcon('check-circle', 14)} Completed
                </span>
              `}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  async openCreateModal() {
    const [whRes, prodRes] = await Promise.all([
      API.getWarehouses(),
      API.getProducts()
    ]);

    const warehouses = whRes.warehouses || [];
    const products = prodRes.products || [];

    const whOptions = warehouses.map(w => `<option value="${w.id}">${w.name} (${w.code})</option>`).join('');

    Modals.open({
      title: 'Create Internal Stock Transfer',
      large: true,
      content: `
        <form id="transfer-form" style="display: flex; flex-direction: column; gap: 16px;">
          <!-- Source & Dest Row -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 18px; padding: 14px; background: #f8fafc; border-radius: var(--radius-md); border: 1px solid #e2e8f0;">
            <!-- Source -->
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <div style="font-size: 0.8rem; font-weight: 700; color: #e11d48; text-transform: uppercase; letter-spacing: 0.05em;">Source (Deduct Stock)</div>
              <div class="form-field">
                <label class="form-label">Source Facility *</label>
                <select id="trf-src-wh" class="form-select" onchange="TransfersPage.loadLocations('src', this.value)">${whOptions}</select>
              </div>
              <div class="form-field">
                <label class="form-label">Source Storage Rack / Location *</label>
                <select id="trf-src-loc" class="form-select"></select>
              </div>
            </div>

            <!-- Destination -->
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <div style="font-size: 0.8rem; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 0.05em;">Destination (Credit Stock)</div>
              <div class="form-field">
                <label class="form-label">Destination Facility *</label>
                <select id="trf-dest-wh" class="form-select" onchange="TransfersPage.loadLocations('dest', this.value)">${whOptions}</select>
              </div>
              <div class="form-field">
                <label class="form-label">Destination Storage Rack / Location *</label>
                <select id="trf-dest-loc" class="form-select"></select>
              </div>
            </div>
          </div>

          <div class="form-field">
            <label class="form-label">Transfer Purpose / Notes</label>
            <input type="text" id="trf-notes" class="form-input" placeholder="e.g. Replenishing Detroit chassis assembly buffer from CDC" />
          </div>

          <div style="border: 1px solid #e2e8f0; border-radius: var(--radius-md); padding: 14px; background: #f8fafc;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span style="font-weight: 700; font-size: 0.86rem; color: #334155;">Products to Relocate</span>
              <button type="button" class="btn btn-secondary btn-sm" onclick="TransfersPage.addLineItem()">
                ${renderIcon('plus', 13)} Add Product
              </button>
            </div>

            <div id="transfer-lines-container" style="display: flex; flex-direction: column; gap: 10px;"></div>
          </div>
        </form>
      `,
      footer: `
        <button class="btn btn-secondary" onclick="Modals.close()">Cancel</button>
        <button class="btn btn-primary" id="btn-save-transfer">Create & Schedule Transfer</button>
      `
    });

    window.allProductsCache = products;
    window.allWarehousesCache = warehouses;

    if (warehouses.length > 0) {
      await TransfersPage.loadLocations('src', warehouses[0].id);
      await TransfersPage.loadLocations('dest', warehouses.length > 1 ? warehouses[1].id : warehouses[0].id);
    }

    TransfersPage.addLineItem();

    document.getElementById('btn-save-transfer').addEventListener('click', async () => {
      const srcWh = document.getElementById('trf-src-wh').value;
      const srcLoc = document.getElementById('trf-src-loc').value;
      const destWh = document.getElementById('trf-dest-wh').value;
      const destLoc = document.getElementById('trf-dest-loc').value;
      const notes = document.getElementById('trf-notes').value.trim();

      if (srcLoc === destLoc) {
        return Toast.error('Source and destination locations cannot be identical!');
      }

      const lineRows = document.querySelectorAll('.transfer-line-row');
      const lines = [];
      lineRows.forEach(row => {
        const prodId = row.querySelector('.line-prod-select').value;
        const qty = parseFloat(row.querySelector('.line-qty-input').value);
        if (prodId && qty > 0) {
          lines.push({ product_id: prodId, quantity: qty });
        }
      });

      if (lines.length === 0) return Toast.error('Please specify at least one product with quantity > 0');

      try {
        const res = await API.createTransfer({
          source_warehouse_id: srcWh,
          source_location_id: srcLoc,
          dest_warehouse_id: destWh,
          dest_location_id: destLoc,
          notes,
          status: 'ready',
          lines
        });
        Toast.success(`Internal transfer ${res.reference} created!`);
        Modals.close();
        TransfersPage.refresh();
      } catch (e) {}
    });
  },

  async loadLocations(type, whId) {
    const locRes = await API.getLocations({ warehouse_id: whId });
    const locs = locRes.locations || [];
    const select = document.getElementById(`trf-${type}-loc`);
    if (select) {
      select.innerHTML = locs.map(l => `<option value="${l.id}">${l.name} (${l.code})</option>`).join('');
    }
  },

  addLineItem() {
    const container = document.getElementById('transfer-lines-container');
    if (!container) return;

    const rowId = `trf_line_${Date.now()}_${Math.random().toString().slice(2, 6)}`;
    const prodOptions = (window.allProductsCache || []).map(p => `
      <option value="${p.id}">${p.name} (${p.sku})</option>
    `).join('');

    const div = document.createElement('div');
    div.className = 'transfer-line-row';
    div.id = rowId;
    div.style = 'display: flex; gap: 10px; align-items: center; background: white; padding: 10px; border-radius: var(--radius-sm); border: 1px solid #e2e8f0;';

    div.innerHTML = `
      <div style="flex: 3;">
        <select class="form-select line-prod-select" style="width: 100%;">
          ${prodOptions}
        </select>
      </div>
      <div style="flex: 1;">
        <input type="number" class="form-input line-qty-input" placeholder="Quantity" value="25" min="1" step="1" style="width: 100%;" />
      </div>
      <button type="button" class="btn-icon" style="color: #f43f5e;" onclick="document.getElementById('${rowId}').remove()" title="Remove line">
        ${renderIcon('trash', 15)}
      </button>
    `;

    container.appendChild(div);
  },

  async validateTransfer(id, ref) {
    Modals.confirm(
      'Validate Internal Relocation',
      `Validating transfer "${ref}" will atomically transfer stock from the source rack to destination rack. Total company-wide inventory balance remains invariant and strictly unchanged. Proceed?`,
      async () => {
        try {
          const res = await API.validateTransfer(id);
          Toast.success(res.message);
          TransfersPage.refresh();
        } catch (e) {}
      }
    );
  },

  debounceTimer: null,
  onSearchInput(val) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(async () => {
      this.filters.search = val.trim();
      const res = await API.getTransfers(this.filters);
      this.transfers = res.transfers || [];
      const tbody = document.getElementById('transfers-tbody');
      if (tbody) tbody.innerHTML = this.renderRows();
    }, 200);
  },

  async onFilterChange(field, val) {
    this.filters[field] = val;
    const res = await API.getTransfers(this.filters);
    this.transfers = res.transfers || [];
    const tbody = document.getElementById('transfers-tbody');
    if (tbody) tbody.innerHTML = this.renderRows();
  },

  async refresh() {
    const main = document.getElementById('main-workspace');
    if (main) await this.render(main);
  }
};

window.TransfersPage = TransfersPage;
