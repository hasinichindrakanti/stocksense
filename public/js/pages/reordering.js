// Reordering Rules & Smart Replenishment Page
const ReorderingPage = {
  rules: [],

  async render(container) {
    container.innerHTML = `
      <div style="display:flex; justify-content:center; align-items:center; padding: 100px 0;">
        <span style="color:#10b981;">${renderIcon('refresh-cw', 32)}</span>
        <span style="margin-left: 12px; font-weight: 500; color: #64748b;">Calculating replenishment deficits...</span>
      </div>
    `;

    try {
      const res = await API.getReorderingRules();
      this.rules = res.rules || [];

      const criticalAlerts = this.rules.filter(r => r.status === 'CRITICAL_OUT');
      const lowStockAlerts = this.rules.filter(r => r.status === 'LOW_STOCK');
      const totalReplenishmentCost = this.rules
        .filter(r => r.status !== 'HEALTHY')
        .reduce((sum, r) => sum + r.restock_cost, 0);

      container.innerHTML = `
        <div class="page-workspace">
          <!-- Page Header -->
          <div class="page-header">
            <div class="page-title-group">
              <h1>Smart Reordering Rules & Alerts</h1>
              <p>Predictive stock threshold replenishment and automated PO generation</p>
            </div>
            <div class="page-actions">
              <button class="btn btn-secondary btn-sm" onclick="ReorderingPage.refresh()">
                ${renderIcon('refresh-cw', 14)} Refresh
              </button>
            </div>
          </div>

          <!-- Alert Summary Cards -->
          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="kpi-top">
                <span class="kpi-label">Critical Depletions</span>
                <div class="kpi-icon-badge kpi-icon-rose">${renderIcon('x-circle', 20)}</div>
              </div>
              <div class="kpi-value-row">
                <div class="kpi-value" style="color: #e11d48;">${criticalAlerts.length}</div>
              </div>
              <div class="kpi-subtext">0 units in stock</div>
            </div>

            <div class="kpi-card">
              <div class="kpi-top">
                <span class="kpi-label">Threshold Warnings</span>
                <div class="kpi-icon-badge kpi-icon-amber">${renderIcon('alert-triangle', 20)}</div>
              </div>
              <div class="kpi-value-row">
                <div class="kpi-value" style="color: #d97706;">${lowStockAlerts.length}</div>
              </div>
              <div class="kpi-subtext">At or below reorder level</div>
            </div>

            <div class="kpi-card">
              <div class="kpi-top">
                <span class="kpi-label">Target Restock Budget</span>
                <div class="kpi-icon-badge kpi-icon-emerald">${renderIcon('box', 20)}</div>
              </div>
              <div class="kpi-value-row">
                <div class="kpi-value">$${Math.round(totalReplenishmentCost).toLocaleString()}</div>
              </div>
              <div class="kpi-subtext">Estimated capital to replenish</div>
            </div>
          </div>

          <!-- Reorder Rules Table -->
          <div class="card">
            <div class="chart-header">
              <div>
                <h3 class="chart-title">Configured SKU Reorder Parameters</h3>
                <p class="chart-subtitle">Thresholds, target stock limits, and 1-click vendor PO generators</p>
              </div>
            </div>

            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Product / SKU</th>
                    <th>Current Stock</th>
                    <th>Reorder Threshold</th>
                    <th>Target Stock</th>
                    <th>Replenish Deficit</th>
                    <th>Unit Cost</th>
                    <th>Est. Cost</th>
                    <th>Alert Status</th>
                    <th style="text-align: right;">Automated Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${this.renderRuleRows()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    } catch (e) {
      container.innerHTML = `<div class="empty-state">Failed to load reordering rules: ${e.message}</div>`;
    }
  },

  renderRuleRows() {
    if (!this.rules || this.rules.length === 0) {
      return `<tr><td colspan="9" class="empty-state">No product rules found</td></tr>`;
    }

    return this.rules.map(r => {
      let badge = '<span class="badge badge-in-stock">HEALTHY</span>';
      if (r.status === 'CRITICAL_OUT') {
        badge = '<span class="badge badge-out-of-stock">CRITICAL OUT</span>';
      } else if (r.status === 'LOW_STOCK') {
        badge = '<span class="badge badge-low-stock">LOW STOCK</span>';
      }

      return `
        <tr>
          <td>
            <div style="font-weight: 600; color: #0f172a;">${r.name}</div>
            <div style="font-family: monospace; font-size: 0.76rem; color: #64748b;">${r.sku}</div>
          </td>
          <td style="font-weight: 700; color: ${r.current_stock > 0 ? '#0f172a' : '#ef4444'};">
            ${r.current_stock} ${r.uom}
          </td>
          <td style="color: #64748b;">${r.reorder_level} ${r.uom}</td>
          <td style="color: #64748b;">${r.target_stock} ${r.uom}</td>
          <td style="font-weight: 700; color: ${r.deficit > 0 ? '#d97706' : '#10b981'};">
            ${r.deficit > 0 ? `+${r.deficit} ${r.uom}` : '0 (Optimal)'}
          </td>
          <td>$${r.unit_cost.toFixed(2)}</td>
          <td style="font-weight: 600;">$${r.restock_cost.toLocaleString()}</td>
          <td>${badge}</td>
          <td style="text-align: right;">
            ${r.deficit > 0 ? `
              <button class="btn btn-primary btn-sm" onclick="ReorderingPage.createDraftReceipt(${r.id})" title="Create a Draft Receipt for ${r.deficit} units">
                ${renderIcon('plus', 13)} Draft Receipt
              </button>
            ` : `
              <span style="font-size: 0.78rem; color: #94a3b8;">No action required</span>
            `}
          </td>
        </tr>
      `;
    }).join('');
  },

  async createDraftReceipt(productId) {
    try {
      const res = await API.createDraftReceiptFromAlert(productId);
      Toast.success(res.message);
      State.setRoute('receipts');
    } catch (e) {}
  },

  async refresh() {
    const main = document.getElementById('main-workspace');
    if (main) await this.render(main);
  }
};

window.ReorderingPage = ReorderingPage;
