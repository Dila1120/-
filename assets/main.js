// ============================================================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ============================================================
let currentSlide = 0;
let slideInterval;
let currentAdminPage = 1;
const itemsPerPage = 4;

// ============================================================
// УТИЛИТЫ
// ============================================================
function navigateTo(page) {
    window.location.href = page;
}

function showToast(message, type = 'success') {
    const bg = type === 'error' ? '#dc3545' : '#28a745';
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.background = bg;
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 400);
    }, 2800);
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = '../index.html';
}

// ============================================================
// БУРГЕР-МЕНЮ
// ============================================================
function initBurgerMenu() {
    const burger = document.getElementById('burger-menu');
    const nav = document.getElementById('nav-menu');
    
    if (!burger || !nav) return;
    
    // Создаём overlay
    let overlay = document.querySelector('.nav-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'nav-overlay';
        document.body.appendChild(overlay);
    }
    
    function toggleMenu() {
        burger.classList.toggle('active');
        nav.classList.toggle('open');
        overlay.classList.toggle('active');
        document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
    }
    
    function closeMenu() {
        burger.classList.remove('active');
        nav.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    burger.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', closeMenu);
    
    // Закрываем при клике на ссылку в меню
    nav.querySelectorAll('a, button').forEach(item => {
        item.addEventListener('click', closeMenu);
    });
    
    // Закрываем при изменении размера окна на десктопный
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            closeMenu();
        }
    });
}

// ============================================================
// МОДАЛЬНОЕ ОКНО (для редактирования)
// ============================================================
function openModal(appId) {
    const apps = JSON.parse(localStorage.getItem('applications')) || [];
    const app = apps.find(a => a.id === appId);
    if (!app) {
        showToast('Заявка не найдена', 'error');
        return;
    }

    document.getElementById('edit-id').value = appId;
    document.getElementById('edit-course').value = app.course;
    document.getElementById('edit-date').value = app.date;
    document.getElementById('edit-payment').value = app.payment;
    document.getElementById('edit-status').value = app.status;

    document.getElementById('edit-modal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('edit-modal').classList.remove('active');
    document.body.style.overflow = '';
}

// ============================================================
// СЛАЙДЕР
// ============================================================
function initSlider() {
    const wrappers = document.querySelectorAll('.slider-wrapper');
    if (wrappers.length === 0) return;

    wrappers.forEach((wrapper) => {
        const slides = wrapper.querySelectorAll('.slide');
        const totalSlides = slides.length;
        if (totalSlides === 0) return;

        const container = wrapper.closest('.hero-slider') || wrapper.parentElement;
        const prevBtn = container.querySelector('.prev');
        const nextBtn = container.querySelector('.next');
        const dotsContainer = container.querySelector('.slider-dots');

        let current = 0;
        let interval;

        function goToSlide(i) {
            current = (i + totalSlides) % totalSlides;
            wrapper.style.transform = `translateX(-${current * 100 / totalSlides}%)`;
            if (dotsContainer) {
                dotsContainer.querySelectorAll('span').forEach((dot, idx) => {
                    dot.classList.toggle('active', idx === current);
                });
            }
        }

        function nextSlide() { goToSlide(current + 1); }
        function prevSlide() { goToSlide(current - 1); }

        function startAutoSlide() {
            if (interval) clearInterval(interval);
            interval = setInterval(nextSlide, 3000);
        }

        if (dotsContainer) {
            dotsContainer.innerHTML = '';
            for (let i = 0; i < totalSlides; i++) {
                const dot = document.createElement('span');
                dot.dataset.index = i;
                dot.addEventListener('click', () => {
                    clearInterval(interval);
                    goToSlide(i);
                    startAutoSlide();
                });
                dotsContainer.appendChild(dot);
            }
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                clearInterval(interval);
                prevSlide();
                startAutoSlide();
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                clearInterval(interval);
                nextSlide();
                startAutoSlide();
            });
        }

        goToSlide(0);
        startAutoSlide();
    });
}

// ============================================================
// АВТОРИЗАЦИЯ И РЕГИСТРАЦИЯ
// ============================================================
function initAuth() {
    const regForm = document.getElementById('register-form');
    if (regForm) {
        regForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const login = document.getElementById('reg-login').value.trim();
            const password = document.getElementById('reg-password').value;
            const fio = document.getElementById('reg-fio').value.trim();
            const phone = document.getElementById('reg-phone').value.trim();
            const email = document.getElementById('reg-email').value.trim();

            let hasError = false;
            const loginRegex = /^[a-zA-Z0-9]{6,}$/;
            if (!loginRegex.test(login)) {
                document.getElementById('reg-login-error').innerText = 'Только лат. буквы и цифры, мин. 6 симв.';
                hasError = true;
            } else {
                document.getElementById('reg-login-error').innerText = '';
            }

            if (password.length < 8) {
                document.getElementById('reg-pass-error').innerText = 'Пароль должен быть мин. 8 символов.';
                hasError = true;
            } else {
                document.getElementById('reg-pass-error').innerText = '';
            }

            if (hasError) return;

            const users = JSON.parse(localStorage.getItem('users')) || [];
            if (users.find(u => u.login === login)) {
                document.getElementById('reg-login-error').innerText = 'Логин уже занят.';
                return;
            }

            users.push({ login, password, fio, phone, email, role: 'user' });
            localStorage.setItem('users', JSON.stringify(users));
            showToast('Регистрация успешна! Войдите в систему.');
            navigateTo('login.html');
        });
    }

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const login = document.getElementById('login-username').value.trim();
            const password = document.getElementById('login-password').value;

            const users = JSON.parse(localStorage.getItem('users')) || [];

            if (login === 'Admin26' && password === 'Demo20') {
                const adminUser = { login: 'Admin26', fio: 'Администратор', role: 'admin' };
                localStorage.setItem('currentUser', JSON.stringify(adminUser));
                showToast('Добро пожаловать, Администратор!');
                navigateTo('admin.html');
                return;
            }

            const user = users.find(u => u.login === login && u.password === password);
            if (user) {
                localStorage.setItem('currentUser', JSON.stringify(user));
                showToast('Добро пожаловать, ' + user.fio + '!');
                navigateTo('dashboard.html');
            } else {
                document.getElementById('login-error').innerText = 'Неверный логин или пароль.';
            }
        });
    }
}

// ============================================================
// ЛИЧНЫЙ КАБИНЕТ
// ============================================================
function renderDashboard() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || user.role === 'admin') {
        window.location.href = '../index.html';
        return;
    }

    const apps = JSON.parse(localStorage.getItem('applications')) || [];
    const userApps = apps.filter(a => a.userLogin === user.login);
    const list = document.getElementById('history-list');
    if (!list) return;

    if (userApps.length === 0) {
        list.innerHTML = '<p style="color:#888; text-align:center; padding:30px 0;">У вас пока нет заявок. Начните обучение!</p>';
        return;
    }

    list.innerHTML = userApps.slice().reverse().map((app) => {
        let statusClass = app.status === 'Новая' ? 'status-new' :
            (app.status === 'Идет обучение' ? 'status-progress' : 'status-done');

        let reviewHtml = '';
        if (app.status === 'Обучение завершено' && !app.review) {
            reviewHtml = `
                <div style="margin-top:10px;">
                    <textarea class="review-area" data-appid="${app.id}" placeholder="Напишите отзыв о курсе..."></textarea>
                    <button class="btn btn-sm" onclick="saveReview(${app.id})" style="margin-top:6px;">Отправить отзыв</button>
                </div>
            `;
        } else if (app.review) {
            reviewHtml = `<p style="margin-top:8px; font-style:italic; color:#2d2d44; background:#f0f4f9; padding:10px 14px; border-radius:8px;">"${app.review}"</p>`;
        }

        return `
            <div class="app-card">
                <strong>${app.course}</strong>
                <div class="meta">${app.date} | ${app.payment}</div>
                <span class="status-badge ${statusClass}">${app.status}</span>
                ${reviewHtml}
            </div>
        `;
    }).join('');
}

function saveReview(appId) {
    const apps = JSON.parse(localStorage.getItem('applications')) || [];
    const index = apps.findIndex(a => a.id === appId);
    if (index === -1) return;

    const textarea = document.querySelector(`.review-area[data-appid="${appId}"]`);
    if (textarea && textarea.value.trim()) {
        apps[index].review = textarea.value.trim();
        localStorage.setItem('applications', JSON.stringify(apps));
        showToast('Спасибо за ваш отзыв!');
        renderDashboard();
    } else {
        showToast('Напишите текст отзыва', 'error');
    }
}

// ============================================================
// ФОРМА ЗАЯВКИ
// ============================================================
function initApplication() {
    const form = document.getElementById('app-form');
    if (!form) return;

    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        window.location.href = '../index.html';
        return;
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const date = document.getElementById('app-date').value.trim();
        if (!/^(\d{2})\.(\d{2})\.(\d{4})$/.test(date)) {
            showToast('Введите дату в формате ДД.ММ.ГГГГ', 'error');
            return;
        }

        const apps = JSON.parse(localStorage.getItem('applications')) || [];
        apps.push({
            id: Date.now(),
            userLogin: user.login,
            course: document.getElementById('app-course').value,
            date: date,
            payment: document.getElementById('app-payment').value,
            status: 'Новая',
            review: ''
        });
        localStorage.setItem('applications', JSON.stringify(apps));
        showToast('Заявка отправлена на согласование!');
        navigateTo('dashboard.html');
    });
}

// ============================================================
// АДМИН-ПАНЕЛЬ (с редактированием и удалением)
// ============================================================
function renderAdminApps(page = 1) {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || user.role !== 'admin') {
        window.location.href = '../index.html';
        return;
    }

    let apps = JSON.parse(localStorage.getItem('applications')) || [];
    const filter = document.getElementById('status-filter')?.value || 'all';

    if (filter !== 'all') {
        apps = apps.filter(a => a.status === filter);
    }

    const totalPages = Math.ceil(apps.length / itemsPerPage) || 1;
    page = Math.max(1, Math.min(page, totalPages));
    currentAdminPage = page;

    const info = document.getElementById('page-info');
    if (info) info.innerText = 'Стр. ' + page + ' из ' + totalPages;

    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    if (prevBtn) prevBtn.disabled = page === 1;
    if (nextBtn) nextBtn.disabled = page === totalPages;

    const start = (page - 1) * itemsPerPage;
    const paginatedApps = apps.slice(start, start + itemsPerPage);
    const list = document.getElementById('admin-app-list');
    if (!list) return;

    if (paginatedApps.length === 0) {
        list.innerHTML = '<p style="text-align:center; color:#888; padding:30px 0;">Заявок не найдено.</p>';
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];

    list.innerHTML = paginatedApps.map((app) => {
        const user = users.find(u => u.login === app.userLogin);
        const userName = user ? user.fio : app.userLogin;

        return `
            <div class="app-card" style="border-left-color: #0d47a1;">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
                    <strong>${app.course}</strong>
                    <small style="color:#6a6a82;">${userName}</small>
                </div>
                <div class="meta">${app.date} | ${app.payment}</div>
                <div class="actions">
                    <span style="font-size:14px; font-weight:500;">Статус:</span>
                    <select onchange="changeStatus(${app.id}, this.value)">
                        <option value="Новая" ${app.status === 'Новая' ? 'selected' : ''}>Новая</option>
                        <option value="Идет обучение" ${app.status === 'Идет обучение' ? 'selected' : ''}>В процессе</option>
                        <option value="Обучение завершено" ${app.status === 'Обучение завершено' ? 'selected' : ''}>Завершено</option>
                    </select>
                    <button class="btn-outline btn-sm" onclick="openModal(${app.id})">Редактировать</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteApp(${app.id})">Удалить</button>
                </div>
            </div>
        `;
    }).join('');
}

function changeStatus(appId, newStatus) {
    const apps = JSON.parse(localStorage.getItem('applications')) || [];
    const index = apps.findIndex(a => a.id === appId);
    if (index !== -1) {
        apps[index].status = newStatus;
        localStorage.setItem('applications', JSON.stringify(apps));
        renderAdminApps(currentAdminPage);
        showToast('Статус обновлён на "' + newStatus + '"');
    }
}

function deleteApp(appId) {
    if (!confirm('Вы уверены, что хотите удалить эту заявку?')) return;

    let apps = JSON.parse(localStorage.getItem('applications')) || [];
    apps = apps.filter(a => a.id !== appId);
    localStorage.setItem('applications', JSON.stringify(apps));
    renderAdminApps(currentAdminPage);
    showToast('Заявка удалена');
}

function saveEdit(e) {
    e.preventDefault();
    const id = parseInt(document.getElementById('edit-id').value);
    const course = document.getElementById('edit-course').value;
    const date = document.getElementById('edit-date').value.trim();
    const payment = document.getElementById('edit-payment').value;
    const status = document.getElementById('edit-status').value;

    if (!/^(\d{2})\.(\d{2})\.(\d{4})$/.test(date)) {
        showToast('Введите дату в формате ДД.ММ.ГГГГ', 'error');
        return;
    }

    const apps = JSON.parse(localStorage.getItem('applications')) || [];
    const index = apps.findIndex(a => a.id === id);
    if (index !== -1) {
        apps[index].course = course;
        apps[index].date = date;
        apps[index].payment = payment;
        apps[index].status = status;
        localStorage.setItem('applications', JSON.stringify(apps));
        closeModal();
        renderAdminApps(currentAdminPage);
        showToast('Заявка обновлена');
    }
}

function changePage(direction) {
    renderAdminApps(currentAdminPage + direction);
}

// ============================================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    initBurgerMenu();
    initSlider();
    initAuth();

    // Форма редактирования
    const editForm = document.getElementById('edit-form');
    if (editForm) {
        editForm.addEventListener('submit', saveEdit);
    }

    // Закрытие модального окна по клику на фон
    const modal = document.getElementById('edit-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) closeModal();
        });

        // Закрытие по Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') closeModal();
        });
    }

    const path = window.location.pathname.split('/').pop();
    const page = path || 'index.html';

    if (page === 'dashboard.html') {
        renderDashboard();
    }

    if (page === 'application.html') {
        initApplication();
    }

    if (page === 'admin.html') {
        renderAdminApps(1);
        const filter = document.getElementById('status-filter');
        if (filter) {
            filter.addEventListener('change', function() {
                renderAdminApps(1);
            });
        }
    }
});