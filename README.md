# Screen Annotator

Aplicativo de anotações na tela para Windows, ideal para apresentações, aulas e videoconferências. Similar ao Presentify para Mac.

![Screen Annotator](https://img.shields.io/badge/Platform-Windows-blue) ![Electron](https://img.shields.io/badge/Electron-28.0-47848F)

## Funcionalidades

- **Desenho livre** - Caneta para desenhar livremente na tela
- **Marcador/Highlighter** - Destacar texto com transparência
- **Formas geométricas** - Retângulos, círculos, linhas e setas
- **Texto** - Adicionar texto em qualquer lugar da tela
- **Borracha** - Apagar anotações
- **Spotlight** - Modo holofote para destacar uma área específica
- **Cores personalizáveis** - 8 cores predefinidas + cor personalizada
- **Espessura ajustável** - Controle do tamanho do traço
- **Desfazer/Refazer** - Histórico completo de ações
- **Toolbar arrastável** - Posicione a barra de ferramentas onde preferir
- **System tray** - Minimiza para a bandeja do sistema

## Atalhos de Teclado

| Atalho | Ação |
|--------|------|
| `Ctrl+Shift+D` | Alternar modo desenho/visualização |
| `Ctrl+Shift+A` | Mostrar/ocultar janela |
| `Ctrl+Shift+C` | Limpar tela |
| `Ctrl+Shift+S` | Alternar spotlight |
| `Ctrl+Z` | Desfazer |
| `Ctrl+Y` | Refazer |
| `Ctrl+1` | Ferramenta caneta |
| `Ctrl+2` | Ferramenta marcador |
| `Ctrl+3` | Ferramenta retângulo |
| `Ctrl+4` | Ferramenta círculo |
| `Ctrl+5` | Ferramenta seta |
| `Ctrl+6` | Ferramenta linha |
| `Ctrl+E` | Borracha |
| `T` | Ferramenta texto |
| `1-6` | Selecionar ferramentas |
| `E` | Borracha |

## Instalação

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- npm (incluído com Node.js)

### Desenvolvimento

```bash
# Clonar o repositório
git clone <url-do-repositorio>
cd desktop-apresentation

# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm start
```

### Build para Windows

```bash
# Criar instalador para Windows
npm run build:win

# Criar versão portable (sem instalação)
npm run build:portable
```

Os arquivos de build serão gerados na pasta `dist/`.

## Estrutura do Projeto

```
desktop-apresentation/
├── assets/              # Ícones e recursos
├── main.js              # Processo principal do Electron
├── preload.js           # Script de preload (segurança)
├── index.html           # Interface do usuário
├── styles.css           # Estilos da interface
├── renderer.js          # Lógica de desenho e interação
├── package.json         # Configuração do projeto
└── README.md            # Documentação
```

## Como Usar

1. **Iniciar o aplicativo** - Execute `npm start` ou o executável gerado
2. **Desenhar** - Clique e arraste no canvas para desenhar
3. **Trocar ferramenta** - Use a toolbar ou atalhos de teclado
4. **Mudar cor** - Clique nas cores da toolbar ou use o seletor de cor personalizada
5. **Ajustar espessura** - Use o slider na toolbar
6. **Spotlight** - Ative para destacar uma área circular (útil para apresentações)
7. **Modo visualização** - Desative o modo desenho para interagir com apps por baixo
8. **Minimizar** - Clique no botão minimizar ou use `Ctrl+Shift+A`

## Dicas de Uso

- Durante videoconferências, compartilhe a tela inteira para que os participantes vejam suas anotações
- Use o **modo spotlight** para chamar atenção para pontos específicos
- O **marcador/highlighter** é ótimo para destacar texto sem cobri-lo
- Use **setas** para indicar fluxos ou direções
- **Desfazer** (`Ctrl+Z`) é seu amigo - não tenha medo de experimentar!

## Tecnologias Utilizadas

- [Electron](https://www.electronjs.org/) - Framework para apps desktop
- HTML5 Canvas - Renderização de desenhos
- JavaScript ES6+ - Lógica da aplicação
- CSS3 - Estilização da interface

## Licença

MIT License - Sinta-se livre para usar, modificar e distribuir.

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.
