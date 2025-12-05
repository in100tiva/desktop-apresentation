# Guia de Contribuição

Obrigado por considerar contribuir com o Screen Annotator! Este documento contém diretrizes para ajudar você a contribuir de forma efetiva.

## Índice

- [Código de Conduta](#código-de-conduta)
- [Como Contribuir](#como-contribuir)
- [Configurando o Ambiente](#configurando-o-ambiente)
- [Fluxo de Trabalho](#fluxo-de-trabalho)
- [Padrões de Código](#padrões-de-código)
- [Commits](#commits)
- [Pull Requests](#pull-requests)
- [Reportando Bugs](#reportando-bugs)
- [Sugerindo Melhorias](#sugerindo-melhorias)

## Código de Conduta

Este projeto adota um código de conduta para garantir um ambiente acolhedor para todos. Esperamos que todos os contribuidores:

- Usem linguagem acolhedora e inclusiva
- Respeitem diferentes pontos de vista e experiências
- Aceitem críticas construtivas graciosamente
- Foquem no que é melhor para a comunidade
- Mostrem empatia com outros membros da comunidade

## Como Contribuir

Existem várias formas de contribuir:

1. **Reportar bugs** - Encontrou um problema? Abra uma issue!
2. **Sugerir features** - Tem uma ideia? Compartilhe conosco!
3. **Melhorar documentação** - Ajude a tornar o projeto mais acessível
4. **Escrever código** - Corrija bugs ou implemente novas funcionalidades
5. **Revisar PRs** - Ajude a revisar pull requests de outros contribuidores

## Configurando o Ambiente

### Pré-requisitos

- [Bun](https://bun.sh/) v1.0+ (recomendado) ou [Node.js](https://nodejs.org/) v18+
- [Git](https://git-scm.com/)
- Editor de código (recomendamos [VS Code](https://code.visualstudio.com/))

### Extensões VS Code Recomendadas

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "formulahendry.auto-rename-tag"
  ]
}
```

### Passo a Passo

1. **Fork o repositório**

   Clique no botão "Fork" no GitHub para criar sua cópia do projeto.

2. **Clone seu fork**

   ```bash
   git clone https://github.com/seu-usuario/desktop-apresentation.git
   cd desktop-apresentation
   ```

3. **Adicione o repositório original como upstream**

   ```bash
   git remote add upstream https://github.com/in100tiva/desktop-apresentation.git
   ```

4. **Instale as dependências**

   ```bash
   bun install
   ```

5. **Inicie o ambiente de desenvolvimento**

   ```bash
   bun run dev
   ```

## Fluxo de Trabalho

### 1. Sincronize com o upstream

Antes de começar qualquer trabalho, sincronize sua branch main:

```bash
git checkout main
git fetch upstream
git merge upstream/main
git push origin main
```

### 2. Crie uma branch

Crie uma branch descritiva para sua contribuição:

```bash
# Para novas funcionalidades
git checkout -b feature/nome-da-feature

# Para correções de bugs
git checkout -b fix/descricao-do-bug

# Para documentação
git checkout -b docs/o-que-documentou

# Para refatoração
git checkout -b refactor/o-que-refatorou
```

### 3. Faça suas alterações

- Escreva código limpo e bem documentado
- Siga os padrões de código do projeto
- Adicione testes quando aplicável
- Atualize a documentação se necessário

### 4. Teste suas alterações

```bash
# Verificar tipos TypeScript
bun run typecheck

# Executar linter
bun run lint

# Corrigir problemas de lint automaticamente
bun run lint:fix

# Testar o build
bun run build
```

### 5. Commit suas alterações

Siga a convenção de commits (veja seção [Commits](#commits)):

```bash
git add .
git commit -m "feat: adiciona nova funcionalidade X"
```

### 6. Push e Pull Request

```bash
git push origin feature/nome-da-feature
```

Depois, abra um Pull Request no GitHub.

## Padrões de Código

### TypeScript

- Use TypeScript para todo código novo
- Defina tipos explícitos para props e estados
- Evite `any` - use `unknown` quando necessário
- Use interfaces para objetos, types para unions/primitivos

```typescript
// Bom
interface ToolbarProps {
  onToolChange: (tool: Tool) => void
  currentTool: Tool
}

// Evitar
const handleClick = (e: any) => { ... }
```

### React

- Use componentes funcionais com hooks
- Prefira composição sobre herança
- Mantenha componentes pequenos e focados
- Use Zustand para estado global

```tsx
// Bom - componente focado
export function ToolButton({ tool, isActive, onClick }: ToolButtonProps) {
  return (
    <Button variant={isActive ? 'default' : 'ghost'} onClick={onClick}>
      <tool.icon className="h-4 w-4" />
    </Button>
  )
}
```

### CSS/Tailwind

- Use classes Tailwind CSS
- Evite CSS inline
- Use o sistema de cores do tema
- Mantenha a consistência com shadcn/ui

```tsx
// Bom
<div className="flex items-center gap-2 rounded-lg bg-background p-4">

// Evitar
<div style={{ display: 'flex', alignItems: 'center' }}>
```

### Estrutura de Arquivos

```
src/
├── main/           # Electron main process
├── preload/        # Preload scripts
├── renderer/       # React app
│   ├── components/ # Componentes React
│   │   ├── ui/     # shadcn/ui components
│   │   ├── canvas/ # Canvas components
│   │   └── ...
│   ├── hooks/      # React hooks customizados
│   ├── stores/     # Zustand stores
│   ├── lib/        # Utilitários
│   └── styles/     # Estilos globais
└── shared/         # Código compartilhado
    ├── types/      # TypeScript types
    └── constants/  # Constantes
```

## Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

### Formato

```
<tipo>(<escopo opcional>): <descrição>

[corpo opcional]

[rodapé opcional]
```

### Tipos

| Tipo | Descrição |
|------|-----------|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `docs` | Apenas documentação |
| `style` | Formatação (não afeta código) |
| `refactor` | Refatoração de código |
| `perf` | Melhoria de performance |
| `test` | Adição ou correção de testes |
| `chore` | Manutenção, configs, etc. |
| `ci` | Mudanças em CI/CD |

### Exemplos

```bash
# Boa mensagem
feat(toolbar): adiciona seletor de cores personalizado
fix(canvas): corrige bug ao desenhar com tablet
docs: atualiza instruções de instalação
refactor(stores): simplifica lógica do canvasStore

# Mensagem ruim
fix: correções
update: atualizações
wip: trabalho em progresso
```

## Pull Requests

### Antes de Abrir

- [ ] Código segue os padrões do projeto
- [ ] Testes passando (`bun run typecheck && bun run lint`)
- [ ] Build funcionando (`bun run build`)
- [ ] Documentação atualizada (se aplicável)
- [ ] Commits seguem a convenção

### Template de PR

```markdown
## Descrição

Breve descrição do que foi alterado e por quê.

## Tipo de Mudança

- [ ] Bug fix (correção que não quebra funcionalidades existentes)
- [ ] Nova feature (mudança que adiciona funcionalidade)
- [ ] Breaking change (correção ou feature que quebra funcionalidades existentes)
- [ ] Documentação

## Como Testar

1. Execute `bun run dev`
2. Faça X
3. Observe Y

## Screenshots (se aplicável)

## Checklist

- [ ] Código segue o style guide do projeto
- [ ] Documentação foi atualizada
- [ ] Não há warnings no console
```

### Processo de Review

1. Mantenha PRs pequenos e focados
2. Responda aos comentários de review
3. Faça squash de commits se solicitado
4. Aguarde aprovação antes de fazer merge

## Reportando Bugs

Use o template de issue para bugs:

```markdown
## Descrição do Bug

Descrição clara e concisa do problema.

## Passos para Reproduzir

1. Vá para '...'
2. Clique em '...'
3. Observe o erro

## Comportamento Esperado

O que deveria acontecer.

## Comportamento Atual

O que está acontecendo.

## Screenshots

Se aplicável, adicione screenshots.

## Ambiente

- OS: [ex: Windows 11, macOS Sonoma, Ubuntu 22.04]
- Versão do App: [ex: 1.0.0]
- Bun/Node: [ex: Bun 1.0.0]

## Contexto Adicional

Qualquer outra informação relevante.
```

## Sugerindo Melhorias

Use o template de issue para features:

```markdown
## Descrição da Feature

Descrição clara da funcionalidade desejada.

## Motivação

Por que isso seria útil? Qual problema resolve?

## Solução Proposta

Como você imagina que isso funcionaria?

## Alternativas Consideradas

Outras abordagens que você considerou.

## Contexto Adicional

Mockups, exemplos de outros apps, etc.
```

---

## Dúvidas?

Se tiver dúvidas sobre como contribuir, abra uma [issue](https://github.com/in100tiva/desktop-apresentation/issues) ou inicie uma [discussão](https://github.com/in100tiva/desktop-apresentation/discussions).

Obrigado por contribuir! 🎉
