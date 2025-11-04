// Dados de usuários (em um sistema real, isso viria de um backend seguro)
function getUsers() {
    return JSON.parse(localStorage.getItem('users') || '{}');
}

document.addEventListener('DOMContentLoaded', function() {
    // Verificar se o usuário já está logado
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        const userData = JSON.parse(currentUser);
        if (userData.isAdmin) {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'index.html';
        }
    }
    
    // Configurar evento de submit do formulário
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        handleLogin();
    });
});

function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Validação básica
    if (!email || !password) {
        alert('Por favor, preencha todos os campos.');
        return;
    }
    
    // Verificar credenciais
    const users = getUsers();
    const user = users[email];
    
    if (user && user.password === password) {
        // Login bem-sucedido
        const userData = {
            email: email,
            name: user.name,
            isAdmin: user.isAdmin || false
        };
        
        // Salvar no localStorage
        localStorage.setItem('currentUser', JSON.stringify(userData));
        
        // Se for pai, garantir que os dados existam
        if (!user.isAdmin) {
            initializeParentData(email, user.name);
        }
        
        // Redirecionar para a página correta
        if (user.isAdmin) {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'index.html';
        }
    } else {
        alert('E-mail ou senha incorretos. Tente novamente.');
    }
}

// Adicione esta função para inicializar dados do pai:
function initializeParentData(email, name) {
    const adminData = JSON.parse(localStorage.getItem('adminData') || '{"pendingReceipts":[], "students":{}}');
    
    // Se o pai não existir nos dados, criar estrutura básica
    if (!adminData.students[email]) {
        adminData.students[email] = {
            name: name,
            children: [
                {
                    id: Date.now(), // ID único
                    name: 'Seu Filho', // Nome temporário
                    class: 'A definir', // Turma temporária
                    balance: 0.00,
                    transactions: [
                        {
                            id: 1,
                            date: new Date().toISOString().split('T')[0],
                            description: 'Sistema iniciado',
                            amount: 0.00,
                            type: 'credit'
                        }
                    ]
                }
            ]
        };
        localStorage.setItem('adminData', JSON.stringify(adminData));
    }
}