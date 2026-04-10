// Konfigurasi & State - Pakai Try Catch agar tidak crash jika localStorage korup
let transactions = [];
try {
    transactions = JSON.parse(localStorage.getItem('catatanku_trx')) || [];
} catch (e) {
    transactions = [];
}

let syncQueue = [];
try {
    syncQueue = JSON.parse(localStorage.getItem('catatanku_queue')) || [];
} catch (e) {
    syncQueue = [];
}

// Inisialisasi Aplikasi
document.addEventListener('DOMContentLoaded', () => {
    console.log("Aplikasi Siap...");
    checkLoginStatus();
    initFormatRupiah();
    updateNetworkStatus();
    
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(err => console.log("SW Fail:", err));
    }
});

// === AUTHENTICATION LOGIC ===
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('login-username').value;
    const pass = document.getElementById('login-password').value;

    console.log("Mencoba login...");

    if (user === 'shinalazmi' && pass === 'shin123') {
        sessionStorage.setItem('role', 'admin');
        checkLoginStatus();
    } else if (user === 'User' && pass === 'user123') {
        sessionStorage.setItem('role', 'user');
        checkLoginStatus();
    } else {
        alert("Username atau Password salah!");
    }
});

function checkLoginStatus() {
    const role = sessionStorage.getItem('role');
    
    // Sembunyikan semua view dulu secara total
    document.querySelectorAll('.view').forEach(v => {
        v.classList.add('hidden');
        v.classList.remove('active');
    });
    
    if (role === 'admin') {
        const adminView = document.getElementById('admin-view');
        adminView.classList.remove('hidden');
        adminView.classList.add('active');
        document.getElementById('admin-sheet-url').value = localStorage.getItem('sheetUrl') || '';
        renderAdminTrx();
    } else if (role === 'user') {
        const appView = document.getElementById('app-view');
        appView.classList.remove('hidden');
        appView.classList.add('active');
        // Jalankan dashboard dengan aman
        setTimeout(() => {
            switchTab('dashboard');
        }, 100);
    } else {
        const loginView = document.getElementById('login-view');
        loginView.classList.remove('hidden');
        loginView.classList.add('active');
    }
}

function logout() {
    sessionStorage.removeItem('role');
    window.location.reload(); // Reload untuk memastikan state bersih
}

// === TAB & NAVIGATION LOGIC ===
function switchTab(tabId) {
    console.log("Pindah ke tab:", tabId);
    
    // Sembunyikan semua konten tab
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    
    const targetTab = document.getElementById(`tab-${tabId}`);
    if(targetTab) {
        targetTab.classList.remove('hidden');
    }

    // Aktifkan icon di bottom nav
    const btns = document.querySelectorAll('.bottom-nav .nav-item');
    btns.forEach(btn => {
        if(btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(tabId)) {
            btn.classList.add('active');
        }
    });

    // Jalankan fungsi spesifik tab dengan proteksi error
    try {
        if(tabId === 'dashboard') renderDashboard();
        if(tabId === 'transaksi') renderTodayTrx();
        if(tabId === 'riwayat') switchReportTab('umum');
    } catch (err) {
        console.error("Gagal memuat konten tab:", err);
    }
}

// === RENDER DASHBOARD (PROTECTED) ===
function renderDashboard() {
    let todayTotal = 0;
    let piutang = 0;
    let hutangSaya = 0;
    const todayStr = new Date().toLocaleDateString();

    transactions.forEach(t => {
        let tDate = new Date(t.date).toLocaleDateString();
        const total = (t.nominal || 0) + (t.adminFee || 0);
        
        if(tDate === todayStr) todayTotal += total;
        if(t.type === 'Hutang') piutang += total;
    });

    // Update UI jika elemen ada (mencegah error null)
    const elTotal = document.getElementById('dash-total-today');
    const elPiutang = document.getElementById('dash-piutang');
    
    if(elTotal) elTotal.innerText = `Rp ${todayTotal.toLocaleString('id-ID')}`;
    if(elPiutang) elPiutang.innerText = `Rp ${piutang.toLocaleString('id-ID')}`;

    initChart();
}

// === CHART LOGIC (PROTECTED) ===
let chartInstance = null;
function initChart() {
    const canvas = document.getElementById('trendChart');
    if(!canvas) return;
    
    // Cek apakah library Chart.js sudah terload
    if (typeof Chart === 'undefined') {
        console.warn("Chart.js belum siap.");
        return;
    }

    if(chartInstance) chartInstance.destroy();
    
    try {
        chartInstance = new Chart(canvas, {
            type: 'line',
            data: {
                labels: ['H-6', 'H-5', 'H-4', 'H-3', 'H-2', 'H-1', 'Hari Ini'],
                datasets: [{
                    label: 'Omzet',
                    data: [0, 0, 0, 0, 0, 0, transactions.length], 
                    borderColor: '#005E6A',
                    backgroundColor: 'rgba(0, 94, 106, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: { 
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } } 
            }
        });
    } catch (e) {
        console.error("Gagal membuat chart:", e);
    }
}

// ... (Sisa fungsi lainnya seperti formatRupiah, renderTodayTrx, dan processQueue tetap sama)
// Pastikan fungsi pendukung lainnya tetap ada di bawah sini...
