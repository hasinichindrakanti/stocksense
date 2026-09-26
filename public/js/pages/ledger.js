// Stock Ledger & Move History Page
const LedgerPage = {
  records: [],
  filters: {
    transaction_type: 'all',
    warehouse_id: 'all',
    search: ''
  },

  async render(container) {
    container.innerHTML = `
      <div style="display:flex; justify-content:center; align-items:center; padding: 100px 0;">
        <span style="color:#10b981;">${renderIcon('refresh-cw', 32)}</span>
        <span style="margin-left: 12px; font-weight: 500; color: #64748b;">Loading auditable stock ledger...</span>
      </div>
    `;

    try {
      const [ledgerRes, whRes] = await Promise.all([
        API.getLedger(this.filters),
        API.getWarehouses()
      ]);

      this.records = ledgerRes.records || [];
      const warehouses = whRes.warehouses || [];

      const whOptions = warehouses.map(w => `
        <option value="${w.id}" ${this.filters.warehouse_id == w.id ? 'selected' : ''}>${w.name}</option>
      `).join('');

      container.innerHTML = `
        <div class="page-workspace">
          <!-- Page Header -->
          <div class="page-header">
            <div class="page-title-group">
              <h1>Stock Movement Ledger</h1>
              <p>Immutable, auditable ledger of all inbound, outbound, transfer, and adjustment operations</p>
            </div>
            <div class="page-actions">
              <button class="btn btn-secondary btn-sm" onclick="LedgerPage.refresh()">
                ${renderIcon('refresh-cw', 14)} Refresh
              </button>
              <button class="btn btn-primary btn-sm" onclick="LedgerPage.exportCsv()">
                ${renderIcon('download', 15)} Export CSV
              </button>
            </div>
          </div>

          <!-- Filter Toolbar -->
          <div class="filter-bar">
            <div style="position: relative; flex: 1; min-width: 240px;">
              <input type="text" class="form-input" style="width: 100%; padding-left: 34px;"
                     placeholder="Search reference, product SKU, notes, user..."
                     value="${this.filters.search}"
                     oninput="LedgerPage.onSearchInput(this.value)" />
              <div style="position: absolute; left: 10px; top: 9px; color: #94a3b8;">
                ${renderIcon('search', 16)}
              </div>
            </div>

            <div class="filter-group">
              <span class="filter-label">Movement Type:</span>
              <select class="filter-select" onchange="LedgerPage.onFilterChange('transaction_type', this.value)">
                <option value="all" ${this.filters.transaction_type === 'all' ? 'selected' : ''}>All Movements</option>
                <option value="RECEIPT" ${this.filters.transaction_type === 'RECEIPT' ? 'selected' : ''}>Vendor Receipts</option>
                <option value="DELIVERY" ${this.filters.transaction_type === 'DELIVERY' ? 'selected' : ''}>Customer Deliveries</option>
                <option value="INTERNAL_TRANSFER" ${this.filters.transaction_type === 'INTERNAL_TRANSFER' ? 'selected' : ''}>Internal Transfers</option>
                <option value="ADJUSTMENT" ${this.filters.transaction_type === 'ADJUSTMENT' ? 'selected' : ''}>Physical Adjustments</option>
                <option value="INITIAL_STOCK" ${this.filters.transaction_type === 'INITIAL_STOCK' ? 'selected' : ''}>Initial Stock</option>
              </select>
            </div>

            <div class="filter-group">
              <span class="filter-label">Facility:</span>
              <select class="filter-select" onchange="LedgerPage.onFilterChange('warehouse_id', this.value)">
                <option value="all">All Facilities</option>
                ${whOptions}
              </select>
            </div>
          </div>

          <!-- Ledger Table -->
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Transaction Ref</th>
                  <th>Timestamp (UTC)</th>
                  <th>Type</th>
                  <th>Product Details</th>
                  <th>Source Location</th>
                  <th>Destination Location</th>
                  <th>Quantity Delta</th>
                  <th>Previous Balance</th>
                  <th>New Balance</th>
                  <th>Responsible User</th>
                </tr>
              </thead>
              <tbody id="ledger-tbody">
                ${this.renderRows()}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } catch (e) {
      container.innerHTML = `<div class="empty-state">Failed to load ledger: ${e.message}</div>`;
    }
  },

  renderRows() {
    if (!this.records || this.records.length === 0) {
      return `<tr><td colspan="10" class="empty-state" style="padding: 36px;">No ledger entries found</td></tr>`;
    }

    return this.records.map(r => {
      let typeBadge = 'badge-type-receipt';
      if (r.transaction_type === 'DELIVERY') typeBadge = 'badge-type-delivery';
      if (r.transaction_type === 'INTERNAL_TRANSFER') typeBadge = 'badge-type-transfer';
      if (r.transaction_type === 'ADJUSTMENT') typeBadge = 'badge-type-adjustment';
      if (r.transaction_type === 'INITIAL_STOCK') typeBadge = 'badge-type-initial';

      const isPositive = r.quantity_change > 0;
      const isNeutral = r.transaction_type === 'INTERNAL_TRANSFER';
      let deltaColor = isPositive ? '#10b981' : '#f43f5e';
      if (isNeutral) deltaColor = '#6366f1';
      const deltaSign = isPositive ? '+' : '';

      const srcLoc = r.source_warehouse_name
        ? `${r.source_warehouse_name} (${r.source_location_name})`
        : '<span style="color:#94a3b8;">External / Vendor</span>';

      const destLoc = r.dest_warehouse_name
        ? `${r.dest_warehouse_name} (${r.dest_location_name})`
        : '<span style="color:#94a3b8;">External / Customer</span>';

      return `
        <tr>
          <td>
            <div style="font-family: monospace; font-weight: 700; color: #0f172a;">${r.reference}</div>
            <div style="font-size: 0.72rem; color: #64748b; max-width: 180px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
              ${r.notes || ''}
            </div>
          </td>
          <td style="font-size: 0.78rem; color: #64748b; white-space: nowrap;">${r.created_at.slice(0, 19).replace('T', ' ')}</td>
          <td><span class="badge ${typeBadge}">${r.transaction_type.replace('_', ' ')}</span></td>
          <td>
            <div style="font-weight: 600; color: #334155;">${r.product_name}</div>
            <div style="font-family: monospace; font-size: 0.74rem; color: #64748b;">${r.product_sku}</div>
          </td>
          <td style="font-size: 0.82rem;">${srcLoc}</td>
          <td style="font-size: 0.82rem;">${destLoc}</td>
          <td style="font-weight: 800; color: ${deltaColor};">
            ${isNeutral ? `${r.quantity_change} ${r.uom} (Moved)` : `${deltaSign}${r.quantity_change} ${r.uom}`}
          </td>
          <td style="color: #64748b; font-size: 0.82rem;">${r.previous_balance} ${r.uom}</td>
          <td style="font-weight: 700; color: #0f172a; font-size: 0.84rem;">${r.new_balance} ${r.uom}</td>
          <td>
            <span style="font-size: 0.8rem; font-weight: 500; color: #334155;">${r.user_name || 'System Operator'}</span>
          </td>
        </tr>
      `;
    }).join('');
  },

  exportCsv() {
    window.location.href = '/api/ledger/export';
    Toast.success('Stock Ledger CSV downloaded successfully');
  },

  debounceTimer: null,
  onSearchInput(val) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(async () => {
      this.filters.search = val.trim();
      const res = await API.getLedger(this.filters);
      this.records = res.records || [];
      const tbody = document.getElementById('ledger-tbody');
      if (tbody) tbody.innerHTML = this.renderRows();
    }, 200);
  },

  async onFilterChange(field, val) {
    this.filters[field] = val;
    const res = await API.getLedger(this.filters);
    this.records = res.records || [];
    const tbody = document.getElementById('ledger-tbody');
    if (tbody) tbody.innerHTML = this.renderRows();
  },

  async refresh() {
    const main = document.getElementById('main-workspace');
    if (main) await this.render(main);
  }
};

window.LedgerPage = LedgerPage;
