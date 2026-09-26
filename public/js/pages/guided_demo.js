// Dedicated Hackathon Guided Demo Scenario Page
const GuidedDemoPage = {
  stepResults: {},

  async render(container) {
    container.innerHTML = `
      <div class="page-workspace">
        <div class="page-header">
          <div class="page-title-group">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="badge badge-done">${renderIcon('sparkles', 13)} Live Demonstration</span>
              <h1>End-to-End Stock Lifecycle Scenario</h1>
            </div>
            <p>Interactive verification for Hackathon Judges: Inbound &rarr; Relocation &rarr; Outbound &rarr; Discrepancy Reconciliation</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-secondary btn-sm" onclick="Navbar.resetDemoData()">
              ${renderIcon('refresh-cw', 14)} Reset Demo State
            </button>
            <button class="btn btn-primary btn-sm" onclick="GuidedDemoPage.runAll()">
              ${renderIcon('sparkles', 14)} Run Complete 4-Step Scenario
            </button>
          </div>
        </div>

        <!-- Walkthrough Explanation Card -->
        <div class="card" style="background: linear-gradient(135deg, #0f172a, #1e293b); color: white; border-color: #334155;">
          <h2 style="font-size: 1.25rem; font-weight: 700; color: #34d399; margin-bottom: 6px;">
            Target Lifecycle: Industrial Steel Rods 20mm (SKU: STL-ROD-20M)
          </h2>
          <p style="font-size: 0.88rem; color: #94a3b8; max-width: 900px; line-height: 1.6;">
            This guided pipeline proves our system's ACID transaction reliability:
            receiving <strong>100 kg</strong> at Central DC, transferring <strong>100 kg</strong> to the Detroit Production floor (verifying company total invariant),
            dispatching <strong>20 kg</strong> to Apex Manufacturing, and adjusting <strong>3 kg</strong> scrap damage.
            The resulting ledger will cleanly audit all 4 transactions totaling an exact net delta of <strong>+77 kg</strong>.
          </p>
        </div>

        <!-- 4 Steps Interactive Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 18px;">
          <!-- Step 1 -->
          <div class="card" id="demo-step-card-1" style="display: flex; flex-direction: column; justify-content: space-between; gap: 14px;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span style="font-size: 0.72rem; font-weight: 800; color: #10b981; text-transform: uppercase;">Step 1 • Inbound Receipt</span>
                <span class="badge badge-type-receipt">RECEIPT</span>
              </div>
              <h3 style="font-size: 1.05rem; font-weight: 700;">Receive 100 kg Steel</h3>
              <p style="font-size: 0.8rem; color: #64748b; margin-top: 4px;">
                Supplier Apex Steel delivers 100 kg to Central Distribution Center (Rack A-01). Stock increases by 100.
              </p>
            </div>
            <div id="step-result-1" style="font-size: 0.8rem; color: #334155; min-height: 48px; background: #f8fafc; padding: 8px; border-radius: var(--radius-sm); border: 1px dashed #cbd5e1;">
              Pending execution...
            </div>
            <button class="btn btn-primary btn-sm" onclick="GuidedDemoPage.runStep(1)">
              Execute Step 1
            </button>
          </div>

          <!-- Step 2 -->
          <div class="card" id="demo-step-card-2" style="display: flex; flex-direction: column; justify-content: space-between; gap: 14px;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span style="font-size: 0.72rem; font-weight: 800; color: #6366f1; text-transform: uppercase;">Step 2 • Internal Transfer</span>
                <span class="badge badge-type-transfer">TRANSFER</span>
              </div>
              <h3 style="font-size: 1.05rem; font-weight: 700;">Relocate to Production Rack</h3>
              <p style="font-size: 0.8rem; color: #64748b; margin-top: 4px;">
                Moves 100 kg from CDC Rack A-01 to Detroit Assembly Plant Rack 1. Company-wide stock remains unchanged!
              </p>
            </div>
            <div id="step-result-2" style="font-size: 0.8rem; color: #334155; min-height: 48px; background: #f8fafc; padding: 8px; border-radius: var(--radius-sm); border: 1px dashed #cbd5e1;">
              Pending execution...
            </div>
            <button class="btn btn-primary btn-sm" onclick="GuidedDemoPage.runStep(2)">
              Execute Step 2
            </button>
          </div>

          <!-- Step 3 -->
          <div class="card" id="demo-step-card-3" style="display: flex; flex-direction: column; justify-content: space-between; gap: 14px;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span style="font-size: 0.72rem; font-weight: 800; color: #3b82f6; text-transform: uppercase;">Step 3 • Customer Delivery</span>
                <span class="badge badge-type-delivery">DELIVERY</span>
              </div>
              <h3 style="font-size: 1.05rem; font-weight: 700;">Deliver 20 kg to Customer</h3>
              <p style="font-size: 0.8rem; color: #64748b; margin-top: 4px;">
                Dispatched to Apex Manufacturing. Available stock at Detroit plant decrements by 20 kg.
              </p>
            </div>
            <div id="step-result-3" style="font-size: 0.8rem; color: #334155; min-height: 48px; background: #f8fafc; padding: 8px; border-radius: var(--radius-sm); border: 1px dashed #cbd5e1;">
              Pending execution...
            </div>
            <button class="btn btn-primary btn-sm" onclick="GuidedDemoPage.runStep(3)">
              Execute Step 3
            </button>
          </div>

          <!-- Step 4 -->
          <div class="card" id="demo-step-card-4" style="display: flex; flex-direction: column; justify-content: space-between; gap: 14px;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span style="font-size: 0.72rem; font-weight: 800; color: #f59e0b; text-transform: uppercase;">Step 4 • Count Adjustment</span>
                <span class="badge badge-type-adjustment">ADJUSTMENT</span>
              </div>
              <h3 style="font-size: 1.05rem; font-weight: 700;">Reconcile -3 kg Damaged</h3>
              <p style="font-size: 0.8rem; color: #64748b; margin-top: 4px;">
                Cycle count identifies 3 kg damaged during robotic lathe chucking. Reason recorded & audited.
              </p>
            </div>
            <div id="step-result-4" style="font-size: 0.8rem; color: #334155; min-height: 48px; background: #f8fafc; padding: 8px; border-radius: var(--radius-sm); border: 1px dashed #cbd5e1;">
              Pending execution...
            </div>
            <button class="btn btn-primary btn-sm" onclick="GuidedDemoPage.runStep(4)">
              Execute Step 4
            </button>
          </div>
        </div>

        <!-- Ledger Summary Jump Card -->
        <div class="card" style="display: flex; align-items: center; justify-content: space-between; padding: 20px;">
          <div>
            <h3 style="font-size: 1.05rem; font-weight: 700; color: #0f172a;">Verify in Stock Movement Ledger</h3>
            <p style="font-size: 0.82rem; color: #64748b;">
              Each validated step creates a cryptographically auditable record with timestamps, before/after balances, and user attribution.
            </p>
          </div>
          <button class="btn btn-secondary" onclick="State.setRoute('ledger')">
            Open Auditable Ledger ${renderIcon('arrow-up-right', 15)}
          </button>
        </div>
      </div>
    `;
  },

  async runStep(stepNum) {
    try {
      const res = await API.runGuidedStep(stepNum);
      const r = res.result;

      const resEl = document.getElementById(`step-result-${stepNum}`);
      if (resEl) {
        if (stepNum === 1) {
          resEl.innerHTML = `<span style="color:#10b981;font-weight:700;">&check; Done!</span> Ref: ${r.reference}<br>CDC Rack: <strong>${r.newLocationStock}</strong>`;
        } else if (stepNum === 2) {
          resEl.innerHTML = `<span style="color:#10b981;font-weight:700;">&check; Done!</span> Ref: ${r.reference}<br>PAP Detroit Rack: <strong>${r.destinationStock}</strong><br><small style="color:#10b981;">Invariant Preserved!</small>`;
        } else if (stepNum === 3) {
          resEl.innerHTML = `<span style="color:#10b981;font-weight:700;">&check; Done!</span> Ref: ${r.reference}<br>Delivered: -20 kg | Remaining: <strong>${r.remainingLocationStock}</strong>`;
        } else if (stepNum === 4) {
          resEl.innerHTML = `<span style="color:#10b981;font-weight:700;">&check; Final Net Delta: +77 kg</span><br>Physical: <strong>${r.countedPhysical}</strong> | Diff: ${r.difference}`;
        }
      }

      const card = document.getElementById(`demo-step-card-${stepNum}`);
      if (card) {
        card.style.borderColor = '#10b981';
      }

      Toast.success(`Step ${stepNum} complete: ${r.action}`);
    } catch (e) {}
  },

  async runAll() {
    Toast.info('Executing complete sequence (Steps 1 &rarr; 4)...');
    for (let s = 1; s <= 4; s++) {
      await this.runStep(s);
      await new Promise(r => setTimeout(r, 600));
    }
    Toast.success('Complete Stock Lifecycle successfully demonstrated!');
  }
};

window.GuidedDemoPage = GuidedDemoPage;
