// Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const expenseForm = document.getElementById('expenseForm');
    const expenseList = document.getElementById('expenseList');
    const totalExpensesElement = document.getElementById('totalExpenses');
    const expenseCountElement = document.getElementById('expenseCount');
    const messageDiv = document.getElementById('message');
    const logoutBtn = document.getElementById('logoutBtn');

    let expenses = [];

    // Initialize dashboard
    init();

    // Add Expense Form Handler
    expenseForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(expenseForm);
        const expenseData = {
            name: formData.get('name'),
            category: formData.get('category'),
            amount: parseFloat(formData.get('amount'))
        };

        // Basic validation
        if (expenseData.amount <= 0) {
            showMessage('Amount must be greater than 0.', 'error');
            return;
        }

        try {
            showLoading();
            const response = await fetch('/task/addtask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Include cookies in the request
                body: JSON.stringify(expenseData)
            });

            const result = await response.text();
            hideLoading();

            console.log('Add expense response:', result); // Debug log

            if (response.ok && (result === 'Task created sucessfully' || result.includes('sucessfully'))) {
                showMessage('Expense added successfully!', 'success');
                expenseForm.reset();
                loadExpenses(); // Refresh the expense list
            } else {
                if (response.status === 401) {
                    window.location.href = 'index.html';
                    return;
                }
                showMessage(result || 'Failed to add expense. Please try again.', 'error');
            }
        } catch (error) {
            hideLoading();
            showMessage('Network error. Please try again.', 'error');
            console.error('Add expense error:', error);
        }
    });

    // Logout Handler
    logoutBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
            logout();
        }
    });

    // Initialize Dashboard
    function init() {
        // Don't redirect immediately, let loadExpenses handle auth check
        loadExpenses();
    }

    // Load expenses from server
    async function loadExpenses() {
        try {
            const response = await fetch('/task/showtask', {
                method: 'GET',
                credentials: 'include' // Include cookies in the request
            });
            
            console.log('Response status:', response.status); // Debug log
            
            if (!response.ok) {
                if (response.status === 401) {
                    console.log('Unauthorized, redirecting to login'); // Debug log
                    window.location.href = 'index.html';
                    return;
                }
                throw new Error('Failed to load expenses');
            }

            const result = await response.text();
            console.log('Expenses response:', result); // Debug log
            
            // Check if it's a "No tasks found" message
            if (result === 'No tasks found') {
                expenses = [];
                displayExpenses();
                updateSummary();
                return;
            }

            // Check for other error messages
            if (result === 'User not found') {
                console.log('User not found, redirecting to login');
                window.location.href = 'index.html';
                return;
            }

            // Try to parse as JSON
            try {
                const data = JSON.parse(result);
                console.log('Parsed data:', data); // Debug log
                
                if (data.taskList && Array.isArray(data.taskList)) {
                    expenses = data.taskList;
                } else if (Array.isArray(data)) {
                    expenses = data;
                } else {
                    expenses = [];
                }
                displayExpenses();
                updateSummary();
            } catch (parseError) {
                // If not JSON, it might be an error message
                console.log('Response:', result);
                expenses = [];
                displayExpenses();
                updateSummary();
            }
        } catch (error) {
            console.error('Load expenses error:', error);
            if (error.message.includes('401') || error.message.includes('unauthorized')) {
                window.location.href = 'index.html';
            } else {
                showMessage('Failed to load expenses.', 'error');
            }
        }
    }

    // Display expenses in the UI
    function displayExpenses() {
        if (expenses.length === 0) {
            expenseList.innerHTML = '<p class="no-expenses">No expenses found. Add your first expense above!</p>';
            return;
        }

        const expenseHTML = expenses.map(expense => {
            const date = new Date(expense.date).toLocaleDateString();
            const amount = parseFloat(expense.amount || 0).toFixed(2);
            return `
                <div class="expense-item" data-id="${expense.id}">
                    <div class="expense-name">${expense.name || 'Unnamed Expense'}</div>
                    <div class="expense-category">${expense.category || 'Other'}</div>
                    <div class="expense-amount">$${amount}</div>
                    <div class="expense-date">${date}</div>
                    <button class="btn-secondary edit-btn" data-id="${expense.id}">Edit</button>
                    <button class="btn-secondary delete-btn" data-id="${expense.id}">Delete</button>
                </div>
            `;
        }).join('');
        expenseList.innerHTML = expenseHTML;
        // Add event listeners for edit and delete
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = btn.getAttribute('data-id');
                const expense = expenses.find(exp => exp.id === id);
                if (expense) showEditModal(expense);
            });
        });
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = btn.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this expense?')) {
                    await deleteExpense(id);
                }
            });
        });
    }

    // Update summary statistics
    function updateSummary() {
        const totalAmount = expenses.reduce((sum, expense) => {
            return sum + parseFloat(expense.amount || 0);
        }, 0);
        const expenseCount = expenses.length;

        totalExpensesElement.textContent = `$${totalAmount.toFixed(2)}`;
        expenseCountElement.textContent = expenseCount;
    }

    // Logout function
    function logout() {
        // Clear any stored authentication data
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        
        // Redirect to login page
        window.location.href = 'index.html';
    }

    // Utility Functions
    function showMessage(message, type) {
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
        
        // Auto-hide messages after 4 seconds
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 4000);
    }

    function showLoading() {
        const submitBtn = expenseForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="loading"></span> Adding...';
        }
    }

    function hideLoading() {
        const submitBtn = expenseForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Add Expense';
        }
    }

    // Show Edit Modal
    function showEditModal(expense) {
        // Create modal HTML
        let modal = document.createElement('div');
        modal.className = 'modal-bg';
        modal.innerHTML = `
            <div class="modal-card">
                <h3>Edit Expense</h3>
                <form id="editExpenseForm">
                    <div class="form-group">
                        <label>Name:</label>
                        <input type="text" name="name" value="${expense.name}" required>
                    </div>
                    <div class="form-group">
                        <label>Category:</label>
                        <input type="text" name="category" value="${expense.category}" required>
                    </div>
                    <div class="form-group">
                        <label>Amount:</label>
                        <input type="number" name="amount" value="${expense.amount}" step="0.01" required>
                    </div>
                    <button type="submit" class="btn-primary">Save</button>
                    <button type="button" class="btn-secondary" id="closeModalBtn">Cancel</button>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
        // Close modal
        modal.querySelector('#closeModalBtn').onclick = () => document.body.removeChild(modal);
        // Handle form submit
        modal.querySelector('#editExpenseForm').onsubmit = async function(e) {
            e.preventDefault();
            const formData = new FormData(e.target);
            const updatedData = {
                name: formData.get('name'),
                category: formData.get('category'),
                amount: parseFloat(formData.get('amount'))
            };
            await editExpense(expense.id, updatedData);
            document.body.removeChild(modal);
        };
    }

    // Edit Expense API
    async function editExpense(id, updatedData) {
        try {
            const response = await fetch(`/task/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(updatedData)
            });
            const result = await response.json();
            if (response.ok) {
                showMessage('Expense updated successfully!', 'success');
                loadExpenses();
            } else {
                showMessage(result.message || 'Failed to update expense.', 'error');
            }
        } catch (error) {
            showMessage('Network error. Please try again.', 'error');
        }
    }

    // Delete Expense API
    async function deleteExpense(id) {
        try {
            const response = await fetch(`/task/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            const result = await response.json();
            if (response.ok) {
                showMessage('Expense deleted successfully!', 'success');
                loadExpenses();
            } else {
                showMessage(result.message || 'Failed to delete expense.', 'error');
            }
        } catch (error) {
            showMessage('Network error. Please try again.', 'error');
        }
    }

    // Auto-refresh expenses every 30 seconds
    setInterval(loadExpenses, 30000);
});