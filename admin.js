// Funções para gerenciar dados unificados
function getAdminData() {
    return JSON.parse(localStorage.getItem('adminData') || '{"pendingReceipts":[], "students":{}}');
}

function saveAdminData(data) {
    localStorage.setItem('adminData', JSON.stringify(data));
}

// Adicione esta função para gerenciar usuários
function getUsers() {
    return JSON.parse(localStorage.getItem('users') || '{}');
}

function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// Função para migrar usuários antigos
function migrateOldUsers() {
    const users = getUsers();
    const adminData = getAdminData();
    let needsSave = false;

    // Verificar todos os pais nos dados do admin
    for (const parentEmail in adminData.students) {
        const parentData = adminData.students[parentEmail];
        
        // Se o usuário não existe mas tem dados no admin, criar
        if (!users[parentEmail] && parentData.name) {
            // Gerar senha padrão baseada no nome
            const defaultPassword = parentData.name.toLowerCase().replace(/\s+/g, '').substring(0, 6) + '123';
            
            users[parentEmail] = {
                password: defaultPassword,
                name: parentData.name,
                isAdmin: false
            };
            needsSave = true;
            console.log(`Usuário migrado: ${parentEmail} com senha: ${defaultPassword}`);
        }
    }

    if (needsSave) {
        saveUsers(users);
        alert('Usuários antigos migrados com sucesso! As senhas foram definidas como: nome123');
    }
}

function findStudentById(studentId, studentsData) {
    for (const parentEmail in studentsData) {
        const student = studentsData[parentEmail].children.find(child => child.id === studentId);
        if (student) return student;
    }
    return null;
}

function initializeAdminData() {
    const adminData = getAdminData();
    
    // Se não existirem dados, criar estrutura inicial
    if (Object.keys(adminData.students).length === 0) {
        adminData.students = {
            'parent1@email.com': {
                name: 'Maria Silva',
                children: [
                    {
                        id: 1,
                        name: 'João Silva',
                        class: '3º Ano A',
                        balance: 45.50,
                        transactions: [
                            { id: 1, date: '2023-10-15', description: 'Depósito PIX', amount: 50.00, type: 'credit' },
                            { id: 2, date: '2023-10-16', description: 'Lanche - Pão de queijo + Suco', amount: 8.50, type: 'debit' },
                            { id: 3, date: '2023-10-17', description: 'Lanche - Bolo + Achocolatado', amount: 6.00, type: 'debit' }
                        ]
                    }
                ]
            },
            'parent2@email.com': {
                name: 'Carlos Oliveira',
                children: [
                    {
                        id: 2,
                        name: 'Ana Oliveira',
                        class: '5º Ano B',
                        balance: 22.00,
                        transactions: [
                            { id: 1, date: '2023-10-12', description: 'Depósito PIX', amount: 40.00, type: 'credit' },
                            { id: 2, date: '2023-10-13', description: 'Lanche - Coxinha + Suco', amount: 7.50, type: 'debit' },
                            { id: 3, date: '2023-10-14', description: 'Lanche - Bolo + Leite', amount: 5.50, type: 'debit' }
                        ]
                    }
                ]
            }
        };
        saveAdminData(adminData);
    }

    // Inicializar usuários padrão
    const users = getUsers();
    if (Object.keys(users).length === 0) {
        users['admin@lanchonete.com'] = {
            password: 'admin123',
            name: 'Administrador Lanchonete',
            isAdmin: true
        };
        users['parent1@email.com'] = {
            password: 'senha123',
            name: 'Maria Silva',
            isAdmin: false
        };
        users['parent2@email.com'] = {
            password: 'senha456',
            name: 'Carlos Oliveira',
            isAdmin: false
        };
        saveUsers(users);
    }

    // Migrar usuários antigos
    migrateOldUsers();
}

// Função para gerar senha aleatória
function generatePassword(length = 6) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

// Adicione esta função para cadastrar novo aluno:
function addNewStudent() {
    // Criar modal de cadastro em vez de prompts
    const modalHtml = `
        <div class="modal" id="cadastro-modal" style="display: block;">
            <div class="modal-content">
                <span class="close" onclick="closeCadastroModal()">&times;</span>
                <h3>Cadastrar Novo Aluno</h3>
                <form id="cadastro-form">
                    <div class="form-group">
                        <label for="parent-email">E-mail do Responsável *</label>
                        <input type="email" id="parent-email" required>
                    </div>
                    <div class="form-group">
                        <label for="parent-name">Nome do Responsável *</label>
                        <input type="text" id="parent-name" required>
                    </div>
                    <div class="form-group">
                        <label for="student-name">Nome do Aluno *</label>
                        <input type="text" id="student-name" required>
                    </div>
                    <div class="form-group">
                        <label for="student-class">Turma do Aluno *</label>
                        <input type="text" id="student-class" required>
                    </div>
                    <div class="form-group">
                        <label for="initial-balance">Saldo Inicial (R$)</label>
                        <input type="number" id="initial-balance" step="0.01" min="0" value="0">
                    </div>
                    <div class="form-group">
                        <label for="generate-password">
                            <input type="checkbox" id="generate-password" checked> 
                            Gerar senha automaticamente
                        </label>
                    </div>
                    <div class="form-group" id="custom-password-group" style="display: none;">
                        <label for="custom-password">Senha Personalizada</label>
                        <input type="text" id="custom-password" placeholder="Deixe em branco para senha automática">
                    </div>
                    <div class="modal-actions">
                        <button type="submit" class="btn btn-success">Cadastrar</button>
                        <button type="button" class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Adicionar modal ao body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Configurar event listeners
    document.getElementById('generate-password').addEventListener('change', function() {
        document.getElementById('custom-password-group').style.display = this.checked ? 'none' : 'block';
    });
    
    document.getElementById('cadastro-form').addEventListener('submit', function(e) {
        e.preventDefault();
        processStudentRegistration();
    });
}

function closeCadastroModal() {
    const modal = document.getElementById('cadastro-modal');
    if (modal) {
        modal.remove();
    }
}

function processStudentRegistration() {
    const parentEmail = document.getElementById('parent-email').value;
    const parentName = document.getElementById('parent-name').value;
    const studentName = document.getElementById('student-name').value;
    const studentClass = document.getElementById('student-class').value;
    const initialBalance = parseFloat(document.getElementById('initial-balance').value) || 0;
    const generatePassword = document.getElementById('generate-password').checked;
    const customPassword = document.getElementById('custom-password').value;

    // Validar e-mail
    if (!parentEmail || !parentEmail.includes('@')) {
        alert('Por favor, insira um e-mail válido.');
        return;
    }

    // Verificar se o e-mail já existe
    const users = getUsers();
    if (users[parentEmail]) {
        alert('Este e-mail já está cadastrado no sistema!');
        return;
    }

    // Gerar ou usar senha personalizada
    let password;
    if (generatePassword) {
        password = generatePassword();
    } else {
        password = customPassword || generatePassword();
    }

    // Salvar usuário
    users[parentEmail] = {
        password: password,
        name: parentName,
        isAdmin: false
    };
    saveUsers(users);

    // Salvar dados do aluno
    const adminData = getAdminData();
    
    // Se o responsável não existir, criar
    if (!adminData.students[parentEmail]) {
        adminData.students[parentEmail] = {
            name: parentName,
            children: []
        };
    }
    
    // Adicionar aluno
    adminData.students[parentEmail].children.push({
        id: Date.now(),
        name: studentName,
        class: studentClass,
        balance: initialBalance,
        transactions: initialBalance > 0 ? [
            {
                id: 1,
                date: new Date().toISOString().split('T')[0],
                description: 'Saldo inicial',
                amount: initialBalance,
                type: 'credit'
            }
        ] : []
    });
    
    saveAdminData(adminData);

    // Mostrar informações de acesso
    const message = `
        ✅ Cadastro realizado com sucesso!

        📧 E-mail: ${parentEmail}
        🔑 Senha: ${password}
        👨‍👧 Responsável: ${parentName}
        👦 Aluno: ${studentName}
        📚 Turma: ${studentClass}
        💰 Saldo inicial: R$ ${initialBalance.toFixed(2)}

        ⚠️ ANOTE ESTA SENHA E ENTREGUE AO RESPONSÁVEL!
    `;

    alert(message);
    closeCadastroModal();
    loadStudentsList();
    populateStudentSelect();
}

// Adicione esta função para visualizar/alterar senhas
function manageUserCredentials(parentEmail) {
    const users = getUsers();
    const adminData = getAdminData();
    const parentData = adminData.students[parentEmail];

    if (!parentData) {
        alert('Responsável não encontrado nos dados!');
        return;
    }

    // Se o usuário não existe mas tem dados, criar
    if (!users[parentEmail]) {
        const confirmCreate = confirm(
            `Usuário ${parentEmail} não encontrado, mas existe nos dados.\n` +
            `Deseja criar uma conta com senha padrão?`
        );
        
        if (confirmCreate) {
            const defaultPassword = parentData.name.toLowerCase().replace(/\s+/g, '').substring(0, 6) + '123';
            users[parentEmail] = {
                password: defaultPassword,
                name: parentData.name,
                isAdmin: false
            };
            saveUsers(users);
            alert(`Conta criada!\nE-mail: ${parentEmail}\nSenha: ${defaultPassword}`);
        }
        return;
    }

    const user = users[parentEmail];

    const action = prompt(
        `Usuário: ${parentEmail}\n` +
        `Responsável: ${parentData.name}\n\n` +
        `Escolha uma opção:\n` +
        `1 - Ver senha atual\n` +
        `2 - Alterar senha\n` +
        `3 - Redefinir senha\n` +
        `4 - Cancelar`
    );

    switch(action) {
        case '1':
            alert(`Senha atual: ${user.password}`);
            break;
        case '2':
            const newPassword = prompt('Digite a nova senha:');
            if (newPassword && newPassword.length >= 4) {
                user.password = newPassword;
                saveUsers(users);
                alert('Senha alterada com sucesso!');
            } else {
                alert('Senha deve ter pelo menos 4 caracteres!');
            }
            break;
        case '3':
            const generatedPassword = generatePassword();
            user.password = generatedPassword;
            saveUsers(users);
            alert(`Senha redefinida para: ${generatedPassword}`);
            break;
        default:
            // Cancelar
            break;
    }
}

let currentReceipt = null;

// Verificar se o usuário está logado como admin
document.addEventListener('DOMContentLoaded', function() {
    checkAdminLogin();
    initializeAdminData();
    setupEventListeners();
    loadPendingReceipts();
    loadStudentsList();
    populateStudentSelect();
});

function checkAdminLogin() {
    const user = localStorage.getItem('currentUser');
    if (user) {
        const userData = JSON.parse(user);
        if (!userData.isAdmin) {
            // Redirecionar para a página principal se não for admin
            window.location.href = 'index.html';
        } else {
            document.getElementById('user-name').textContent = userData.name;
        }
    } else {
        // Redirecionar para a página de login se não estiver logado
        window.location.href = 'login.html';
    }
}

function setupEventListeners() {
    // Navegação
    document.getElementById('nav-pending').addEventListener('click', function(e) {
        e.preventDefault();
        showSection('pending');
    });
    
    document.getElementById('nav-students').addEventListener('click', function(e) {
        e.preventDefault();
        showSection('students');
    });
    
    document.getElementById('nav-add-consumption').addEventListener('click', function(e) {
        e.preventDefault();
        showSection('add-consumption');
    });
    
    // Logout
    document.getElementById('logout-btn').addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });
    
    // Busca de alunos
    document.getElementById('student-search').addEventListener('input', loadStudentsList);
    
    // Formulário de consumo
    document.getElementById('consumption-form').addEventListener('submit', handleConsumptionSubmit);
    
    // Botão de cadastrar novo aluno
    document.getElementById('add-student-btn').addEventListener('click', function(e) {
        e.preventDefault();
        addNewStudent();
    });
    
    // Modal
    document.querySelector('.close').addEventListener('click', closeModal);
    document.getElementById('modal-cancel').addEventListener('click', closeModal);
    
    // Configurar data atual no formulário
    document.getElementById('consumption-date').valueAsDate = new Date();
}

function showSection(sectionId) {
    // Esconder todas as seções
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Mostrar a seção selecionada
    document.getElementById(sectionId).classList.add('active');
}

function loadPendingReceipts() {
    const adminData = getAdminData();
    const container = document.getElementById('pending-receipts');
    container.innerHTML = '';
    
    const pendingReceipts = adminData.pendingReceipts.filter(receipt => receipt.status === 'pending');
    
    if (pendingReceipts.length === 0) {
        container.innerHTML = '<p class="no-receipts">Nenhum comprovante pendente.</p>';
        return;
    }
    
    pendingReceipts.forEach(receipt => {
        const student = findStudentById(receipt.studentId, adminData.students);
        const parent = adminData.students[receipt.parentEmail];
        
        const receiptCard = document.createElement('div');
        receiptCard.className = 'receipt-card';
        receiptCard.innerHTML = `
            <div class="receipt-header">
                <div class="receipt-amount">R$ ${receipt.amount.toFixed(2)}</div>
                <div class="receipt-status status-pending">Pendente</div>
            </div>
            <div class="receipt-info">
                <p><strong>Aluno:</strong> ${student.name}</p>
                <p><strong>Responsável:</strong> ${parent.name}</p>
                <p><strong>Data:</strong> ${new Date(receipt.date).toLocaleDateString('pt-BR')}</p>
            </div>
            <div class="receipt-actions">
                <button class="btn btn-primary btn-sm view-receipt" data-id="${receipt.id}">Ver Detalhes</button>
            </div>
        `;
        
        container.appendChild(receiptCard);
    });
    
    // Adicionar event listeners aos botões
    document.querySelectorAll('.view-receipt').forEach(button => {
        button.addEventListener('click', function() {
            const receiptId = parseInt(this.getAttribute('data-id'));
            showReceiptDetails(receiptId);
        });
    });
}

function showReceiptDetails(receiptId) {
    const adminData = getAdminData();
    currentReceipt = adminData.pendingReceipts.find(receipt => receipt.id === receiptId);
    
    if (!currentReceipt) return;
    
    const student = findStudentById(currentReceipt.studentId, adminData.students);
    const parent = adminData.students[currentReceipt.parentEmail];
    
    document.getElementById('modal-student-name').textContent = student.name;
    document.getElementById('modal-parent-name').textContent = parent.name;
    document.getElementById('modal-amount').textContent = currentReceipt.amount.toFixed(2);
    document.getElementById('modal-date').textContent = new Date(currentReceipt.date).toLocaleDateString('pt-BR');
    document.getElementById('modal-status').textContent = 'Pendente';
    document.getElementById('modal-receipt-img').src = currentReceipt.image;
    
    // Configurar botões de ação
    document.getElementById('approve-receipt').onclick = function() {
        approveReceipt(currentReceipt.id);
    };
    
    document.getElementById('reject-receipt').onclick = function() {
        rejectReceipt(currentReceipt.id);
    };
    
    document.getElementById('receipt-modal').style.display = 'block';
}

function approveReceipt(receiptId) {
    const adminData = getAdminData();
    const receipt = adminData.pendingReceipts.find(r => r.id === receiptId);
    if (!receipt) return;
    
    // Atualizar status do comprovante
    receipt.status = 'approved';
    
    // Adicionar crédito ao aluno
    const student = findStudentById(receipt.studentId, adminData.students);
    const parentEmail = receipt.parentEmail;
    
    if (student && adminData.students[parentEmail]) {
        // Atualizar saldo
        student.balance += receipt.amount;
        
        // Adicionar transação
        student.transactions.unshift({
            id: Date.now(),
            date: receipt.date,
            description: 'Depósito PIX - Aprovado',
            amount: receipt.amount,
            type: 'credit'
        });
        
        // Salvar dados
        saveAdminData(adminData);
        
        alert('Depósito aprovado e crédito adicionado com sucesso!');
        closeModal();
        loadPendingReceipts();
    }
}

function rejectReceipt(receiptId) {
    const adminData = getAdminData();
    const receipt = adminData.pendingReceipts.find(r => r.id === receiptId);
    if (!receipt) return;
    
    const reason = prompt('Digite o motivo da rejeição:');
    if (reason === null) return; // Usuário cancelou
    
    // Atualizar status do comprovante
    receipt.status = 'rejected';
    receipt.rejectionReason = reason;
    
    // Salvar dados
    saveAdminData(adminData);
    
    alert('Comprovante rejeitado.');
    closeModal();
    loadPendingReceipts();
}

function loadStudentsList() {
    const adminData = getAdminData();
    const container = document.getElementById('students-list');
    const searchTerm = document.getElementById('student-search').value.toLowerCase();
    
    container.innerHTML = '';
    
    let hasStudents = false;
    
    for (const parentEmail in adminData.students) {
        const parent = adminData.students[parentEmail];
        
        parent.children.forEach(student => {
            if (searchTerm && !student.name.toLowerCase().includes(searchTerm) && 
                !parent.name.toLowerCase().includes(searchTerm) &&
                !parentEmail.toLowerCase().includes(searchTerm)) {
                return;
            }
            
            hasStudents = true;
            
            const studentCard = document.createElement('div');
            studentCard.className = 'student-card';
            studentCard.innerHTML = `
                <h3>${student.name}</h3>
                <p><strong>Turma:</strong> ${student.class}</p>
                <p><strong>Responsável:</strong> ${parent.name}</p>
                <p><strong>E-mail:</strong> ${parentEmail}</p>
                <div class="student-balance">Saldo: R$ ${student.balance.toFixed(2)}</div>
                <div class="student-actions">
                    <button class="btn btn-primary btn-sm view-transactions" data-id="${student.id}">Ver Transações</button>
                    <button class="btn btn-secondary btn-sm add-credit" data-id="${student.id}">Adicionar Crédito</button>
                    <button class="btn btn-warning btn-sm manage-password" data-email="${parentEmail}">Gerenciar Senha</button>
                </div>
            `;
            
            container.appendChild(studentCard);
        });
    }
    
    if (!hasStudents) {
        container.innerHTML = '<p class="no-students">Nenhum aluno encontrado.</p>';
    }
    
    // Adicionar event listeners
    document.querySelectorAll('.view-transactions').forEach(button => {
        button.addEventListener('click', function() {
            const studentId = parseInt(this.getAttribute('data-id'));
            viewStudentTransactions(studentId);
        });
    });
    
    document.querySelectorAll('.add-credit').forEach(button => {
        button.addEventListener('click', function() {
            const studentId = parseInt(this.getAttribute('data-id'));
            addManualCredit(studentId);
        });
    });

    document.querySelectorAll('.manage-password').forEach(button => {
        button.addEventListener('click', function() {
            const parentEmail = this.getAttribute('data-email');
            manageUserCredentials(parentEmail);
        });
    });
}

function populateStudentSelect() {
    const adminData = getAdminData();
    const select = document.getElementById('student-select');
    select.innerHTML = '<option value="">Selecione um aluno</option>';
    
    for (const parentEmail in adminData.students) {
        const parent = adminData.students[parentEmail];
        
        parent.children.forEach(student => {
            const option = document.createElement('option');
            option.value = student.id;
            option.textContent = `${student.name} (${student.class}) - Saldo: R$ ${student.balance.toFixed(2)}`;
            select.appendChild(option);
        });
    }
}

function handleConsumptionSubmit(e) {
    e.preventDefault();
    
    const adminData = getAdminData();
    const studentId = parseInt(document.getElementById('student-select').value);
    const date = document.getElementById('consumption-date').value;
    const description = document.getElementById('consumption-description').value;
    const amount = parseFloat(document.getElementById('consumption-amount').value);
    
    if (!studentId) {
        alert('Por favor, selecione um aluno.');
        return;
    }
    
    if (!date) {
        alert('Por favor, selecione uma data.');
        return;
    }
    
    if (!description) {
        alert('Por favor, insira uma descrição.');
        return;
    }
    
    if (!amount || amount <= 0) {
        alert('Por favor, insira um valor válido.');
        return;
    }
    
    // Encontrar o aluno
    const student = findStudentById(studentId, adminData.students);
    if (!student) {
        alert('Aluno não encontrado.');
        return;
    }
    
    // Verificar se tem saldo suficiente
    if (student.balance < amount) {
        alert('Saldo insuficiente para este consumo.');
        return;
    }
    
    // Adicionar transação de consumo
    student.transactions.unshift({
        id: Date.now(),
        date: date,
        description: description,
        amount: amount,
        type: 'debit'
    });
    
    // Atualizar saldo
    student.balance -= amount;
    
    // Salvar dados
    saveAdminData(adminData);
    
    alert('Consumo lançado com sucesso!');
    document.getElementById('consumption-form').reset();
    document.getElementById('consumption-date').valueAsDate = new Date();
    
    // Atualizar lista de alunos e select
    loadStudentsList();
    populateStudentSelect();
}

function viewStudentTransactions(studentId) {
    const adminData = getAdminData();
    const student = findStudentById(studentId, adminData.students);
    if (!student) return;
    
    let transactionsHtml = '<h3>Transações de ' + student.name + '</h3>';
    transactionsHtml += '<div class="transactions-list">';
    
    student.transactions.forEach(transaction => {
        transactionsHtml += `
            <div class="transaction-item">
                <div class="transaction-date">${new Date(transaction.date).toLocaleDateString('pt-BR')}</div>
                <div class="transaction-description">${transaction.description}</div>
                <div class="transaction-amount ${transaction.type}">
                    ${transaction.type === 'credit' ? '+' : '-'} R$ ${transaction.amount.toFixed(2)}
                </div>
            </div>
        `;
    });
    
    transactionsHtml += '</div>';
    
    alert(transactionsHtml.replace(/<[^>]*>/g, '')); // Alert simples sem HTML
}

function addManualCredit(studentId) {
    const amount = parseFloat(prompt('Digite o valor do crédito a ser adicionado:'));
    
    if (!amount || amount <= 0) {
        alert('Valor inválido.');
        return;
    }
    
    const adminData = getAdminData();
    const student = findStudentById(studentId, adminData.students);
    if (!student) return;
    
    // Adicionar transação de crédito
    student.transactions.unshift({
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        description: 'Crédito Manual - Admin',
        amount: amount,
        type: 'credit'
    });
    
    // Atualizar saldo
    student.balance += amount;
    
    // Salvar dados
    saveAdminData(adminData);
    
    alert('Crédito adicionado com sucesso!');
    loadStudentsList();
    populateStudentSelect();
}

function closeModal() {
    document.getElementById('receipt-modal').style.display = 'none';
    currentReceipt = null;
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}