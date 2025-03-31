# Como Utilizar o Sistema de Controle de Ponto Eletrônico

## Tela Inicial (Registro de Ponto)

![Tela Inicial](https://img.shields.io/badge/Módulo-Registro%20de%20Ponto-green)

A tela inicial é destinada aos funcionários para registro diário de ponto:

1. Digite seu ID no campo "ID do Colaborador"
2. O sistema valida automaticamente o ID e mostra o status:
  - ✅ **Pronto para registrar entrada**: Colaborador pode registrar entrada
  - 🕒 **Entrada registrada - pronto para registrar saída**: Colaborador já registrou entrada
  - ❌ **ID não encontrado**: ID inválido ou não cadastrado
3. Clique no botão para registrar seu ponto (entrada ou saída)
4. Uma mensagem de confirmação será exibida após o registro bem-sucedido

## Acesso Administrativo

![Acesso Admin](https://img.shields.io/badge/Módulo-Administrativo-blue)

Para acessar as funções de administração:

1. Clique no ícone de login no canto superior direito da tela inicial
2. Insira as credenciais administrativas:
  - Nome de usuário
  - Senha
3. Após autenticado, você será redirecionado para o painel de gerenciamento

## Gerenciamento de Funcionários

### Adicionar Funcionários

1. No painel administrativo, localize o formulário "Adicionar Novo Funcionário"
2. Preencha os campos obrigatórios:
  - ID único do funcionário
  - Nome completo
  - Cargo
3. Clique no botão "Adicionar Funcionário"
4. Uma mensagem de confirmação será exibida após adição bem-sucedida

### Editar Funcionários

1. Na tabela de funcionários, localize o colaborador que deseja editar
2. Clique no ícone de edição (✏️) na linha correspondente
3. O formulário será preenchido com os dados atuais do funcionário
4. Altere os dados necessários
5. Clique em "Salvar Alterações"
6. Uma mensagem de confirmação será exibida após atualização bem-sucedida

### Remover Funcionários

1. Na tabela de funcionários, localize o colaborador que deseja remover
2. Clique no ícone de exclusão (🗑️) na linha correspondente
3. Uma caixa de diálogo de confirmação será exibida
4. Confirme a exclusão clicando em "Sim, Remover"
5. Uma mensagem de confirmação será exibida após remoção bem-sucedida

### Visualizar Registros de Ponto

1. Na tabela de funcionários, localize o colaborador cujos registros deseja visualizar
2. Clique no ícone de relógio (🕒) na linha correspondente
3. Uma tabela detalhada será exibida com:
  - Data do registro (DD/MM/YYYY)
  - Horário de entrada (HH:MM)
  - Horário de saída (HH:MM)
  - Duração total trabalhada (HH:MM)
4. É possível filtrar os registros por:
  - Período (data inicial e final)
  - Status (completo/incompleto)
