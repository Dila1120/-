// ============================================================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ============================================================
var currentSlide = 0;
var slideInterval;
var currentAdminPage = 1;
var itemsPerPage = 4;

// ============================================================
// УТИЛИТЫ
// ============================================================
function navigateTo(page) {
    window.location.href = page;
}

function showToast(message, type) {
    type = type || 'success';
    var bg = type === 'error' ? '#dc3545' : '#28a745';
    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.background = bg;
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(function() {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(function() { toast.remove(); }, 400);
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
    var burger = document.getElementById('burger-menu');
    var nav = document.getElementById('nav-menu');

    if (!burger || !nav) return;

    var oldOverlay = document.querySelector('.nav-overlay');
    if (oldOverlay) oldOverlay.remove();

    var overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);

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

    var links = nav.querySelectorAll('a, button');
    for (var i = 0; i < links.length; i++) {
        links[i].addEventListener('click', closeMenu);
    }

    var resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            if (window.innerWidth > 768) {
                closeMenu();
            }
        }, 100);
    });
}

// ============================================================
// МОДАЛЬНОЕ ОКНО
// ============================================================
function openModal(appId) {
    var apps = JSON.parse(localStorage.getItem('applications')) || [];
    var app = null;
    for (var i = 0; i < apps.length; i++) {
        if (apps[i].id === appId) {
            app = apps[i];
            break;
        }
    }
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
    var wrappers = document.querySelectorAll('.slider-wrapper');
    if (wrappers.length === 0) return;

    for (var w = 0; w < wrappers.length; w++) {
        (function(wrapper) {
            var slides = wrapper.querySelectorAll('.slide');
            var totalSlides = slides.length;
            if (totalSlides === 0) return;

            var container = wrapper.closest('.hero-slider') || wrapper.parentElement;
            var prevBtn = container.querySelector('.prev');
            var nextBtn = container.querySelector('.next');
            var dotsContainer = container.querySelector('.slider-dots');

            var current = 0;
            var interval;

            function goToSlide(i) {
                current = (i + totalSlides) % totalSlides;
                wrapper.style.transform = 'translateX(-' + (current * 100 / totalSlides) + '%)';
                if (dotsContainer) {
                    var dots = dotsContainer.querySelectorAll('span');
                    for (var d = 0; d < dots.length; d++) {
                        dots[d].classList.toggle('active', d === current);
                    }
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
                for (var i = 0; i < totalSlides; i++) {
                    var dot = document.createElement('span');
                    dot.dataset.index = i;
                    dot.addEventListener('click', function() {
                        clearInterval(interval);
                        goToSlide(parseInt(this.dataset.index));
                        startAutoSlide();
                    });
                    dotsContainer.appendChild(dot);
                }
            }

            if (prevBtn) {
                prevBtn.addEventListener('click', function() {
                    clearInterval(interval);
                    prevSlide();
                    startAutoSlide();
                });
            }
            if (nextBtn) {
                nextBtn.addEventListener('click', function() {
                    clearInterval(interval);
                    nextSlide();
                    startAutoSlide();
                });
            }

            goToSlide(0);
            startAutoSlide();
        })(wrappers[w]);
    }
}

// ============================================================
// АВТОРИЗАЦИЯ И РЕГИСТРАЦИЯ
// ============================================================
function initAuth() {
    var regForm = document.getElementById('register-form');
    if (regForm) {
        regForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var login = document.getElementById('reg-login').value.trim();
            var password = document.getElementById('reg-password').value;
            var fio = document.getElementById('reg-fio').value.trim();
            var phone = document.getElementById('reg-phone').value.trim();
            var email = document.getElementById('reg-email').value.trim();

            var hasError = false;
            var loginRegex = /^[a-zA-Z0-9]{6,}$/;
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

            var users = JSON.parse(localStorage.getItem('users')) || [];
            for (var i = 0; i < users.length; i++) {
                if (users[i].login === login) {
                    document.getElementById('reg-login-error').innerText = 'Логин уже занят.';
                    return;
                }
            }

            users.push({ login: login, password: password, fio: fio, phone: phone, email: email, role: 'user' });
            localStorage.setItem('users', JSON.stringify(users));
            showToast('Регистрация успешна! Войдите в систему.');
            navigateTo('login.html');
        });
    }

    var loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var login = document.getElementById('login-username').value.trim();
            var password = document.getElementById('login-password').value;

            var users = JSON.parse(localStorage.getItem('users')) || [];

            if (login === 'Admin26' && password === 'Demo20') {
                var adminUser = { login: 'Admin26', fio: 'Администратор', role: 'admin' };
                localStorage.setItem('currentUser', JSON.stringify(adminUser));
                showToast('Добро пожаловать, Администратор!');
                navigateTo('admin.html');
                return;
            }

            var found = false;
            for (var i = 0; i < users.length; i++) {
                if (users[i].login === login && users[i].password === password) {
                    localStorage.setItem('currentUser', JSON.stringify(users[i]));
                    showToast('Добро пожаловать, ' + users[i].fio + '!');
                    navigateTo('dashboard.html');
                    found = true;
                    return;
                }
            }
            if (!found) {
                document.getElementById('login-error').innerText = 'Неверный логин или пароль.';
            }
        });
    }
}

// ============================================================
// ЛИЧНЫЙ КАБИНЕТ
// ============================================================
function renderDashboard() {
    var user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || user.role === 'admin') {
        window.location.href = '../index.html';
        return;
    }

    var apps = JSON.parse(localStorage.getItem('applications')) || [];
    var userApps = [];
    for (var i = 0; i < apps.length; i++) {
        if (apps[i].userLogin === user.login) {
            userApps.push(apps[i]);
        }
    }
    var list = document.getElementById('history-list');
    if (!list) return;

    if (userApps.length === 0) {
        list.innerHTML = '<p style="color:#888; text-align:center; padding:30px 0;">У вас пока нет заявок. Начните обучение!</p>';
        return;
    }

    var html = '';
    for (var i = userApps.length - 1; i >= 0; i--) {
        var app = userApps[i];
        var statusClass = app.status === 'Новая' ? 'status-new' :
            (app.status === 'Идет обучение' ? 'status-progress' : 'status-done');

        var reviewHtml = '';
        if (app.status === 'Обучение завершено' && !app.review) {
            reviewHtml = '<div style="margin-top:10px;">' +
                '<textarea class="review-area" data-appid="' + app.id + '" placeholder="Напишите отзыв о курсе..."></textarea>' +
                '<button class="btn btn-sm" onclick="saveReview(' + app.id + ')" style="margin-top:6px;">Отправить отзыв</button>' +
                '</div>';
        } else if (app.review) {
            reviewHtml = '<p style="margin-top:8px; font-style:italic; color:#2d2d44; background:#f0f4f9; padding:10px 14px; border-radius:8px;">"' + app.review + '"</p>';
        }

        html += '<div class="app-card">' +
            '<strong>' + app.course + '</strong>' +
            '<div class="meta">' + app.date + ' | ' + app.payment + '</div>' +
            '<span class="status-badge ' + statusClass + '">' + app.status + '</span>' +
            reviewHtml +
            '</div>';
    }
    list.innerHTML = html;
}

function saveReview(appId) {
    var apps = JSON.parse(localStorage.getItem('applications')) || [];
    var index = -1;
    for (var i = 0; i < apps.length; i++) {
        if (apps[i].id === appId) {
            index = i;
            break;
        }
    }
    if (index === -1) return;

    var textarea = document.querySelector('.review-area[data-appid="' + appId + '"]');
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
    var form = document.getElementById('app-form');
    if (!form) return;

    var user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        window.location.href = '../index.html';
        return;
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        var date = document.getElementById('app-date').value.trim();
        if (!/^(\d{2})\.(\d{2})\.(\d{4})$/.test(date)) {
            showToast('Введите дату в формате ДД.ММ.ГГГГ', 'error');
            return;
        }

        var apps = JSON.parse(localStorage.getItem('applications')) || [];
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
// АДМИН-ПАНЕЛЬ
// ============================================================
function renderAdminApps(page) {
    page = page || 1;
    var user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || user.role !== 'admin') {
        window.location.href = '../index.html';
        return;
    }

    var apps = JSON.parse(localStorage.getItem('applications')) || [];
    var filter = document.getElementById('status-filter');
    var filterValue = filter ? filter.value : 'all';

    if (filterValue !== 'all') {
        var filtered = [];
        for (var i = 0; i < apps.length; i++) {
            if (apps[i].status === filterValue) {
                filtered.push(apps[i]);
            }
        }
        apps = filtered;
    }

    var totalPages = Math.ceil(apps.length / itemsPerPage) || 1;
    page = Math.max(1, Math.min(page, totalPages));
    currentAdminPage = page;

    var info = document.getElementById('page-info');
    if (info) info.innerText = 'Стр. ' + page + ' из ' + totalPages;

    var prevBtn = document.getElementById('prev-page');
    var nextBtn = document.getElementById('next-page');
    if (prevBtn) prevBtn.disabled = page === 1;
    if (nextBtn) nextBtn.disabled = page === totalPages;

    var start = (page - 1) * itemsPerPage;
    var paginatedApps = apps.slice(start, start + itemsPerPage);
    var list = document.getElementById('admin-app-list');
    if (!list) return;

    if (paginatedApps.length === 0) {
        list.innerHTML = '<p style="text-align:center; color:#888; padding:30px 0;">Заявок не найдено.</p>';
        return;
    }

    var users = JSON.parse(localStorage.getItem('users')) || [];

    var html = '';
    for (var i = 0; i < paginatedApps.length; i++) {
        var app = paginatedApps[i];
        var found = false;
        var userName = app.userLogin;
        for (var u = 0; u < users.length; u++) {
            if (users[u].login === app.userLogin) {
                userName = users[u].fio;
                found = true;
                break;
            }
        }

        html += '<div class="app-card" style="border-left-color: #0d47a1;">' +
            '<div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">' +
            '<strong>' + app.course + '</strong>' +
            '<small style="color:#6a6a82;">' + userName + '</small>' +
            '</div>' +
            '<div class="meta">' + app.date + ' | ' + app.payment + '</div>' +
            '<div class="actions">' +
            '<span style="font-size:14px; font-weight:500;">Статус:</span>' +
            '<select onchange="changeStatus(' + app.id + ', this.value)">' +
            '<option value="Новая" ' + (app.status === 'Новая' ? 'selected' : '') + '>Новая</option>' +
            '<option value="Идет обучение" ' + (app.status === 'Идет обучение' ? 'selected' : '') + '>В процессе</option>' +
            '<option value="Обучение завершено" ' + (app.status === 'Обучение завершено' ? 'selected' : '') + '>Завершено</option>' +
            '</select>' +
            '<button class="btn-outline btn-sm" onclick="openModal(' + app.id + ')">Редактировать</button>' +
            '<button class="btn btn-sm btn-danger" onclick="deleteApp(' + app.id + ')">Удалить</button>' +
            '</div>' +
            '</div>';
    }
    list.innerHTML = html;
}

function changeStatus(appId, newStatus) {
    var apps = JSON.parse(localStorage.getItem('applications')) || [];
    var index = -1;
    for (var i = 0; i < apps.length; i++) {
        if (apps[i].id === appId) {
            index = i;
            break;
        }
    }
    if (index !== -1) {
        apps[index].status = newStatus;
        localStorage.setItem('applications', JSON.stringify(apps));
        renderAdminApps(currentAdminPage);
        showToast('Статус обновлён на "' + newStatus + '"');
    }
}

function deleteApp(appId) {
    if (!confirm('Вы уверены, что хотите удалить эту заявку?')) return;

    var apps = JSON.parse(localStorage.getItem('applications')) || [];
    var filtered = [];
    for (var i = 0; i < apps.length; i++) {
        if (apps[i].id !== appId) {
            filtered.push(apps[i]);
        }
    }
    localStorage.setItem('applications', JSON.stringify(filtered));
    renderAdminApps(currentAdminPage);
    showToast('Заявка удалена');
}

function saveEdit(e) {
    e.preventDefault();
    var id = parseInt(document.getElementById('edit-id').value);
    var course = document.getElementById('edit-course').value;
    var date = document.getElementById('edit-date').value.trim();
    var payment = document.getElementById('edit-payment').value;
    var status = document.getElementById('edit-status').value;

    if (!/^(\d{2})\.(\d{2})\.(\d{4})$/.test(date)) {
        showToast('Введите дату в формате ДД.ММ.ГГГГ', 'error');
        return;
    }

    var apps = JSON.parse(localStorage.getItem('applications')) || [];
    var index = -1;
    for (var i = 0; i < apps.length; i++) {
        if (apps[i].id === id) {
            index = i;
            break;
        }
    }
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

    var editForm = document.getElementById('edit-form');
    if (editForm) {
        editForm.addEventListener('submit', saveEdit);
    }

    var modal = document.getElementById('edit-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) closeModal();
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') closeModal();
        });
    }

    var path = window.location.pathname.split('/').pop();
    var page = path || 'index.html';

    if (page === 'dashboard.html') {
        renderDashboard();
    }

    if (page === 'application.html') {
        initApplication();
    }

    if (page === 'admin.html') {
        renderAdminApps(1);
        var filter = document.getElementById('status-filter');
        if (filter) {
            filter.addEventListener('change', function() {
                renderAdminApps(1);
            });
        }
    }
});