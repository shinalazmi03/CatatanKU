function checkLoginStatus() {
    const role = sessionStorage.getItem('role');
    console.log("Role saat ini:", role); // Untuk cek di konsol

    // Sembunyikan SEMUA view dulu
    document.getElementById('login-view').classList.add('hidden');
    document.getElementById('admin-view').classList.add('hidden');
    document.getElementById('app-view').classList.add('hidden');
    
    if (role === 'admin') {
        const adminView = document.getElementById('admin-view');
        adminView.classList.remove('hidden');
        adminView.style.display = 'block'; // Paksa tampil
        renderAdminTrx();
    } else if (role === 'user') {
        const appView = document.getElementById('app-view');
        appView.classList.remove('hidden');
        appView.style.display = 'block'; // Paksa tampil
        switchTab('dashboard');
    } else {
        document.getElementById('login-view').classList.remove('hidden');
        document.getElementById('login-view').style.display = 'block';
    }
}