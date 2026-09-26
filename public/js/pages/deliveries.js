// Delivery Orders (Outgoing Stock) Page
const DeliveriesPage = {
  deliveries: [],
  filters: {
    status: 'all',
    warehouse_id: 'all',
    search: ''
  },

  async render(container) {
    container.innerHTML = `
      <div style="display:flex; justify-content:center; align-items:center; padding: 100px 0;">
        <span style="color:#10b981;">${renderIcon('refresh-cw', 32)}</span>
        <span style="margin-left: 12px; font-weight: 500; color: #64748b;">Loading outbound deliveries...</span>
      </div>
    `;

    try {
      const [res, whRes] = await Promise.all([
        API.getDeliveries(this.filters),
        API.getWarehouses()
      ]);

      this.deliveries = res.deliveries || [];
      const warehouses = whRes.warehouses || [];

      const whOptions = warehouses.map(w => `
        <option value="${w.id}" ${this.filters.warehouse_id == w.id ? 'selected' : ''}>${w.name}</option>
      `).join('');

      container.innerHTML = `
        <div class="page-workspace">
          <!-- Page Header -->
          <div class="page-header">
            <div class="page-title-group">
              <h1>Outbound Delivery Orders</h1>
              <p>Customer fulfillment, pick & pack dispatch, and inventory stock decrement</p>
            </div>
            <div class="page-actions">
              <button class="btn btn-secondary btn-sm" onclick="DeliveriesPage.refresh()">
                ${renderIcon('refresh-cw', 14)} Refresh
              </button>
              <button class="btn btn-primary btn-sm" onclick="DeliveriesPage.openCreateModal()">
                ${renderIcon('plus', 15)} New Delivery Order
              </button>
            </div>
          </div>

          <!-- Filter Toolbar -->
          <div class="filter-bar">
            <div style="position: relative; flex: 1; min-width: 240px;">
              <input type="text" class="form-input" style="width: 100%; padding-left: 34px;"
                     placeholder="Search reference, customer name..."
                     value="${this.filters.search}"
                     oninput="DeliveriesPage.onSearchInput(this.value)" />
              <div style="position: absolute; left: 10px; top: 9px; color: #94a3b8;">
                ${renderIcon('search', 16)}
              </div>
            </div>

            <div class="filter-group">
              <span class="filter-label">Status:</span>
              <select class="filter-select" onchange="DeliveriesPage.onFilterChange('status', this.value)">
                <option value="all" ${this.filters.status === 'all' ? 'selected' : ''}>All Statuses</option>
                <option value="draft" ${this.filters.status === 'draft' ? 'selected' : ''}>Draft</option>
                <option value="waiting" ${this.filters.status === 'waiting' ? 'selected' : ''}>Waiting Staging</option>
                <option value="ready" ${this.filters.status === 'ready' ? 'selected' : ''}>Ready (Picked & Packed)</option>
                <option value="done" ${this.filters.status === 'done' ? 'selected' : ''}>Validated (Done)</option>
                <option value="canceled" ${this.filters.status === 'canceled' ? 'selected' : ''}>Canceled</option>
              </select>
            </div>

            <div class="filter-group">
              <span class="filter-label">Warehouse:</span>
              <select class="filter-select" onchange="DeliveriesPage.onFilterChange('warehouse_id', this.value)">
                <option value="all">All Facilities</option>
                ${whOptions}
              </select>
            </div>
          </div>

          <!-- Deliveries Table -->
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Order Reference</th>
                  <th>Customer Client</th>
                  <th>Source Storage Facility</th>
                  <th>Items / Lines</th>
                  <th>Quantity Demanded</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th style="text-align: right;">Pick, Pack & Validate</th>
                </tr>
              </thead>
              <tbody id="deliveries-tbody">
                ${this.renderRows()}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } catch (e) {
      container.innerHTML = `<div class="empty-state">Failed to load deliveries: ${e.message}</div>`;
    }
  },

  renderRows() {
    if (!this.deliveries || this.deliveries.length === 0) {
      return `<tr><td colspan="8" class="empty-state" style="padding: 36px;">No delivery orders found</td></tr>`;
    }

    return this.deliveries.map(d => {
      const isDone = d.status === 'done';
      const isCanceled = d.status === 'canceled';

      return `
        <tr>
          <td>
            <div style="font-family: monospace; font-weight: 700; color: #0f172a;">${d.reference}</div>
            <div style="font-size: 0.74rem; color: #64748b;">${d.line_count} line items</div>
          </td>
          <td>
            <div style="font-weight: 600; color: #334155;">${d.customer_name || 'Direct Customer'}</div>
            <div style="font-size: 0.74rem; color: #94a3b8;">${d.customer_email || ''}</div>
          </td>
          <td>
            <div style="font-weight: 500;">${d.warehouse_name}</div>
            <div style="font-size: 0.74rem; color: #64748b;">${d.location_name} (${d.location_code})</div>
          </td>
          <td>${d.line_count}</td>
          <td style="font-weight: 700; color: #f43f5e;">-${d.total_quantity}</td>
          <td><span class="badge badge-${d.status}">${d.status.toUpperCase()}</span></td>
          <td style="font-size: 0.78rem; color: #64748b;">${d.created_at.slice(0, 16)}</td>
          <td style="text-align: right;">
            <div style="display: inline-flex; gap: 6px; align-items: center;">
              <button class="btn btn-secondary btn-sm" onclick='DeliveriesPage.viewDetails(${JSON.stringify(d).replace(/'/g, "&#39;")})' title="View details">
                ${renderIcon('eye', 13)} View
              </button>

              ${!isDone && !isCanceled ? `
                ${d.status === 'draft' || d.status === 'waiting' ? `
                  <button class="btn btn-secondary btn-sm" style="color: #2563eb;" onclick="DeliveriesPage.setStatus(${d.id}, 'ready')">
                    Pick & Pack
                  </button>
                ` : ''}

                <button class="btn btn-primary btn-sm" onclick="DeliveriesPage.validateDelivery(${d.id}, '${d.reference}')">
                  ${renderIcon('truck', 13)} Validate Outbound
                </button>

                <button class="btn btn-secondary btn-sm" style="color: #f43f5e;" onclick="DeliveriesPage.setStatus(${d.id}, 'canceled')">
                  Cancel
                </button>
              ` : ''}

              ${isDone ? `
                <span style="font-size: 0.76rem; color: #10b981; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
                  ${renderIcon('check-circle', 14)} Dispatched
                </span>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  viewDetails(d) {
    const linesHtml = (d.lines || []).map(l => `
      <tr>
        <td style="font-weight: 600;">${l.product_name}</td>
        <td style="font-family: monospace;">${l.sku}</td>
        <td style="font-weight: 600; color: #f43f5e;">${l.quantity_demanded} ${l.uom}</td>
        <td style="color: #10b981; font-weight: 600;">${l.available_stock} ${l.uom} available</td>
        <td>$${l.unit_price.toFixed(2)}</td>
      </tr>
    `).join('');

    Modals.open({
      title: `Delivery Order: ${d.reference}`,
      large: true,
      content: `
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div class="form-grid-2" style="background: #f8fafc; padding: 14px; border-radius: var(--radius-md); border: 1px solid #e2e8f0;">
            <div>
              <div style="font-size: 0.74rem; color: #64748b;">Customer</div>
              <div style="font-weight: 700; color: #0f172a;">${d.customer_name || 'Standard Client'}</div>
            </div>
            <div>
              <div style="font-size: 0.74rem; color: #64748b;">Source Storage Dock</div>
              <div style="font-weight: 600;">${d.warehouse_name} &rarr; ${d.location_name}</div>
            </div>
            <div>
              <div style="font-size: 0.74rem; color: #64748b;">Status</div>
              <div><span class="badge badge-${d.status}">${d.status.toUpperCase()}</span></div>
            </div>
            <div>
              <div style="font-size: 0.74rem; color: #64748b;">Order Date</div>
              <div style="font-weight: 500;">${d.created_at}</div>
            </div>
          </div>

          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Demanded Quantity</th>
                  <th>Location Available Stock</th>
                  <th>Unit Sale Price</th>
                </tr>
              </thead>
              <tbody>
                ${linesHtml}
              </tbody>
            </table>
          </div>

          ${d.notes ? `
            <div style="font-size: 0.82rem; color: #475569; background: #fff; padding: 10px; border-radius: var(--radius-sm); border: 1px solid #e2e8f0;">
              <strong>Dispatch Notes:</strong> ${d.notes}
            </div>
          ` : ''}
        </div>
      `,
      footer: `
        <button class="btn btn-secondary" onclick="Modals.close()">Close</button>
        ${d.status !== 'done' && d.status !== 'canceled' ? `
          <button class="btn btn-primary" onclick="Modals.close(); DeliveriesPage.validateDelivery(${d.id}, '${d.reference}')">
            Validate & Deduct Stock
          </button>
        ` : ''}
      `
    });
  },

  async openCreateModal() {
    const [custRes, whRes, prodRes] = await Promise.all([
      API.getCustomers(),
      API.getWarehouses(),
      API.getProducts()
    ]);

    const customers = custRes.customers || [];
    const warehouses = whRes.warehouses || [];
    const products = prodRes.products || [];

    const custOptions = customers.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    const whOptions = warehouses.map(w => `<option value="${w.id}">${w.name} (${w.code})</option>`).join('');

    Modals.open({
      title: 'Create Outbound Delivery Order',
      large: true,
      content: `
        <form id="delivery-form" style="display: flex; flex-direction: column; gap: 16px;">
          <div class="form-grid-2">
            <div class="form-field">
              <label class="form-label">Client / Customer *</label>
              <select id="del-customer" class="form-select">${custOptions}</select>
            </div>

            <div class="form-field">
              <label class="form-label">Source Facility *</label>
              <select id="del-warehouse" class="form-select" onchange="DeliveriesPage.onWarehouseSelect(this.value)">${whOptions}</select>
            </div>

            <div class="form-field">
              <label class="form-label">Source Storage Location *</label>
              <select id="del-location" class="form-select"></select>
            </div>

            <div class="form-field">
              <label class="form-label">Initial Status</label>
              <select id="del-status" class="form-select">
                <option value="draft">Draft (Planning)</option>
                <option value="waiting">Waiting (Staging)</option>
                <option value="ready">Ready (Picked & Packed)</option>
              </select>
            </div>
          </div>

          <div class="form-field">
            <label class="form-label">Dispatch Shipping Notes / Carrier</label>
            <input type="text" id="del-notes" class="form-input" placeholder="e.g. Expedited Freight Bill #9910" />
          </div>

          <div style="border: 1px solid #e2e8f0; border-radius: var(--radius-md); padding: 14px; background: #f8fafc;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span style="font-weight: 700; font-size: 0.86rem; color: #334155;">Demanded Product Lines (Stock Availability Enforced)</span>
              <button type="button" class="btn btn-secondary btn-sm" onclick="DeliveriesPage.addLineItem()">
                ${renderIcon('plus', 13)} Add Product
              </button>
            </div>

            <div id="delivery-lines-container" style="display: flex; flex-direction: column; gap: 10px;"></div>
          </div>
        </form>
      `,
      footer: `
        <button class="btn btn-secondary" onclick="Modals.close()">Cancel</button>
        <button class="btn btn-primary" id="btn-save-delivery">Create Delivery</button>
      `
    });

    window.allProductsCache = products;
    window.allWarehousesCache = warehouses;

    if (warehouses.length > 0) {
      await DeliveriesPage.onWarehouseSelect(warehouses[0].id);
    }

    DeliveriesPage.addLineItem();

    document.getElementById('btn-save-delivery').addEventListener('click', async () => {
      const customer_id = document.getElementById('del-customer').value;
      const warehouse_id = document.getElementById('del-warehouse').value;
      const location_id = document.getElementById('del-location').value;
      const notes = document.getElementById('del-notes').value.trim();
      const status = document.getElementById('del-status').value;

      if (!location_id) return Toast.error('Please select source storage location');

      const lineRows = document.querySelectorAll('.delivery-line-row');
      const lines = [];
      lineRows.forEach(row => {
        const prodId = row.querySelector('.line-prod-select').value;
        const qty = parseFloat(row.querySelector('.line-qty-input').value);
        const price = parseFloat(row.querySelector('.line-price-input').value) || 0;
        if (prodId && qty > 0) {
          lines.push({ product_id: prodId, quantity: qty, unit_price: price });
        }
      });

      if (lines.length === 0) return Toast.error('Please add at least one line item with quantity > 0');

      try {
        const res = await API.createDelivery({
          customer_id,
          warehouse_id,
          location_id,
          notes,
          status,
          lines
        });
        Toast.success(`Delivery order ${res.reference} created successfully!`);
        Modals.close();
        DeliveriesPage.refresh();
      } catch (e) {}
    });
  },

  async onWarehouseSelect(whId) {
    const locRes = await API.getLocations({ warehouse_id: whId });
    const locs = locRes.locations || [];
    const locSelect = document.getElementById('del-location');
    if (locSelect) {
      locSelect.innerHTML = locs.map(l => `<option value="${l.id}">${l.name} (${l.code})</option>`).join('');
    }
  },

  addLineItem() {
    const container = document.getElementById('delivery-lines-container');
    if (!container) return;

    const rowId = `del_line_${Date.now()}_${Math.random().toString().slice(2, 6)}`;
    const prodOptions = (window.allProductsCache || []).map(p => `
      <option value="${p.id}">${p.name} (${p.sku}) — Avail: ${p.current_stock} ${p.uom}</option>
    `).join('');

    const div = document.createElement('div');
    div.className = 'delivery-line-row';
    div.id = rowId;
    div.style = 'display: flex; gap: 10px; align-items: center; background: white; padding: 10px; border-radius: var(--radius-sm); border: 1px solid #e2e8f0;';

    div.innerHTML = `
      <div style="flex: 2;">
        <select class="form-select line-prod-select" style="width: 100%;">
          ${prodOptions}
        </select>
      </div>
      <div style="flex: 1;">
        <input type="number" class="form-input line-qty-input" placeholder="Demanded Qty" value="10" min="1" step="1" style="width: 100%;" />
      </div>
      <div style="flex: 1;">
        <input type="number" class="form-input line-price-input" placeholder="Price ($)" value="45.00" step="0.01" style="width: 100%;" />
      </div>
      <button type="button" class="btn-icon" style="color: #f43f5e;" onclick="document.getElementById('${rowId}').remove()" title="Remove line">
        ${renderIcon('trash', 15)}
      </button>
    `;

    container.appendChild(div);
  },

  async validateDelivery(id, ref) {
    Modals.confirm(
      'Validate Delivery Order',
      `Validating order "${ref}" verifies stock availability, decrements inventory from the source location, and registers an outbound audit record in the Stock Ledger. Confirm dispatch?`,
      async () => {
        try {
          const res = await API.validateDelivery(id);
          Toast.success(res.message);
          DeliveriesPage.refresh();
        } catch (e) {}
      }
    );
  },

  async setStatus(id, status) {
    try {
      await API.updateDeliveryStatus(id, status);
      Toast.success(`Delivery order status set to ${status}`);
      DeliveriesPage.refresh();
    } catch (e) {}
  },

  debounceTimer: null,
  onSearchInput(val) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(async () => {
      this.filters.search = val.trim();
      const res = await API.getDeliveries(this.filters);
      this.deliveries = res.deliveries || [];
      const tbody = document.getElementById('deliveries-tbody');
      if (tbody) tbody.innerHTML = this.renderRows();
    }, 200);
  },

  async onFilterChange(field, val) {
    this.filters[field] = val;
    const res = await API.getDeliveries(this.filters);
    this.deliveries = res.deliveries || [];
    const tbody = document.getElementById('deliveries-tbody');
    if (tbody) tbody.innerHTML = this.renderRows();
  },

  async refresh() {
    const main = document.getElementById('main-workspace');
    if (main) await this.render(main);
  }
};

window.DeliveriesPage = DeliveriesPage;
