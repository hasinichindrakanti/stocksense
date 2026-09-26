// Dynamic Modal Dialog Manager
const Modals = {
  backdrop: null,
  dialog: null,
  activeCallback: null,

  init() {
    if (!this.backdrop) {
      this.backdrop = document.createElement('div');
      this.backdrop.className = 'modal-backdrop';
      this.backdrop.innerHTML = `
        <div class="modal-dialog" id="global-modal-dialog">
          <div class="modal-header">
            <h3 class="modal-title" id="modal-title">Modal</h3>
            <button class="btn-icon" onclick="Modals.close()">${renderIcon('x', 18)}</button>
          </div>
          <div class="modal-body" id="modal-body"></div>
          <div class="modal-footer" id="modal-footer"></div>
        </div>
      `;
      document.body.appendChild(this.backdrop);
      this.dialog = document.getElementById('global-modal-dialog');

      this.backdrop.addEventListener('click', (e) => {
        if (e.target === this.backdrop) this.close();
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.backdrop.classList.contains('open')) {
          this.close();
        }
      });
    }
  },

  open({ title, content, footer, large = false }) {
    this.init();
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-body').innerHTML = content;
    document.getElementById('modal-footer').innerHTML = footer || `
      <button class="btn btn-secondary" onclick="Modals.close()">Close</button>
    `;

    if (large) {
      this.dialog.classList.add('large');
    } else {
      this.dialog.classList.remove('large');
    }

    this.backdrop.classList.add('open');
  },

  close() {
    if (this.backdrop) {
      this.backdrop.classList.remove('open');
    }
  },

  // 1. Global Search Modal (Ctrl+K)
  async openGlobalSearch() {
    this.open({
      title: 'StockSense Global Search',
      content: `
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div style="position: relative;">
            <input type="text" id="global-search-input" class="form-input" style="width: 100%; padding-left: 36px;" placeholder="Search SKU, product name, PO/DO reference, warehouse..." autofocus />
            <div style="position: absolute; left: 10px; top: 10px; color: #94a3b8;">
              ${renderIcon('search', 18)}
            </div>
          </div>
          <div id="global-search-results" style="max-height: 380px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;">
            <div style="color: #94a3b8; font-size: 0.84rem; text-align: center; padding: 24px 0;">
              Type 2 or more characters to search products, transactions, or locations...
            </div>
          </div>
        </div>
      `,
      footer: `<div style="font-size: 0.74rem; color: #94a3b8; margin-right: auto;">Press <kbd style="background:#e2e8f0;padding:2px 5px;border-radius:3px;">ESC</kbd> to exit</div>
               <button class="btn btn-secondary" onclick="Modals.close()">Close</button>`
    });

    const input = document.getElementById('global-search-input');
    const resultsContainer = document.getElementById('global-search-results');

    let debounceTimer;
    input.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      const query = e.target.value.trim();
      if (query.length < 2) {
        resultsContainer.innerHTML = `<div style="color:#94a3b8;font-size:0.84rem;text-align:center;padding:24px 0;">Type 2 or more characters to search...</div>`;
        return;
      }

      debounceTimer = setTimeout(async () => {
        try {
          const res = await API.search(query);
          let html = '';

          if (res.products && res.products.length > 0) {
            html += `<div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;color:#64748b;letter-spacing:0.05em;margin-top:6px;">Products</div>`;
            res.products.forEach(p => {
              html += `
                <div class="nav-item" style="border:1px solid #e2e8f0;justify-content:space-between;" onclick="Modals.close(); State.setRoute('products');">
                  <div style="display:flex;align-items:center;gap:10px;">
                    <span style="color:#10b981;">${renderIcon('package', 18)}</span>
                    <div>
                      <div style="font-weight:600;color:#0f172a;">${p.name}</div>
                      <div style="font-size:0.75rem;color:#64748b;">SKU: ${p.sku} | ${p.category_name || 'General'}</div>
                    </div>
                  </div>
                  <span class="badge ${p.current_stock > 0 ? 'badge-in-stock' : 'badge-out-of-stock'}">${p.current_stock} ${p.uom}</span>
                </div>
              `;
            });
          }

          if (res.documents && res.documents.length > 0) {
            html += `<div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;color:#64748b;letter-spacing:0.05em;margin-top:10px;">Operations & Documents</div>`;
            res.documents.forEach(d => {
              let route = 'receipts';
              if (d.type === 'delivery') route = 'deliveries';
              if (d.type === 'transfer') route = 'transfers';
              if (d.type === 'adjustment') route = 'adjustments';

              html += `
                <div class="nav-item" style="border:1px solid #e2e8f0;justify-content:space-between;" onclick="Modals.close(); State.setRoute('${route}');">
                  <div style="display:flex;align-items:center;gap:10px;">
                    <span style="color:#3b82f6;">${renderIcon('file-text', 18)}</span>
                    <div>
                      <div style="font-weight:600;color:#0f172a;">${d.reference}</div>
                      <div style="font-size:0.75rem;color:#64748b;text-transform:capitalize;">${d.type} Order</div>
                    </div>
                  </div>
                  <span class="badge badge-${d.status}">${d.status}</span>
                </div>
              `;
            });
          }

          if (res.warehouses && res.warehouses.length > 0) {
            html += `<div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;color:#64748b;letter-spacing:0.05em;margin-top:10px;">Warehouses</div>`;
            res.warehouses.forEach(w => {
              html += `
                <div class="nav-item" style="border:1px solid #e2e8f0;justify-content:space-between;" onclick="Modals.close(); State.setRoute('warehouses');">
                  <div style="display:flex;align-items:center;gap:10px;">
                    <span style="color:#8b5cf6;">${renderIcon('warehouse', 18)}</span>
                    <div>
                      <div style="font-weight:600;color:#0f172a;">${w.name} (${w.code})</div>
                      <div style="font-size:0.75rem;color:#64748b;">Manager: ${w.manager_name}</div>
                    </div>
                  </div>
                  <span style="color:#64748b;">${renderIcon('chevron-right', 16)}</span>
                </div>
              `;
            });
          }

          if (!html) {
            html = `<div style="color:#94a3b8;font-size:0.84rem;text-align:center;padding:24px 0;">No matching records found for "${query}"</div>`;
          }

          resultsContainer.innerHTML = html;
        } catch (e) {
          resultsContainer.innerHTML = `<div style="color:#ef4444;font-size:0.84rem;text-align:center;">Search failed</div>`;
        }
      }, 250);
    });

    setTimeout(() => input.focus(), 100);
  },

  // 2. Add Product Modal
  async openAddProductModal(onSuccess) {
    const [catRes, whRes] = await Promise.all([API.getCategories(), API.getWarehouses()]);
    const categories = catRes.categories || [];
    const warehouses = whRes.warehouses || [];

    const categoryOptions = categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    const warehouseOptions = warehouses.map(w => `<option value="${w.id}">${w.name} (${w.code})</option>`).join('');

    this.open({
      title: 'Add New Product',
      large: true,
      content: `
        <form id="add-product-form" class="form-grid-2">
          <div class="form-field" style="grid-column: span 2;">
            <label class="form-label">Product Name *</label>
            <input type="text" id="prod-name" class="form-input" required placeholder="e.g. Industrial Steel Rods 20mm" />
          </div>

          <div class="form-field">
            <label class="form-label">SKU / Code *</label>
            <input type="text" id="prod-sku" class="form-input" required placeholder="e.g. STL-ROD-20M" />
            <span class="form-helper">Must be unique across the system</span>
          </div>

          <div class="form-field">
            <label class="form-label">Barcode / UPC</label>
            <input type="text" id="prod-barcode" class="form-input" placeholder="e.g. 789123001" />
          </div>

          <div class="form-field">
            <label class="form-label">Category</label>
            <select id="prod-cat" class="form-select">${categoryOptions}</select>
          </div>

          <div class="form-field">
            <label class="form-label">Unit of Measure (UOM)</label>
            <select id="prod-uom" class="form-select">
              <option value="Units">Units</option>
              <option value="kg">kg (Kilograms)</option>
              <option value="Liters">Liters</option>
              <option value="Boxes">Boxes</option>
              <option value="Meters">Meters</option>
            </select>
          </div>

          <div class="form-field">
            <label class="form-label">Unit Cost ($)</label>
            <input type="number" id="prod-cost" class="form-input" step="0.01" value="10.00" />
          </div>

          <div class="form-field">
            <label class="form-label">Reorder Level (Alert Threshold)</label>
            <input type="number" id="prod-reorder" class="form-input" step="1" value="25" />
            <span class="form-helper">Triggers warning when total stock is at or below this level</span>
          </div>

          <div class="form-field">
            <label class="form-label">Target Replenishment Stock</label>
            <input type="number" id="prod-target" class="form-input" step="1" value="100" />
          </div>

          <div class="form-field" style="grid-column: span 2;">
            <label class="form-label">Product Description</label>
            <textarea id="prod-desc" class="form-textarea" rows="2" placeholder="Technical specifications or handling notes..."></textarea>
          </div>

          <div style="grid-column: span 2; padding: 12px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: var(--radius-md);">
            <div style="font-weight: 600; font-size: 0.82rem; margin-bottom: 8px; color: #334155;">Initial Stock Inward (Optional)</div>
            <div class="form-grid-2">
              <div class="form-field">
                <label class="form-label">Initial Quantity</label>
                <input type="number" id="prod-init-qty" class="form-input" step="1" placeholder="0" />
              </div>
              <div class="form-field">
                <label class="form-label">Intake Warehouse & Location</label>
                <select id="prod-init-wh" class="form-select">${warehouseOptions}</select>
              </div>
            </div>
          </div>
        </form>
      `,
      footer: `
        <button class="btn btn-secondary" onclick="Modals.close()">Cancel</button>
        <button class="btn btn-primary" id="btn-save-prod">Save Product</button>
      `
    });

    document.getElementById('btn-save-prod').addEventListener('click', async () => {
      const name = document.getElementById('prod-name').value.trim();
      const sku = document.getElementById('prod-sku').value.trim();
      if (!name || !sku) {
        Toast.error('Product name and SKU are required');
        return;
      }

      const initWh = document.getElementById('prod-init-wh').value;
      let initLoc = null;
      if (initWh) {
        const locs = await API.getLocations({ warehouse_id: initWh });
        if (locs.locations && locs.locations.length > 0) {
          initLoc = locs.locations[0].id;
        }
      }

      const data = {
        name,
        sku,
        barcode: document.getElementById('prod-barcode').value.trim(),
        category_id: document.getElementById('prod-cat').value,
        uom: document.getElementById('prod-uom').value,
        unit_cost: parseFloat(document.getElementById('prod-cost').value) || 0,
        reorder_level: parseFloat(document.getElementById('prod-reorder').value) || 10,
        target_stock: parseFloat(document.getElementById('prod-target').value) || 50,
        description: document.getElementById('prod-desc').value.trim(),
        initial_stock: parseFloat(document.getElementById('prod-init-qty').value) || 0,
        initial_warehouse_id: initWh,
        initial_location_id: initLoc
      };

      try {
        await API.createProduct(data);
        Toast.success(`Product ${data.name} (${data.sku}) created successfully!`);
        Modals.close();
        if (onSuccess) onSuccess();
      } catch (e) {
        // Handled by API error toast
      }
    });
  },

  // 3. Edit Product Modal
  async openEditProductModal(prod, onSuccess) {
    const catRes = await API.getCategories();
    const categories = catRes.categories || [];
    const categoryOptions = categories.map(c => `
      <option value="${c.id}" ${c.id === prod.category_id ? 'selected' : ''}>${c.name}</option>
    `).join('');

    this.open({
      title: `Edit Product: ${prod.name}`,
      large: true,
      content: `
        <form id="edit-product-form" class="form-grid-2">
          <div class="form-field" style="grid-column: span 2;">
            <label class="form-label">Product Name *</label>
            <input type="text" id="edit-prod-name" class="form-input" value="${prod.name}" required />
          </div>

          <div class="form-field">
            <label class="form-label">SKU</label>
            <input type="text" class="form-input" value="${prod.sku}" disabled style="background:#f1f5f9;cursor:not-allowed;" />
            <span class="form-helper">SKU identifier cannot be altered after creation</span>
          </div>

          <div class="form-field">
            <label class="form-label">Barcode / UPC</label>
            <input type="text" id="edit-prod-barcode" class="form-input" value="${prod.barcode || ''}" />
          </div>

          <div class="form-field">
            <label class="form-label">Category</label>
            <select id="edit-prod-cat" class="form-select">${categoryOptions}</select>
          </div>

          <div class="form-field">
            <label class="form-label">Unit of Measure (UOM)</label>
            <select id="edit-prod-uom" class="form-select">
              <option value="Units" ${prod.uom === 'Units' ? 'selected' : ''}>Units</option>
              <option value="kg" ${prod.uom === 'kg' ? 'selected' : ''}>kg (Kilograms)</option>
              <option value="Liters" ${prod.uom === 'Liters' ? 'selected' : ''}>Liters</option>
              <option value="Boxes" ${prod.uom === 'Boxes' ? 'selected' : ''}>Boxes</option>
              <option value="Meters" ${prod.uom === 'Meters' ? 'selected' : ''}>Meters</option>
            </select>
          </div>

          <div class="form-field">
            <label class="form-label">Unit Cost ($)</label>
            <input type="number" id="edit-prod-cost" class="form-input" step="0.01" value="${prod.unit_cost}" />
          </div>

          <div class="form-field">
            <label class="form-label">Reorder Level (Alert Threshold)</label>
            <input type="number" id="edit-prod-reorder" class="form-input" step="1" value="${prod.reorder_level}" />
          </div>

          <div class="form-field">
            <label class="form-label">Target Replenishment Stock</label>
            <input type="number" id="edit-prod-target" class="form-input" step="1" value="${prod.target_stock}" />
          </div>

          <div class="form-field" style="grid-column: span 2;">
            <label class="form-label">Product Description</label>
            <textarea id="edit-prod-desc" class="form-textarea" rows="2">${prod.description || ''}</textarea>
          </div>
        </form>
      `,
      footer: `
        <button class="btn btn-secondary" onclick="Modals.close()">Cancel</button>
        <button class="btn btn-primary" id="btn-update-prod">Save Changes</button>
      `
    });

    document.getElementById('btn-update-prod').addEventListener('click', async () => {
      const name = document.getElementById('edit-prod-name').value.trim();
      if (!name) return Toast.error('Product name cannot be empty');

      const data = {
        name,
        barcode: document.getElementById('edit-prod-barcode').value.trim(),
        category_id: document.getElementById('edit-prod-cat').value,
        uom: document.getElementById('edit-prod-uom').value,
        unit_cost: parseFloat(document.getElementById('edit-prod-cost').value) || 0,
        reorder_level: parseFloat(document.getElementById('edit-prod-reorder').value) || 10,
        target_stock: parseFloat(document.getElementById('edit-prod-target').value) || 50,
        description: document.getElementById('edit-prod-desc').value.trim()
      };

      try {
        await API.updateProduct(prod.id, data);
        Toast.success(`Product ${name} updated`);
        Modals.close();
        if (onSuccess) onSuccess();
      } catch (e) {}
    });
  },

  // 4. Warehouse Stock Breakdown Modal
  openProductStockBreakdown(prod) {
    const rows = (prod.warehouses && prod.warehouses.length > 0)
      ? prod.warehouses.map(w => `
        <tr>
          <td style="font-weight: 600;">${w.warehouse_name}</td>
          <td><span style="font-family: monospace; font-weight: 600; color: #475569;">${w.warehouse_code}</span></td>
          <td>${w.location_name} (${w.location_code})</td>
          <td style="font-weight: 700; color: #10b981; text-align: right;">${w.quantity} ${prod.uom}</td>
        </tr>
      `).join('')
      : `<tr><td colspan="4" class="empty-state" style="padding: 24px;">No stock currently stored in any warehouse location.</td></tr>`;

    this.open({
      title: `Stock Availability: ${prod.name} (${prod.sku})`,
      content: `
        <div style="display:flex; flex-direction:column; gap:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; background:#f8fafc; padding:12px 16px; border-radius:var(--radius-md); border:1px solid #e2e8f0;">
            <div>
              <div style="font-size:0.75rem; color:#64748b; font-weight:600; text-transform:uppercase;">Company-Wide Total Stock</div>
              <div style="font-size:1.4rem; font-weight:800; color:#0f172a;">${prod.current_stock} ${prod.uom}</div>
            </div>
            <div>
              <span class="badge ${prod.status_badge === 'in_stock' ? 'badge-in-stock' : (prod.status_badge === 'low_stock' ? 'badge-low-stock' : 'badge-out-of-stock')}">
                ${prod.status_badge.replace(/_/g, ' ').toUpperCase()}
              </span>
            </div>
          </div>

          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Warehouse</th>
                  <th>Code</th>
                  <th>Storage Location / Rack</th>
                  <th style="text-align: right;">Available Quantity</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
          </div>
        </div>
      `,
      footer: `<button class="btn btn-secondary" onclick="Modals.close()">Close</button>`
    });
  },

  // Confirmation Dialog
  confirm(title, message, onConfirm) {
    this.open({
      title: title || 'Are you sure?',
      content: `
        <div style="display: flex; gap: 14px; align-items: flex-start;">
          <div style="color: #f59e0b; padding-top: 2px;">
            ${renderIcon('alert-triangle', 24)}
          </div>
          <div style="color: #334155; font-size: 0.92rem;">
            ${message}
          </div>
        </div>
      `,
      footer: `
        <button class="btn btn-secondary" onclick="Modals.close()">Cancel</button>
        <button class="btn btn-primary" id="btn-modal-confirm">Confirm</button>
      `
    });

    document.getElementById('btn-modal-confirm').addEventListener('click', () => {
      Modals.close();
      if (onConfirm) onConfirm();
    });
  }
};

window.Modals = Modals;
