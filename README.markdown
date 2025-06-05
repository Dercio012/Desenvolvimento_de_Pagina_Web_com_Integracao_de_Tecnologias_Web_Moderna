# Revista Online

## Descrição
A **Revista Online** é uma aplicação web para publicação e leitura de artigos, com funcionalidades de administração, chat em tempo real, e autenticação de usuários. Os usuários podem visualizar artigos por categoria, interagir via chat, e administradores podem gerenciar conteúdo (artigos, categorias, mensagens). A aplicação utiliza HTML, CSS, JavaScript, e Bootstrap no frontend, com Node.js, Express, e WebSocket no backend.

## Funcionalidades
- **Públicas**:
  - Visualização de artigos na página inicial (`index.html`) e por categoria (`categorias.html`).
  - Leitura de artigos completos (`artigo.html`).
  - Chat em tempo real com mensagens públicas e privadas (`chat.html`).
  - Autenticação via login (`login.html`) e cadastro (`register.html`).
- **Administrativas** (`admin.html`, restrito a admins):
  - Gerenciamento de categorias (adicionar/listar).
  - Gerenciamento de artigos (criar/editar/excluir) com upload de imagens.
  - Moderação de mensagens do chat.
  - Monitoramento de usuários online.
- **Técnicas**:
  - Carregamento de dados via AJAX (`fetch`).
  - Chat e monitoramento em tempo real via WebSocket.
  - Upload de imagens com `multer` (salvas em `public/uploads/`).
  - Responsividade com Bootstrap 5.3.3.

## Tecnologias
- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Bootstrap 5.3.3
- **Backend**: Node.js, Express, WebSocket (ws), Multer
- **Dados**: Arquivo `data.json` (banco simulado)
- **Outros**: AJAX, WebSocket

## Pré-requisitos
- Node.js (v18 ou superior)
- npm
- Navegador moderno (Chrome, Firefox, Edge)

## Instalação
1. Clone o repositório:
   ```bash
   git clone https://github.com/<seu-usuario>/revista-online.git
   cd revista-online
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Crie as pastas necessárias:
   - `public/uploads/` (para imagens enviadas)
   - `public/imgs/` (com `placeholder.jpg` como fallback)

## Executando o Projeto
1. Inicie o servidor:
   ```bash
   npm start
   ```
   O servidor rodará em `http://localhost:3000`.
2. Acesse no navegador:
   - Página inicial: `http://localhost:3000/index.html`
   - Login: `http://localhost:3000/login.html`

## Uso
- **Credenciais de teste** (em `server/data.json`):
  - Admin: `admin@revista.com` / `admin123`
  - Usuário: `user1@revista.com` / `user123`
- **Funcionalidades**:
  - **Não logado**: Veja artigos, categorias, e acesse chat (após login).
  - **Usuário logado**: Participe do chat, leia artigos.
  - **Admin**: Acesse `admin.html` para gerenciar categorias, artigos, e moderar o chat.
- **Upload de imagens**:
  - Em `admin.html`, envie imagens (JPG, PNG, GIF, <5MB) ao criar/editar artigos.
  - Imagens são salvas em `public/uploads/` e exibidas com fallback `imgs/placeholder.jpg`.

## Estrutura do Projeto
```
/revista-online
├── /public
│   ├── /css
│   │   └── styles.css
│   ├── /imgs
│   │   └── placeholder.jpg
│   ├── /uploads
│   ├── admin.html
│   ├── artigo.html
│   ├── categorias.html
│   ├── chat.html
│   ├── index.html
│   ├── login.html
│   ├── register.html
├── /server
│   ├── /routes
│   │   └── users.js
│   ├── app.js
│   ├── data.json
├── package.json
├── README.md
```

## Deploy
Para hospedar no **Render**:
1. Crie um repositório no GitHub.
2. No Render, configure um **Web Service**:
   - Conecte ao repositório.
   - Build: `npm install`
   - Start: `npm start`
   - Variável de ambiente: `PORT=3000`
3. Acesse a URL fornecida após o deploy.

## Contribuição
1. Faça um fork do repositório.
2. Crie uma branch: `git checkout -b minha-feature`.
3. Commit suas mudanças: `git commit -m "Adiciona minha feature"`.
4. Push: `git push origin minha-feature`.
5. Abra um Pull Request.

## Problemas Comuns
- **Upload de imagens falha**: Verifique permissões de escrita em `public/uploads/`.
- **WebSocket não conecta**: Confirme que `app.js` trata mensagens inválidas e `data.json` tem usuários válidos.
- **Imagens não aparecem**: Verifique caminhos em `data.json` (ex.: `uploads/nome.jpg`) e existência de `imgs/placeholder.jpg`.

## Melhorias Futuras
- Adicionar comentários em `artigo.html`.
- Implementar busca de artigos.
- Usar `bcrypt` para senhas no `data.json`.
- Adicionar testes automatizados (Jest, Cypress).

## Licença
MIT License

## Contato
Para dúvidas, abra uma issue no repositório ou contate <seu-email>.