/**
 * SolarEye — Authentication & User Profile Controller
 */

const Auth = {
    init() {
        this.bindEvents();
        this.checkExistingSession();
    },

    bindEvents() {
        const formLogin = document.getElementById('formLogin');
        const btnFillAdmin = document.getElementById('btnFillAdmin');
        const btnFillUser = document.getElementById('btnFillUser');

        if (formLogin) {
            formLogin.addEventListener('submit', (e) => this.handleLogin(e));
        }

        if (btnFillAdmin) {
            btnFillAdmin.addEventListener('click', () => {
                document.getElementById('loginEmail').value = 'admin@solareye.com';
                document.getElementById('loginPassword').value = 'admin123';
            });
        }

        if (btnFillUser) {
            btnFillUser.addEventListener('click', () => {
                document.getElementById('loginEmail').value = 'user@solareye.com';
                document.getElementById('loginPassword').value = 'user123';
            });
        }
    },

    checkExistingSession() {
        try {
            const savedUser = localStorage.getItem('solareye_user');
            if (savedUser) {
                const user = JSON.parse(savedUser);
                this.setCurrentUser(user);
            }
        } catch (e) {
            console.warn('Could not parse saved user session:', e);
        }
    },

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const alertError = document.getElementById('loginAlertError');
        const btnSubmit = document.getElementById('btnLoginSubmit');

        alertError.classList.add('d-none');
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i> Authenticating...';

        try {
            const res = await Api.login(email, password);
            if (res.success && res.data) {
                this.setCurrentUser(res.data);
                localStorage.setItem('solareye_user', JSON.stringify(res.data));

                // Close modal
                const modalEl = document.getElementById('authModal');
                const modal = bootstrap.Modal.getInstance(modalEl);
                if (modal) modal.hide();

                if (window.AlertsManager) {
                    AlertsManager.showToast('Welcome back, ' + res.data.name + '!', 'success');
                }
            } else {
                throw new Error(res.message || 'Invalid credentials');
            }
        } catch (err) {
            alertError.textContent = err.message || 'Login failed. Please check your credentials.';
            alertError.classList.remove('d-none');
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = '<i class="fa-solid fa-right-to-bracket me-2"></i> Sign In to SolarEye';
        }
    },

    setCurrentUser(user) {
        AppState.user = user;
        const nameLabel = document.getElementById('userNameLabel');
        const dropdownEmail = document.getElementById('dropdownUserEmail');
        const dropdownRole = document.getElementById('dropdownUserRole');
        const authMenuItem = document.getElementById('authMenuItem');

        if (nameLabel) nameLabel.textContent = user.name || user.email;
        if (dropdownEmail) dropdownEmail.textContent = user.email;
        if (dropdownRole) dropdownRole.textContent = user.role || 'USER';

        if (authMenuItem) {
            authMenuItem.innerHTML = `
                <a class="dropdown-item text-danger fw-semibold" href="#" id="btnLogout">
                    <i class="fa-solid fa-right-from-bracket me-2"></i> Sign Out
                </a>
            `;
            document.getElementById('btnLogout')?.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
    },

    logout() {
        AppState.user = null;
        localStorage.removeItem('solareye_user');

        const nameLabel = document.getElementById('userNameLabel');
        const dropdownEmail = document.getElementById('dropdownUserEmail');
        const dropdownRole = document.getElementById('dropdownUserRole');
        const authMenuItem = document.getElementById('authMenuItem');

        if (nameLabel) nameLabel.textContent = 'Guest Mode';
        if (dropdownEmail) dropdownEmail.textContent = 'Not Authenticated';
        if (dropdownRole) dropdownRole.textContent = 'GUEST';

        if (authMenuItem) {
            authMenuItem.innerHTML = `
                <a class="dropdown-item text-solar-orange fw-semibold" href="#" data-bs-toggle="modal" data-bs-target="#authModal" id="btnOpenAuthModal">
                    <i class="fa-solid fa-right-to-bracket me-2"></i> Sign In
                </a>
            `;
        }

        if (window.AlertsManager) {
            AlertsManager.showToast('You have signed out.', 'info');
        }
    }
};

window.Auth = Auth;
