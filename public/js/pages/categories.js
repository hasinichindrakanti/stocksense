// Product Categories Management Page
const CategoriesPage = {
  categories: [],

  async render(container) {
    container.innerHTML = `
      <div style="display:flex; justify-content:center; align-items:center; padding: 100px 0;">
        <span style="color:#10b981;">${renderIcon('refresh-cw', 32)}</span>
        <span style="margin-left: 12px; font-weight: 500; color: #64748b;">Loading categories...</span>
      </div>
    `;

    try {
      const res = await API.getCategories();
      this.categories = res.categories || [];

      container.innerHTML = `
        <div class="page-workspace">
          <div class="page-header">
            <div class="page-title-group">
              <h1>Product Categories</h1>
              <p>Classification taxonomy, department tags and storage grouping</p>
            </div>
            <div class="page-actions">
              <button class="btn btn-secondary btn-sm" onclick="CategoriesPage.refresh()">
                ${renderIcon('refresh-cw', 14)} Refresh
              </button>
              <button class="btn btn-primary btn-sm" onclick="CategoriesPage.openCreateModal()">
                ${renderIcon('plus', 15)} New Category
              </button>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 18px;">
            ${this.renderCategoryCards()}
          </div>
        </div>
      `;
    } catch (e) {
      container.innerHTML = `<div class="empty-state">Failed to load categories: ${e.message}</div>`;
    }
  },

  renderCategoryCards() {
    if (!this.categories || this.categories.length === 0) {
      return `<div class="card empty-state" style="grid-column: 1 / -1;">No categories found</div>`;
    }

    return this.categories.map(c => `
      <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; gap: 14px;">
        <div style="display: flex; align-items: flex-start; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 40px; height: 40px; border-radius: var(--radius-md); background: ${c.color || '#10b981'}20; color: ${c.color || '#10b981'}; display: flex; align-items: center; justify-content: center;">
              ${renderIcon(c.icon || 'layers', 22)}
            </div>
            <div>
              <h3 style="font-size: 1.05rem; font-weight: 700; color: #0f172a;">${c.name}</h3>
              <span style="font-size: 0.78rem; color: #64748b;">${c.product_count} SKUs assigned</span>
            </div>
          </div>
          <span style="width: 12px; height: 12px; border-radius: 50%; background: ${c.color || '#10b981'};" title="Theme color"></span>
        </div>

        <p style="font-size: 0.82rem; color: #64748b; min-height: 38px;">
          ${c.description || 'General category for inventory grouping.'}
        </p>

        <div style="border-top: 1px solid #f1f5f9; padding-top: 12px; display: flex; justify-content: space-between; align-items: center;">
          <button class="btn btn-secondary btn-sm" onclick="State.setRoute('products')">
            Browse SKUs ${renderIcon('arrow-up-right', 13)}
          </button>
        </div>
      </div>
    `).join('');
  },

  openCreateModal() {
    Modals.open({
      title: 'Create Product Category',
      content: `
        <form id="create-cat-form" class="form-grid-2">
          <div class="form-field" style="grid-column: span 2;">
            <label class="form-label">Category Name *</label>
            <input type="text" id="cat-name" class="form-input" required placeholder="e.g. Precision Instrumentation" />
          </div>
          <div class="form-field">
            <label class="form-label">Accent Color</label>
            <input type="color" id="cat-color" class="form-input" value="#10b981" style="height: 42px; padding: 2px;" />
          </div>
          <div class="form-field">
            <label class="form-label">Icon</label>
            <select id="cat-icon" class="form-select">
              <option value="layers">Layers</option>
              <option value="cpu">Processor / Electronics</option>
              <option value="box">Package / Box</option>
              <option value="cog">Mechanical / Cog</option>
              <option value="shield">Safety / Shield</option>
              <option value="briefcase">Office / Facility</option>
            </select>
          </div>
          <div class="form-field" style="grid-column: span 2;">
            <label class="form-label">Description</label>
            <textarea id="cat-desc" class="form-textarea" rows="2" placeholder="Brief scope of products in this category..."></textarea>
          </div>
        </form>
      `,
      footer: `
        <button class="btn btn-secondary" onclick="Modals.close()">Cancel</button>
        <button class="btn btn-primary" id="btn-save-cat">Create Category</button>
      `
    });

    document.getElementById('btn-save-cat').addEventListener('click', async () => {
      const name = document.getElementById('cat-name').value.trim();
      if (!name) return Toast.error('Category name is required');

      try {
        await API.createCategory({
          name,
          color: document.getElementById('cat-color').value,
          icon: document.getElementById('cat-icon').value,
          description: document.getElementById('cat-desc').value.trim()
        });
        Toast.success(`Category "${name}" created`);
        Modals.close();
        CategoriesPage.refresh();
      } catch (e) {}
    });
  },

  async refresh() {
    const main = document.getElementById('main-workspace');
    if (main) await this.render(main);
  }
};

window.CategoriesPage = CategoriesPage;
