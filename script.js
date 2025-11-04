// Dados de exemplo (em um sistema real, isso viria de um backend)
let currentUser = null;

// Funções para gerenciar dados unificados
function getStudentsData() {
    const adminData = JSON.parse(localStorage.getItem('adminData') || '{"students":{}}');
    return adminData.students;
}

function saveStudentsData(students) {
    const adminData = JSON.parse(localStorage.getItem('adminData') || '{"students":{}, "pendingReceipts":[]}');
    adminData.students = students;
    localStorage.setItem('adminData', JSON.stringify(adminData));
}

// Verificar se o usuário está logado
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
    setupEventListeners();
});

function checkLoginStatus() {
    const user = localStorage.getItem('currentUser');
    if (user) {
        const userData = JSON.parse(user);
        
        // Se for admin, redirecionar para admin.html
        if (userData.isAdmin) {
            window.location.href = 'admin.html';
            return;
        }
        
        currentUser = userData;
        loadUserData();
    } else {
        // Redirecionar para a página de login se não estiver logado
        window.location.href = 'login.html';
    }
}

function setupEventListeners() {
    // Navegação
    document.getElementById('nav-dashboard').addEventListener('click', function(e) {
        e.preventDefault();
        showSection('dashboard');
    });
    
    document.getElementById('nav-transactions').addEventListener('click', function(e) {
        e.preventDefault();
        showSection('transactions');
        loadFullTransactions();
    });
    
    document.getElementById('nav-upload').addEventListener('click', function(e) {
        e.preventDefault();
        showSection('upload');
    });
    
    // Logout
    document.getElementById('logout-btn').addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });
    
    // Filtros
    document.getElementById('filter-type').addEventListener('change', loadFullTransactions);
    document.getElementById('filter-date').addEventListener('change', loadFullTransactions);
    
    // Formulário de comprovante
    document.getElementById('receipt-form').addEventListener('submit', handleReceiptSubmit);
    
    // Modal
    document.querySelector('.close').addEventListener('click', closeModal);
    document.getElementById('modal-cancel').addEventListener('click', closeModal);
    
    // Configurar data atual no formulário
    document.getElementById('receipt-date').valueAsDate = new Date();
}

function loadUserData() {
    if (!currentUser) return;
    
    const studentsData = getStudentsData();
    let userData = studentsData[currentUser.email];
    
    // Se não encontrar dados, criar dados temporários
    if (!userData) {
        userData = {
            name: currentUser.name,
            children: [
                {
                    id: Date.now(),
                    name: 'Aluno - Dados Temporários',
                    class: 'Entre em contato com a escola',
                    balance: 0.00,
                    transactions: [
                        {
                            id: 1,
                            date: new Date().toISOString().split('T')[0],
                            description: 'Sistema em configuração',
                            amount: 0.00,
                            type: 'credit'
                        }
                    ]
                }
            ]
        };
        
        // Salvar os dados temporários
        const adminData = JSON.parse(localStorage.getItem('adminData') || '{"pendingReceipts":[], "students":{}}');
        adminData.students[currentUser.email] = userData;
        localStorage.setItem('adminData', JSON.stringify(adminData));
    }
    
    // Atualizar informações do usuário
    document.getElementById('user-name').textContent = userData.name;
    
    // Para simplificar, vamos mostrar apenas o primeiro filho
    const student = userData.children[0];
    
    // Atualizar informações do aluno
    document.getElementById('student-name').textContent = student.name;
    document.getElementById('student-class').textContent = `Turma: ${student.class}`;
    document.getElementById('current-balance').textContent = `R$ ${student.balance.toFixed(2)}`;
    
    // Carregar transações recentes
    loadRecentTransactions(student.transactions);
}

function loadRecentTransactions(transactions) {
    const container = document.getElementById('transactions-list');
    container.innerHTML = '';
    
    // Ordenar transações por data (mais recentes primeiro)
    const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Pegar apenas as 5 mais recentes
    const recentTransactions = sortedTransactions.slice(0, 5);
    
    recentTransactions.forEach(transaction => {
        const transactionElement = createTransactionElement(transaction);
        container.appendChild(transactionElement);
    });
}

function loadFullTransactions() {
    if (!currentUser) return;
    
    const studentsData = getStudentsData();
    const userData = studentsData[currentUser.email];
    if (!userData) return;
    
    const student = userData.children[0];
    const container = document.getElementById('full-transactions-list');
    container.innerHTML = '';
    
    // Aplicar filtros
    const typeFilter = document.getElementById('filter-type').value;
    const dateFilter = document.getElementById('filter-date').value;
    
    let filteredTransactions = student.transactions;
    
    if (typeFilter !== 'all') {
        filteredTransactions = filteredTransactions.filter(t => t.type === typeFilter);
    }
    
    if (dateFilter) {
        filteredTransactions = filteredTransactions.filter(t => t.date === dateFilter);
    }
    
    // Ordenar por data (mais recentes primeiro)
    filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (filteredTransactions.length === 0) {
        container.innerHTML = '<p class="no-transactions">Nenhuma transação encontrada.</p>';
        return;
    }
    
    filteredTransactions.forEach(transaction => {
        const transactionElement = createTransactionElement(transaction);
        container.appendChild(transactionElement);
    });
}

function createTransactionElement(transaction) {
    const div = document.createElement('div');
    div.className = 'transaction-item';
    
    const date = new Date(transaction.date);
    const formattedDate = date.toLocaleDateString('pt-BR');
    
    div.innerHTML = `
        <div class="transaction-date">${formattedDate}</div>
        <div class="transaction-description">${transaction.description}</div>
        <div class="transaction-amount ${transaction.type}">
            ${transaction.type === 'credit' ? '+' : '-'} R$ ${transaction.amount.toFixed(2)}
        </div>
    `;
    
    return div;
}

function showSection(sectionId) {
    // Esconder todas as seções
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Mostrar a seção selecionada
    document.getElementById(sectionId).classList.add('active');
}

function handleReceiptSubmit(e) {
    e.preventDefault();
    
    const amount = parseFloat(document.getElementById('receipt-amount').value);
    const date = document.getElementById('receipt-date').value;
    const file = document.getElementById('receipt-file').files[0];
    
    if (!amount || amount <= 0) {
        alert('Por favor, insira um valor válido.');
        return;
    }
    
    if (!date) {
        alert('Por favor, selecione uma data.');
        return;
    }
    
    if (!file) {
        alert('Por favor, selecione um comprovante.');
        return;
    }
    
    // Simular envio do comprovante
    showModal(
        'Enviar Comprovante',
        `Confirma o envio do comprovante no valor de R$ ${amount.toFixed(2)}?`,
        function() {
            // Ler a imagem como base64 (simulação)
            const reader = new FileReader();
            reader.onload = function(e) {
                const adminData = JSON.parse(localStorage.getItem('adminData') || '{"pendingReceipts":[], "students":{}}');
                
                // Encontrar o aluno do usuário atual
                const studentsData = getStudentsData();
                const userData = studentsData[currentUser.email];
                if (!userData || !userData.children[0]) {
                    alert('Erro: Dados do aluno não encontrados.');
                    return;
                }
                
                const studentId = userData.children[0].id;
                
                const newReceipt = {
                    id: Date.now(),
                    studentId: studentId,
                    parentEmail: currentUser.email,
                    amount: amount,
                    date: date,
                    image: e.target.result,
                    status: 'pending'
                };
                
                adminData.pendingReceipts.push(newReceipt);
                localStorage.setItem('adminData', JSON.stringify(adminData));
                
                alert('Comprovante enviado com sucesso! Aguarde a confirmação do administrador.');
                
                // Limpar formulário
                document.getElementById('receipt-form').reset();
                document.getElementById('receipt-date').valueAsDate = new Date();
                
                closeModal();
            };
            reader.readAsDataURL(file);
        }
    );
}

function showModal(title, message, confirmCallback) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-message').textContent = message;
    document.getElementById('modal').style.display = 'block';
    
    // Configurar callback de confirmação
    document.getElementById('modal-confirm').onclick = confirmCallback;
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}