(() => {
    'use strict';

    const AUTH_BASE = 'http://localhost:8081';
    const USER_BASE = window.location.origin;
    const GOOGLE_CLIENT_ID = '1095734426921-05g451ugu10mi7dastaaes87sedpn60c.apps.googleusercontent.com';
    const REFRESH_STORAGE_KEY = 'athis.refreshToken';

    const state = {
        accessToken: null,
        refreshToken: sessionStorage.getItem(REFRESH_STORAGE_KEY),
        account: null,
        roles: [],
        permissions: [],
        data: {accounts: [], roles: [], permissions: [], users: []},
        activeSection: 'overview',
        modal: null,
        confirmAction: null
    };

    const resources = {
        accounts: {
            title: 'Tài khoản',
            description: 'Quản lý đăng nhập, provider, trạng thái và vai trò.',
            base: AUTH_BASE,
            path: '/accounts',
            icon: '◎',
            singular: 'tài khoản',
            columns: [
                {label: 'TÀI KHOẢN', render: x => primary(x.username || '—', `ID #${x.id}`)},
                {label: 'PROVIDER', value: 'provider'},
                {label: 'TRẠNG THÁI', render: x => statusBadge(x.status)},
                {label: 'ĐĂNG NHẬP CUỐI', render: x => formatDate(x.lastLoginAt)},
                {label: 'LỖI ĐĂNG NHẬP', value: 'failedLoginAttempts'}
            ],
            fields: [
                field('username', 'Tên đăng nhập', 'text', true, 'admin'),
                field('password', 'Mật khẩu', 'password', false, 'Để trống nếu không đổi', true),
                selectField('provider', 'Provider', ['OFFICE', 'GOOGLE'], true),
                field('providerUserId', 'Provider user ID', 'text', false, 'Bắt buộc với Google'),
                statusField()
            ]
        },
        roles: {
            title: 'Vai trò',
            description: 'Tạo vai trò và gán nhóm quyền cho vai trò.',
            base: AUTH_BASE,
            path: '/roles',
            icon: '◇',
            singular: 'vai trò',
            columns: [
                {label: 'VAI TRÒ', render: x => primary(x.name, `ID #${x.id}`)},
                {label: 'MÔ TẢ', value: 'description'},
                {label: 'TRẠNG THÁI', render: x => statusBadge(x.status)},
                {label: 'CẬP NHẬT', render: x => formatDate(x.updatedAt)}
            ],
            fields: [
                field('name', 'Tên vai trò', 'text', true, 'ADMIN'),
                field('description', 'Mô tả', 'textarea', false, 'Mô tả ngắn', true),
                statusField()
            ]
        },
        permissions: {
            title: 'Quyền hạn',
            description: 'Quản lý các quyền chi tiết được đưa vào JWT.',
            base: AUTH_BASE,
            path: '/permissions',
            icon: '⌘',
            singular: 'quyền hạn',
            columns: [
                {label: 'QUYỀN', render: x => primary(x.name, `ID #${x.id}`)},
                {label: 'MÔ TẢ', value: 'description'},
                {label: 'TRẠNG THÁI', render: x => statusBadge(x.status)},
                {label: 'CẬP NHẬT', render: x => formatDate(x.updatedAt)}
            ],
            fields: [
                field('name', 'Tên quyền', 'text', true, 'user:read'),
                field('description', 'Mô tả', 'textarea', false, 'Mô tả ngắn', true),
                statusField()
            ]
        },
        users: {
            title: 'Người dùng',
            description: 'Quản lý hồ sơ gắn với tài khoản đăng nhập.',
            base: USER_BASE,
            path: '/users',
            icon: '♙',
            singular: 'người dùng',
            columns: [
                {label: 'NGƯỜI DÙNG', render: x => primary(x.fullName || 'Chưa đặt tên', x.email || `ID #${x.id}`)},
                {label: 'ACCOUNT ID', value: 'accountId'},
                {label: 'ĐIỆN THOẠI', value: 'phone'},
                {label: 'GIỚI TÍNH', value: 'gender'},
                {label: 'TRẠNG THÁI', render: x => statusBadge(x.status)}
            ],
            fields: [
                field('accountId', 'Account ID', 'number', true, '1'),
                field('fullName', 'Họ và tên', 'text', false, 'Nguyễn Văn A'),
                field('email', 'Email', 'email', false, 'name@example.com'),
                field('phone', 'Số điện thoại', 'text', false, '090...'),
                field('avatar', 'URL ảnh đại diện', 'url', false, 'https://...', true),
                field('dateOfBirth', 'Ngày sinh', 'date'),
                selectField('gender', 'Giới tính', ['', 'MALE', 'FEMALE', 'OTHER']),
                field('address', 'Địa chỉ', 'textarea', false, 'Địa chỉ', true),
                statusField()
            ]
        }
    };

    const $ = selector => document.querySelector(selector);
    const $$ = selector => [...document.querySelectorAll(selector)];

    document.addEventListener('DOMContentLoaded', init);

    async function init() {
        bindEvents();
        buildResourceShells();
        checkServices();
        initializeGoogleWhenReady();

        if (state.refreshToken) {
            setLoading(true);
            try {
                await refreshAccessToken();
                showApplication();
            } catch (_) {
                clearSession();
                showLogin();
            } finally {
                setLoading(false);
            }
        } else {
            showLogin();
        }
    }

    function bindEvents() {
        $('#office-login-form').addEventListener('submit', loginOffice);
        $('#toggle-password').addEventListener('click', togglePassword);
        $('#logout-button').addEventListener('click', logout);
        $('#refresh-page').addEventListener('click', () => refreshCurrent(true));
        $('#menu-toggle').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
        $('#main-nav').addEventListener('click', event => {
            const button = event.target.closest('[data-section]');
            if (button) navigate(button.dataset.section);
        });
        $('#stat-grid').addEventListener('click', event => {
            const button = event.target.closest('[data-goto]');
            if (button) navigate(button.dataset.goto);
        });
        $$('.quick-action').forEach(button => button.addEventListener('click', () => {
            navigate(button.dataset.create);
            openEntityModal(button.dataset.create);
        }));
        $('#modal-close').addEventListener('click', closeModal);
        $('#modal-cancel').addEventListener('click', closeModal);
        $('#modal-form').addEventListener('submit', submitModal);
        $('#modal-backdrop').addEventListener('click', event => {
            if (event.target === $('#modal-backdrop')) closeModal();
        });
        $('#confirm-cancel').addEventListener('click', closeConfirm);
        $('#confirm-submit').addEventListener('click', executeConfirmedAction);
        $('#confirm-backdrop').addEventListener('click', event => {
            if (event.target === $('#confirm-backdrop')) closeConfirm();
        });
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                closeModal();
                closeConfirm();
            }
        });
    }

    async function checkServices() {
        const dot = $('#auth-dot');
        const message = $('#service-message');
        try {
            const response = await fetch(`${AUTH_BASE}/.well-known/jwks.json`, {signal: AbortSignal.timeout(3500)});
            if (!response.ok) throw new Error();
            dot.className = 'status-dot online';
            message.textContent = 'Auth Service sẵn sàng tại cổng 8081';
        } catch (_) {
            dot.className = 'status-dot offline';
            message.textContent = 'Không kết nối được Auth Service tại cổng 8081';
        }
    }

    function initializeGoogleWhenReady(attempt = 0) {
        if (window.google?.accounts?.id) {
            window.google.accounts.id.initialize({client_id: GOOGLE_CLIENT_ID, callback: loginGoogle});
            window.google.accounts.id.renderButton($('#google-login-button'), {
                theme: 'outline', size: 'large', width: 390, text: 'signin_with', shape: 'rectangular'
            });
            return;
        }
        if (attempt < 30) setTimeout(() => initializeGoogleWhenReady(attempt + 1), 250);
    }

    async function loginOffice(event) {
        event.preventDefault();
        const button = $('#office-login-button');
        button.disabled = true;
        $('#login-error').textContent = '';
        try {
            const body = await publicAuthRequest('/auth/login', {
                method: 'POST',
                body: {
                    username: $('#login-username').value.trim(),
                    password: $('#login-password').value,
                    provider: 'OFFICE'
                }
            });
            acceptAuthentication(body.data);
            showApplication();
        } catch (error) {
            $('#login-error').textContent = readableError(error, 'Đăng nhập không thành công.');
        } finally {
            button.disabled = false;
        }
    }

    async function loginGoogle(googleResponse) {
        $('#login-error').textContent = '';
        setLoading(true);
        try {
            const body = await publicAuthRequest('/auth/login', {
                method: 'POST',
                body: {provider: 'GOOGLE', idToken: googleResponse.credential}
            });
            acceptAuthentication(body.data);
            showApplication();
        } catch (error) {
            $('#login-error').textContent = readableError(error, 'Đăng nhập Google không thành công.');
        } finally {
            setLoading(false);
        }
    }

    function acceptAuthentication(data) {
        state.accessToken = data.accessToken;
        state.refreshToken = data.refreshToken;
        state.account = data.account;
        state.roles = data.roles || [];
        state.permissions = data.permissions || [];
        sessionStorage.setItem(REFRESH_STORAGE_KEY, state.refreshToken);
    }

    async function refreshAccessToken() {
        if (!state.refreshToken) throw new Error('Phiên đăng nhập không tồn tại.');
        const body = await publicAuthRequest('/auth/refresh', {
            method: 'POST', body: {refreshToken: state.refreshToken}
        });
        acceptAuthentication(body.data);
        return body.data.accessToken;
    }

    async function logout() {
        const refreshToken = state.refreshToken;
        clearSession();
        showLogin();
        if (window.google?.accounts?.id) window.google.accounts.id.disableAutoSelect();
        if (refreshToken) {
            try {
                await publicAuthRequest('/auth/logout', {method: 'POST', body: {refreshToken}});
            } catch (_) {
                // Local state is already removed; server-side revocation can fail when Auth is offline.
            }
        }
    }

    function clearSession() {
        state.accessToken = null;
        state.refreshToken = null;
        state.account = null;
        state.roles = [];
        state.permissions = [];
        state.data = {accounts: [], roles: [], permissions: [], users: []};
        sessionStorage.removeItem(REFRESH_STORAGE_KEY);
    }

    function showLogin() {
        $('#login-view').classList.remove('hidden');
        $('#app-view').classList.add('hidden');
        $('#login-password').value = '';
        checkServices();
    }

    function showApplication() {
        $('#login-view').classList.add('hidden');
        $('#app-view').classList.remove('hidden');
        updateIdentity();
        navigate('overview');
        loadAllStats();
    }

    function updateIdentity() {
        const name = state.account?.username || `Account #${state.account?.id || '?'}`;
        const role = state.roles.join(', ') || 'USER';
        $('#account-name').textContent = name;
        $('#account-role').textContent = role;
        $('#account-avatar').textContent = name.charAt(0).toUpperCase();
        $('#welcome-title').textContent = `Xin chào, ${name}!`;
        $('#session-account').textContent = `${name} (#${state.account?.id || '—'})`;
        $('#session-provider').textContent = state.account?.provider || '—';
        $('#session-roles').textContent = role;
        $('#session-expiry').textContent = tokenExpiry(state.accessToken);
    }

    function navigate(section) {
        if (!resources[section] && section !== 'overview') return;
        state.activeSection = section;
        $$('.page-section').forEach(element => element.classList.toggle('active', element.id === `section-${section}`));
        $$('.nav-item').forEach(element => element.classList.toggle('active', element.dataset.section === section));
        $('#page-title').textContent = section === 'overview' ? 'Tổng quan' : resources[section].title;
        $('#sidebar').classList.remove('open');
        if (resources[section]) loadResource(section);
    }

    function buildResourceShells() {
        Object.entries(resources).forEach(([key, config]) => {
            const section = $(`#section-${key}`);
            section.innerHTML = `
                <div class="resource-shell">
                    <header class="resource-header">
                        <div class="resource-heading"><h3>${config.title}</h3><p>${config.description}</p></div>
                        <div class="resource-tools">
                            <div class="search-box"><input type="search" data-search="${key}" placeholder="Tìm kiếm..."></div>
                            <button class="button primary" data-add="${key}">＋ Thêm mới</button>
                        </div>
                    </header>
                    <div class="resource-content" data-content="${key}">${emptyState(config.icon, 'Chưa tải dữ liệu', 'Nhấn tải lại để bắt đầu.')}</div>
                </div>`;
            section.querySelector('[data-add]').addEventListener('click', () => openEntityModal(key));
            section.querySelector('[data-search]').addEventListener('input', event => renderResource(key, event.target.value));
            section.querySelector('[data-content]').addEventListener('click', event => handleRowAction(key, event));
        });
    }

    async function loadAllStats() {
        await Promise.all(Object.keys(resources).map(async key => {
            try {
                const data = await fetchResource(key);
                $(`#stat-${key}`).textContent = data.length;
            } catch (_) {
                $(`#stat-${key}`).textContent = '—';
            }
        }));
    }

    async function loadResource(key, notify = false) {
        const content = document.querySelector(`[data-content="${key}"]`);
        content.innerHTML = emptyState('…', 'Đang tải dữ liệu', 'Vui lòng chờ trong giây lát.');
        try {
            await fetchResource(key);
            renderResource(key);
            if (notify) toast(`Đã tải lại ${resources[key].title.toLowerCase()}.`);
        } catch (error) {
            content.innerHTML = emptyState('!', 'Không tải được dữ liệu', escapeHtml(readableError(error, 'Hãy kiểm tra quyền và kết nối service.')));
            if (notify) toast(readableError(error), 'error');
        }
    }

    async function fetchResource(key) {
        const config = resources[key];
        const body = await apiRequest(config.base, config.path);
        state.data[key] = Array.isArray(body.data) ? body.data : [];
        return state.data[key];
    }

    function renderResource(key, query = '') {
        const config = resources[key];
        const content = document.querySelector(`[data-content="${key}"]`);
        const normalized = query.trim().toLowerCase();
        const rows = state.data[key].filter(item => !normalized || JSON.stringify(item).toLowerCase().includes(normalized));
        if (!rows.length) {
            content.innerHTML = emptyState(config.icon, normalized ? 'Không tìm thấy kết quả' : `Chưa có ${config.singular}`, normalized ? 'Thử một từ khóa khác.' : 'Chọn “Thêm mới” để tạo dữ liệu đầu tiên.');
            return;
        }
        const head = config.columns.map(column => `<th>${column.label}</th>`).join('');
        const body = rows.map(item => `
            <tr>
                ${config.columns.map(column => `<td>${column.render ? column.render(item) : escapeHtml(display(item[column.value]))}</td>`).join('')}
                <td>${rowActions(key, item)}</td>
            </tr>`).join('');
        content.innerHTML = `
            <div class="table-wrap"><table><thead><tr>${head}<th>THAO TÁC</th></tr></thead><tbody>${body}</tbody></table></div>
            <footer class="table-footer"><span>Hiển thị ${rows.length} bản ghi</span><span>Tổng: ${state.data[key].length}</span></footer>`;
    }

    function rowActions(key, item) {
        const relation = key === 'accounts'
            ? `<button class="row-button" data-action="roles" data-id="${item.id}">Vai trò</button>`
            : key === 'roles'
                ? `<button class="row-button" data-action="permissions" data-id="${item.id}">Quyền</button>` : '';
        const reset = key === 'accounts'
            ? `<button class="row-button" data-action="reset" data-id="${item.id}">Reset lỗi</button>` : '';
        return `<div class="row-actions">
            ${relation}${reset}
            <button class="row-button" data-action="edit" data-id="${item.id}">Sửa</button>
            <button class="row-button" data-action="status" data-id="${item.id}">${item.status === 'ACTIVE' ? 'Tắt' : 'Bật'}</button>
            <button class="row-button destructive" data-action="delete" data-id="${item.id}">Xóa</button>
        </div>`;
    }

    async function handleRowAction(key, event) {
        const button = event.target.closest('[data-action]');
        if (!button) return;
        const item = state.data[key].find(value => String(value.id) === button.dataset.id);
        if (!item) return;
        switch (button.dataset.action) {
            case 'edit': openEntityModal(key, item); break;
            case 'status': confirmStatusChange(key, item); break;
            case 'delete': confirmDelete(key, item); break;
            case 'reset': confirmReset(item); break;
            case 'roles': await openRelationModal('accounts', item); break;
            case 'permissions': await openRelationModal('roles', item); break;
        }
    }

    function openEntityModal(key, item = null) {
        const config = resources[key];
        state.modal = {type: 'entity', key, item};
        $('#modal-eyebrow').textContent = item ? 'CẬP NHẬT DỮ LIỆU' : 'TẠO DỮ LIỆU';
        $('#modal-title').textContent = `${item ? 'Sửa' : 'Thêm'} ${config.singular}`;
        $('#modal-submit').textContent = item ? 'Lưu thay đổi' : 'Tạo mới';
        $('#modal-error').textContent = '';
        $('#modal-fields').innerHTML = config.fields.map(def => renderField(def, item)).join('');
        openModal();
    }

    async function openRelationModal(key, item) {
        const relationKey = key === 'accounts' ? 'roles' : 'permissions';
        try {
            if (!state.data[relationKey].length) await fetchResource(relationKey);
            const options = state.data[relationKey].map(value => ({value: value.id, label: `${value.name} (#${value.id})`}));
            if (!options.length) throw new Error(`Chưa có ${resources[relationKey].title.toLowerCase()} để lựa chọn.`);
            state.modal = {type: 'relation', key, item, relationKey};
            $('#modal-eyebrow').textContent = 'PHÂN QUYỀN';
            $('#modal-title').textContent = key === 'accounts' ? `Vai trò của ${item.username}` : `Quyền của ${item.name}`;
            $('#modal-submit').textContent = 'Thực hiện';
            $('#modal-error').textContent = '';
            $('#modal-fields').innerHTML = renderField({name: 'relationId', label: resources[relationKey].title, type: 'select', required: true, options}, null)
                + renderField({name: 'operation', label: 'Thao tác', type: 'select', required: true, options: [
                    {value: 'assign', label: 'Gán'}, {value: 'remove', label: 'Gỡ'}
                ]}, null);
            openModal();
        } catch (error) {
            toast(readableError(error), 'error');
        }
    }

    function renderField(def, item) {
        const value = item?.[def.name] ?? (def.name === 'status' ? 'ACTIVE' : '');
        const full = def.full ? 'full' : '';
        const required = def.required ? 'required' : '';
        let control;
        if (def.type === 'select') {
            const options = def.options.map(option => {
                const normalized = typeof option === 'object' ? option : {value: option, label: option || 'Không chọn'};
                return `<option value="${escapeAttr(normalized.value)}" ${String(value) === String(normalized.value) ? 'selected' : ''}>${escapeHtml(normalized.label)}</option>`;
            }).join('');
            control = `<select name="${def.name}" ${required}>${options}</select>`;
        } else if (def.type === 'textarea') {
            control = `<textarea name="${def.name}" placeholder="${escapeAttr(def.placeholder || '')}" ${required}>${escapeHtml(value)}</textarea>`;
        } else {
            control = `<input name="${def.name}" type="${def.type || 'text'}" value="${def.type === 'password' ? '' : escapeAttr(value)}" placeholder="${escapeAttr(def.placeholder || '')}" ${required}>`;
        }
        return `<label class="${full}"><span>${def.label}${def.required ? ' *' : ''}</span>${control}${def.hint ? `<small class="field-hint">${def.hint}</small>` : ''}</label>`;
    }

    async function submitModal(event) {
        event.preventDefault();
        const submit = $('#modal-submit');
        submit.disabled = true;
        $('#modal-error').textContent = '';
        try {
            if (state.modal.type === 'relation') await submitRelation();
            else await submitEntity();
            closeModal();
        } catch (error) {
            $('#modal-error').textContent = readableError(error, 'Không thể lưu dữ liệu.');
        } finally {
            submit.disabled = false;
        }
    }

    async function submitEntity() {
        const {key, item} = state.modal;
        const config = resources[key];
        const formData = new FormData($('#modal-form'));
        const payload = {};
        config.fields.forEach(def => {
            let value = formData.get(def.name);
            if (def.type === 'number') value = value ? Number(value) : null;
            if (value === '' && (def.type === 'date' || def.type === 'select')) value = null;
            if (def.type === 'password' && !value) return;
            payload[def.name] = value;
        });
        await apiRequest(config.base, item ? `${config.path}/${item.id}` : config.path, {
            method: item ? 'PUT' : 'POST', body: payload
        });
        toast(`${item ? 'Đã cập nhật' : 'Đã tạo'} ${config.singular}.`);
        await loadResource(key);
        loadAllStats();
    }

    async function submitRelation() {
        const {key, item} = state.modal;
        const form = new FormData($('#modal-form'));
        const relationId = form.get('relationId');
        const operation = form.get('operation');
        const path = key === 'accounts'
            ? `/accounts/${item.id}/roles/${relationId}`
            : `/roles/${item.id}/permissions/${relationId}`;
        await apiRequest(AUTH_BASE, path, {method: operation === 'assign' ? 'POST' : 'DELETE'});
        toast(operation === 'assign' ? 'Đã gán thành công.' : 'Đã gỡ thành công.');
    }

    function confirmStatusChange(key, item) {
        const nextStatus = item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        openConfirm(`Đổi trạng thái thành ${nextStatus}?`, `Bản ghi #${item.id} sẽ được chuyển sang ${nextStatus}.`, async () => {
            const config = resources[key];
            await apiRequest(config.base, `${config.path}/${item.id}/status?status=${nextStatus}`, {method: 'PATCH'});
            toast('Đã cập nhật trạng thái.');
            await loadResource(key);
        });
    }

    function confirmDelete(key, item) {
        const config = resources[key];
        openConfirm(`Xóa ${config.singular}?`, `Thao tác này sẽ xóa hoặc đánh dấu DELETED bản ghi #${item.id}.`, async () => {
            await apiRequest(config.base, `${config.path}/${item.id}`, {method: 'DELETE'});
            toast(`Đã xóa ${config.singular}.`);
            await loadResource(key);
            loadAllStats();
        });
    }

    function confirmReset(item) {
        openConfirm('Reset số lần đăng nhập lỗi?', `Tài khoản ${item.username} sẽ được mở khóa và đưa số lần sai về 0.`, async () => {
            await apiRequest(AUTH_BASE, `/accounts/${item.id}/reset-login-attempts`, {method: 'PATCH'});
            toast('Đã reset trạng thái đăng nhập.');
            await loadResource('accounts');
        });
    }

    function openConfirm(title, message, action) {
        state.confirmAction = action;
        $('#confirm-title').textContent = title;
        $('#confirm-message').textContent = message;
        $('#confirm-backdrop').classList.remove('hidden');
    }

    async function executeConfirmedAction() {
        const action = state.confirmAction;
        if (!action) return;
        const button = $('#confirm-submit');
        button.disabled = true;
        try {
            await action();
            closeConfirm();
        } catch (error) {
            toast(readableError(error), 'error');
        } finally {
            button.disabled = false;
        }
    }

    function openModal() {
        $('#modal-backdrop').classList.remove('hidden');
        setTimeout(() => $('#modal-fields input, #modal-fields select, #modal-fields textarea')?.focus(), 40);
    }
    function closeModal() { $('#modal-backdrop').classList.add('hidden'); state.modal = null; }
    function closeConfirm() { $('#confirm-backdrop').classList.add('hidden'); state.confirmAction = null; }

    async function refreshCurrent(notify = false) {
        if (state.activeSection === 'overview') {
            await loadAllStats();
            if (notify) toast('Đã cập nhật tổng quan.');
        } else {
            await loadResource(state.activeSection, notify);
        }
    }

    async function publicAuthRequest(path, options = {}) {
        return request(AUTH_BASE, path, options, false);
    }

    async function apiRequest(base, path, options = {}) {
        return request(base, path, options, true);
    }

    async function request(base, path, options, authenticated, retry = true) {
        const headers = new Headers(options.headers || {});
        headers.set('Accept', 'application/json');
        if (options.body !== undefined) headers.set('Content-Type', 'application/json');
        if (authenticated && state.accessToken) headers.set('Authorization', `Bearer ${state.accessToken}`);

        let response;
        try {
            response = await fetch(`${base}${path}`, {
                method: options.method || 'GET',
                headers,
                body: options.body === undefined ? undefined : JSON.stringify(options.body)
            });
        } catch (_) {
            throw new Error(`Không kết nối được ${base}. Hãy kiểm tra service đang chạy.`);
        }

        if (authenticated && response.status === 401 && retry && state.refreshToken) {
            try {
                await refreshAccessToken();
                return request(base, path, options, true, false);
            } catch (_) {
                clearSession();
                showLogin();
                throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            }
        }

        const text = await response.text();
        let body = null;
        if (text) {
            try { body = JSON.parse(text); } catch (_) { body = {message: text}; }
        }
        if (!response.ok || body?.success === false) {
            const error = new Error(body?.message || `Yêu cầu thất bại (${response.status}).`);
            error.status = response.status;
            throw error;
        }
        return body || {success: true, data: null};
    }

    function togglePassword() {
        const input = $('#login-password');
        const visible = input.type === 'text';
        input.type = visible ? 'password' : 'text';
        $('#toggle-password').textContent = visible ? 'Hiện' : 'Ẩn';
    }

    function tokenExpiry(token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
            return new Intl.DateTimeFormat('vi-VN', {dateStyle: 'short', timeStyle: 'medium'}).format(new Date(payload.exp * 1000));
        } catch (_) {
            return '—';
        }
    }

    function toast(message, type = 'success') {
        const element = document.createElement('div');
        element.className = `toast ${type === 'error' ? 'error' : ''}`;
        element.textContent = message;
        $('#toast-region').appendChild(element);
        setTimeout(() => element.remove(), 3800);
    }

    function setLoading(visible) { $('#loading-layer').classList.toggle('hidden', !visible); }
    function readableError(error, fallback = 'Đã xảy ra lỗi.') { return error?.message || fallback; }
    function display(value) { return value === null || value === undefined || value === '' ? '—' : value; }
    function formatDate(value) {
        if (!value) return '—';
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? escapeHtml(value) : new Intl.DateTimeFormat('vi-VN', {dateStyle: 'short', timeStyle: 'short'}).format(date);
    }
    function primary(title, subtitle) { return `<span class="entity-primary"><strong>${escapeHtml(display(title))}</strong><small>${escapeHtml(display(subtitle))}</small></span>`; }
    function statusBadge(status) { return `<span class="status-badge ${String(status || '').toLowerCase()}">${escapeHtml(display(status))}</span>`; }
    function emptyState(icon, title, description) { return `<div class="empty-state"><span>${icon}</span><div><h4>${title}</h4><p>${description}</p></div></div>`; }
    function escapeHtml(value) { return String(value ?? '').replace(/[&<>'"]/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'}[char])); }
    function escapeAttr(value) { return escapeHtml(value); }
    function field(name, label, type = 'text', required = false, placeholder = '', full = false) { return {name, label, type, required, placeholder, full}; }
    function selectField(name, label, options, required = false) { return {name, label, type: 'select', options, required}; }
    function statusField() { return selectField('status', 'Trạng thái', ['ACTIVE', 'INACTIVE', 'LOCKED', 'DELETED'], true); }
})();
