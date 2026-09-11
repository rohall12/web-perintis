// Fungsi untuk berpindah tab dengan animasi halus
window.switchTab = function(tabName) {
    const sectionBeranda = document.getElementById('section-beranda');
    const sectionSertifikat = document.getElementById('section-sertifikat');
    const navBeranda = document.getElementById('nav-beranda');
    const navSertifikat = document.getElementById('nav-sertifikat');

    // Kelas style navigasi aktif & non-aktif
    const activeClasses = ['bg-blue-50', 'text-blue-600', 'dark:bg-blue-900/40', 'dark:text-blue-400'];
    const inactiveClasses = ['text-gray-600', 'dark:text-gray-300', 'hover:bg-gray-50', 'dark:hover:bg-gray-700'];

    if (tabName === 'beranda') {
        // Sembunyikan Sertifikat
        sectionSertifikat.classList.add('hidden');
        sectionSertifikat.classList.remove('animate-fade-in');

        // Tampilkan Beranda dengan animasi
        sectionBeranda.classList.remove('hidden');
        // Reset animasi jika diklik ulang
        void sectionBeranda.offsetWidth; 
        sectionBeranda.classList.add('animate-fade-in');

        // Update tombol navigasi
        navBeranda.classList.add(...activeClasses);
        navBeranda.classList.remove(...inactiveClasses);
        navSertifikat.classList.remove(...activeClasses);
        navSertifikat.classList.add(...inactiveClasses);

    } else if (tabName === 'sertifikat') {
        // Sembunyikan Beranda
        sectionBeranda.classList.add('hidden');
        sectionBeranda.classList.remove('animate-fade-in');

        // Tampilkan Sertifikat dengan animasi
        sectionSertifikat.classList.remove('hidden');
        // Reset animasi jika diklik ulang
        void sectionSertifikat.offsetWidth; 
        sectionSertifikat.classList.add('animate-fade-in');

        // Update tombol navigasi
        navSertifikat.classList.add(...activeClasses);
        navSertifikat.classList.remove(...inactiveClasses);
        navBeranda.classList.remove(...activeClasses);
        navBeranda.classList.add(...inactiveClasses);
    }
};
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