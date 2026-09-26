// Interactive Pure SVG Data Charts
const Charts = {
  // 1. Render Category Donut Chart
  renderCategoryDonut(categories, container) {
    if (!categories || categories.length === 0) {
      container.innerHTML = '<div class="empty-state">No category data</div>';
      return;
    }

    const totalUnits = categories.reduce((sum, c) => sum + c.total_units, 0);
    const size = 200;
    const strokeWidth = 32;
    const radius = (size - strokeWidth) / 2;
    const center = size / 2;
    const circumference = 2 * Math.PI * radius;

    let accumulatedAngle = 0;
    let svgSlices = '';

    categories.forEach(cat => {
      const percentage = totalUnits > 0 ? (cat.total_units / totalUnits) : 0;
      const strokeDasharray = `${percentage * circumference} ${circumference}`;
      const strokeDashoffset = -accumulatedAngle * circumference;
      accumulatedAngle += percentage;

      svgSlices += `
        <circle cx="${center}" cy="${center}" r="${radius}"
          fill="none"
          stroke="${cat.color || '#10b981'}"
          stroke-width="${strokeWidth}"
          stroke-dasharray="${strokeDasharray}"
          stroke-dashoffset="${strokeDashoffset}"
          style="transition: stroke-width 0.2s ease, opacity 0.2s ease; cursor: pointer;"
          onmouseover="this.style.strokeWidth='36px'; this.style.opacity='0.85';"
          onmouseout="this.style.strokeWidth='${strokeWidth}px'; this.style.opacity='1';"
        >
          <title>${cat.name}: ${cat.total_units} units (${Math.round(percentage * 100)}%)</title>
        </circle>
      `;
    });

    const legendHtml = categories.map(cat => {
      const pct = totalUnits > 0 ? Math.round((cat.total_units / totalUnits) * 100) : 0;
      return `
        <div class="legend-item">
          <div class="legend-dot-name">
            <span class="legend-dot" style="background-color: ${cat.color};"></span>
            <span style="font-weight: 500; color: #334155;">${cat.name}</span>
          </div>
          <div style="display: flex; gap: 8px;">
            <span style="font-weight: 600; color: #0f172a;">${cat.total_units}</span>
            <span style="color: #94a3b8; width: 34px; text-align: right;">${pct}%</span>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="donut-wrapper">
        <div style="position: relative; width: ${size}px; height: ${size}px; flex-shrink: 0;">
          <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="transform: rotate(-90deg);">
            <circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="#f1f5f9" stroke-width="${strokeWidth}" />
            ${svgSlices}
          </svg>
          <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none;">
            <span style="font-size: 1.4rem; font-weight: 800; color: #0f172a;">${totalUnits}</span>
            <span style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 600;">Total Units</span>
          </div>
        </div>
        <div class="legend-list">
          ${legendHtml}
        </div>
      </div>
    `;
  },

  // 2. Render Stock Movement Overview (Incoming vs Outgoing) Grouped Bar Chart
  renderMovementBarChart(movement, container) {
    const days = ['Day -6', 'Day -5', 'Day -4', 'Day -3', 'Day -2', 'Yesterday', 'Today'];
    const incomingData = [45, 120, 80, 150, 100, 200, 140];
    const outgoingData = [20, 65, 40, 90, 85, 110, 60];

    const width = 500;
    const height = 220;
    const padX = 40;
    const padY = 30;
    const chartW = width - padX * 2;
    const chartH = height - padY * 2;

    const maxVal = Math.max(...incomingData, ...outgoingData, 100) * 1.15;
    const slotW = chartW / days.length;
    const barW = 12;

    let bars = '';
    let labels = '';

    days.forEach((day, i) => {
      const x = padX + i * slotW;
      const inH = (incomingData[i] / maxVal) * chartH;
      const outH = (outgoingData[i] / maxVal) * chartH;

      const inY = height - padY - inH;
      const outY = height - padY - outH;

      bars += `
        <!-- Incoming Bar -->
        <rect x="${x + slotW / 2 - barW - 2}" y="${inY}" width="${barW}" height="${inH}" rx="3" fill="#10b981" style="transition: all 0.3s ease;">
          <title>${day} Incoming (Receipts): ${incomingData[i]} units</title>
        </rect>
        <!-- Outgoing Bar -->
        <rect x="${x + slotW / 2 + 2}" y="${outY}" width="${barW}" height="${outH}" rx="3" fill="#3b82f6" style="transition: all 0.3s ease;">
          <title>${day} Outgoing (Deliveries): ${outgoingData[i]} units</title>
        </rect>
      `;

      labels += `
        <text x="${x + slotW / 2}" y="${height - 10}" text-anchor="middle" font-size="10" fill="#64748b">${day.replace('Day -', '-').replace('Yesterday', 'Yday')}</text>
      `;
    });

    container.innerHTML = `
      <div style="width: 100%; display: flex; flex-direction: column; gap: 8px;">
        <div style="display: flex; justify-content: flex-end; gap: 16px; font-size: 0.78rem;">
          <span style="display: flex; align-items: center; gap: 6px; color: #475569; font-weight: 500;">
            <span style="width: 10px; height: 10px; border-radius: 2px; background-color: #10b981;"></span>
            Incoming (Receipts)
          </span>
          <span style="display: flex; align-items: center; gap: 6px; color: #475569; font-weight: 500;">
            <span style="width: 10px; height: 10px; border-radius: 2px; background-color: #3b82f6;"></span>
            Outgoing (Deliveries)
          </span>
        </div>
        <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: 210px; overflow: visible;">
          <!-- Grid Lines -->
          <line x1="${padX}" y1="${height - padY}" x2="${width - padX}" y2="${height - padY}" stroke="#e2e8f0" stroke-width="1" />
          <line x1="${padX}" y1="${height - padY - chartH / 2}" x2="${width - padX}" y2="${height - padY - chartH / 2}" stroke="#f1f5f9" stroke-dasharray="4 4" stroke-width="1" />
          <line x1="${padX}" y1="${padY}" x2="${width - padX}" y2="${padY}" stroke="#f1f5f9" stroke-dasharray="4 4" stroke-width="1" />

          ${bars}
          ${labels}
        </svg>
      </div>
    `;
  }
};

window.Charts = Charts;
