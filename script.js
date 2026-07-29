// 1. CONFIGURATION & CONSTANTS

const CONFIG = {
    STORAGE_KEY: 'expenseTrackerData',
    SETTINGS_KEY: 'expenseTrackerSettings',
    TOAST_DURATION: 3000,
    ANIMATION_DELAY: 300,
};

const CATEGORIES = {
    Income: ['Salary', 'Business', 'Freelancing', 'Investment', 'Bonus', 'Gift', 'Refund', 'Other'],
    Expense: ['Food', 'Shopping', 'Travel', 'Fuel', 'Medical', 'Bills', 'Entertainment', 'Education', 'Rent', 'Groceries', 'Subscription', 'EMI', 'Insurance', 'Taxes', 'Clothing', 'Mobile Recharge', 'Internet', 'Pets', 'Donation', 'Other']
};

// 2. STATE MANAGEMENT

let appState = {
    transactions: [],
    filters: {
        type: 'all',
        category: '',
        searchQuery: '',
        sortBy: 'newest'
    },
    settings: {
        darkMode: false
    },
    editingId: null
};

// 3. DOM ELEMENT CACHING

const DOM = {
    // Containers
    appContainer: document.getElementById('appContainer'),
    loadingSpinner: document.getElementById('loadingSpinner'),
    mainContent: document.querySelector('.main-content'),
    
    // Header
    currentDate: document.getElementById('currentDate'),
    currentTime: document.getElementById('currentTime'),
    darkModeToggle: document.getElementById('darkModeToggle'),
    
    // Hero
    heroCtaBtn: document.getElementById('heroCtaBtn'),
    
    // Summary Cards
    totalIncomeDisplay: document.getElementById('totalIncomeDisplay'),
    totalExpenseDisplay: document.getElementById('totalExpenseDisplay'),
    currentBalanceDisplay: document.getElementById('currentBalanceDisplay'),
    totalTransactionsDisplay: document.getElementById('totalTransactionsDisplay'),
    
    // Form
    transactionForm: document.getElementById('transactionForm'),
    transactionType: document.getElementById('transactionType'),
    amount: document.getElementById('amount'),
    title: document.getElementById('title'),
    category: document.getElementById('category'),
    date: document.getElementById('date'),
    notes: document.getElementById('notes'),
    saveBtn: document.getElementById('saveBtn'),
    titleCount: document.getElementById('titleCount'),
    notesCount: document.getElementById('notesCount'),
    
    // Filters
    searchInput: document.getElementById('searchInput'),
    typeFilterBtns: document.querySelectorAll('.filter-btn'),
    categoryFilter: document.getElementById('categoryFilter'),
    sortOptions: document.getElementById('sortOptions'),
    clearFiltersBtn: document.getElementById('clearFiltersBtn'),
    
    // Statistics
    monthlyIncome: document.getElementById('monthlyIncome'),
    monthlyExpense: document.getElementById('monthlyExpense'),
    monthlySavings: document.getElementById('monthlySavings'),
    savingsRate: document.getElementById('savingsRate'),
    todayIncome: document.getElementById('todayIncome'),
    todaySpending: document.getElementById('todaySpending'),
    avgExpense: document.getElementById('avgExpense'),
    avgIncome: document.getElementById('avgIncome'),
    highestExpense: document.getElementById('highestExpense'),
    highestIncome: document.getElementById('highestIncome'),
    topSpending: document.getElementById('topSpending'),
    topIncome: document.getElementById('topIncome'),
    mostFrequent: document.getElementById('mostFrequent'),
    
    // Recent Activity
    recentActivityContainer: document.getElementById('recentActivityContainer'),
    
    // Transaction History
    tableContainer: document.getElementById('tableContainer'),
    tableBody: document.getElementById('tableBody'),
    cardsContainer: document.getElementById('cardsContainer'),
    emptyState: document.getElementById('emptyState'),
    emptyStateBtn: document.getElementById('emptyStateBtn'),
    
    // Data Management
    exportBtn: document.getElementById('exportBtn'),
    importBtn: document.getElementById('importBtn'),
    importFile: document.getElementById('importFile'),
    clearAllBtn: document.getElementById('clearAllBtn'),
    
    // Modal
    confirmModal: document.getElementById('confirmModal'),
    modalTitle: document.getElementById('modalTitle'),
    modalMessage: document.getElementById('modalMessage'),
    modalCancelBtn: document.getElementById('modalCancelBtn'),
    modalConfirmBtn: document.getElementById('modalConfirmBtn'),
    modalClose: document.querySelector('.modal-close'),
    
    // Toast
    toastContainer: document.getElementById('toastContainer'),
    
    // Footer
    currentYear: document.getElementById('currentYear')
};


function initializeApp() {
    // Set current year in footer
    DOM.currentYear.textContent = new Date().getFullYear();
    
    // Load data from localStorage
    loadData();
    loadSettings();
    
    // Set initial date
    DOM.date.valueAsDate = new Date();
    
    // Populate category dropdowns
    populateCategoryDropdowns();
    
    // Setup event listeners
    setupEventListeners();
    
    // Update dashboard
    updateDashboard();
    
    // Start time update
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // Show app after loading
    setTimeout(() => {
        DOM.loadingSpinner.style.display = 'none';
        DOM.appContainer.style.display = 'flex';
    }, CONFIG.ANIMATION_DELAY);
}


function setupEventListeners() {
    // Form
    DOM.transactionForm.addEventListener('submit', handleFormSubmit);
    DOM.transactionType.addEventListener('change', updateCategoryOptions);
    DOM.title.addEventListener('input', updateCharCount);
    DOM.notes.addEventListener('input', updateNotesCount);
    
    // Filters
    DOM.searchInput.addEventListener('input', handleSearch);
    DOM.typeFilterBtns.forEach(btn => {
        btn.addEventListener('click', handleTypeFilter);
    });
    DOM.categoryFilter.addEventListener('change', handleCategoryFilter);
    DOM.sortOptions.addEventListener('change', handleSort);
    DOM.clearFiltersBtn.addEventListener('click', clearAllFilters);
    
    // Buttons
    DOM.heroCtaBtn.addEventListener('click', scrollToForm);
    DOM.emptyStateBtn.addEventListener('click', scrollToForm);
    DOM.darkModeToggle.addEventListener('click', toggleDarkMode);
    DOM.exportBtn.addEventListener('click', exportToCSV);
    DOM.importBtn.addEventListener('click', () => DOM.importFile.click());
    DOM.importFile.addEventListener('change', handleImportCSV);
    DOM.clearAllBtn.addEventListener('click', handleClearAll);
    
    // Modal
    DOM.modalCancelBtn.addEventListener('click', hideModal);
    DOM.modalConfirmBtn.addEventListener('click', handleModalConfirm);
    DOM.modalClose.addEventListener('click', hideModal);
    DOM.confirmModal.addEventListener('click', (e) => {
        if (e.target === DOM.confirmModal) hideModal();
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// 5. DATE & TIME MANAGEMENT
function updateDateTime() {
    const now = new Date();
    
    // Format date
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    DOM.currentDate.textContent = now.toLocaleDateString('en-US', options);
    
    // Format time
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    DOM.currentTime.textContent = `${hours}:${minutes}`;
}

// Get today's date in YYYY-MM-DD format
 
function getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

//  Get current month in YYYY-MM format 

function getCurrentMonth() {
    const now = new Date();
    return now.toISOString().slice(0, 7);
}

function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// 6. FORM HANDLING

function populateCategoryDropdowns() {
    updateCategoryOptions();
    
    // Populate category filter
    const filterOptions = ['<option value="">All Categories</option>'];
    Object.values(CATEGORIES).flat().forEach(cat => {
        filterOptions.push(`<option value="${cat}">${cat}</option>`);
    });
    DOM.categoryFilter.innerHTML = filterOptions.join('');
}


function updateCategoryOptions() {
    const type = DOM.transactionType.value;
    const categories = CATEGORIES[type] || [];
    
    const options = ['<option value="">Select Category</option>'];
    categories.forEach(cat => {
        options.push(`<option value="${cat}">${cat}</option>`);
    });
    
    DOM.category.innerHTML = options.join('');
}


function updateCharCount() {
    DOM.titleCount.textContent = DOM.title.value.length;
}


function updateNotesCount() {
    DOM.notesCount.textContent = DOM.notes.value.length;
}


function validateForm() {
    const errors = {};
    
    // Validate type
    if (!DOM.transactionType.value) {
        errors.type = 'Please select a transaction type';
    }
    
    // Validate amount
    const amountValue = parseFloat(DOM.amount.value);
    if (!DOM.amount.value) {
        errors.amount = 'Amount is required';
    } else if (amountValue <= 0) {
        errors.amount = 'Amount must be greater than zero';
    }
    
    // Validate title
    if (!DOM.title.value.trim()) {
        errors.title = 'Title is required';
    }
    
    // Validate category
    if (!DOM.category.value) {
        errors.category = 'Category is required';
    }
    
    // Validate date
    if (!DOM.date.value) {
        errors.date = 'Date is required';
    }
    
    // Display errors
    displayFormErrors(errors);
    
    return Object.keys(errors).length === 0;
}


function displayFormErrors(errors) {
    // Clear all errors first
    document.querySelectorAll('.error-message').forEach(el => {
        el.classList.remove('show');
    });
    document.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(el => {
        el.classList.remove('error');
    });
    
    // Display new errors
    Object.keys(errors).forEach(field => {
        const errorEl = document.getElementById(`${field}Error`);
        if (errorEl) {
            errorEl.textContent = errors[field];
            errorEl.classList.add('show');
        }
        
        const inputEl = document.getElementById(field);
        if (inputEl) {
            inputEl.classList.add('error');
        }
    });
}


function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) {
        showToast('Please fix the errors above', 'error');
        return;
    }
    
    const transaction = {
        id: appState.editingId || generateUniqueID(),
        type: DOM.transactionType.value,
        title: DOM.title.value.trim(),
        category: DOM.category.value,
        amount: parseFloat(DOM.amount.value),
        date: DOM.date.value,
        notes: DOM.notes.value.trim(),
        createdAt: appState.editingId ? getTransactionById(appState.editingId).createdAt : new Date().toDateString(),
        updatedAt: new Date().toDateString()
    };
    
    if (appState.editingId) {
        // Update existing transaction
        const index = appState.transactions.findIndex(t => t.id === appState.editingId);
        if (index !== -1) {
            appState.transactions[index] = transaction;
            showToast('Transaction updated successfully', 'success');
            appState.editingId = null;
        }
    } else {
        // Add new transaction
        appState.transactions.unshift(transaction);
        showToast('Transaction added successfully', 'success');
    }
    
    saveData();
    updateDashboard();
    DOM.transactionForm.reset();
    DOM.date.valueAsDate = new Date();
    updateCategoryOptions();
    
    // Clear errors
    document.querySelectorAll('.error-message').forEach(el => el.classList.remove('show'));
    document.querySelectorAll('.form-input, .form-select').forEach(el => el.classList.remove('error'));
}


function editTransaction(id) {
    const transaction = getTransactionById(id);
    if (!transaction) return;
    
    appState.editingId = id;
    
    DOM.transactionType.value = transaction.type;
    updateCategoryOptions();
    DOM.amount.value = transaction.amount;
    DOM.title.value = transaction.title;
    DOM.category.value = transaction.category;
    DOM.date.value = transaction.date;
    DOM.notes.value = transaction.notes;
    
    updateCharCount();
    updateNotesCount();
    
    // Scroll to form
    scrollToForm();
    
    // Focus on first field
    DOM.transactionType.focus();
}


function resetFormForNew() {
    appState.editingId = null;
    DOM.transactionForm.reset();
    DOM.date.valueAsDate = new Date();
    updateCategoryOptions();
    updateCharCount();
    updateNotesCount();
}

function scrollToForm() {
    const formSection = document.querySelector('.form-section');
    formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// 7. TRANSACTION MANAGEMENT

function getTransactionById(id) {
    return appState.transactions.find(t => t.id === id);
}


function deleteTransaction(id) {
    appState.transactions = appState.transactions.filter(t => t.id !== id);
    saveData();
    updateDashboard();
    showToast('Transaction deleted successfully', 'success');
}


function generateUniqueID() {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getFilteredTransactions() {
    let filtered = [...appState.transactions];
    
    // Type filter
    if (appState.filters.type !== 'all') {
        filtered = filtered.filter(t => t.type === appState.filters.type);
    }
    
    // Category filter
    if (appState.filters.category) {
        filtered = filtered.filter(t => t.category === appState.filters.category);
    }
    
    // Search filter
    if (appState.filters.searchQuery) {
        const query = appState.filters.searchQuery.toLowerCase();
        filtered = filtered.filter(t => 
            t.title.toLowerCase().includes(query) ||
            t.category.toLowerCase().includes(query) ||
            t.notes.toLowerCase().includes(query) ||
            t.amount.toString().includes(query) ||
            t.date.includes(query)
        );
    }
    
    // Sort
    filtered = sortTransactions(filtered, appState.filters.sortBy);
    
    return filtered;
}

function sortTransactions(transactions, sortBy) {
    const sorted = [...transactions];
    
    switch (sortBy) {
        case 'newest':
            sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'oldest':
            sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
        case 'highest':
            sorted.sort((a, b) => b.amount - a.amount);
            break;
        case 'lowest':
            sorted.sort((a, b) => a.amount - b.amount);
            break;
        case 'alphabetical':
            sorted.sort((a, b) => a.title.localeCompare(b.title));
            break;
    }
    
    return sorted;
}

// 8. FILTERING & SEARCH

function handleSearch(e) {
    appState.filters.searchQuery = e.target.value;
    updateDashboard();
}

function handleTypeFilter(e) {
    const filter = e.target.dataset.filter;
    appState.filters.type = filter;
    
    // Update active state
    DOM.typeFilterBtns.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    
    updateDashboard();
}


function handleCategoryFilter(e) {
    appState.filters.category = e.target.value;
    updateDashboard();
}

function handleSort(e) {
    appState.filters.sortBy = e.target.value;
    updateDashboard();
}


function clearAllFilters() {
    appState.filters = {
        type: 'all',
        category: '',
        searchQuery: '',
        sortBy: 'newest'
    };
    
    DOM.searchInput.value = '';
    DOM.categoryFilter.value = '';
    DOM.sortOptions.value = 'newest';
    
    DOM.typeFilterBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === 'all') btn.classList.add('active');
    });
    
    updateDashboard();
    showToast('Filters cleared', 'info');
}

// 9. CALCULATIONS & STATISTICS

function calculateSummary() {
    const summary = {
        totalIncome: 0,
        totalExpense: 0,
        totalTransactions: appState.transactions.length,
        highestIncome: 0,
        highestExpense: 0,
        avgIncome: 0,
        avgExpense: 0,
        incomeCount: 0,
        expenseCount: 0
    };
    
    appState.transactions.forEach(t => {
        if (t.type === 'Income') {
            summary.totalIncome += t.amount;
            summary.highestIncome = Math.max(summary.highestIncome, t.amount);
            summary.incomeCount++;
        } else {
            summary.totalExpense += t.amount;
            summary.highestExpense = Math.max(summary.highestExpense, t.amount);
            summary.expenseCount++;
        }
    });
    
    summary.avgIncome = summary.incomeCount > 0 ? summary.totalIncome / summary.incomeCount : 0;
    summary.avgExpense = summary.expenseCount > 0 ? summary.totalExpense / summary.expenseCount : 0;
    summary.currentBalance = summary.totalIncome - summary.totalExpense;
    
    return summary;
}


function calculateMonthlyStatistics() {
    const currentMonth = getCurrentMonth();
    const monthly = {
        income: 0,
        expense: 0,
        savings: 0,
        savingsRate: 0
    };
    
    appState.transactions.forEach(t => {
        if (t.date.startsWith(currentMonth)) {
            if (t.type === 'Income') {
                monthly.income += t.amount;
            } else {
                monthly.expense += t.amount;
            }
        }
    });
    
    monthly.savings = monthly.income - monthly.expense;
    monthly.savingsRate = monthly.income > 0 ? (monthly.savings / monthly.income) * 100 : 0;
    
    return monthly;
}

function calculateTodayStatistics() {
    const today = getTodayDate();
    const stats = {
        income: 0,
        expense: 0
    };
    
    appState.transactions.forEach(t => {
        if (t.date === today) {
            if (t.type === 'Income') {
                stats.income += t.amount;
            } else {
                stats.expense += t.amount;
            }
        }
    });
    
    return stats;
}


function calculateTopCategories() {
    const categoryStats = {};
    
    appState.transactions.forEach(t => {
        if (!categoryStats[t.category]) {
            categoryStats[t.category] = { amount: 0, count: 0, type: t.type };
        }
        categoryStats[t.category].amount += t.amount;
        categoryStats[t.category].count++;
    });
    
    const topSpending = Object.entries(categoryStats)
        .filter(([_, stats]) => stats.type === 'Expense')
        .sort((a, b) => b[1].amount - a[1].amount)[0];
    
    const topIncome = Object.entries(categoryStats)
        .filter(([_, stats]) => stats.type === 'Income')
        .sort((a, b) => b[1].amount - a[1].amount)[0];
    
    const mostFrequent = Object.entries(categoryStats)
        .sort((a, b) => b[1].count - a[1].count)[0];
    
    return {
        topSpending: topSpending ? topSpending[0] : '-',
        topIncome: topIncome ? topIncome[0] : '-',
        mostFrequent: mostFrequent ? mostFrequent[0] : '-'
    };
}

// 10. DASHBOARD UPDATE

function updateDashboard() {
    updateSummaryCards();
    updateStatistics();
    updateRecentActivity();
    renderTransactions();
    saveSettings();
}

function updateSummaryCards() {
    const summary = calculateSummary();
    
    DOM.totalIncomeDisplay.textContent = formatCurrency(summary.totalIncome);
    DOM.totalExpenseDisplay.textContent = formatCurrency(summary.totalExpense);
    DOM.currentBalanceDisplay.textContent = formatCurrency(summary.currentBalance);
    DOM.totalTransactionsDisplay.textContent = summary.totalTransactions;
    
    // Animate numbers
    animateNumber(DOM.totalIncomeDisplay, summary.totalIncome);
    animateNumber(DOM.totalExpenseDisplay, summary.totalExpense);
    animateNumber(DOM.currentBalanceDisplay, summary.currentBalance);
}

function updateStatistics() {
    const summary = calculateSummary();
    const monthly = calculateMonthlyStatistics();
    const today = calculateTodayStatistics();
    const topCats = calculateTopCategories();
    
    // Monthly
    DOM.monthlyIncome.textContent = formatCurrency(monthly.income);
    DOM.monthlyExpense.textContent = formatCurrency(monthly.expense);
    DOM.monthlySavings.textContent = formatCurrency(monthly.savings);
    DOM.savingsRate.textContent = monthly.savingsRate.toFixed(1) + '%';
    
    // Today
    DOM.todayIncome.textContent = formatCurrency(today.income);
    DOM.todaySpending.textContent = formatCurrency(today.expense);
    
    // Averages & Highs
    DOM.avgExpense.textContent = formatCurrency(summary.avgExpense);
    DOM.avgIncome.textContent = formatCurrency(summary.avgIncome);
    DOM.highestExpense.textContent = formatCurrency(summary.highestExpense);
    DOM.highestIncome.textContent = formatCurrency(summary.highestIncome);
    
    // Top Categories
    DOM.topSpending.textContent = topCats.topSpending;
    DOM.topIncome.textContent = topCats.topIncome;
    DOM.mostFrequent.textContent = topCats.mostFrequent;
}

function updateRecentActivity() {
    const recentTransactions = appState.transactions.slice(0, 5);
    
    if (recentTransactions.length === 0) {
        DOM.recentActivityContainer.innerHTML = '<div class="empty-state"><p>No recent transactions</p></div>';
        return;
    }
    
    const html = recentTransactions.map(t => `
        <div class="activity-item">
            <div class="activity-info">
                <div class="activity-title">${escapeHtml(t.title)}</div>
                <div class="activity-meta">${t.category} • ${formatDate(t.date)}</div>
            </div>
            <div class="activity-amount ${t.type.toLowerCase()}">
                ${t.type === 'Income' ? '+' : '-'}${formatCurrency(t.amount)}
            </div>
        </div>
    `).join('');
    
    DOM.recentActivityContainer.innerHTML = html;
}


function renderTransactions() {
    const filtered = getFilteredTransactions();
    
    if (filtered.length === 0) {
        DOM.tableContainer.style.display = 'none';
        DOM.cardsContainer.innerHTML = '<div class="empty-state"><p>No transactions found</p></div>';
        DOM.cardsContainer.style.display = 'grid';
        return;
    }
    
    // Render table
    renderTable(filtered);
    
    // Render cards
    renderCards(filtered);
}

function renderTable(transactions) {
    const rows = transactions.map(t => `
        <tr>
            <td>${t.id.substring(0, 8)}</td>
            <td class="type-${t.type.toLowerCase()}">${t.type}</td>
            <td>${escapeHtml(t.title)}</td>
            <td>${t.category}</td>
            <td class="amount">${formatCurrency(t.amount)}</td>
            <td>${formatDate(t.date)}</td>
            <td>${escapeHtml(t.notes.substring(0, 30))}${t.notes.length > 30 ? '...' : ''}</td>
            <td>
                <button class="btn btn-sm btn-outline" onclick="editTransaction('${t.id}')" title="Edit">✎</button>
                <button class="btn btn-sm btn-outline" onclick="showDeleteConfirm('${t.id}')" title="Delete">🗑</button>
            </td>
        </tr>
    `).join('');
    
    DOM.tableBody.innerHTML = rows || '<tr class="empty-row"><td colspan="8" class="empty-message">No transactions found</td></tr>';
}

function renderCards(transactions) {
    const cards = transactions.map(t => `
        <div class="transaction-card">
            <div class="transaction-card-header">
                <div class="transaction-card-title">${escapeHtml(t.title)}</div>
                <span class="transaction-card-type ${t.type.toLowerCase()}">${t.type}</span>
            </div>
            <div class="transaction-card-body">
                <div class="transaction-card-field">
                    <span class="transaction-card-label">Category</span>
                    <span class="transaction-card-value">${t.category}</span>
                </div>
                <div class="transaction-card-field">
                    <span class="transaction-card-label">Date</span>
                    <span class="transaction-card-value">${formatDate(t.date)}</span>
                </div>
                <div class="transaction-card-field">
                    <span class="transaction-card-label">Amount</span>
                    <span class="transaction-card-amount ${t.type.toLowerCase()}">
                        ${t.type === 'Income' ? '+' : '-'}${formatCurrency(t.amount)}
                    </span>
                </div>
                ${t.notes ? `
                <div class="transaction-card-field">
                    <span class="transaction-card-label">Notes</span>
                    <span class="transaction-card-value">${escapeHtml(t.notes.substring(0, 50))}</span>
                </div>
                ` : ''}
            </div>
            <div class="transaction-card-actions">
                <button class="btn btn-sm btn-outline" onclick="editTransaction('${t.id}')">Edit</button>
                <button class="btn btn-sm btn-outline" onclick="showDeleteConfirm('${t.id}')">Delete</button>
            </div>
        </div>
    `).join('');
    
    DOM.cardsContainer.innerHTML = cards;
}

// 11. DATA PERSISTENCE

function saveData() {
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(appState.transactions));
}


function loadData() {
    try {
        const data = localStorage.getItem(CONFIG.STORAGE_KEY);
        appState.transactions = data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error loading data:', error);
        appState.transactions = [];
        showToast('Error loading data. Starting fresh.', 'error');
    }
}


function saveSettings() {
    appState.settings.darkMode = document.body.classList.contains('dark-mode');
    appState.settings.filters = appState.filters;
    localStorage.setItem(CONFIG.SETTINGS_KEY, JSON.stringify(appState.settings));
}

function loadSettings() {
    try {
        const settings = localStorage.getItem(CONFIG.SETTINGS_KEY);
        if (settings) {
            appState.settings = JSON.parse(settings);
            
            // Apply dark mode
            if (appState.settings.darkMode) {
                document.body.classList.add('dark-mode');
                DOM.darkModeToggle.querySelector('.icon').textContent = '🌙';
            }
            
            // Restore filters
            if (appState.settings.filters) {
                appState.filters = appState.settings.filters;
                DOM.searchInput.value = appState.filters.searchQuery;
                DOM.categoryFilter.value = appState.filters.category;
                DOM.sortOptions.value = appState.filters.sortBy;
                
                // Update type filter buttons
                DOM.typeFilterBtns.forEach(btn => {
                    if (btn.dataset.filter === appState.filters.type) {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                });
            }
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// 12. DARK MODE

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    
    const isDarkMode = document.body.classList.contains('dark-mode');
    DOM.darkModeToggle.querySelector('.icon').textContent = isDarkMode ? '🌙' : '☀️';
    
    appState.settings.darkMode = isDarkMode;
    saveSettings();
    
    showToast(`Dark mode ${isDarkMode ? 'enabled' : 'disabled'}`, 'info');
}

// 13. IMPORT/EXPORT

function exportToCSV() {
    if (appState.transactions.length === 0) {
        showToast('No transactions to export', 'warning');
        return;
    }
    
    const headers = ['ID', 'Type', 'Title', 'Category', 'Amount', 'Date', 'Notes'];
    const rows = appState.transactions.map(t => [
        t.id,
        t.type,
        `"${t.title}"`,
        t.category,
        t.amount,
        t.date,
        `"${t.notes}"`
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    const today = new Date();
    const dateStr = `${today.getFullYear()}_${String(today.getMonth() + 1).padStart(2, '0')}_${String(today.getDate()).padStart(2, '0')}`;
    a.download = `ExpenseTracker_${dateStr}.csv`;
    
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    showToast('Exported successfully', 'success');
}


function handleImportCSV(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const csv = event.target.result;
            const lines = csv.split('\n');
            
            if (lines.length < 2) {
                showToast('Invalid CSV file', 'error');
                return;
            }
            
            let imported = 0;
            
            // Skip header
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;
                
                const parts = parseCSVLine(line);
                if (parts.length < 6) continue;
                
                const transaction = {
                    id: parts[0] || generateUniqueID(),
                    type: parts[1],
                    title: parts[2],
                    category: parts[3],
                    amount: parseFloat(parts[4]),
                    date: parts[5],
                    notes: parts[6] || '',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                
                // Validate
                if (transaction.type && transaction.title && transaction.amount > 0 && transaction.date) {
                    appState.transactions.push(transaction);
                    imported++;
                }
            }
            
            if (imported > 0) {
                saveData();
                updateDashboard();
                showToast(`Imported ${imported} transactions successfully`, 'success');
            } else {
                showToast('No valid transactions found in CSV', 'warning');
            }
        } catch (error) {
            console.error('Error importing CSV:', error);
            showToast('Error importing CSV file', 'error');
        }
    };
    
    reader.readAsText(file);
    DOM.importFile.value = '';
}


function parseCSVLine(line) {
    const result = [];
    let current = '';
    let insideQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current.trim());
    return result;
}

// 14. MODAL & CONFIRMATION
function showModal(title, message, onConfirm) {
    DOM.modalTitle.textContent = title;
    DOM.modalMessage.textContent = message;
    DOM.confirmModal.classList.add('active');
    DOM.confirmModal.dataset.callback = onConfirm;
}


function hideModal() {
    DOM.confirmModal.classList.remove('active');
    delete DOM.confirmModal.dataset.callback;
}


function handleModalConfirm() {
    const callback = DOM.confirmModal.dataset.callback;
    if (callback && window[callback]) {
        window[callback]();
    }
    hideModal();
}

function showDeleteConfirm(id) {
    showModal(
        'Delete Transaction',
        'Are you sure you want to delete this transaction? This action cannot be undone.',
        `confirmDeleteTransaction('${id}')`
    );
}

function confirmDeleteTransaction(id) {
    deleteTransaction(id);
}

function handleClearAll() {
    showModal(
        'Clear All Transactions',
        'Are you sure you want to delete all transactions? This action cannot be undone.',
        'confirmClearAll'
    );
}


function confirmClearAll() {
    appState.transactions = [];
    appState.editingId = null;
    saveData();
    updateDashboard();
    DOM.transactionForm.reset();
    DOM.date.valueAsDate = new Date();
    showToast('All transactions cleared', 'success');
}

//  NOTIFICATIONS (TOAST)
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    
    toast.innerHTML = `
        <div class="toast-icon">${icons[type]}</div>
        <div class="toast-content">
            <p class="toast-message">${escapeHtml(message)}</p>
        </div>
    `;
    
    DOM.toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    }, CONFIG.TOAST_DURATION);
}

// 16. KEYBOARD SHORTCUTS


function handleKeyboardShortcuts(e) {
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        resetFormForNew();
        scrollToForm();
    }
    
    if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        DOM.searchInput.focus();
    }

    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        DOM.transactionForm.dispatchEvent(new Event('submit'));
    }
    
    if (e.key === 'Escape') {
        if (DOM.confirmModal.classList.contains('active')) {
            hideModal();
        }
    }
}

//  UTILITY FUNCTIONS
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

function animateNumber(element, target) {
    const current = parseFloat(element.textContent.replace(/[^0-9.-]/g, '')) || 0;
    const duration = 500;
    const steps = 30;
    const increment = (target - current) / steps;
    let step = 0;
    
    const timer = setInterval(() => {
        step++;
        const value = current + (increment * step);
        element.textContent = formatCurrency(value);
        
        if (step >= steps) {
            element.textContent = formatCurrency(target);
            clearInterval(timer);
        }
    }, duration / steps);
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}


// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
