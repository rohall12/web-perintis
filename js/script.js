/* ============================================================
   1. Cek Tema Dark Mode Saat Pertama Ditinggalkan/Dimuat
   (Ditaruh paling atas agar dieksekusi langsung tanpa flicker)
   ============================================================ */
if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
} else {
    document.documentElement.classList.remove('dark');
}

/* ============================================================
   2. Switcher Tab Navigasi (Beranda, Sertifikat, Kontak)
   ============================================================ */
function switchTab(tabName) {
    const sections = ['beranda', 'sertifikat', 'kontak'];
    
    sections.forEach(s => {
        const secEl = document.getElementById(`section-${s}`);
        const navEl = document.getElementById(`nav-${s}`);
        
        if (s === tabName) {
            if (secEl) {
                secEl.classList.remove('hidden');
                secEl.classList.add('block');
            }
            if (navEl) {
                navEl.classList.add('bg-blue-50', 'text-blue-600', 'dark:bg-blue-900/40', 'dark:text-blue-400');
                navEl.classList.remove('text-gray-600', 'dark:text-gray-300', 'hover:bg-gray-50', 'dark:hover:bg-gray-700');
            }
        } else {
            if (secEl) {
                secEl.classList.remove('block');
                secEl.classList.add('hidden');
            }
            if (navEl) {
                navEl.classList.remove('bg-blue-50', 'text-blue-600', 'dark:bg-blue-900/40', 'dark:text-blue-400');
                navEl.classList.add('text-gray-600', 'dark:text-gray-300', 'hover:bg-gray-50', 'dark:hover:bg-gray-700');
            }
        }
    });
}

/* ============================================================
   3. Toggle Sidebar (Tampilkan / Sembunyikan Navigasi)
   ============================================================ */
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggleText = document.getElementById('sidebar-toggle-text');
    
    if (sidebar) {
        sidebar.classList.toggle('hidden');
        if (toggleText) {
            toggleText.textContent = sidebar.classList.contains('hidden') ? 'Tampilkan Menu' : 'Sembunyikan Menu';
        }
    }
}

/* ============================================================
   4. Switcher Dark Mode
   ============================================================ */
function toggleDarkMode() {
    const isDark = document.documentElement.classList.toggle('dark');
    updateThemeUI(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

function updateThemeUI(isDark) {
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

/* ============================================================
   5. Modal Handler (Preview Gambar Sertifikat)
   ============================================================ */
function openModal(imageSrc, title) {
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-image');
    const modalTitle = document.getElementById('modal-title');

    if (modalImg) modalImg.src = imageSrc;
    if (modalTitle) modalTitle.textContent = title;
    if (modal) modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('image-modal');
    if (modal) modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

/* ============================================================
   6. Event Listeners (Inisialisasi UI & Keyboard Shortcuts)
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    const isDark = document.documentElement.classList.contains('dark');
    updateThemeUI(isDark);
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});