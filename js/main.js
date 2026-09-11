// js/main.js - Entry Point Utama Aplikasi
import { switchTab, toggleDarkMode, updateThemeUI, toggleSidebar, openModal, closeModal } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Cek Tema Terpesan dari LocalStorage / System Preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);

    if (isDark) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    updateThemeUI(isDark);

    // 2. Hubungkan Fungsi ke Window Scope (agar bisa dipanggil dari atribut onclick di HTML)
    window.switchTab = switchTab;
    window.toggleDarkMode = toggleDarkMode;
    window.toggleSidebar = toggleSidebar;
    window.openModal = openModal;
    window.closeModal = closeModal;

    // 3. Shortcut Keyboard (Tutup Modal dengan Tombol Escape)
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeModal();
        }
    });
});