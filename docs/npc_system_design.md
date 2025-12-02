# Planejamento do Sistema de NPCs - Lutaver

Este documento detalha o projeto técnico e visual para a implementação do sistema de NPCs (Non-Player Characters) no jogo Lutaver, seguindo estritamente os conceitos e blocos definidos.

---

## 1. Modelo Conceitual (Entidade NPC)

A entidade `NPC` será o núcleo deste sistema. Abaixo, a definição dos campos organizados pelos blocos conceituais.

### 🟦 Bloco 01: Identidade Básica
*Dados essenciais para identificação e "lore" do personagem.*

| Campo | Tipo de Dado | Descrição |
| :--- | :--- | :--- |
| `name` | String | Nome do NPC. |
| `type` | Enum/String | `professor`, `student`, `staff`, `boss`, `extra`. |
| `discipline_id` | Integer (FK) | (Opcional) ID da disciplina, se for professor. |
| `school_year` | Integer | (Opcional) Ano/série de atuação (ex: 1, 2, 3). |
| `location` | String | Local onde aparece (ex: "Biblioteca", "Corredor A"). |
| `avatar` | String | URL ou caminho da imagem/ícone do NPC. |
| `personality` | String | Traço marcante (ex: "Rigoroso", "Alegre"). |
| `short_description` | String | Descrição de 1 linha para listagens. |
| `bio` | Text | Descrição longa, história e papel no mundo. |

### 🟩 Bloco 02: Função no Jogo
*Define o que o NPC "faz" mecanicamente.*

| Campo | Tipo de Dado | Descrição |
| :--- | :--- | :--- |
| `roles` | JSON Array | Lista de papéis: `['adventure_giver', 'quiz_master', 'shopkeeper', 'boss', 'extra']`. |
| `related_adventure_id` | Integer (FK) | (Opcional) Aventura que este NPC inicia. |
| `related_shop_id` | Integer (FK) | (Opcional) Loja que este NPC gerencia. |
| `related_map_sector` | String | Setor do mapa ao qual pertence. |

### 🟧 Bloco 03: Características de Jogo
*Dados para sistemas de combate e testes.*

| Campo | Tipo de Dado | Descrição |
| :--- | :--- | :--- |
| `difficulty` | Enum | `easy`, `medium`, `hard`, `boss`. |
| `is_combatant` | Boolean | Se participa de combates/testes (Sim/Não). |
| `attributes` | JSON | Objeto com atributos: `{ strength, dexterity, constitution, intelligence, reasoning, luck }`. |
| `affinity_discipline_id`| Integer (FK) | Disciplina com afinidade especial. |
| `affinity_level` | Integer | Valor da afinidade (ex: 100). |

### 🟨 Bloco 04: Comportamento e Diálogos
*Falas pré-definidas para interação.*

| Campo | Tipo de Dado | Descrição |
| :--- | :--- | :--- |
| `dialogues` | JSON | Objeto estruturado com as falas-chave. |

**Estrutura do JSON `dialogues`:**
```json
{
  "greeting": "Olá, aluno! Pronto para mais um desafio?",
  "farewell": "Volte sempre, jovem estudioso!",
  "adventure_start": "Tenho um desafio especial para você.",
  "success": "Excelente! Você dominou este conteúdo.",
  "failure": "Você ainda não está pronto. Tente novamente."
}
```

### 🟥 Bloco 05: Integrações Futuras
*Campos reservados para expansão.*

*Nota: A maioria das integrações é coberta pelas Chaves Estrangeiras (FKs) no Bloco 02, mas podemos ter um campo genérico para configurações extras.*

| Campo | Tipo de Dado | Descrição |
| :--- | :--- | :--- |
| `custom_config` | JSON | Configurações extras para eventos, cutscenes ou recompensas específicas. |

---

## 2. Estrutura do CRUD (Admin)

O painel administrativo deve ser intuitivo, dividindo o cadastro nas mesmas abas ou seções lógicas dos blocos.

### 📌 Páginas do Admin

1.  **Listagem de NPCs (`index`)**
    *   Tabela com: Avatar (mini), Nome, Tipo, Local, Papéis (ícones).
    *   Filtros: Por Tipo, Por Local, Por Disciplina.
    *   Ações: Visualizar, Editar, Excluir.

2.  **Criação/Edição de NPC (`create` / `edit`)**
    *   **Layout em Abas (Tabs):**
        *   **Aba 1: Identidade:** Campos do Bloco 01. Upload de imagem para o avatar.
        *   **Aba 2: Funções:** Checkboxes para os `roles`. Selects condicionais (ex: se marcar "Lojinha", aparece o select de "Loja Associada").
        *   **Aba 3: Stats:** Select de Dificuldade, Switch para "Combatente", Inputs numéricos para Atributos (pode ter um botão "Gerar Aleatório" no futuro).
        *   **Aba 4: Diálogos:** Textareas para cada tipo de fala (Apresentação, Despedida, Sucesso, etc.).

3.  **Visualização Detalhada (`show`)**
    *   Layout visual estilo "Ficha de Personagem", exibindo todos os dados de forma bonita e organizada (ver seção 4).

### 🧠 Experiência do Administrador
*   **Feedback Visual:** Ao selecionar um tipo "Professor", o campo "Disciplina" deve se destacar.
*   **Validação:** Impedir salvar um NPC "Lojista" sem associar uma loja (ou alertar).
*   **Pré-visualização:** Mostrar como o balão de diálogo ficaria com as falas inseridas.

---

## 3. Arquitetura de Arquivos e Views

A estrutura de pastas seguirá o padrão MVC do projeto:

### Controllers
*   `src/controllers/AdminNPCController.js`: Lógica de CRUD.

### Models
*   `src/models/NPC.js`: Definição do Sequelize.

### Rotas
*   `src/routes/adminNPCRoutes.js`: Rotas protegidas `/admin/npcs/...`.

### Views (`src/views/admin/npcs/`)
1.  `index.ejs`: Listagem (DataTables ou Grid).
2.  `form.ejs`: Formulário único reutilizável para Create e Edit (com verificação `if npc.id`).
3.  `show.ejs`: A ficha visual do NPC.
4.  `_tab_identity.ejs`, `_tab_roles.ejs`, etc.: Partials para organizar o formulário grande se necessário.

---

## 4. Recomendações Visuais (Ficha do NPC)

A view `show.ejs` deve ser a "jóia" do admin, servindo de referência para como o jogador verá o NPC no futuro.

### Layout Proposto
*   **Cabeçalho:**
    *   Esquerda: Avatar Grande (Card flutuante).
    *   Centro: Nome (H1), Título/Tipo (Badge), Local (Ícone de mapa).
    *   Direita: Botões de Ação (Editar, Voltar).
*   **Corpo (Grid de Cards):**
    *   **Card "Sobre":** Bio e Personalidade.
    *   **Card "Funções":** Lista de ícones com o que ele faz (ex: 🛒 Vendedor, 📜 Quest Giver).
    *   **Card "Atributos":** Gráfico de radar ou barras de progresso para os stats (Força, Int, etc.).
    *   **Card "Diálogos":** Lista estilo "chat" mostrando as falas cadastradas.

### Padronização
*   **Ícones:** Usar Bootstrap Icons (`bi`).
    *   Professor: `bi-mortarboard`
    *   Aluno: `bi-backpack`
    *   Boss: `bi-fire`
    *   Lojista: `bi-shop`
*   **Cores dos Tipos:**
    *   Professor: Azul (`primary`)
    *   Boss: Vermelho (`danger`)
    *   Aluno: Verde (`success`)
    *   Funcionário: Amarelo (`warning`)

---

## 5. Sugestões de Extensões Futuras

Como ligar este sistema aos outros módulos:

1.  **NPC & Loja:**
    *   No `ShopController`, ao invés de carregar uma loja genérica, carregar `Shop.findOne({ where: { npc_id: id } })`.
    *   O NPC teria um botão "Abrir Loja" na interface do jogo.

2.  **NPC & Aventura:**
    *   Na tabela `Adventures`, adicionar coluna `giver_npc_id`.
    *   O NPC exibe um ícone de "!" (exclamação) na cabeça quando tem uma aventura disponível para o jogador.

3.  **NPC & Efeitos:**
    *   Criar tabela `NPC_ActiveEffects`. O NPC pode ter buffs permanentes (ex: "Aura de Medo" para Bosses) que aplicam debuffs no jogador ao entrar em combate.

4.  **Progressão na História:**
    *   Adicionar um campo `min_level_requirement` ou `required_quest_id` no NPC (ou em seus diálogos) para que ele só interaja ou mude de fala se o jogador tiver atingido certo progresso.
