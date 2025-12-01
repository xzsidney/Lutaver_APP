# 🎮 Lutaver - Sistema de Autenticação e CRUD de Usuários

Sistema completo de gerenciamento de usuários com autenticação para o jogo educacional Lutaver.

## 📋 Pré-requisitos

- Node.js (v14 ou superior)
- MySQL (v5.7 ou superior)

## 🚀 Instalação

1. **Clone o repositório** (ou navegue até a pasta do projeto)

2. **Instale as dependências** (já feito):
```bash
npm install
```

3. **Configure o banco de dados**:
   - Crie um banco de dados MySQL chamado `lutaver_db` (ou outro nome de sua preferência)
   - Edite o arquivo `.env` com suas credenciais:

```env
DB_NAME=lutaver_db
DB_USER=root
DB_PASS=sua_senha_aqui
DB_HOST=localhost
SESSION_SECRET=supersecretkey_lutaver_game
PORT=3000
```

4. **Crie um usuário administrador inicial**:
```bash
node src/seed.js
```

Isso criará um usuário admin com:
- **E-mail**: admin@lutaver.com
- **Senha**: admin123

## ▶️ Executar o Projeto

```bash
node src/app.js
```

O servidor estará disponível em: `http://localhost:3000`

## 🔐 Funcionalidades

### Autenticação
- ✅ Login com e-mail e senha
- ✅ Logout
- ✅ Proteção de rotas com middleware
- ✅ Controle de acesso por papel (role)
- ✅ Senhas criptografadas com bcrypt

### CRUD de Usuários (Admin apenas)
- ✅ Listar todos os usuários
- ✅ Criar novo usuário
- ✅ Editar usuário existente
- ✅ Excluir usuário
- ✅ Ativar/Desativar usuário

### Papéis (Roles)
- **player**: Jogador comum
- **teacher**: Professor
- **admin**: Administrador (acesso total)

## 📁 Estrutura do Projeto

```
V2/
├── src/
│   ├── config/
│   │   └── database.js          # Configuração do Sequelize
│   ├── controllers/
│   │   ├── AuthController.js    # Lógica de autenticação
│   │   └── UserController.js    # CRUD de usuários
│   ├── middlewares/
│   │   └── auth.js              # Middlewares de autenticação
│   ├── models/
│   │   └── User.js              # Model do usuário
│   ├── routes/
│   │   ├── authRoutes.js        # Rotas de autenticação
│   │   ├── userRoutes.js        # Rotas de usuários
│   │   └── index.js             # Agregador de rotas
│   ├── views/
│   │   ├── auth/
│   │   │   └── login.ejs        # Página de login
│   │   └── users/
│   │       ├── list.ejs         # Lista de usuários
│   │       ├── new.ejs          # Criar usuário
│   │       └── edit.ejs         # Editar usuário
│   ├── app.js                   # Aplicação principal
│   └── seed.js                  # Script para criar admin inicial
├── .env                         # Variáveis de ambiente
├── .gitignore
├── package.json
└── README.md
```

## 🛣️ Rotas Principais

| Rota | Método | Descrição | Acesso |
|------|--------|-----------|--------|
| `/login` | GET | Página de login | Público |
| `/login` | POST | Processar login | Público |
| `/logout` | GET | Fazer logout | Autenticado |
| `/users` | GET | Listar usuários | Admin |
| `/users/new` | GET | Formulário novo usuário | Admin |
| `/users` | POST | Criar usuário | Admin |
| `/users/:id/edit` | GET | Formulário editar usuário | Admin |
| `/users/:id` | POST | Atualizar usuário | Admin |
| `/users/:id/delete` | POST | Excluir usuário | Admin |

## 🔒 Segurança

- ✅ Senhas NUNCA armazenadas em texto plano
- ✅ Hash bcrypt com salt automático
- ✅ Validação de e-mail único
- ✅ Validação de senha mínima (6 caracteres)
- ✅ Proteção de rotas administrativas
- ✅ Verificação de usuário ativo no login
- ✅ Sessões com secret configurável

## 🎯 Próximas Melhorias Sugeridas

1. **Recuperação de senha** via e-mail
2. **Confirmação de e-mail** no cadastro
3. **Bloqueio de conta** após múltiplas tentativas de login
4. **Logs de auditoria** (quem fez o quê e quando)
5. **Paginação** na lista de usuários
6. **Filtros e busca** na lista de usuários
7. **Alteração de senha** no perfil do usuário
8. **Upload de avatar** do usuário
9. **2FA (Two-Factor Authentication)**
10. **Rate limiting** para prevenir ataques de força bruta

## 📝 Notas Importantes

- Em produção, é recomendado **desativar** usuários ao invés de excluí-los (soft delete)
- Altere o `SESSION_SECRET` no `.env` para um valor seguro em produção
- Use `sequelize.sync({ alter: true })` apenas em desenvolvimento
- Para produção, use migrations do Sequelize ao invés de sync

## 🐛 Troubleshooting

**Erro de conexão com MySQL:**
- Verifique se o MySQL está rodando
- Confirme as credenciais no arquivo `.env`
- Certifique-se de que o banco de dados existe

**Erro ao criar usuário:**
- Verifique se o e-mail já está cadastrado
- Confirme que as senhas coincidem
- Verifique os logs do console para mais detalhes

## 📧 Contato

Para dúvidas ou sugestões sobre o Lutaver, entre em contato com a equipe de desenvolvimento.

---

**Desenvolvido com ❤️ para educação**
