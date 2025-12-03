// public/js/admin-theme.js
document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const btn = document.getElementById('adminThemeToggle');
    if (!btn) return;

    const THEME_KEY = 'lutaverAdminTheme';

    function applyTheme(theme) {
        body.classList.remove('theme-dark', 'theme-light');

        if (theme === 'light') {
            body.classList.add('theme-light');
            btn.textContent = '🌙 Modo escuro';
        } else {
            body.classList.add('theme-dark');
            btn.textContent = '🌞 Modo claro';
        }
    }

    // carrega escolha salva
    const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
    applyTheme(savedTheme);

    // clique do botão
    btn.addEventListener('click', () => {
        const current = body.classList.contains('theme-light') ? 'light' : 'dark';
        const next = current === 'light' ? 'dark' : 'light';

        applyTheme(next);
        localStorage.setItem(THEME_KEY, next);
    });
});
