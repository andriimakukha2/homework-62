document.addEventListener('DOMContentLoaded', () => {
    const themeButtons = document.querySelectorAll('button');

    themeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const theme = button.textContent.toLowerCase().includes('dark') ? 'dark' : 'light';
            setTheme(theme);
        });
    });

    function setTheme(theme) {
        fetch('/settings/set-theme', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ theme }),
        }).then(() => location.reload());
    }
});