# 🎫 Service Desk - OpenFinance Brasil

Dashboard web para visualizar e gerenciar tickets do Jira Service Desk.

## 🚀 Acesso

**URL:** https://scluiz.github.io/Service-Desk/

## ✨ Funcionalidades

- 📊 Dashboard com estatísticas de tickets
- 🔍 Filtros por status e busca de texto
- 📱 Design responsivo (funciona em celular)
- 🎨 Visual moderno com cores da OpenFinance
- 🔄 Atualização em tempo real dos tickets
- ➕ Criar novos tickets diretamente

## ⚙️ Configuração

1. Clique em "⚙️ Configurar"
2. Preencha:
   - **URL do Jira:** `https://openfinancebrasil.atlassian.net`
   - **Email:** seu email do Jira
   - **API Token:** [gere aqui](https://id.atlassian.com/manage-profile/security/api-tokens)
   - **Service Desk ID:** `105`
3. Clique em "💾 Salvar Configuração"

## 🔐 Segurança

- Credenciais armazenadas apenas no navegador (localStorage)
- Nunca enviadas para servidores externos
- Use o backend proxy para produção (evita expor credenciais)

## 🛠️ Backend Proxy (Opcional)

Para evitar problemas de CORS e melhorar segurança:

```bash
cd service-desk-web
pip install -r requirements.txt
python api_proxy.py
```

Depois edite `script.js` para usar `http://localhost:5000/api`

## 💡 Tecnologias

- HTML5 + CSS3 + JavaScript vanilla
- Jira REST API v3
- GitHub Pages para hosting

---

**Sistema Kraken** · OpenFinance Brasil
