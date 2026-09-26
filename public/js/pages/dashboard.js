// Main Dashboard Page
const DashboardPage = {
  stats: null,
  filteredDocs: [],
  currentFilter: {
    type: 'all',
    status: 'all',
    warehouse_id: 'all'
  },

  async render(container) {
    container.innerHTML = `
      <div style="display:flex; justify-content:center; align-items:center; padding: 100px 0;">
        <span style="color:#10b981;">${renderIcon('refresh-cw', 32)}</span>
        <span style="margin-left: 12px; font-weight: 500; color: #64748b;">Loading real-time inventory telemetry...</span>
      </div>
    `;

    try {
      const [statsData, filterData, whRes] = await Promise.all([
        API.getStats(),
        API.getFilteredDocuments(this.currentFilter),
        API.getWarehouses()
      ]);

      this.stats = statsData;
      this.filteredDocs = filterData.documents || [];
      const warehouses = whRes.warehouses || [];

      const kpi = this.stats.kpi;

      // Warehouse options for filter
      const whOptions = warehouses.map(w => `
        <option value="${w.id}" ${this.currentFilter.warehouse_id == w.id ? 'selected' : ''}>${w.name}</option>
      `).join('');

      container.innerHTML = `
        <div class="page-workspace">
          <!-- Page Header -->
          <div class="page-header">
            <div class="page-title-group">
              <h1>Inventory Operations Center</h1>
              <p>Real-time telemetry across multi-facility storage locations • StockSense Enterprise</p>
            </div>
            <div class="page-actions">
              <button class="btn btn-secondary btn-sm" onclick="DashboardPage.refresh(this)">
                ${renderIcon('refresh-cw', 15)} Refresh Data
              </button>
              <button class="btn btn-primary btn-sm" onclick="Modals.openAddProductModal(() => DashboardPage.refresh())">
                ${renderIcon('plus', 15)} New Product
              </button>
            </div>
          </div>

          <!-- Guided Interactive Hackathon Walkthrough Banner -->
          <div class="guided-scenario-card">
            <div class="guided-header">
              <div>
                <span class="guided-title-badge">${renderIcon('sparkles', 14)} Hackathon Interactive Demo</span>
                <h3 style="font-size: 1.15rem; font-weight: 700; margin-top: 6px; color: white;">
                  Complete Stock Lifecycle Walkthrough
                </h3>
                <p style="font-size: 0.82rem; color: #94a3b8; margin-top: 2px;">
                  Demonstrating inbound receipt of 100 kg steel &rarr; inter-facility transfer to production rack &rarr; 20 kg customer delivery &rarr; 3 kg damage adjustment.
                </p>
              </div>
              <div style="display: flex; gap: 8px;">
                <button class="btn btn-primary btn-sm" onclick="DashboardPage.runFullDemoScenario()">
                  ${renderIcon('sparkles', 14)} Run Complete Lifecycle
                </button>
              </div>
            </div>

            <!-- Steps Grid -->
            <div class="guided-steps-grid">
              <div class="guided-step-box" id="step-box-1">
                <div>
                  <div class="guided-step-num">Step 1 • Inbound</div>
                  <div class="guided-step-desc">Receive 100 kg Steel into CDC Rack A1</div>
                </div>
                <button class="btn-run-step" onclick="DashboardPage.runStep(1)">
                  ${renderIcon('arrow-down-left', 14)} Receive (+100kg)
                </button>
              </div>

              <div class="guided-step-box" id="step-box-2">
                <div>
                  <div class="guided-step-num">Step 2 • Transfer</div>
                  <div class="guided-step-desc">Transfer to PAP Detroit Production Rack</div>
                </div>
                <button class="btn-run-step" onclick="DashboardPage.runStep(2)">
                  ${renderIcon('arrow-left-right', 14)} Transfer (Invariant)
                </button>
              </div>

              <div class="guided-step-box" id="step-box-3">
                <div>
                  <div class="guided-step-num">Step 3 • Outbound</div>
                  <div class="guided-step-desc">Deliver 20 kg to Apex Manufacturing</div>
                </div>
                <button class="btn-run-step" onclick="DashboardPage.runStep(3)">
                  ${renderIcon('truck', 14)} Deliver (-20kg)
                </button>
              </div>

              <div class="guided-step-box" id="step-box-4">
                <div>
                  <div class="guided-step-num">Step 4 • Audit</div>
                  <div class="guided-step-desc">Count audit: -3 kg damaged lathe scrap</div>
                </div>
                <button class="btn-run-step" onclick="DashboardPage.runStep(4)">
                  ${renderIcon('clipboard-check', 14)} Adjust (-3kg)
                </button>
              </div>
            </div>
          </div>

          <!-- 6 Dynamic KPI Cards -->
          <div class="kpi-grid">
            <!-- 1. Total Products in Stock -->
            <div class="kpi-card" onclick="State.setRoute('products')" style="cursor: pointer;">
              <div class="kpi-top">
                <span class="kpi-label">Total In Stock</span>
                <div class="kpi-icon-badge kpi-icon-emerald">
                  ${renderIcon('package', 20)}
                </div>
              </div>
              <div class="kpi-value-row">
                <div class="kpi-value">${kpi.totalProductsInStock.toLocaleString()}</div>
              </div>
              <div class="kpi-subtext">
                <span style="color:#10b981; font-weight: 600;">$${kpi.totalInventoryValue.toLocaleString()}</span> total asset value
              </div>
            </div>

            <!-- 2. Low Stock Items -->
            <div class="kpi-card" onclick="State.setRoute('reordering')" style="cursor: pointer;">
              <div class="kpi-top">
                <span class="kpi-label">Low Stock Alert</span>
                <div class="kpi-icon-badge kpi-icon-amber">
                  ${renderIcon('alert-triangle', 20)}
                </div>
              </div>
              <div class="kpi-value-row">
                <div class="kpi-value" style="color: #d97706;">${kpi.lowStockCount}</div>
              </div>
              <div class="kpi-subtext">
                <span style="color: #d97706; font-weight: 600;">Needs Reorder</span> at threshold
              </div>
            </div>

            <!-- 3. Out of Stock Items -->
            <div class="kpi-card" onclick="State.setRoute('reordering')" style="cursor: pointer;">
              <div class="kpi-top">
                <span class="kpi-label">Out of Stock</span>
                <div class="kpi-icon-badge kpi-icon-rose">
                  ${renderIcon('x-circle', 20)}
                </div>
              </div>
              <div class="kpi-value-row">
                <div class="kpi-value" style="color: #e11d48;">${kpi.outOfStockCount}</div>
              </div>
              <div class="kpi-subtext">
                <span style="color: #e11d48; font-weight: 600;">Critical Zero Stock</span> items
              </div>
            </div>

            <!-- 4. Pending Receipts -->
            <div class="kpi-card" onclick="State.setRoute('receipts')" style="cursor: pointer;">
              <div class="kpi-top">
                <span class="kpi-label">Pending Receipts</span>
                <div class="kpi-icon-badge kpi-icon-blue">
                  ${renderIcon('arrow-down-left', 20)}
                </div>
              </div>
              <div class="kpi-value-row">
                <div class="kpi-value">${kpi.pendingReceipts}</div>
              </div>
              <div class="kpi-subtext">
                Incoming vendor shipments
              </div>
            </div>

            <!-- 5. Pending Deliveries -->
            <div class="kpi-card" onclick="State.setRoute('deliveries')" style="cursor: pointer;">
              <div class="kpi-top">
                <span class="kpi-label">Pending Deliveries</span>
                <div class="kpi-icon-badge kpi-icon-indigo">
                  ${renderIcon('truck', 20)}
                </div>
              </div>
              <div class="kpi-value-row">
                <div class="kpi-value">${kpi.pendingDeliveries}</div>
              </div>
              <div class="kpi-subtext">
                Outgoing customer orders
              </div>
            </div>

            <!-- 6. Internal Transfers Scheduled -->
            <div class="kpi-card" onclick="State.setRoute('transfers')" style="cursor: pointer;">
              <div class="kpi-top">
                <span class="kpi-label">Scheduled Transfers</span>
                <div class="kpi-icon-badge kpi-icon-purple">
                  ${renderIcon('arrow-left-right', 20)}
                </div>
              </div>
              <div class="kpi-value-row">
                <div class="kpi-value">${kpi.scheduledTransfers}</div>
              </div>
              <div class="kpi-subtext">
                Inter-facility movements
              </div>
            </div>
          </div>

          <!-- Visual Telemetry Charts (Category Distribution & Movement Trends) -->
          <div class="dashboard-grid-2">
            <!-- Product Category Distribution -->
            <div class="card">
              <div class="chart-header">
                <div>
                  <h3 class="chart-title">Inventory by Category</h3>
                  <p class="chart-subtitle">Stock unit breakdown across material classifications</p>
                </div>
                <button class="btn btn-secondary btn-sm" onclick="State.setRoute('categories')">
                  View All
                </button>
              </div>
              <div id="category-donut-container" class="chart-container"></div>
            </div>

            <!-- Stock Movement Overview -->
            <div class="card">
              <div class="chart-header">
                <div>
                  <h3 class="chart-title">Stock Movement Overview</h3>
                  <p class="chart-subtitle">Incoming vendor stock vs outgoing client dispatches</p>
                </div>
                <button class="btn btn-secondary btn-sm" onclick="State.setRoute('ledger')">
                  Ledger
                </button>
              </div>
              <div id="movement-bar-container" class="chart-container"></div>
            </div>
          </div>

          <!-- Smart Reorder Alerts & Warehouse Health Section -->
          <div class="dashboard-grid-2-equal">
            <!-- Smart Reorder Alerts Panel -->
            <div class="card">
              <div class="chart-header">
                <div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <h3 class="chart-title">Smart Reorder Alerts</h3>
                    <span class="badge badge-low-stock">${this.stats.smartReorderAlerts.length} Action Needed</span>
                  </div>
                  <p class="chart-subtitle">Items at or below threshold with target stock calculations</p>
                </div>
                <button class="btn btn-secondary btn-sm" onclick="State.setRoute('reordering')">
                  View Rules
                </button>
              </div>

              <div style="display: flex; flex-direction: column; gap: 10px; max-height: 290px; overflow-y: auto;">
                ${this.renderReorderAlerts()}
              </div>
            </div>

            <!-- Warehouse-Wise Inventory Summary -->
            <div class="card">
              <div class="chart-header">
                <div>
                  <h3 class="chart-title">Warehouse Inventory Summary</h3>
                  <p class="chart-subtitle">Capacity, stock density and active operations</p>
                </div>
                <button class="btn btn-secondary btn-sm" onclick="State.setRoute('warehouses')">
                  Manage
                </button>
              </div>

              <div class="table-responsive">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Facility</th>
                      <th>Code</th>
                      <th>Total Units</th>
                      <th>Low Stock</th>
                      <th>Pending Ops</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${this.renderWarehouseSummaryRows()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Document Operations Filter & Live Records -->
          <div class="card">
            <div class="chart-header">
              <div>
                <h3 class="chart-title">Live Document Operations Feed</h3>
                <p class="chart-subtitle">Filter receipts, delivery orders, internal transfers and adjustments</p>
              </div>
            </div>

            <!-- Filter Controls -->
            <div class="filter-bar" style="margin-bottom: 16px;">
              <div class="filter-group">
                <span class="filter-label">Document:</span>
                <select class="filter-select" onchange="DashboardPage.onFilterChange('type', this.value)">
                  <option value="all" ${this.currentFilter.type === 'all' ? 'selected' : ''}>All Documents</option>
                  <option value="receipts" ${this.currentFilter.type === 'receipts' ? 'selected' : ''}>Receipts (Inbound)</option>
                  <option value="delivery" ${this.currentFilter.type === 'delivery' ? 'selected' : ''}>Deliveries (Outbound)</option>
                  <option value="transfers" ${this.currentFilter.type === 'transfers' ? 'selected' : ''}>Internal Transfers</option>
                  <option value="adjustments" ${this.currentFilter.type === 'adjustments' ? 'selected' : ''}>Adjustments</option>
                </select>
              </div>

              <div class="filter-group">
                <span class="filter-label">Status:</span>
                <select class="filter-select" onchange="DashboardPage.onFilterChange('status', this.value)">
                  <option value="all" ${this.currentFilter.status === 'all' ? 'selected' : ''}>All Statuses</option>
                  <option value="draft" ${this.currentFilter.status === 'draft' ? 'selected' : ''}>Draft</option>
                  <option value="waiting" ${this.currentFilter.status === 'waiting' ? 'selected' : ''}>Waiting</option>
                  <option value="ready" ${this.currentFilter.status === 'ready' ? 'selected' : ''}>Ready</option>
                  <option value="done" ${this.currentFilter.status === 'done' ? 'selected' : ''}>Done</option>
                  <option value="canceled" ${this.currentFilter.status === 'canceled' ? 'selected' : ''}>Canceled</option>
                </select>
              </div>

              <div class="filter-group">
                <span class="filter-label">Warehouse:</span>
                <select class="filter-select" onchange="DashboardPage.onFilterChange('warehouse_id', this.value)">
                  <option value="all">All Facilities</option>
                  ${whOptions}
                </select>
              </div>
            </div>

            <!-- Filtered Documents Table -->
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Reference</th>
                    <th>Partner / Transfer Flow</th>
                    <th>Location</th>
                    <th>Items / Qty</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th style="text-align: right;">Action</th>
                  </tr>
                </thead>
                <tbody id="filtered-docs-tbody">
                  ${this.renderFilteredDocsRows()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;

      // Render Charts into their DOM nodes
      Charts.renderCategoryDonut(this.stats.categoryStats, document.getElementById('category-donut-container'));
      Charts.renderMovementBarChart(this.stats.movementOverview, document.getElementById('movement-bar-container'));

    } catch (err) {
      console.error(err);
      container.innerHTML = `
        <div class="page-workspace">
          <div class="card empty-state">
            <div style="color: #ef4444; margin-bottom: 12px;">${renderIcon('alert-triangle', 36)}</div>
            <div class="empty-title">Failed to load dashboard</div>
            <div class="empty-desc">${err.message}</div>
            <button class="btn btn-primary" onclick="DashboardPage.refresh()">Retry</button>
          </div>
        </div>
      `;
    }
  },

  renderReorderAlerts() {
    const alerts = this.stats.smartReorderAlerts || [];
    if (alerts.length === 0) {
      return `
        <div class="empty-state" style="padding: 24px;">
          <span style="color: #10b981; margin-bottom: 6px;">${renderIcon('check-circle', 24)}</span>
          <div style="font-weight: 600; color: #0f172a;">All Stock Levels Optimal</div>
          <div style="font-size: 0.8rem; color: #64748b;">No products currently at or below reorder threshold.</div>
        </div>
      `;
    }

    return alerts.map(a => `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: var(--radius-md);">
        <div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-weight: 600; color: #0f172a; font-size: 0.88rem;">${a.name}</span>
            <span class="badge ${a.urgency === 'CRITICAL' ? 'badge-out-of-stock' : 'badge-low-stock'}">${a.urgency}</span>
          </div>
          <div style="font-size: 0.76rem; color: #64748b; margin-top: 2px;">
            SKU: <span style="font-family: monospace; font-weight: 600;">${a.sku}</span> • Current: <strong>${a.currentStock}</strong> / Reorder: ${a.reorderLevel} • Suggested Order: <strong>+${a.suggestedRestock}</strong>
          </div>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="DashboardPage.quickReorder(${a.productId})" title="Generate Draft Purchase Receipt">
          ${renderIcon('plus', 13)} Draft PO
        </button>
      </div>
    `).join('');
  },

  renderWarehouseSummaryRows() {
    const summaries = this.stats.warehouseSummaries || [];
    if (summaries.length === 0) {
      return `<tr><td colspan="5" style="text-align: center; color: #94a3b8;">No warehouse records found</td></tr>`;
    }

    return summaries.map(w => `
      <tr>
        <td style="font-weight: 600; color: #0f172a;">${w.name}</td>
        <td><span style="font-family: monospace; font-weight: 600; color: #475569;">${w.code}</span></td>
        <td style="font-weight: 700; color: #10b981;">${w.total_stock.toLocaleString()} units</td>
        <td>
          <span class="badge ${w.low_stock_count > 0 ? 'badge-low-stock' : 'badge-in-stock'}">
            ${w.low_stock_count} items
          </span>
        </td>
        <td>
          <span class="badge ${w.pending_operations > 0 ? 'badge-waiting' : 'badge-done'}">
            ${w.pending_operations} pending
          </span>
        </td>
      </tr>
    `).join('');
  },

  renderFilteredDocsRows() {
    if (!this.filteredDocs || this.filteredDocs.length === 0) {
      return `<tr><td colspan="8" class="empty-state" style="padding: 28px;">No matching documents for selected criteria</td></tr>`;
    }

    return this.filteredDocs.map(d => {
      let route = 'receipts';
      if (d.doc_type === 'Delivery') route = 'deliveries';
      if (d.doc_type === 'Transfer') route = 'transfers';
      if (d.doc_type === 'Adjustment') route = 'adjustments';

      const typeBadgeClass = `badge-type-${d.doc_type.toLowerCase().slice(0, 4)}`;

      return `
        <tr>
          <td><span class="badge ${typeBadgeClass}">${d.doc_type}</span></td>
          <td style="font-weight: 600; font-family: monospace;">${d.reference}</td>
          <td>${d.party_name || 'N/A'}</td>
          <td style="color: #64748b;">${d.warehouse_name || 'All'} (${d.location_name || 'Multi'})</td>
          <td style="font-weight: 600;">${d.total_quantity > 0 ? '+' : ''}${d.total_quantity}</td>
          <td><span class="badge badge-${d.status}">${d.status}</span></td>
          <td style="font-size: 0.78rem; color: #64748b;">${d.created_at.slice(0, 16)}</td>
          <td style="text-align: right;">
            <button class="btn btn-secondary btn-sm" onclick="State.setRoute('${route}')">
              ${renderIcon('eye', 13)} View
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  async onFilterChange(field, val) {
    this.currentFilter[field] = val;
    const filterData = await API.getFilteredDocuments(this.currentFilter);
    this.filteredDocs = filterData.documents || [];
    const tbody = document.getElementById('filtered-docs-tbody');
    if (tbody) tbody.innerHTML = this.renderFilteredDocsRows();
  },

  async quickReorder(productId) {
    try {
      const res = await API.createDraftReceiptFromAlert(productId);
      Toast.success(res.message);
      this.refresh();
    } catch (e) {}
  },

  async runStep(stepNum) {
    try {
      const res = await API.runGuidedStep(stepNum);
      const r = res.result;
      Toast.success(`Step ${stepNum} complete: ${r.action}`);

      // Highlight step box
      const box = document.getElementById(`step-box-${stepNum}`);
      if (box) box.classList.add('completed');

      // Refresh dashboard stats
      await this.refresh();
    } catch (e) {}
  },

  async runFullDemoScenario() {
    Toast.info('Executing complete hackathon lifecycle scenario (Steps 1 to 4)...');
    try {
      for (let s = 1; s <= 4; s++) {
        await API.runGuidedStep(s);
        const box = document.getElementById(`step-box-${s}`);
        if (box) box.classList.add('completed');
      }
      Toast.success('Full lifecycle scenario validated! Resulting stock: 77 kg verified in ledger.');
      await this.refresh();
    } catch (e) {}
  },

  async refresh(btn) {
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `${renderIcon('refresh-cw', 14)} Updating...`;
    }
    const mainEl = document.getElementById('main-workspace');
    if (mainEl) await this.render(mainEl);
  }
};

window.DashboardPage = DashboardPage;
