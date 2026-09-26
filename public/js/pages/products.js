// Product Management Page
const ProductsPage = {
  products: [],
  categories: [],
  warehouses: [],
  filters: {
    search: '',
    category_id: 'all',
    status: 'all',
    warehouse_id: 'all'
  },

  async render(container) {
    container.innerHTML = `
      <div style="display:flex; justify-content:center; align-items:center; padding: 100px 0;">
        <span style="color:#10b981;">${renderIcon('refresh-cw', 32)}</span>
        <span style="margin-left: 12px; font-weight: 500; color: #64748b;">Loading product catalog...</span>
      </div>
    `;

    try {
      const [prodRes, catRes, whRes] = await Promise.all([
        API.getProducts(this.filters),
        API.getCategories(),
        API.getWarehouses()
      ]);

      this.products = prodRes.products || [];
      this.categories = catRes.categories || [];
      this.warehouses = whRes.warehouses || [];

      const catOptions = this.categories.map(c => `
        <option value="${c.id}" ${this.filters.category_id == c.id ? 'selected' : ''}>${c.name}</option>
      `).join('');

      const whOptions = this.warehouses.map(w => `
        <option value="${w.id}" ${this.filters.warehouse_id == w.id ? 'selected' : ''}>${w.name}</option>
      `).join('');

      container.innerHTML = `
        <div class="page-workspace">
          <!-- Page Header -->
          <div class="page-header">
            <div class="page-title-group">
              <h1>Product Management</h1>
              <p>Master catalog, multi-warehouse stock allocations and reorder thresholds</p>
            </div>
            <div class="page-actions">
              <button class="btn btn-secondary btn-sm" onclick="ProductsPage.refresh()">
                ${renderIcon('refresh-cw', 14)} Refresh
              </button>
              <button class="btn btn-primary btn-sm" onclick="Modals.openAddProductModal(() => ProductsPage.refresh())">
                ${renderIcon('plus', 15)} Add Product
              </button>
            </div>
          </div>

          <!-- Filter & Search Toolbar -->
          <div class="filter-bar">
            <!-- Search input -->
            <div style="position: relative; flex: 1; min-width: 240px;">
              <input type="text" id="prod-search-input" class="form-input" style="width: 100%; padding-left: 34px;"
                placeholder="Search by product name, SKU or barcode..."
                value="${this.filters.search}"
                oninput="ProductsPage.onSearchInput(this.value)" />
              <div style="position: absolute; left: 10px; top: 9px; color: #94a3b8;">
                ${renderIcon('search', 16)}
              </div>
            </div>

            <!-- Category Filter -->
            <div class="filter-group">
              <span class="filter-label">Category:</span>
              <select class="filter-select" onchange="ProductsPage.onFilterChange('category_id', this.value)">
                <option value="all">All Categories</option>
                ${catOptions}
              </select>
            </div>

            <!-- Stock Status Filter -->
            <div class="filter-group">
              <span class="filter-label">Status:</span>
              <select class="filter-select" onchange="ProductsPage.onFilterChange('status', this.value)">
                <option value="all" ${this.filters.status === 'all' ? 'selected' : ''}>All Stock</option>
                <option value="in" ${this.filters.status === 'in' ? 'selected' : ''}>In Stock</option>
                <option value="low" ${this.filters.status === 'low' ? 'selected' : ''}>Low Stock</option>
                <option value="out" ${this.filters.status === 'out' ? 'selected' : ''}>Out of Stock</option>
              </select>
            </div>

            <!-- Warehouse Filter -->
            <div class="filter-group">
              <span class="filter-label">Facility:</span>
              <select class="filter-select" onchange="ProductsPage.onFilterChange('warehouse_id', this.value)">
                <option value="all">All Facilities</option>
                ${whOptions}
              </select>
            </div>
          </div>

          <!-- Products Table -->
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Product Details</th>
                  <th>SKU / Barcode</th>
                  <th>Category</th>
                  <th>UOM</th>
                  <th>Unit Cost</th>
                  <th>Company Stock</th>
                  <th>Reorder Level</th>
                  <th>Status</th>
                  <th style="text-align: right;">Actions</th>
                </tr>
              </thead>
              <tbody id="products-tbody">
                ${this.renderTableRows()}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } catch (err) {
      console.error(err);
      container.innerHTML = `<div class="empty-state">Failed to load products: ${err.message}</div>`;
    }
  },

  renderTableRows() {
    if (!this.products || this.products.length === 0) {
      return `
        <tr>
          <td colspan="9" class="empty-state" style="padding: 40px;">
            <span style="color:#94a3b8; margin-bottom:8px;">${renderIcon('package', 32)}</span>
            <div class="empty-title">No products found</div>
            <div class="empty-desc">No products matched your search or filter settings.</div>
          </td>
        </tr>
      `;
    }

    return this.products.map(p => {
      let badgeClass = 'badge-in-stock';
      let badgeLabel = 'IN STOCK';
      if (p.current_stock === 0) {
        badgeClass = 'badge-out-of-stock';
        badgeLabel = 'OUT OF STOCK';
      } else if (p.current_stock <= p.reorder_level) {
        badgeClass = 'badge-low-stock';
        badgeLabel = 'LOW STOCK';
      }

      return `
        <tr>
          <td>
            <div style="font-weight: 600; color: #0f172a;">${p.name}</div>
            <div style="font-size: 0.76rem; color: #64748b; max-width: 260px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${p.description || 'No description provided'}
            </div>
          </td>
          <td>
            <div style="font-family: monospace; font-weight: 700; color: #334155;">${p.sku}</div>
            <div style="font-size: 0.74rem; color: #94a3b8;">${p.barcode || '—'}</div>
          </td>
          <td>
            <span style="display: inline-flex; align-items: center; gap: 6px; font-weight: 500;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: ${p.category_color || '#10b981'};"></span>
              ${p.category_name || 'Unassigned'}
            </span>
          </td>
          <td style="color: #64748b;">${p.uom}</td>
          <td style="font-weight: 600;">$${p.unit_cost.toFixed(2)}</td>
          <td>
            <button class="btn btn-secondary btn-sm" style="font-weight: 700; font-size: 0.86rem; color: ${p.current_stock > 0 ? '#10b981' : '#f43f5e'};"
                    onclick='Modals.openProductStockBreakdown(${JSON.stringify(p).replace(/'/g, "&#39;")})'
                    title="Click to view stock by warehouse & rack">
              ${p.current_stock} ${p.uom} ${renderIcon('eye', 13)}
            </button>
          </td>
          <td style="color: #64748b;">${p.reorder_level} ${p.uom}</td>
          <td>
            <span class="badge ${badgeClass}">${badgeLabel}</span>
          </td>
          <td style="text-align: right;">
            <div style="display: inline-flex; gap: 6px;">
              <button class="btn-icon" title="Edit Product" onclick='Modals.openEditProductModal(${JSON.stringify(p).replace(/'/g, "&#39;")}, () => ProductsPage.refresh())'>
                ${renderIcon('edit', 16)}
              </button>
              <button class="btn-icon" style="color: #f87171;" title="Delete Product" onclick="ProductsPage.deleteProduct(${p.id}, '${p.name}')">
                ${renderIcon('trash', 16)}
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  deleteProduct(id, name) {
    Modals.confirm('Delete Product', `Are you sure you want to remove "${name}"? Only products with zero movements in the ledger can be removed.`, async () => {
      try {
        await API.deleteProduct(id);
        Toast.success(`Product "${name}" deleted`);
        ProductsPage.refresh();
      } catch (e) {}
    });
  },

  debounceTimer: null,
  onSearchInput(val) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(async () => {
      this.filters.search = val.trim();
      const res = await API.getProducts(this.filters);
      this.products = res.products || [];
      const tbody = document.getElementById('products-tbody');
      if (tbody) tbody.innerHTML = this.renderTableRows();
    }, 200);
  },

  async onFilterChange(field, val) {
    this.filters[field] = val;
    const res = await API.getProducts(this.filters);
    this.products = res.products || [];
    const tbody = document.getElementById('products-tbody');
    if (tbody) tbody.innerHTML = this.renderTableRows();
  },

  async refresh() {
    const main = document.getElementById('main-workspace');
    if (main) await this.render(main);
  }
};

window.ProductsPage = ProductsPage;
