// js/ui.js - Logika Interaksi Tampilan (UI)

// 1. Pindah Tab Navigasi (Beranda & Sertifikat)
export function switchTab(tabName) {
    const sections = ['beranda', 'sertifikat'];
    
    sections.forEach(sec => {
        const sectionEl = document.getElementById(`section-${sec}`);
        const navEl = document.getElementById(`nav-${sec}`);
        
        if (sectionEl) {
            if (sec === tabName) {
                sectionEl.classList.remove('hidden');
                sectionEl.classList.add('block');
            } else {
                sectionEl.classList.add('hidden');
                sectionEl.classList.remove('block');
            }
        }

        if (navEl) {
            if (sec === tabName) {
                navEl.classList.add('bg-blue-50', 'text-blue-600', 'dark:bg-blue-900/40', 'dark:text-blue-400');
                navEl.classList.remove('text-gray-600', 'dark:text-gray-300', 'hover:bg-gray-50', 'dark:hover:bg-gray-700');
            } else {
                navEl.classList.remove('bg-blue-50', 'text-blue-600', 'dark:bg-blue-900/40', 'dark:text-blue-400');
                navEl.classList.add('text-gray-600', 'dark:text-gray-300', 'hover:bg-gray-50', 'dark:hover:bg-gray-700');
            }
        }
    });
}

// 2. Toggle Dark Mode / Light Mode
export function toggleDarkMode() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeUI(isDark);
}

export function updateThemeUI(isDark) {
    const icon = document.getElementById('theme-toggle-icon');
    const text = document.getElementById('theme-toggle-text');
    if (icon && text) {
        if (isDark) {
            icon.className = 'fa-solid fa-sun text-sm md:text-lg text-amber-400';
            text.textContent = 'Mode Terang';
        } else {
            icon.className = 'fa-solid fa-moon text-sm md:text-lg';
            text.textContent = 'Mode Gelap';
        }
    }
}

// 3. Toggle Sidebar Menu (Tampilkan / Sembunyikan Navigasi)
export function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggleText = document.getElementById('sidebar-toggle-text');
    
    if (sidebar) {
        sidebar.classList.toggle('hidden');
        if (toggleText) {
            toggleText.textContent = sidebar.classList.contains('hidden') ? 'Tampilkan Menu' : 'Sembunyikan Menu';
        }
    }
}

// 4. Modal Handler (Preview Gambar Sertifikat)
export function openModal(imageSrc, title) {
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-image');
    const modalTitle = document.getElementById('modal-title');

    if (modalImg) modalImg.src = imageSrc;
    if (modalTitle) modalTitle.textContent = title;
    if (modal) modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

export function closeModal() {
    const modal = document.getElementById('image-modal');
    if (modal) modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}