// Authentication Module (Login, Sign-Up, OTP Password Reset, Demo Accounts)
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
            <p style="font-size: 0.8rem; color: #10b981; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">
              "Every Item. Every Movement. In Control."
            </p>
            <p style="font-size: 0.84rem; color: #64748b;">
              Sign in to manage real-time inventory operations
            </p>
          </div>

          <!-- Quick 1-Click Demo Login for Judges -->
          <div class="demo-account-box">
            <div style="font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 6px;">
              ${renderIcon('sparkles', 14)} 1-Click Hackathon Quick Sign-In:
            </div>
            <div class="demo-btn-row">
              <button class="btn btn-secondary btn-sm" style="flex: 1;" onclick="AuthPage.demoLogin('elena@stocksense.io')">
                Manager (Elena)
              </button>
              <button class="btn btn-secondary btn-sm" style="flex: 1;" onclick="AuthPage.demoLogin('marcus@stocksense.io')">
                Staff (Marcus)
              </button>
            </div>
          </div>

          <!-- Standard Credentials Form -->
          <form id="login-form" style="display: flex; flex-direction: column; gap: 14px;">
            <div class="form-field">
              <label class="form-label">Email Address</label>
              <input type="email" id="login-email" class="form-input" required placeholder="name@company.com" value="elena@stocksense.io" />
            </div>

            <div class="form-field">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <label class="form-label">Password</label>
                <a href="javascript:void(0)" style="font-size: 0.74rem; color: #10b981; font-weight: 600;" onclick="AuthPage.setView('forgot')">
                  Forgot password?
                </a>
              </div>
              <input type="password" id="login-password" class="form-input" required placeholder="••••••••" value="password123" />
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 6px; padding: 10px;">
              Sign In to Dashboard
            </button>
          </form>

          <!-- Toggle to Sign Up -->
          <div style="text-align: center; font-size: 0.82rem; color: #64748b;">
            Don't have an account?
            <a href="javascript:void(0)" style="color: #10b981; font-weight: 600;" onclick="AuthPage.setView('signup')">
              Register here
            </a>
          </div>
        </div>
      </div>
    `;

    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;

      try {
        const res = await API.login({ email, password });
        State.setUser(res.user, res.token);
        Toast.success(`Welcome back, ${res.user.name}!`);
        State.setRoute('dashboard');
        App.render();
      } catch (err) {}
    });
  },

  renderSignup(container) {
    container.innerHTML = `
      <div class="auth-wrapper">
        <div class="auth-card">
          <div class="auth-header">
            <div class="brand-icon" style="width: 48px; height: 48px;">
              ${renderIcon('box', 28)}
            </div>
            <h2 style="font-size: 1.45rem; font-weight: 800; color: #0f172a; margin-top: 4px;">
              Create Operator Account
            </h2>
            <p style="font-size: 0.84rem; color: #64748b;">
              Join the StockSense supply chain workspace
            </p>
          </div>

          <form id="signup-form" style="display: flex; flex-direction: column; gap: 14px;">
            <div class="form-field">
              <label class="form-label">Full Name *</label>
              <input type="text" id="reg-name" class="form-input" required placeholder="e.g. Alex Mercer" />
            </div>

            <div class="form-field">
              <label class="form-label">Work Email *</label>
              <input type="email" id="reg-email" class="form-input" required placeholder="alex@stocksense.io" />
            </div>

            <div class="form-field">
              <label class="form-label">Account Role *</label>
              <select id="reg-role" class="form-select">
                <option value="inventory_manager">Inventory Manager (Full Admin Clearance)</option>
                <option value="warehouse_staff">Warehouse Staff (Floor Operational Clearance)</option>
              </select>
            </div>

            <div class="form-field">
              <label class="form-label">Password *</label>
              <input type="password" id="reg-password" class="form-input" required placeholder="At least 6 characters" />
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 6px; padding: 10px;">
              Register & Sign In
            </button>
          </form>

          <div style="text-align: center; font-size: 0.82rem; color: #64748b;">
            Already have an account?
            <a href="javascript:void(0)" style="color: #10b981; font-weight: 600;" onclick="AuthPage.setView('login')">
              Sign in
            </a>
          </div>
        </div>
      </div>
    `;

    document.getElementById('signup-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('reg-name').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const role = document.getElementById('reg-role').value;
      const password = document.getElementById('reg-password').value;

      try {
        const res = await API.register({ name, email, role, password });
        State.setUser(res.user, res.token);
        Toast.success(`Account registered! Welcome, ${res.user.name}`);
        State.setRoute('dashboard');
        App.render();
      } catch (e) {}
    });
  },

  renderForgot(container) {
    container.innerHTML = `
      <div class="auth-wrapper">
        <div class="auth-card">
          <div class="auth-header">
            <div style="color: #10b981; margin-bottom: 6px;">
              ${renderIcon('shield-check', 36)}
            </div>
            <h2 style="font-size: 1.35rem; font-weight: 800; color: #0f172a;">
              Password Reset
            </h2>
            <p style="font-size: 0.84rem; color: #64748b;">
              Enter your registered email to receive an OTP verification code
            </p>
          </div>

          <form id="forgot-form" style="display: flex; flex-direction: column; gap: 14px;">
            <div class="form-field">
              <label class="form-label">Registered Work Email</label>
              <input type="email" id="forgot-email" class="form-input" required placeholder="elena@stocksense.io" value="elena@stocksense.io" />
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%; padding: 10px;">
              Generate OTP Verification Code
            </button>
          </form>

          <div style="text-align: center; font-size: 0.82rem; color: #64748b;">
            <a href="javascript:void(0)" style="color: #64748b; font-weight: 500;" onclick="AuthPage.setView('login')">
              &larr; Back to Sign In
            </a>
          </div>
        </div>
      </div>
    `;

    document.getElementById('forgot-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('forgot-email').value.trim();
      try {
        const res = await API.forgotPassword(email);
        this.resetEmail = email;
        this.simulatedOtp = res.demoOtp;
        Toast.success(`Hackathon Demo: OTP is ${res.demoOtp}`);
        this.setView('reset');
      } catch (e) {}
    });
  },

  renderReset(container) {
    container.innerHTML = `
      <div class="auth-wrapper">
        <div class="auth-card">
          <div class="auth-header">
            <h2 style="font-size: 1.35rem; font-weight: 800; color: #0f172a;">
              Verify OTP & Set New Password
            </h2>
            <p style="font-size: 0.84rem; color: #64748b;">
              Verification code issued for <strong>${this.resetEmail}</strong>
            </p>
          </div>

          <!-- Hackathon Demo OTP Display Card -->
          <div style="background: #ecfdf5; border: 1px dashed #10b981; border-radius: var(--radius-md); padding: 14px; text-align: center;">
            <div style="font-size: 0.76rem; font-weight: 700; color: #047857; text-transform: uppercase;">
              Hackathon Demo OTP Code
            </div>
            <div style="font-size: 2rem; font-weight: 900; letter-spacing: 0.15em; color: #065f46; margin: 4px 0;">
              ${this.simulatedOtp}
            </div>
            <div style="font-size: 0.74rem; color: #059669;">
              Code valid for 10 minutes (Simulated OTP Interface)
            </div>
          </div>

          <form id="reset-form" style="display: flex; flex-direction: column; gap: 14px;">
            <div class="form-field">
              <label class="form-label">6-Digit OTP Code</label>
              <input type="text" id="reset-otp" class="form-input" required value="${this.simulatedOtp}" style="letter-spacing: 0.1em; font-weight: 700;" />
            </div>

            <div class="form-field">
              <label class="form-label">New Secure Password</label>
              <input type="password" id="reset-new-pass" class="form-input" required placeholder="New password" value="password123" />
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%; padding: 10px;">
              Update Password & Return
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

    document.getElementById('reset-form').addEventListener('submit', async (e) => {
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
  },

  async demoLogin(email) {
    try {
      const res = await API.login({ email, password: 'password123' });
      State.setUser(res.user, res.token);
      Toast.success(`Logged in as ${res.user.name} (${res.user.role})`);
      State.setRoute('dashboard');
      App.render();
    } catch (e) {}
  },

  setView(mode) {
    this.viewMode = mode;
    const container = document.getElementById('app-container');
    if (container) this.render(container);
  },

  logout() {
    State.setUser(null, null);
    Toast.info('Signed out of session');
    AuthPage.setView('login');
  }
};

window.AuthPage = AuthPage;
