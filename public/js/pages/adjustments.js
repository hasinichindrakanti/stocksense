// Inventory Adjustments (Physical Stock Count Correction) Page
const AdjustmentsPage = {
  adjustments: [],

  async render(container) {
    container.innerHTML = `
      <div style="display:flex; justify-content:center; align-items:center; padding: 100px 0;">
        <span style="color:#10b981;">${renderIcon('refresh-cw', 32)}</span>
        <span style="margin-left: 12px; font-weight: 500; color: #64748b;">Loading stock adjustments...</span>
      </div>
    `;

    try {
      const res = await API.getAdjustments();
      this.adjustments = res.adjustments || [];

      container.innerHTML = `
        <div class="page-workspace">
          <!-- Page Header -->
          <div class="page-header">
            <div class="page-title-group">
              <h1>Inventory Adjustments</h1>
              <p>Physical cycle counts, discrepancy reconciliation, scrap logging and auditable corrections</p>
            </div>
            <div class="page-actions">
              <button class="btn btn-secondary btn-sm" onclick="AdjustmentsPage.refresh()">
                ${renderIcon('refresh-cw', 14)} Refresh
              </button>
              <button class="btn btn-primary btn-sm" onclick="AdjustmentsPage.openCreateModal()">
                ${renderIcon('plus', 15)} New Physical Count Adjustment
              </button>
            </div>
          </div>

          <!-- Adjustments History Table -->
          <div class="card">
            <div class="chart-header">
              <div>
                <h3 class="chart-title">Discrepancy & Adjustment Audit Records</h3>
                <p class="chart-subtitle">Recorded counts vs physical audited counts with mandatory audit rationale</p>
              </div>
            </div>

            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Adjustment Ref</th>
                    <th>Product / SKU</th>
                    <th>Storage Location</th>
                    <th>System Recorded</th>
                    <th>Physical Counted</th>
                    <th>Variance / Diff</th>
                    <th>Reason / Root Cause</th>
                    <th>Auditor</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  ${this.renderRows()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    } catch (e) {
      container.innerHTML = `<div class="empty-state">Failed to load adjustments: ${e.message}</div>`;
    }
  },

  renderRows() {
    if (!this.adjustments || this.adjustments.length === 0) {
      return `<tr><td colspan="9" class="empty-state" style="padding: 36px;">No inventory adjustments recorded</td></tr>`;
    }

    return this.adjustments.map(a => {
      const isPositive = a.difference > 0;
      const diffColor = isPositive ? '#10b981' : '#f43f5e';
      const diffSign = isPositive ? '+' : '';

      return `
        <tr>
          <td style="font-family: monospace; font-weight: 700; color: #0f172a;">${a.reference}</td>
          <td>
            <div style="font-weight: 600; color: #334155;">${a.product_name}</div>
            <div style="font-family: monospace; font-size: 0.74rem; color: #64748b;">${a.sku}</div>
          </td>
          <td>
            <div style="font-weight: 500;">${a.warehouse_name}</div>
            <div style="font-size: 0.74rem; color: #64748b;">${a.location_name} (${a.location_code})</div>
          </td>
          <td style="color: #64748b;">${a.previous_quantity} ${a.uom}</td>
          <td style="font-weight: 700; color: #0f172a;">${a.counted_quantity} ${a.uom}</td>
          <td style="font-weight: 800; color: ${diffColor};">
            ${diffSign}${a.difference} ${a.uom}
          </td>
          <td style="font-size: 0.82rem; color: #475569; max-width: 280px;">
            ${a.reason}
          </td>
          <td style="font-size: 0.78rem; color: #64748b;">${a.creator_name || 'Auditor'}</td>
          <td style="font-size: 0.78rem; color: #64748b;">${a.created_at.slice(0, 16)}</td>
        </tr>
      `;
    }).join('');
  },

  async openCreateModal() {
    const [prodRes, whRes] = await Promise.all([
      API.getProducts(),
      API.getWarehouses()
    ]);

    const products = prodRes.products || [];
    const warehouses = whRes.warehouses || [];

    const prodOptions = products.map(p => `
      <option value="${p.id}" data-uom="${p.uom}">${p.name} (${p.sku})</option>
    `).join('');

    const whOptions = warehouses.map(w => `
      <option value="${w.id}">${w.name} (${w.code})</option>
    `).join('');

    Modals.open({
      title: 'Physical Inventory Count & Correction',
      content: `
        <form id="adjustment-form" style="display: flex; flex-direction: column; gap: 16px;">
          <div class="form-field">
            <label class="form-label">Product to Reconcile *</label>
            <select id="adj-product" class="form-select" onchange="AdjustmentsPage.onProductOrLocationSelect()">
              ${prodOptions}
            </select>
          </div>

          <div class="form-grid-2">
            <div class="form-field">
              <label class="form-label">Facility *</label>
              <select id="adj-warehouse" class="form-select" onchange="AdjustmentsPage.onWarehouseSelect(this.value)">
                ${whOptions}
              </select>
            </div>
            <div class="form-field">
              <label class="form-label">Storage Location / Rack *</label>
              <select id="adj-location" class="form-select" onchange="AdjustmentsPage.onProductOrLocationSelect()"></select>
            </div>
          </div>

          <!-- Dynamic Count Calculation Panel -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: var(--radius-md); padding: 16px; display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.84rem; color: #64748b; font-weight: 500;">System Recorded Stock at Location:</span>
              <span id="adj-system-stock" style="font-size: 1.1rem; font-weight: 800; color: #0f172a;">0 Units</span>
            </div>

            <div class="form-field">
              <label class="form-label">Physical Counted Quantity (On Shelf) *</label>
              <input type="number" id="adj-physical-count" class="form-input" step="1" placeholder="Enter verified physical count"
                     oninput="AdjustmentsPage.calculateDifference()" style="font-size: 1rem; font-weight: 600;" />
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #cbd5e1; padding-top: 10px;">
              <span style="font-size: 0.84rem; font-weight: 600; color: #334155;">Inventory Variance / Difference:</span>
              <span id="adj-diff-display" style="font-size: 1.1rem; font-weight: 800; color: #64748b;">—</span>
            </div>
          </div>

          <div class="form-field">
            <label class="form-label">Mandatory Audit Reason / Cause *</label>
            <textarea id="adj-reason" class="form-textarea" rows="2" required placeholder="e.g. Broken packaging discovered during weekly count; Scrap loss from lathe machining..."></textarea>
          </div>
        </form>
      `,
      footer: `
        <button class="btn btn-secondary" onclick="Modals.close()">Cancel</button>
        <button class="btn btn-primary" id="btn-save-adj">Confirm & Post Adjustment</button>
      `
    });

    window.allProductsCache = products;

    if (warehouses.length > 0) {
      await AdjustmentsPage.onWarehouseSelect(warehouses[0].id);
    }

    document.getElementById('btn-save-adj').addEventListener('click', async () => {
      const prodId = document.getElementById('adj-product').value;
      const whId = document.getElementById('adj-warehouse').value;
      const locId = document.getElementById('adj-location').value;
      const counted = document.getElementById('adj-physical-count').value;
      const reason = document.getElementById('adj-reason').value.trim();

      if (!locId) return Toast.error('Please select storage location');
      if (counted === '' || isNaN(parseFloat(counted))) return Toast.error('Please enter valid physically counted quantity');
      if (!reason || reason.length < 4) return Toast.error('Please enter a clear audit reason for this stock adjustment');

      try {
        const res = await API.createAdjustment({
          product_id: prodId,
          warehouse_id: whId,
          location_id: locId,
          counted_quantity: parseFloat(counted),
          reason
        });
        Toast.success(`Adjustment ${res.reference} posted! Variance: ${res.difference > 0 ? '+' : ''}${res.difference}`);
        Modals.close();
        AdjustmentsPage.refresh();
      } catch (e) {}
    });
  },

  async onWarehouseSelect(whId) {
    const locRes = await API.getLocations({ warehouse_id: whId });
    const locs = locRes.locations || [];
    const select = document.getElementById('adj-location');
    if (select) {
      select.innerHTML = locs.map(l => `<option value="${l.id}">${l.name} (${l.code})</option>`).join('');
      await this.onProductOrLocationSelect();
    }
  },

  currentRecordedQty: 0,
  currentUom: 'Units',

  async onProductOrLocationSelect() {
    const prodSelect = document.getElementById('adj-product');
    const locSelect = document.getElementById('adj-location');
    if (!prodSelect || !locSelect || !prodSelect.value || !locSelect.value) return;

    const prodId = prodSelect.value;
    const locId = locSelect.value;

    const prod = (window.allProductsCache || []).find(p => p.id == prodId);
    this.currentUom = prod ? prod.uom : 'Units';

    // Find stock from product warehouses or fetch
    let stockAtLoc = 0;
    if (prod && prod.warehouses) {
      const entry = prod.warehouses.find(w => w.location_id == locId);
      if (entry) stockAtLoc = entry.quantity;
    }

    this.currentRecordedQty = stockAtLoc;

    const sysEl = document.getElementById('adj-system-stock');
    if (sysEl) {
      sysEl.innerText = `${stockAtLoc} ${this.currentUom}`;
    }

    this.calculateDifference();
  },

  calculateDifference() {
    const input = document.getElementById('adj-physical-count');
    const diffEl = document.getElementById('adj-diff-display');
    if (!input || !diffEl) return;

    const val = input.value.trim();
    if (val === '' || isNaN(parseFloat(val))) {
      diffEl.innerText = '—';
      diffEl.style.color = '#64748b';
      return;
    }

    const counted = parseFloat(val);
    const diff = Math.round((counted - this.currentRecordedQty) * 100) / 100;

    if (diff > 0) {
      diffEl.innerText = `+${diff} ${this.currentUom} (Surplus Gain)`;
      diffEl.style.color = '#10b981';
    } else if (diff < 0) {
      diffEl.innerText = `${diff} ${this.currentUom} (Shrinkage / Deficit)`;
      diffEl.style.color = '#f43f5e';
    } else {
      diffEl.innerText = `0 ${this.currentUom} (Exact Match)`;
      diffEl.style.color = '#64748b';
    }
  },

  async refresh() {
    const main = document.getElementById('main-workspace');
    if (main) await this.render(main);
  }
};

window.AdjustmentsPage = AdjustmentsPage;
