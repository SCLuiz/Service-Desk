// Variáveis globais
let todosTickets = [];
let ticketsFiltrados = [];

// Carregar configuração do localStorage
function carregarConfiguracao() {
    const config = {
        jiraUrl: localStorage.getItem('jiraUrl') || 'https://openfinancebrasil.atlassian.net',
        jiraEmail: localStorage.getItem('jiraEmail') || '',
        jiraToken: localStorage.getItem('jiraToken') || '',
        jiraProject: localStorage.getItem('jiraProject') || '105'
    };

    // Preencher campos se existirem
    if (document.getElementById('jiraUrl')) {
        document.getElementById('jiraUrl').value = config.jiraUrl;
        document.getElementById('jiraEmail').value = config.jiraEmail;
        document.getElementById('jiraToken').value = config.jiraToken;
        document.getElementById('jiraProject').value = config.jiraProject;
    }

    return config;
}

// Salvar configuração
function salvarConfig() {
    const jiraUrl = document.getElementById('jiraUrl').value.trim();
    const jiraEmail = document.getElementById('jiraEmail').value.trim();
    const jiraToken = document.getElementById('jiraToken').value.trim();
    const jiraProject = document.getElementById('jiraProject').value.trim();

    if (!jiraUrl || !jiraEmail || !jiraToken) {
        mostrarStatus('⚠️ Preencha todos os campos obrigatórios', 'warning');
        return;
    }

    localStorage.setItem('jiraUrl', jiraUrl);
    localStorage.setItem('jiraEmail', jiraEmail);
    localStorage.setItem('jiraToken', jiraToken);
    localStorage.setItem('jiraProject', jiraProject);

    mostrarStatus('✅ Configuração salva com sucesso!', 'success');
    toggleConfig();

    // Carregar tickets automaticamente
    setTimeout(() => carregarTickets(), 500);
}

// Toggle config
function toggleConfig() {
    const configSection = document.getElementById('configSection');
    configSection.classList.toggle('active');
}

// Mostrar status
function mostrarStatus(mensagem, tipo = '') {
    const statusDiv = document.getElementById('status');
    statusDiv.innerHTML = `<p>${mensagem}</p>`;
    statusDiv.className = 'status ' + tipo;
    statusDiv.style.display = 'block';
}

// Carregar tickets do Jira
async function carregarTickets() {
    const config = carregarConfiguracao();

    if (!config.jiraEmail || !config.jiraToken) {
        mostrarStatus('⚠️ Configure suas credenciais do Jira primeiro', 'warning');
        return;
    }

    mostrarStatus('🔄 Carregando tickets do Jira...', '');

    try {
        // Codificar credenciais em base64
        const auth = btoa(`${config.jiraEmail}:${config.jiraToken}`);

        // Construir URL da API
        // Para Service Desk, usamos a API do Jira Service Management
        const apiUrl = `${config.jiraUrl}/rest/api/3/search`;

        // JQL para buscar issues do Service Desk
        const jql = `project = ${config.jiraProject} ORDER BY created DESC`;

        const url = `${apiUrl}?jql=${encodeURIComponent(jql)}&maxResults=100`;

        // IMPORTANTE: Para usar em produção, você precisa de um proxy ou backend
        // porque o Jira não permite CORS direto do navegador
        // Por enquanto, vou mostrar como seria a chamada

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        todosTickets = data.issues || [];
        ticketsFiltrados = todosTickets;

        exibirTickets();
        atualizarEstatisticas();

        document.getElementById('stats').style.display = 'grid';
        document.getElementById('filters').style.display = 'flex';

        mostrarStatus(`✅ ${todosTickets.length} tickets carregados com sucesso!`, 'success');

    } catch (error) {
        console.error('Erro ao carregar tickets:', error);

        // Mensagem específica para erro de CORS
        if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
            mostrarStatus(
                '❌ Erro de CORS: Para acessar o Jira diretamente do navegador, você precisa:<br>' +
                '1. Usar um proxy/backend (recomendado)<br>' +
                '2. Ou instalar extensão CORS no navegador (temporário)<br>' +
                '3. Ou usar Jira Cloud REST API com token OAuth<br><br>' +
                '<strong>💡 Solução:</strong> Vou criar também uma versão com backend Python!',
                'error'
            );
        } else {
            mostrarStatus(`❌ Erro ao carregar tickets: ${error.message}`, 'error');
        }

        // Mostrar dados de exemplo
        mostrarDadosExemplo();
    }
}

// Mostrar dados de exemplo (para demonstração)
function mostrarDadosExemplo() {
    todosTickets = [
        {
            key: 'SD-123',
            fields: {
                summary: 'Problema com acesso ao sistema',
                description: 'Não consigo fazer login na plataforma',
                status: { name: 'To Do' },
                priority: { name: 'High' },
                created: '2024-01-15T10:30:00',
                assignee: { displayName: 'João Silva' }
            }
        },
        {
            key: 'SD-124',
            fields: {
                summary: 'Solicitação de novo equipamento',
                description: 'Preciso de um notebook para trabalho remoto',
                status: { name: 'In Progress' },
                priority: { name: 'Medium' },
                created: '2024-01-15T11:00:00',
                assignee: { displayName: 'Maria Santos' }
            }
        },
        {
            key: 'SD-125',
            fields: {
                summary: 'Dúvida sobre políticas de RH',
                description: 'Como funciona o processo de férias?',
                status: { name: 'Done' },
                priority: { name: 'Low' },
                created: '2024-01-14T09:00:00',
                assignee: { displayName: 'Pedro Costa' }
            }
        }
    ];

    ticketsFiltrados = todosTickets;
    exibirTickets();
    atualizarEstatisticas();

    document.getElementById('stats').style.display = 'grid';
    document.getElementById('filters').style.display = 'flex';

    mostrarStatus('ℹ️ Mostrando dados de exemplo (Configure as credenciais para ver dados reais)', 'warning');
}

// Exibir tickets na tela
function exibirTickets() {
    const container = document.getElementById('ticketsContainer');

    if (ticketsFiltrados.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">📭</div>
                <h3>Nenhum ticket encontrado</h3>
                <p>Tente ajustar os filtros ou criar um novo ticket</p>
            </div>
        `;
        return;
    }

    container.innerHTML = ticketsFiltrados.map(ticket => {
        const status = ticket.fields.status.name;
        const statusClass = status.replace(/\s+/g, '').toLowerCase();
        const priority = ticket.fields.priority?.name || 'Medium';
        const priorityClass = priority.toLowerCase();

        const data = new Date(ticket.fields.created);
        const dataFormatada = data.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });

        return `
            <div class="ticket-card" onclick="abrirTicket('${ticket.key}')">
                <div class="ticket-header">
                    <span class="ticket-key">${ticket.key}</span>
                    <span class="ticket-status status-${statusClass}">${status}</span>
                </div>
                <div class="ticket-title">${ticket.fields.summary}</div>
                <div class="ticket-description">
                    ${ticket.fields.description || 'Sem descrição'}
                </div>
                <div class="ticket-footer">
                    <div class="ticket-meta">
                        👤 ${ticket.fields.assignee?.displayName || 'Não atribuído'}<br>
                        📅 ${dataFormatada}
                    </div>
                    <span class="ticket-priority priority-${priorityClass}">
                        ${priority}
                    </span>
                </div>
            </div>
        `;
    }).join('');
}

// Atualizar estatísticas
function atualizarEstatisticas() {
    const abertos = todosTickets.filter(t => t.fields.status.name === 'To Do').length;
    const emProgresso = todosTickets.filter(t => t.fields.status.name === 'In Progress').length;
    const resolvidos = todosTickets.filter(t => t.fields.status.name === 'Done').length;

    document.getElementById('statAbertos').textContent = abertos;
    document.getElementById('statEmProgresso').textContent = emProgresso;
    document.getElementById('statResolvidos').textContent = resolvidos;
    document.getElementById('statTotal').textContent = todosTickets.length;
}

// Filtrar tickets
function filtrarTickets() {
    const statusFiltro = document.getElementById('filterStatus').value;
    const searchFiltro = document.getElementById('filterSearch').value.toLowerCase();

    ticketsFiltrados = todosTickets.filter(ticket => {
        const matchStatus = !statusFiltro || ticket.fields.status.name === statusFiltro;
        const matchSearch = !searchFiltro ||
            ticket.fields.summary.toLowerCase().includes(searchFiltro) ||
            ticket.key.toLowerCase().includes(searchFiltro) ||
            (ticket.fields.description && ticket.fields.description.toLowerCase().includes(searchFiltro));

        return matchStatus && matchSearch;
    });

    exibirTickets();
}

// Abrir ticket (link para Jira)
function abrirTicket(ticketKey) {
    const config = carregarConfiguracao();
    const url = `${config.jiraUrl}/browse/${ticketKey}`;
    window.open(url, '_blank');
}

// Abrir novo ticket
function abrirNovoTicket() {
    const config = carregarConfiguracao();
    const url = `${config.jiraUrl}/servicedesk/customer/portal/${config.jiraProject}`;
    window.open(url, '_blank');
}

// Inicialização
window.addEventListener('DOMContentLoaded', () => {
    carregarConfiguracao();

    // Se já tem credenciais, carregar tickets
    const config = carregarConfiguracao();
    if (config.jiraEmail && config.jiraToken) {
        // Mostrar dados de exemplo por padrão (devido ao CORS)
        mostrarDadosExemplo();
    }
});
