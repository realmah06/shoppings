document.addEventListener('DOMContentLoaded', function() {
    // Check authentication state
    if (window.location.pathname.endsWith('index.html')) {
        if (localStorage.getItem('loggedIn')) {
            window.location.href = 'dashboard.html';
        }
        
        // Setup login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;
                
                const user = db.authenticate(username, password);
                if (user) {
                    localStorage.setItem('loggedIn', true);
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    
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
    } else {
        // For all other pages, check if logged in
        if (!localStorage.getItem('loggedIn')) {
            window.location.href = 'index.html';
        } else {
            // Set current user in navbar
            const user = JSON.parse(localStorage.getItem('currentUser'));
            if (user && document.getElementById('currentUser')) {
                document.getElementById('currentUser').textContent = user.full_name || user.username;
            }
        }
    }

    // Sidebar toggle
    const sidebarCollapse = document.getElementById('sidebarCollapse');
    if (sidebarCollapse) {
        sidebarCollapse.addEventListener('click', function() {
            document.getElementById('sidebar').classList.toggle('active');
        });
    }
});

function logout() {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}
