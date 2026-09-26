// Receipts (Incoming Stock) Page
const ReceiptsPage = {
  receipts: [],
  filters: {
    status: 'all',
    warehouse_id: 'all',
    search: ''
  },

  async render(container) {
    container.innerHTML = `
      <div style="display:flex; justify-content:center; align-items:center; padding: 100px 0;">
        <span style="color:#10b981;">${renderIcon('refresh-cw', 32)}</span>
        <span style="margin-left: 12px; font-weight: 500; color: #64748b;">Loading vendor receipts...</span>
      </div>
    `;

    try {
      const [res, whRes] = await Promise.all([
        API.getReceipts(this.filters),
        API.getWarehouses()
      ]);

      this.receipts = res.receipts || [];
      const warehouses = whRes.warehouses || [];

      const whOptions = warehouses.map(w => `
        <option value="${w.id}" ${this.filters.warehouse_id == w.id ? 'selected' : ''}>${w.name}</option>
      `).join('');

      container.innerHTML = `
        <div class="page-workspace">
          <!-- Page Header -->
          <div class="page-header">
            <div class="page-title-group">
              <h1>Inbound Receipts</h1>
              <p>Receiving dock operations, vendor goods intake, and physical stock induction</p>
            </div>
            <div class="page-actions">
              <button class="btn btn-secondary btn-sm" onclick="ReceiptsPage.refresh()">
                ${renderIcon('refresh-cw', 14)} Refresh
              </button>
              <button class="btn btn-primary btn-sm" onclick="ReceiptsPage.openCreateModal()">
                ${renderIcon('plus', 15)} New Receipt
              </button>
            </div>
          </div>

          <!-- Filter Toolbar -->
          <div class="filter-bar">
            <div style="position: relative; flex: 1; min-width: 240px;">
              <input type="text" class="form-input" style="width: 100%; padding-left: 34px;"
                     placeholder="Search reference, supplier name..."
                     value="${this.filters.search}"
                     oninput="ReceiptsPage.onSearchInput(this.value)" />
              <div style="position: absolute; left: 10px; top: 9px; color: #94a3b8;">
                ${renderIcon('search', 16)}
              </div>
            </div>

            <div class="filter-group">
              <span class="filter-label">Status:</span>
              <select class="filter-select" onchange="ReceiptsPage.onFilterChange('status', this.value)">
                <option value="all" ${this.filters.status === 'all' ? 'selected' : ''}>All Statuses</option>
                <option value="draft" ${this.filters.status === 'draft' ? 'selected' : ''}>Draft</option>
                <option value="ready" ${this.filters.status === 'ready' ? 'selected' : ''}>Ready for Intake</option>
                <option value="done" ${this.filters.status === 'done' ? 'selected' : ''}>Validated (Done)</option>
                <option value="canceled" ${this.filters.status === 'canceled' ? 'selected' : ''}>Canceled</option>
              </select>
            </div>

            <div class="filter-group">
              <span class="filter-label">Warehouse:</span>
              <select class="filter-select" onchange="ReceiptsPage.onFilterChange('warehouse_id', this.value)">
                <option value="all">All Facilities</option>
                ${whOptions}
              </select>
            </div>
          </div>

          <!-- Receipts Table -->
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Receipt Reference</th>
                  <th>Vendor / Supplier</th>
                  <th>Intake Facility & Location</th>
                  <th>SKU Lines</th>
                  <th>Total Units</th>
                  <th>Status</th>
                  <th>Date Recorded</th>
                  <th style="text-align: right;">Workflow Actions</th>
                </tr>
              </thead>
              <tbody id="receipts-tbody">
                ${this.renderRows()}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } catch (e) {
      container.innerHTML = `<div class="empty-state">Failed to load receipts: ${e.message}</div>`;
    }
  },

  renderRows() {
    if (!this.receipts || this.receipts.length === 0) {
      return `<tr><td colspan="8" class="empty-state" style="padding: 36px;">No receipts found matching criteria</td></tr>`;
    }

    return this.receipts.map(r => {
      const isDone = r.status === 'done';
      const isCanceled = r.status === 'canceled';

      let itemsSummary = '';
      if (r.lines && r.lines.length > 0) {
        itemsSummary = r.lines.map(l => `${l.quantity_expected} ${l.uom} of ${l.product_name}`).join(', ');
      }

      return `
        <tr>
          <td>
            <div style="font-family: monospace; font-weight: 700; color: #0f172a;">${r.reference}</div>
            <div style="font-size: 0.74rem; color: #64748b;" title="${itemsSummary}">${r.line_count} line items</div>
          </td>
          <td>
            <div style="font-weight: 600; color: #334155;">${r.supplier_name || 'Generic Vendor'}</div>
            <div style="font-size: 0.74rem; color: #94a3b8;">${r.supplier_email || ''}</div>
          </td>
          <td>
            <div style="font-weight: 500;">${r.warehouse_name}</div>
            <div style="font-size: 0.74rem; color: #64748b;">${r.location_name} (${r.location_code})</div>
          </td>
          <td>${r.line_count}</td>
          <td style="font-weight: 700; color: #10b981;">+${r.total_quantity}</td>
          <td><span class="badge badge-${r.status}">${r.status.toUpperCase()}</span></td>
          <td style="font-size: 0.78rem; color: #64748b;">${r.created_at.slice(0, 16)}</td>
          <td style="text-align: right;">
            <div style="display: inline-flex; gap: 6px; align-items: center;">
              <button class="btn btn-secondary btn-sm" onclick='ReceiptsPage.viewDetails(${JSON.stringify(r).replace(/'/g, "&#39;")})' title="View details">
                ${renderIcon('eye', 13)} View
              </button>

              ${!isDone && !isCanceled ? `
                ${r.status === 'draft' ? `
                  <button class="btn btn-secondary btn-sm" style="color: #2563eb;" onclick="ReceiptsPage.setStatus(${r.id}, 'ready')">
                    Mark Ready
                  </button>
                ` : ''}

                <button class="btn btn-primary btn-sm" onclick="ReceiptsPage.validateReceipt(${r.id}, '${r.reference}')">
                  ${renderIcon('check', 13)} Validate Stock
                </button>

                <button class="btn btn-secondary btn-sm" style="color: #f43f5e;" onclick="ReceiptsPage.setStatus(${r.id}, 'canceled')">
                  Cancel
                </button>
              ` : ''}

              ${isDone ? `
                <span style="font-size: 0.76rem; color: #10b981; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
                  ${renderIcon('check-circle', 14)} Inducted
                </span>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  viewDetails(r) {
    const linesHtml = (r.lines || []).map(l => `
      <tr>
        <td style="font-weight: 600;">${l.product_name}</td>
        <td style="font-family: monospace;">${l.sku}</td>
        <td>${l.quantity_expected} ${l.uom}</td>
        <td style="font-weight: 600; color: #10b981;">${l.quantity_received} ${l.uom}</td>
        <td>$${l.unit_cost.toFixed(2)}</td>
      </tr>
    `).join('');

    Modals.open({
      title: `Receipt Details: ${r.reference}`,
      large: true,
      content: `
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div class="form-grid-2" style="background: #f8fafc; padding: 14px; border-radius: var(--radius-md); border: 1px solid #e2e8f0;">
            <div>
              <div style="font-size: 0.74rem; color: #64748b;">Supplier / Vendor</div>
              <div style="font-weight: 700; color: #0f172a;">${r.supplier_name || 'Standard Vendor'}</div>
            </div>
            <div>
              <div style="font-size: 0.74rem; color: #64748b;">Destination Storage</div>
              <div style="font-weight: 600;">${r.warehouse_name} &rarr; ${r.location_name}</div>
            </div>
            <div>
              <div style="font-size: 0.74rem; color: #64748b;">Status</div>
              <div><span class="badge badge-${r.status}">${r.status.toUpperCase()}</span></div>
            </div>
            <div>
              <div style="font-size: 0.74rem; color: #64748b;">Recorded Date</div>
              <div style="font-weight: 500;">${r.created_at}</div>
            </div>
          </div>

          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>SKU</th>
                  <th>Expected Qty</th>
                  <th>Received Qty</th>
                  <th>Unit Cost</th>
                </tr>
              </thead>
              <tbody>
                ${linesHtml}
              </tbody>
            </table>
          </div>

          ${r.notes ? `
            <div style="font-size: 0.82rem; color: #475569; background: #fff; padding: 10px; border-radius: var(--radius-sm); border: 1px solid #e2e8f0;">
              <strong>Intake Notes:</strong> ${r.notes}
            </div>
          ` : ''}
        </div>
      `,
      footer: `
        <button class="btn btn-secondary" onclick="Modals.close()">Close</button>
        ${r.status !== 'done' && r.status !== 'canceled' ? `
          <button class="btn btn-primary" onclick="Modals.close(); ReceiptsPage.validateReceipt(${r.id}, '${r.reference}')">
            Validate Inbound Stock
          </button>
        ` : ''}
      `
    });
  },

  async openCreateModal() {
    const [supRes, whRes, prodRes] = await Promise.all([
      API.getSuppliers(),
      API.getWarehouses(),
      API.getProducts()
    ]);

    const suppliers = supRes.suppliers || [];
    const warehouses = whRes.warehouses || [];
    const products = prodRes.products || [];

    const supOptions = suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    const whOptions = warehouses.map(w => `<option value="${w.id}">${w.name} (${w.code})</option>`).join('');
    const prodOptions = products.map(p => `<option value="${p.id}" data-cost="${p.unit_cost}" data-uom="${p.uom}">${p.name} (${p.sku})</option>`).join('');

    Modals.open({
      title: 'Create Inbound Receipt',
      large: true,
      content: `
        <form id="receipt-form" style="display: flex; flex-direction: column; gap: 16px;">
          <div class="form-grid-2">
            <div class="form-field">
              <label class="form-label">Vendor / Supplier *</label>
              <select id="rec-supplier" class="form-select">${supOptions}</select>
            </div>

            <div class="form-field">
              <label class="form-label">Destination Facility *</label>
              <select id="rec-warehouse" class="form-select" onchange="ReceiptsPage.onWarehouseSelect(this.value)">${whOptions}</select>
            </div>

            <div class="form-field">
              <label class="form-label">Storage Location / Rack *</label>
              <select id="rec-location" class="form-select"></select>
            </div>

            <div class="form-field">
              <label class="form-label">Initial Status</label>
              <select id="rec-status" class="form-select">
                <option value="draft">Draft (Planning)</option>
                <option value="ready">Ready (Arrived at Dock)</option>
              </select>
            </div>
          </div>

          <div class="form-field">
            <label class="form-label">Inbound Notes / PO Reference</label>
            <input type="text" id="rec-notes" class="form-input" placeholder="e.g. Purchase order PO-9942 via Freight carrier" />
          </div>

          <!-- Product Line Items -->
          <div style="border: 1px solid #e2e8f0; border-radius: var(--radius-md); padding: 14px; background: #f8fafc;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span style="font-weight: 700; font-size: 0.86rem; color: #334155;">Incoming Product Lines</span>
              <button type="button" class="btn btn-secondary btn-sm" onclick="ReceiptsPage.addLineItem()">
                ${renderIcon('plus', 13)} Add SKU Line
              </button>
            </div>

            <div id="receipt-lines-container" style="display: flex; flex-direction: column; gap: 10px;">
              <!-- Line row template will be added here -->
            </div>
          </div>
        </form>
      `,
      footer: `
        <button class="btn btn-secondary" onclick="Modals.close()">Cancel</button>
        <button class="btn btn-primary" id="btn-save-receipt">Create Receipt</button>
      `
    });

    window.allProductsCache = products;
    window.allWarehousesCache = warehouses;

    // Load locations for first warehouse
    if (warehouses.length > 0) {
      await ReceiptsPage.onWarehouseSelect(warehouses[0].id);
    }

    // Add first line item
    ReceiptsPage.addLineItem();

    document.getElementById('btn-save-receipt').addEventListener('click', async () => {
      const supplier_id = document.getElementById('rec-supplier').value;
      const warehouse_id = document.getElementById('rec-warehouse').value;
      const location_id = document.getElementById('rec-location').value;
      const notes = document.getElementById('rec-notes').value.trim();
      const status = document.getElementById('rec-status').value;

      if (!location_id) return Toast.error('Please select destination storage location');

      // Collect lines
      const lineRows = document.querySelectorAll('.receipt-line-row');
      const lines = [];
      lineRows.forEach(row => {
        const prodId = row.querySelector('.line-prod-select').value;
        const qty = parseFloat(row.querySelector('.line-qty-input').value);
        const cost = parseFloat(row.querySelector('.line-cost-input').value) || 0;
        if (prodId && qty > 0) {
          lines.push({ product_id: prodId, quantity: qty, unit_cost: cost });
        }
      });

      if (lines.length === 0) return Toast.error('Please add at least one product with quantity > 0');

      try {
        const res = await API.createReceipt({
          supplier_id,
          warehouse_id,
          location_id,
          notes,
          status,
          lines
        });
        Toast.success(`Receipt ${res.reference} created successfully!`);
        Modals.close();
        ReceiptsPage.refresh();
      } catch (e) {}
    });
  },

  async onWarehouseSelect(whId) {
    const locRes = await API.getLocations({ warehouse_id: whId });
    const locs = locRes.locations || [];
    const locSelect = document.getElementById('rec-location');
    if (locSelect) {
      locSelect.innerHTML = locs.map(l => `<option value="${l.id}">${l.name} (${l.code})</option>`).join('');
    }
  },

  addLineItem() {
    const container = document.getElementById('receipt-lines-container');
    if (!container) return;

    const rowId = `line_${Date.now()}_${Math.random().toString().slice(2, 6)}`;
    const prodOptions = (window.allProductsCache || []).map(p => `
      <option value="${p.id}" data-cost="${p.unit_cost}">${p.name} (${p.sku})</option>
    `).join('');

    const div = document.createElement('div');
    div.className = 'receipt-line-row';
    div.id = rowId;
    div.style = 'display: flex; gap: 10px; align-items: center; background: white; padding: 10px; border-radius: var(--radius-sm); border: 1px solid #e2e8f0;';

    div.innerHTML = `
      <div style="flex: 2;">
        <select class="form-select line-prod-select" style="width: 100%;" onchange="ReceiptsPage.onLineProdChange('${rowId}', this)">
          ${prodOptions}
        </select>
      </div>
      <div style="flex: 1;">
        <input type="number" class="form-input line-qty-input" placeholder="Qty" value="50" min="1" step="1" style="width: 100%;" />
      </div>
      <div style="flex: 1;">
        <input type="number" class="form-input line-cost-input" placeholder="Cost ($)" value="15.00" step="0.01" style="width: 100%;" />
      </div>
      <button type="button" class="btn-icon" style="color: #f43f5e;" onclick="document.getElementById('${rowId}').remove()" title="Remove line">
        ${renderIcon('trash', 15)}
      </button>
    `;

    container.appendChild(div);
  },

  onLineProdChange(rowId, selectEl) {
    const selectedOpt = selectEl.options[selectEl.selectedIndex];
    const cost = selectedOpt.getAttribute('data-cost');
    const row = document.getElementById(rowId);
    if (row && cost) {
      row.querySelector('.line-cost-input').value = cost;
    }
  },

  async validateReceipt(id, ref) {
    Modals.confirm(
      'Validate Receipt',
      `Validating receipt "${ref}" will immediately increase warehouse physical stock balances and create an auditable entry in the Stock Ledger. This cannot be undone. Confirm?`,
      async () => {
        try {
          const res = await API.validateReceipt(id);
          Toast.success(res.message);
          ReceiptsPage.refresh();
        } catch (e) {}
      }
    );
  },

  async setStatus(id, status) {
    try {
      await API.updateReceiptStatus(id, status);
      Toast.success(`Receipt marked as ${status}`);
      ReceiptsPage.refresh();
    } catch (e) {}
  },

  debounceTimer: null,
  onSearchInput(val) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(async () => {
      this.filters.search = val.trim();
      const res = await API.getReceipts(this.filters);
      this.receipts = res.receipts || [];
      const tbody = document.getElementById('receipts-tbody');
      if (tbody) tbody.innerHTML = this.renderRows();
    }, 200);
  },

  async onFilterChange(field, val) {
    this.filters[field] = val;
    const res = await API.getReceipts(this.filters);
    this.receipts = res.receipts || [];
    const tbody = document.getElementById('receipts-tbody');
    if (tbody) tbody.innerHTML = this.renderRows();
  },

  async refresh() {
    const main = document.getElementById('main-workspace');
    if (main) await this.render(main);
  }
};

window.ReceiptsPage = ReceiptsPage;
