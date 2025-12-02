# Documentação de Rotas da API - Lutaver

Este documento lista todas as rotas disponíveis no sistema Lutaver, organizadas por módulo.

**URL Base de Exemplo:** `http://localhost:3000`

---

## 🏠 Rotas Públicas e Autenticação

| Método | Rota / Função | URL de Exemplo | Descrição |
| :--- | :--- | :--- | :--- |
| **GET** | Landing Page | `http://localhost:3000/` | Página inicial pública do sistema. |
| **GET** | Login Page | `http://localhost:3000/login` | Exibe o formulário de login. |
| **POST** | Process Login | `http://localhost:3000/login` | Processa as credenciais de login. |
| **GET** | Logout | `http://localhost:3000/logout` | Encerra a sessão do usuário. |

---

## 📊 Dashboards

| Método | Rota / Função | URL de Exemplo | Descrição |
| :--- | :--- | :--- | :--- |
| **GET** | Main Dashboard | `http://localhost:3000/dashboard` | Redireciona para o dashboard específico do papel do usuário. |
| **GET** | Admin Dashboard | `http://localhost:3000/admin/dashboard` | Painel principal para administradores. |
| **GET** | Player Dashboard | `http://localhost:3000/player/dashboard` | Painel principal para jogadores (alunos). |
| **GET** | Teacher Dashboard | `http://localhost:3000/teacher/dashboard` | Painel principal para professores. |

---

## 👤 Usuários (Admin)

| Método | Rota / Função | URL de Exemplo | Descrição |
| :--- | :--- | :--- | :--- |
| **GET** | List Users | `http://localhost:3000/users` | Lista todos os usuários cadastrados. |
| **GET** | Create User Page | `http://localhost:3000/users/new` | Formulário para criar um novo usuário. |
| **POST** | Create User | `http://localhost:3000/users` | Salva um novo usuário. |
| **GET** | Edit User Page | `http://localhost:3000/users/1/edit` | Formulário para editar um usuário existente. |
| **POST** | Update User | `http://localhost:3000/users/1` | Atualiza os dados de um usuário. |
| **POST** | Delete User | `http://localhost:3000/users/1/delete` | Remove um usuário do sistema. |

---

## 🎮 Jogo e Quiz (Play)

| Método | Rota / Função | URL de Exemplo | Descrição |
| :--- | :--- | :--- | :--- |
| **GET** | List Adventures | `http://localhost:3000/play` | Lista as aventuras disponíveis para o jogador. |
| **GET** | Start Adventure | `http://localhost:3000/play/adventure/1` | Inicia uma aventura (Modo Cena Legado). |
| **POST** | Process Scene | `http://localhost:3000/play/adventure/1/scene/5` | Processa interação em uma cena (Legado). |
| **GET** | Start Quiz | `http://localhost:3000/play/quiz/1/2` | Inicia um quiz para uma aventura e personagem. |
| **GET** | Show Question | `http://localhost:3000/play/quiz/1/2/question` | Exibe a pergunta atual do quiz. |
| **POST** | Process Answer | `http://localhost:3000/play/quiz/1/2/answer` | Processa a resposta do jogador. |
| **GET** | Show Result | `http://localhost:3000/play/quiz/1/2/result` | Exibe o resultado final do quiz. |

---

## 🦸 Meus Personagens (Jogador)

| Método | Rota / Função | URL de Exemplo | Descrição |
| :--- | :--- | :--- | :--- |
| **GET** | List Characters | `http://localhost:3000/my/characters` | Lista os personagens do jogador logado. |
| **GET** | Create Character Page | `http://localhost:3000/my/characters/new` | Formulário para criar um novo personagem. |
| **POST** | Create Character | `http://localhost:3000/my/characters` | Salva um novo personagem. |
| **GET** | Character Sheet | `http://localhost:3000/my/characters/1` | Exibe a ficha detalhada do personagem. |
| **GET** | Edit Character Page | `http://localhost:3000/my/characters/1/edit` | Formulário para editar o personagem. |
| **POST** | Update Character | `http://localhost:3000/my/characters/1` | Atualiza os dados do personagem. |
| **POST** | Delete Character | `http://localhost:3000/my/characters/1/delete` | Exclui um personagem. |
| **POST** | Save Attributes | `http://localhost:3000/my/characters/1/attributes/save` | Salva a distribuição de pontos de atributos. |
| **POST** | Learn Power | `http://localhost:3000/my/characters/1/powers` | Aprende um novo poder disponível. |

---

## 🛒 Loja e Inventário

| Método | Rota / Função | URL de Exemplo | Descrição |
| :--- | :--- | :--- | :--- |
| **GET** | Shop Index | `http://localhost:3000/shop/1` | Exibe a loja para um personagem específico. |
| **POST** | Buy Item | `http://localhost:3000/shop/1/buy/5` | Compra um item para o personagem. |
| **GET** | Inventory Index | `http://localhost:3000/inventory/1` | Exibe o inventário de um personagem. |
| **POST** | Use Item | `http://localhost:3000/inventory/1/use/5` | Usa um item consumível. |
| **POST** | Equip Item | `http://localhost:3000/inventory/1/equip/5` | Equipa um item de equipamento. |
| **POST** | Unequip Item | `http://localhost:3000/inventory/1/unequip/5` | Desequipa um item. |
| **POST** | Discard Item | `http://localhost:3000/inventory/1/discard/5` | Descarta um item do inventário. |

---

## 👨‍🏫 Área do Professor

| Método | Rota / Função | URL de Exemplo | Descrição |
| :--- | :--- | :--- | :--- |
| **GET** | List Adventures | `http://localhost:3000/teacher/adventures` | Lista aventuras criadas pelo professor. |
| **GET** | Create Adventure | `http://localhost:3000/teacher/adventures/new` | Formulário de nova aventura. |
| **POST** | Save Adventure | `http://localhost:3000/teacher/adventures` | Salva nova aventura. |
| **GET** | List Questions | `http://localhost:3000/teacher/questions` | Lista questões do banco de dados. |
| **GET** | Create Question | `http://localhost:3000/teacher/questions/new` | Formulário de nova questão. |
| **POST** | Save Question | `http://localhost:3000/teacher/questions` | Salva nova questão. |
| **GET** | Duplicate Question | `http://localhost:3000/teacher/questions/1/duplicate` | Duplica uma questão existente. |
| **GET** | Student Reports | `http://localhost:3000/teacher/reports/students` | Relatórios de desempenho dos alunos. |
| **GET** | Adventure Reports | `http://localhost:3000/teacher/reports/adventures` | Relatórios de desempenho por aventura. |

---

## 🛠️ Administração (Admin)

### Disciplinas
| Método | Rota / Função | URL de Exemplo | Descrição |
| :--- | :--- | :--- | :--- |
| **GET** | List Disciplines | `http://localhost:3000/admin/disciplines` | Gerenciamento de disciplinas. |
| **POST** | Create Discipline | `http://localhost:3000/admin/disciplines` | Cria nova disciplina. |

### Poderes e Efeitos
| Método | Rota / Função | URL de Exemplo | Descrição |
| :--- | :--- | :--- | :--- |
| **GET** | List Powers | `http://localhost:3000/admin/powers` | Gerenciamento de poderes. |
| **POST** | Create Power | `http://localhost:3000/admin/powers` | Cria novo poder. |
| **GET** | List Effects | `http://localhost:3000/admin/effects` | Gerenciamento de efeitos. |
| **POST** | Create Effect | `http://localhost:3000/admin/effects` | Cria novo efeito. |

### Itens
| Método | Rota / Função | URL de Exemplo | Descrição |
| :--- | :--- | :--- | :--- |
| **GET** | List Items | `http://localhost:3000/admin/items` | Gerenciamento de itens do jogo. |
| **POST** | Create Item | `http://localhost:3000/admin/items` | Cria novo item. |

### Aventuras e Cenas (Admin)
| Método | Rota / Função | URL de Exemplo | Descrição |
| :--- | :--- | :--- | :--- |
| **GET** | List Adventures | `http://localhost:3000/admin/adventures` | Gerenciamento global de aventuras. |
| **GET** | List Scenes | `http://localhost:3000/admin/scenes` | Lista todas as cenas do sistema. |
| **GET** | Adventure Scenes | `http://localhost:3000/admin/adventures/1/scenes` | Lista cenas de uma aventura específica. |

### Personagens (Admin)
| Método | Rota / Função | URL de Exemplo | Descrição |
| :--- | :--- | :--- | :--- |
| **GET** | List Characters | `http://localhost:3000/admin/characters` | Lista todos os personagens do sistema. |
| **GET** | Show Character | `http://localhost:3000/admin/characters/1` | Visualiza detalhes de qualquer personagem. |
