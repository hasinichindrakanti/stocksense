// Authentication Module (Fintech Sign In, Sign Up, OTP Password Reset, Real Session Management)
const AuthPage = {
  viewMode: 'login', // 'login' | 'signup' | 'forgot' | 'reset'
  resetEmail: '',
  simulatedOtp: '',

  render(container) {
    if (this.viewMode === 'signup') {
      this.renderSignup(container);
    } else if (this.viewMode === 'forgot') {
      this.renderForgot(container);
    } else if (this.viewMode === 'reset') {
      this.renderReset(container);
    } else {
      this.renderLogin(container);
    }
  },

  togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    if (input.type === 'password') {
      input.type = 'text';
      btn.innerHTML = renderIcon('eye-off', 18);
      btn.setAttribute('title', 'Hide password');
    } else {
      input.type = 'password';
      btn.innerHTML = renderIcon('eye', 18);
      btn.setAttribute('title', 'Show password');
    }
  },

  renderLogin(container) {
    container.innerHTML = `
      <div class="auth-wrapper">
        <div class="auth-card">
          <!-- Logo & Brand Header -->
          <div class="auth-header">
            <div class="brand-icon" style="width: 48px; height: 48px;">
              ${renderIcon('box', 28)}
            </div>
            <h2 style="font-size: 1.45rem; font-weight: 800; color: #0f172a; margin-top: 4px;">
              StockSense
            </h2>
            <p style="font-size: 0.78rem; color: #10b981; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;">
              "Every Item. Every Movement. In Control."
            </p>
            <p style="font-size: 0.84rem; color: #64748b;">
              Enterprise Inventory & Logistics Intelligence
            </p>
          </div>

          <!-- Auth Tabs (Sign In / Register) -->
          <div class="auth-tabs">
            <button class="auth-tab-btn active" onclick="AuthPage.setView('login')">
              Sign In
            </button>
            <button class="auth-tab-btn" onclick="AuthPage.setView('signup')">
              Create Account
            </button>
          </div>

          <!-- Hackathon Quick 1-Click Evaluation Sign In -->
          <div class="demo-account-box">
            <div style="font-weight: 700; color: #1e293b; display: flex; align-items: center; justify-content: space-between;">
              <span style="display: flex; align-items: center; gap: 6px;">
                ${renderIcon('sparkles', 14, 'text-emerald-500')} 1-Click Hackathon Sign In:
              </span>
              <span style="font-size: 0.72rem; color: #10b981; font-weight: 600;">Pre-seeded</span>
            </div>
            <div class="demo-btn-row">
              <button type="button" class="btn btn-secondary btn-sm" style="flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;" onclick="AuthPage.fillCredentials('elena@stocksense.io', 'password123')">
                ${renderIcon('shield-check', 14)} Manager (Elena)
              </button>
              <button type="button" class="btn btn-secondary btn-sm" style="flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;" onclick="AuthPage.fillCredentials('marcus@stocksense.io', 'password123')">
                ${renderIcon('user', 14)} Staff (Marcus)
              </button>
            </div>
          </div>

          <!-- Error Alert Banner -->
          <div id="login-error-banner" class="auth-error-banner" style="display: none;">
            ${renderIcon('alert-triangle', 16)}
            <span id="login-error-text">Invalid email or password</span>
          </div>

          <!-- Real Authentication Form -->
          <form id="login-form" style="display: flex; flex-direction: column; gap: 14px;">
            <div class="form-field">
              <label class="form-label" for="login-email">Work Email</label>
              <div class="auth-input-container">
                <span class="auth-input-icon">${renderIcon('mail', 18)}</span>
                <input
                  type="email"
                  id="login-email"
                  class="form-input"
                  required
                  placeholder="name@company.com"
                  value="elena@stocksense.io"
                  autocomplete="email"
                />
              </div>
            </div>

            <div class="form-field">
              <label class="form-label" for="login-password">Password</label>
              <div class="auth-input-container">
                <span class="auth-input-icon">${renderIcon('lock', 18)}</span>
                <input
                  type="password"
                  id="login-password"
                  class="form-input"
                  required
                  placeholder="Enter password"
                  value="password123"
                  autocomplete="current-password"
                />
                <button
                  type="button"
                  class="password-toggle-btn"
                  title="Show password"
                  onclick="AuthPage.togglePasswordVisibility('login-password', this)"
                >
                  ${renderIcon('eye', 18)}
                </button>
              </div>
            </div>

            <div class="auth-options-row">
              <label class="auth-checkbox-label">
                <input type="checkbox" id="login-remember" checked />
                <span>Remember me for 30 days</span>
              </label>
              <a href="javascript:void(0)" class="auth-forgot-link" onclick="AuthPage.setView('forgot')">
                Forgot password?
              </a>
            </div>

            <button type="submit" id="login-submit-btn" class="btn btn-primary" style="width: 100%; margin-top: 4px; padding: 11px; font-weight: 700;">
              <span>Sign In to Dashboard</span>
            </button>
          </form>

          <!-- Security Reassurance -->
          <div class="auth-security-badge">
            ${renderIcon('shield-check', 14)}
            <span>PBKDF2 Secure Session Hashing & 256-bit Encryption</span>
          </div>
        </div>
      </div>
    `;

    const form = document.getElementById('login-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const rememberMe = document.getElementById('login-remember').checked;
        const errBanner = document.getElementById('login-error-banner');
        const errText = document.getElementById('login-error-text');
        const submitBtn = document.getElementById('login-submit-btn');

        if (errBanner) errBanner.style.display = 'none';

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = `<span>Authenticating...</span>`;
        }

        try {
          const res = await API.login({ email, password, rememberMe });
          State.setUser(res.user, res.token, rememberMe);
          Toast.success(`Welcome back, ${res.user.name}!`);
          State.setRoute('dashboard');
          App.render();
        } catch (err) {
          if (errBanner && errText) {
            errText.textContent = err.message || 'Invalid email or password. Please try again.';
            errBanner.style.display = 'flex';
          }
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<span>Sign In to Dashboard</span>`;
          }
        }
      });
    }
  },

  fillCredentials(email, password) {
    const emailEl = document.getElementById('login-email');
    const passEl = document.getElementById('login-password');
    if (emailEl) emailEl.value = email;
    if (passEl) passEl.value = password;
    // Auto-trigger submit for slick demo experience
    const form = document.getElementById('login-form');
    if (form) {
      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  },

  renderSignup(container) {
    container.innerHTML = `
      <div class="auth-wrapper">
        <div class="auth-card">
          <!-- Logo & Brand Header -->
          <div class="auth-header">
            <div class="brand-icon" style="width: 48px; height: 48px;">
              ${renderIcon('box', 28)}
            </div>
            <h2 style="font-size: 1.45rem; font-weight: 800; color: #0f172a; margin-top: 4px;">
              StockSense
            </h2>
            <p style="font-size: 0.84rem; color: #64748b;">
              Create New Operator Clearance
            </p>
          </div>

          <!-- Auth Tabs -->
          <div class="auth-tabs">
            <button class="auth-tab-btn" onclick="AuthPage.setView('login')">
              Sign In
            </button>
            <button class="auth-tab-btn active" onclick="AuthPage.setView('signup')">
              Create Account
            </button>
          </div>

          <!-- Error Alert Banner -->
          <div id="signup-error-banner" class="auth-error-banner" style="display: none;">
            ${renderIcon('alert-triangle', 16)}
            <span id="signup-error-text">Registration failed</span>
          </div>

          <form id="signup-form" style="display: flex; flex-direction: column; gap: 13px;">
            <div class="form-field">
              <label class="form-label" for="reg-name">Full Name *</label>
              <div class="auth-input-container">
                <span class="auth-input-icon">${renderIcon('user', 18)}</span>
                <input type="text" id="reg-name" class="form-input" required placeholder="e.g. Jordan Hayes" autocomplete="name" />
              </div>
            </div>

            <div class="form-field">
              <label class="form-label" for="reg-email">Work Email *</label>
              <div class="auth-input-container">
                <span class="auth-input-icon">${renderIcon('mail', 18)}</span>
                <input type="email" id="reg-email" class="form-input" required placeholder="jordan@company.com" autocomplete="email" />
              </div>
            </div>

            <div class="form-field">
              <label class="form-label" for="reg-role">System Clearance Role *</label>
              <select id="reg-role" class="form-select" style="width: 100%;">
                <option value="inventory_manager">Inventory Manager (Full Admin & Approvals)</option>
                <option value="warehouse_staff">Warehouse Staff (Floor Operations & Receipts)</option>
              </select>
            </div>

            <div class="form-field">
              <label class="form-label" for="reg-password">Password (min. 6 characters) *</label>
              <div class="auth-input-container">
                <span class="auth-input-icon">${renderIcon('lock', 18)}</span>
                <input
                  type="password"
                  id="reg-password"
                  class="form-input"
                  required
                  minlength="6"
                  placeholder="Create a secure password"
                  autocomplete="new-password"
                />
                <button
                  type="button"
                  class="password-toggle-btn"
                  title="Show password"
                  onclick="AuthPage.togglePasswordVisibility('reg-password', this)"
                >
                  ${renderIcon('eye', 18)}
                </button>
              </div>
            </div>

            <button type="submit" id="signup-submit-btn" class="btn btn-primary" style="width: 100%; margin-top: 4px; padding: 11px; font-weight: 700;">
              <span>Register & Enter Workspace</span>
            </button>
          </form>

          <div class="auth-security-badge">
            ${renderIcon('shield-check', 14)}
            <span>Instant Role Provisioning & SQLite Persistence</span>
          </div>
        </div>
      </div>
    `;

    const form = document.getElementById('signup-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const role = document.getElementById('reg-role').value;
        const password = document.getElementById('reg-password').value;
        const errBanner = document.getElementById('signup-error-banner');
        const errText = document.getElementById('signup-error-text');
        const submitBtn = document.getElementById('signup-submit-btn');

        if (errBanner) errBanner.style.display = 'none';

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = `<span>Creating account...</span>`;
        }

        try {
          const res = await API.register({ name, email, role, password, department: 'Logistics' });
          State.setUser(res.user, res.token, true);
          Toast.success(`Welcome to StockSense, ${res.user.name}!`);
          State.setRoute('dashboard');
          App.render();
        } catch (err) {
          if (errBanner && errText) {
            errText.textContent = err.message || 'Registration failed. Please try again.';
            errBanner.style.display = 'flex';
          }
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<span>Register & Enter Workspace</span>`;
          }
        }
      });
    }
  },

  renderForgot(container) {
    container.innerHTML = `
      <div class="auth-wrapper">
        <div class="auth-card">
          <div class="auth-header">
            <div style="color: #10b981; margin-bottom: 4px;">
              ${renderIcon('shield-check', 40)}
            </div>
            <h2 style="font-size: 1.35rem; font-weight: 800; color: #0f172a;">
              Password Recovery
            </h2>
            <p style="font-size: 0.84rem; color: #64748b;">
              Enter your registered work email to generate an OTP code
            </p>
          </div>

          <form id="forgot-form" style="display: flex; flex-direction: column; gap: 14px;">
            <div class="form-field">
              <label class="form-label" for="forgot-email">Registered Email</label>
              <div class="auth-input-container">
                <span class="auth-input-icon">${renderIcon('mail', 18)}</span>
                <input
                  type="email"
                  id="forgot-email"
                  class="form-input"
                  required
                  placeholder="elena@stocksense.io"
                  value="elena@stocksense.io"
                />
              </div>
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%; padding: 11px; font-weight: 700;">
              Generate OTP Verification Code
            </button>
          </form>

          <div style="text-align: center; font-size: 0.82rem; color: #64748b;">
            <a href="javascript:void(0)" style="color: #64748b; font-weight: 600;" onclick="AuthPage.setView('login')">
              &larr; Back to Sign In
            </a>
          </div>
        </div>
      </div>
    `;

    const form = document.getElementById('forgot-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('forgot-email').value.trim();
        try {
          const res = await API.forgotPassword(email);
          this.resetEmail = email;
          this.simulatedOtp = res.demoOtp;
          Toast.success(`Verification OTP generated: ${res.demoOtp}`);
          this.setView('reset');
        } catch (e) {}
      });
    }
  },

  renderReset(container) {
    container.innerHTML = `
      <div class="auth-wrapper">
        <div class="auth-card">
          <div class="auth-header">
            <h2 style="font-size: 1.35rem; font-weight: 800; color: #0f172a;">
              Verify OTP & Set Password
            </h2>
            <p style="font-size: 0.84rem; color: #64748b;">
              Verification code issued for <strong>${this.resetEmail}</strong>
            </p>
          </div>

          <!-- Hackathon Demo OTP Display Box -->
          <div style="background: #ecfdf5; border: 1px dashed #10b981; border-radius: var(--radius-md); padding: 14px; text-align: center;">
            <div style="font-size: 0.74rem; font-weight: 700; color: #047857; text-transform: uppercase; letter-spacing: 0.05em;">
              Hackathon Evaluation OTP Code
            </div>
            <div style="font-size: 2.1rem; font-weight: 900; letter-spacing: 0.2em; color: #065f46; margin: 4px 0;">
              ${this.simulatedOtp}
            </div>
            <div style="font-size: 0.74rem; color: #059669;">
              Code valid for 10 minutes (Simulated OTP Delivery)
            </div>
          </div>

          <form id="reset-form" style="display: flex; flex-direction: column; gap: 14px;">
            <div class="form-field">
              <label class="form-label" for="reset-otp">6-Digit OTP Code</label>
              <input
                type="text"
                id="reset-otp"
                class="form-input"
                required
                value="${this.simulatedOtp}"
                style="letter-spacing: 0.15em; font-weight: 700; text-align: center; font-size: 1.1rem;"
              />
            </div>

            <div class="form-field">
              <label class="form-label" for="reset-new-pass">New Secure Password</label>
              <div class="auth-input-container">
                <span class="auth-input-icon">${renderIcon('lock', 18)}</span>
                <input
                  type="password"
                  id="reset-new-pass"
                  class="form-input"
                  required
                  placeholder="Enter new password"
                  value="password123"
                />
                <button
                  type="button"
                  class="password-toggle-btn"
                  title="Show password"
                  onclick="AuthPage.togglePasswordVisibility('reset-new-pass', this)"
                >
                  ${renderIcon('eye', 18)}
                </button>
              </div>
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%; padding: 11px; font-weight: 700;">
              Update Password & Return to Sign In
            </button>
          </form>

          <div style="text-align: center; font-size: 0.82rem; color: #64748b;">
            <a href="javascript:void(0)" style="color: #64748b; font-weight: 500;" onclick="AuthPage.setView('login')">
              &larr; Cancel and return to Sign In
            </a>
          </div>
        </div>
      </div>
    `;

    const form = document.getElementById('reset-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const otp = document.getElementById('reset-otp').value.trim();
        const newPassword = document.getElementById('reset-new-pass').value;

        try {
          const res = await API.resetPassword({
            email: this.resetEmail,
            otp,
            newPassword
          });
          Toast.success(res.message);
          this.setView('login');
        } catch (e) {}
      });
    }
  },

  setView(mode) {
    this.viewMode = mode;
    // Keep URL hash aligned if in unauthenticated state
    if (!State.currentUser) {
      window.location.hash = `#${mode}`;
      State.currentRoute = mode;
    }
    const container = document.getElementById('app-container');
    if (container) this.render(container);
  },

  async logout() {
    try {
      await API.logout();
    } catch (e) {}
    State.setUser(null, null);
    Toast.info('Signed out of session');
    this.viewMode = 'login';
    window.location.hash = '#login';
    State.currentRoute = 'login';
    const container = document.getElementById('app-container');
    if (container) {
      this.render(container);
    }
  }
};

window.AuthPage = AuthPage;
