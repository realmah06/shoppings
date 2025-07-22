document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    if (window.location.pathname.endsWith('index.html') && localStorage.getItem('loggedIn')) {
        window.location.href = 'dashboard.html';
    }

    // Login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Simple validation (in a real app, you'd check against a database)
            if (username === 'admin' && password === 'admin123') {
                localStorage.setItem('loggedIn', true);
                localStorage.setItem('username', username);
                
                Swal.fire({
                    title: 'Login Successful',
                    text: 'Redirecting to dashboard...',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    window.location.href = 'dashboard.html';
                });
            } else {
                Swal.fire({
                    title: 'Login Failed',
                    text: 'Invalid username or password',
                    icon: 'error'
                });
            }
        });
    }
});

// Sidebar toggle
document.addEventListener('DOMContentLoaded', function() {
    const sidebarCollapse = document.getElementById('sidebarCollapse');
    if (sidebarCollapse) {
        sidebarCollapse.addEventListener('click', function() {
            document.getElementById('sidebar').classList.toggle('active');
        });
    }
});
