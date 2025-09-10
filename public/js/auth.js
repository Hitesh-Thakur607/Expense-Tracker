// Authentication JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const messageDiv = document.getElementById('message');

    // Login Form Handler
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(loginForm);
            const loginData = {
                email: formData.get('email'),
                password: formData.get('password')
            };

            try {
                showLoading();
                const response = await fetch('/user/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include', // Include cookies in the request
                    body: JSON.stringify(loginData)
                });

                const result = await response.text();
                hideLoading();

                console.log('Login response:', result); // Debug log
                
                if (response.ok && result.includes('Login Successful')) {
                    showMessage('Login successful! Redirecting...', 'success');
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1000);
                } else {
                    showMessage(result || 'Login failed. Please check your credentials.', 'error');
                }
            } catch (error) {
                hideLoading();
                showMessage('Network error. Please try again.', 'error');
                console.error('Login error:', error);
            }
        });
    }

    // Register Form Handler
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(registerForm);
            const registerData = {
                name: formData.get('name'),
                email: formData.get('email'),
                password: formData.get('password')
            };

            // Basic validation
            if (registerData.password.length < 6) {
                showMessage('Password must be at least 6 characters long.', 'error');
                return;
            }

            try {
                showLoading();
                const response = await fetch('/user/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(registerData)
                });

                const result = await response.text();
                hideLoading();

                if (response.ok) {
                    showMessage('Registration successful! Please login.', 'success');
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 2000);
                } else {
                    showMessage(result || 'Registration failed. Please try again.', 'error');
                }
            } catch (error) {
                hideLoading();
                showMessage('Network error. Please try again.', 'error');
                console.error('Registration error:', error);
            }
        });
    }

    // Utility Functions
    function showMessage(message, type) {
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
        
        // Auto-hide error messages after 5 seconds
        if (type === 'error') {
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 5000);
        }
    }

    function showLoading() {
        const submitBtn = document.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="loading"></span> Processing...';
        }
    }

    function hideLoading() {
        const submitBtn = document.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            if (loginForm) {
                submitBtn.textContent = 'Login';
            } else if (registerForm) {
                submitBtn.textContent = 'Register';
            }
        }
    }
});