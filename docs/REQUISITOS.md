# Análise de Requisitos e Especificação Arquitetural
## Mapa de Viagens do Brasil com Efeito Raspadinha e Apresentação de Fotos

- **Versão do Documento**: 1.2.0
- **Status**: Aprovado para Implementação
- **Stack Tecnológica**: React 19, TypeScript 5, Vite, Arquitetura MVVM Estrita, Tailwind CSS, Vitest + Testing Library
- **Arquivos e Recursos de Referência**:
  - Imagem de Referência do Poster: [`Gemini_Generated_Image_cxemzjcxemzjcxem.jpg`](file:///C:/projects/estudos/BrazilTravels/Gemini_Generated_Image_cxemzjcxemzjcxem.jpg)
  - Mockup Visual Renderizado (PNG): [`ui-mockup.png`](file:///C:/projects/estudos/BrazilTravels/ui-mockup.png)
  - Mockup Vetorial Escalável (SVG): [`ui-mockup.svg`](file:///C:/projects/estudos/BrazilTravels/ui-mockup.svg)
  - Base de Dados Geográfica Oficial do IBGE: [`brazil_states.json`](file:///C:/projects/estudos/BrazilTravels/brazil_states.json)
  - Especificação Técnica em Inglês: [`REQUIREMENTS.md`](file:///C:/projects/estudos/BrazilTravels/REQUIREMENTS.md)

---

## 1. Visão Geral e Objetivo do Projeto

O **Mapa de Viagens do Brasil Interativo (Estilo Raspadinha)** é uma aplicação web concebida para funcionar como um mural digital de viagens, inspirada nos tradicionais mapas físicos de raspar (como demonstrado na imagem de referência [`Gemini_Generated_Image_cxemzjcxemzjcxem.jpg`](file:///C:/projects/estudos/BrazilTravels/Gemini_Generated_Image_cxemzjcxemzjcxem.jpg)).

### 1.1. Metáfora da Raspadinha Digital
* **Estado Inicial Bloqueado**: Todos os 26 estados + Distrito Federal, bem como todas as listas de praias, cidades famosas, pontos turísticos e ilhas, iniciam com uma camada cinza metálica fosca (*scratch-off*), com tipografia em preto escuro nítido.
* **Liberação Interativa**: Ao clicar em qualquer estado no mapa ou em um ponto turístico/praia nas listas laterais, abre-se um modal minimalista de confirmação.
* **Revelação de Cores Oficiais e Fotos**: Ao confirmar, o destino é liberado, revelando a cor vibrante de sua região (Norte verde, Nordeste vermelho/coral, Centro-Oeste roxo, Sudeste laranja e Sul azul). O item liberado passa a exibir um botão com ícone de `+` para anexar fotos daquela viagem.

### 1.2. Disposição para Monitor Vertical (Totem / Display Kiosk)
A tela é otimizada para monitores na posição vertical (**1080 × 1920**, proporção 9:16), dividida em dois blocos harmoniosos:
* **Parte Superior (~35% da altura da tela)**: *Apresentação de Slideshow Contínuo*, exibindo as fotos cadastradas das viagens já realizadas, com efeito hero, título, data e carrossel lateral de miniaturas.
* **Parte Inferior (~65% da altura da tela)**: *Poster Interativo do Mapa do Brasil*, contendo o mapa com as fronteiras geográficas oficiais do IBGE, listas dinâmicas laterais, fita inferior com as 27 bandeiras e modal de liberação na base.
* A aplicação também se adapta responsivamente para monitores convencionais em paisagem (16:9), distribuindo o Slideshow à esquerda e o Mapa à direita.

---

## 2. Layout da Interface e Mockup Visual

Abaixo está o diagrama esquemático da tela em modo vertical:

```
+-------------------------------------------------------------------------+
| [SEÇÃO SUPERIOR ~35% DA ALTURA - SLIDESHOW DE MEMÓRIAS]                  |
|  TRAVEL MEMORIES • SLIDESHOW DAS VIAGENS DESBLOQUEADAS                  |
|  +-------------------------------------+  +---------------------------+  |
|  | [Card Hero da Foto em Destaque]     |  | [Carrossel de Miniaturas] |  |
|  |  * Foto de alta resolução ampliada  |  |  * Lençóis Maranhenses    |  |
|  |  * Selo "DESTINO DESBLOQUEADO"      |  |  * Cristo Redentor        |  |
|  |  * Local, data e notas da viagem    |  |  * Cataratas do Iguaçu    |  |
|  +-------------------------------------+  +---------------------------+  |
+-------------------------------------------------------------------------+
| [SEÇÃO INFERIOR ~65% DA ALTURA - MAPA DO BRASIL ESTILO RASPAGEM]        |
|  Progresso: [ 6 / 27 Estados Desbloqueados • 22% ]                      |
|  +----------------+  +--------------------------+  +------------------+  |
|  | LATERAIS ESQ.  |  | MAPA VETORIAL IBGE       |  | PRINCIPAIS PRAIAS|  |
|  |  - Ilhas       |  |  * Desbloqueado: Cor Viva|  |  * Sancho [v] [+]|  |
|  |  - Cidades     |  |  * Bloqueado: Raspadinha |  |  * Copacabana[+] |  |
|  |  - Pontos Tur. |  |    cinza metálico com    |  |  * Jericoacoara  |  |
|  |  (Mostra já    |  |    siglas dos estados    |  |  (Mostra já      |  |
|  |   liberados ou |  |  * Fronteiras reais IBGE |  |   liberadas ou   |  |
|  |   do est. foco)|  |  * Conexões litorâneas   |  |   do est. foco)  |  |
|  +----------------+  +--------------------------+  +------------------+  |
|  +--------------------------------------------------------------------+  |
|  | FITA DE BANDEIRAS: [AM][MA][BA][PE][RJ][PR][..bandeiras cinzas..]  |  |
|  +--------------------------------------------------------------------+  |
|  +--------------------------------------------------------------------+  |
|  | [MODAL DE LIBERAÇÃO SIMPLES NA BASE]                               |  |
|  |  "Deseja realmente liberar este destino?" -> Jericoacoara (CE)     |  |
|  |  [ Cancelar ]                     [ Confirmar ]                    |  |
|  +--------------------------------------------------------------------+  |
+-------------------------------------------------------------------------+
```

O mockup visual gerado está disponível em:

![Mockup do Layout](file:///C:/projects/estudos/BrazilTravels/ui-mockup.png)

---

## 3. Requisitos Funcionais (RF)

### 3.1. Visualização do Mapa e Cores Regionais
- **RF-01 (Fronteiras Geográficas Oficiais do IBGE)**: O mapa do Brasil deve ser renderizado como um SVG interativo utilizando exclusivamente as coordenadas geográficas oficiais do IBGE ([`brazil_states.json`](file:///C:/projects/estudos/BrazilTravels/brazil_states.json)), reproduzindo com fidelidade os contornos de todos os 26 estados + Distrito Federal, linha de costa e ilhas. Polígonos simplificados ou imprecisos são proibidos.
- **RF-02 (Camada de Raspadinha e Revelação de Cores)**:
  - **Estado Bloqueado**: Todos os estados e locais não visitados exibem preenchimento metálico prateado/cinza (`#9ca3af` / `#cbd5e1`) com a sigla do estado em preto escuro (`#111827`).
  - **Estado Liberado**: Revela a paleta de cores regional em alta vivacidade com transição suave:
    - **Região Norte**: Tons de verde esmeralda e floresta (`#10b981`, `#059669`).
    - **Região Nordeste**: Tons de vermelho coral e carmim (`#ef4444`, `#dc2626`).
    - **Região Centro-Oeste**: Tons de roxo e violeta (`#8b5cf6`, `#7c3aed`).
    - **Região Sudeste**: Tons de laranja quente e âmbar (`#f97316`, `#ea580c`).
    - **Região Sul**: Tons de azul oceano e ciano (`#0284c7`, `#06b6d4`).

### 3.2. Comportamento Dinâmico das Listas Laterais (Sidebars)
- **RF-03 (Categorias & Visão Dinâmica: Global vs. Filtrada por Estado)**:
  - **Categorias Suportadas**: *Praias*, *Cidades Famosas*, *Pontos Turísticos*, *Cachoeiras* e *Ilhas*.
  - **Distribuição Ponderada por Estado**:
    - **Alta Densidade**: Estado de **São Paulo (SP)** e estados vizinhos (**Rio de Janeiro - RJ**, **Minas Gerais - MG**, **Paraná - PR**, **Mato Grosso do Sul - MS**, **Goiás - GO / DF**), contendo dezenas de praias, cachoeiras e marcos turísticos detalhados.
    - **Densidade Representativa**: Demais estados do Brasil (Norte, Nordeste e Sul), contendo suas principais atrações consagradas nacionalmente.
  - **Modo Global (Nenhum estado selecionado no mapa - `selectedState === null`)**:
    - As colunas laterais (*Ilhas*, *Cidades Famosas*, *Pontos Turísticos*, *Cachoeiras* na esquerda; *Principais Praias* na direita) exibem **apenas os pontos que o usuário já liberou** em todo o Brasil.
    - Caso o usuário ainda não tenha liberado nenhum ponto, exibe-se uma mensagem de orientação convidando a clicar em um estado no mapa.
  - **Modo Filtrado por Estado (Ao clicar em um estado - `selectedState !== null`)**:
    - Ao clicar em um estado no mapa (ex: *São Paulo*, *Minas Gerais*, *Ceará*), as laterais atualizam imediatamente para exibir **todos os pontos e cachoeiras pertencentes àquele estado selecionado** (tanto os liberados quanto os ainda bloqueados).
    - Clicar novamente no mesmo estado ou no fundo do mapa desmarca a seleção e retorna as laterais para a lista de locais já liberados.

### 3.3. Regra de Liberação em Cascata e Modal Minimalista
- **RF-04 (Regra em Cascata: Liberar 1 Ponto Libera o Estado)**:
  - Ao liberar qualquer ponto de interesse (seja praia, cidade ou ponto turístico), **o estado correspondente é automaticamente liberado no mapa**, transformando-se de cinza para a sua cor oficial de região.
- **RF-05 (Modal de Confirmação Minimalista)**:
  - Ao clicar em um ponto ou estado para liberar, o modal de confirmação deve ser simples e direto:
    - Pergunta clara: *"Deseja realmente liberar este destino?"*.
    - Nome do local em destaque: Exemplo: `Jericoacoara (CE)` ou `Praia do Sancho (PE)`.
    - Dois botões únicos:
      - **[Confirmar]**: Efetiva a liberação do ponto e do estado associado.
      - **[Cancelar]**: Fecha o diálogo sem alterar nada (tecla `Esc` suportada).
    - Não exige formulários complexos nem uploads obrigatórios neste momento, garantindo máxima fluidez.
- **RF-06 (Botão '+' com Ícone SVG para Adicionar Fotos Pós-Liberação)**:
  - Assim que um destino é liberado, seu card na lista passa a exibir um botão com **ícone SVG de `+`** (`[+]`).
  - Clicar no botão `+` abre a janela para selecionar ou arrastar fotos da viagem para aquele ponto.
- **RF-07 (Fita de Bandeiras dos Estados)**:
  - Uma faixa horizontal na base exibe as 27 bandeiras dos estados. Os estados desbloqueados exibem a bandeira colorida; os bloqueados exibem a bandeira em cinza de raspadinha.

### 3.4. Slideshow de Fotos Superior
- **RF-08 (Apresentação Automatizada de Memórias)**:
  - Localizado no topo da tela, exibe as fotos adicionadas pelos botões `+` dos destinos liberados.
  - Rotação automática configurável (a cada 5 a 8 segundos) com transição suave.
  - Controles manuais acessíveis: pausar ao passar o mouse ou focar, botão de foto anterior (`<`), próxima (`>`) e navegação por miniaturas no carrossel lateral.
  - Exibe no card: nome do local, estado, data da viagem e autor/legenda da foto.
  - Enquanto não houver fotos, exibe uma ilustração convidativa incentivando a raspar o primeiro destino.

### 3.5. Armazenamento e Persistência
- **RF-09 (Persistência Offline Local com IndexedDB)**:
  - Todos os estados desbloqueados, pontos liberados e imagens em alta resolução enviadas são salvos no navegador via `IndexedDB`.
  - A aplicação funciona 100% offline, sem necessidade de servidores ou custos de hospedagem.
- **RF-10 (Integração com Backend Opcional)**:
  - Arquitetura desacoplada via serviço (`StorageService`), permitindo alternar facilmente entre `IndexedDB` no cliente ou um backend leve em Node.js para salvar imagens em disco (`/uploads`) em caso de totem público físico.
- **RF-11 (Backup e Reset)**:
  - Função de *Exportar Viagens* (download de arquivo `.json` com o progresso e fotos).
  - Função de *Importar Viagens* para restaurar dados.
  - Opção de *Zerar Raspadinha* mediante confirmação dupla.

---

## 4. Requisitos Não Funcionais (RNF)

### 4.1. Acessibilidade (Padrão WCAG 2.1 AA+)
- **RNF-01 (Semântica HTML5)**: Utilização rigorosa de elementos nativos (`<header>`, `<main>`, `<section>`, `<nav>`, `<dialog>`, `<button>`). Proibido o uso de `<div>` clicável sem semântica.
- **RNF-02 (Navegação por Teclado)**: Todos os estados do mapa e botões `+` das listas devem ser navegáveis via tecla `Tab` e ativados por `Enter` e `Espaço`.
- **RNF-03 (Compatibilidade com Leitores de Tela)**:
  - Cada estado no SVG deve possuir `role="button"`, `aria-label="[Nome do Estado], [Região] - [Liberado / Bloqueado]"` e `aria-pressed={isUnlocked}`.
  - O modal deve reter o foco (focus trap), responder a `Escape` e possuir `aria-modal="true"`.
- **RNF-04 (Contraste de Cores)**: Texto sobre a raspadinha prateada e sobre as cores dos estados deve garantir contraste mínimo de 4.5:1.

### 4.2. Desempenho e Display
- **RNF-05 (Resolução de Totem Vertical)**: Otimizado para monitores em orientação vertical (1080×1920).
- **RNF-06 (Interatividade Vetorial a 60 FPS)**: Renderização instantânea do SVG sem travamentos ou deslocamento cumulativo de layout (CLS = 0).

---

## 5. Padrão Arquitetural: MVVM Estrito

Para manter a separação estrita de responsabilidades:

```
src/
├── models/                     # Modelos TypeScript puros (Zero dependências de React / JSX)
│   ├── Destination.ts          # Entidades de Estado, Praia, Cidade, Ilha
│   ├── TravelPhoto.ts          # Registro de fotos, datas e metadados
│   ├── RegionColor.ts          # Paletas e cores das regiões brasileiras
│   └── schemas/                # Schemas Zod de validação em tempo de execução
│
├── services/                   # Serviços puros de armazenamento e utilitários
│   ├── StorageService.ts       # Interface desacoplada de persistência
│   ├── IndexedDBStorage.ts     # Implementação cliente via IndexedDB
│   ├── ApiStorage.ts           # Implementação opcional de API REST
│   └── ImageCompressor.ts      # Otimizador de imagem em Canvas no cliente
│
├── viewmodels/                 # Custom Hooks React (Zero JSX, Zero HTML/CSS)
│   ├── useBrazilMapViewModel.ts       # Estados do mapa, seleção, filtro dinâmico e cascata
│   ├── useSlideshowViewModel.ts       # Rotação do carrossel, timers e foto ativa
│   └── useUnlockModalViewModel.ts     # Controle do modal simples e upload de fotos
│
├── views/                      # Componentes React Funcionais e Acessíveis (TSX)
│   ├── AppView.tsx                    # Layout principal (Vertical Kiosk / Desktop)
│   ├── components/
│   │   ├── slideshow/
│   │   │   ├── PhotoSlideshow.tsx     # Card Hero e miniaturas do carrossel
│   │   │   └── SlideshowControls.tsx  # Botões de controle de reprodução
│   │   ├── map/
│   │   │   ├── BrazilMapPoster.tsx    # Moldura do poster
│   │   │   ├── BrazilMapSvg.tsx       # 27 estados em SVG com fronteiras IBGE
│   │   │   ├── CategorySidebar.tsx    # Listas laterais dinâmicas com botão '+'
│   │   │   └── StateFlagsBar.tsx      # Fita com as 27 bandeiras
│   │   └── modal/
│   │       ├── SimpleUnlockModal.tsx  # Modal de confirmação enxuto
│   │       └── PhotoUploadDrawer.tsx  # Gaveta para envio de fotos via botão '+'
│
└── tests/                      # Testes unitários com Vitest e React Testing Library
    ├── models/
    ├── viewmodels/
    └── views/
```

---

## 6. Modelos de Domínio e Contratos TypeScript

*(Nota de Conformidade: Os identificadores, interfaces e tipos mantêm-se em inglês conforme os padrões de engenharia).*

```typescript
/**
 * Regiões geográficas oficiais do Brasil.
 */
export type BrazilianRegion = 
  | 'North' 
  | 'Northeast' 
  | 'Center-West' 
  | 'Southeast' 
  | 'South';

/**
 * Siglas das 27 Unidades Federativas do Brasil.
 */
export type BrazilStateCode =
  | 'AC' | 'AL' | 'AP' | 'AM' | 'BA' | 'CE' | 'DF' | 'ES' | 'GO'
  | 'MA' | 'MT' | 'MS' | 'MG' | 'PA' | 'PB' | 'PR' | 'PE' | 'PI'
  | 'RJ' | 'RN' | 'RS' | 'RO' | 'RR' | 'SC' | 'SP' | 'SE' | 'TO';

/**
 * Categoria do destino ou ponto de interesse.
 */
export type DestinationCategory = 
  | 'State' 
  | 'Beach' 
  | 'FamousCity' 
  | 'TouristSpot' 
  | 'Island';

/**
 * Entidade que representa um destino (estado, praia ou ponto).
 */
export interface Destination {
  readonly id: string;
  readonly code?: BrazilStateCode;
  readonly name: string;
  readonly category: DestinationCategory;
  readonly region: BrazilianRegion;
  readonly stateCode: BrazilStateCode;
  readonly isUnlocked: boolean;
  readonly unlockedAt?: string; // ISO 8601
  readonly unlockedColor: string; // Cor hexadecimal regional
  readonly photosCount: number;
}

/**
 * Registro de foto enviada via botão '+'.
 */
export interface TravelPhoto {
  readonly id: string;
  readonly destinationId: string;
  readonly dataUrl: string; // Base64 ou URL local de objeto
  readonly fileName: string;
  readonly caption?: string;
  readonly travelDate?: string;
  readonly createdAt: string;
}

/**
 * Dataset completo para exportação e importação.
 */
export interface TravelLogDataset {
  readonly schemaVersion: '1.2.0';
  readonly unlockedDestinationIds: string[];
  readonly photos: TravelPhoto[];
  readonly lastModified: string;
}
```

---

## 7. Contrato do ViewModel do Mapa (`useBrazilMapViewModel`)

```typescript
export interface BrazilMapState {
  readonly destinations: Record<string, Destination>;
  readonly selectedStateCode: BrazilStateCode | null; // null = visão global; código = estado focado
  readonly displayedDestinations: Destination[]; // Lista calculada para as laterais
  readonly unlockedCount: number;
  readonly totalStatesCount: number;
  readonly progressPercentage: number;
  
  // Estado do Modal de Liberação Simples
  readonly isUnlockModalOpen: boolean;
  readonly pendingUnlockDestination: Destination | null;

  // Estado da Janela de Upload de Fotos (aberta pelo botão '+')
  readonly isPhotoModalOpen: boolean;
  readonly targetPhotoDestination: Destination | null;
}

export interface BrazilMapActions {
  /**
   * Seleciona um estado no mapa para filtrar as laterais, ou passa null para desmarcar.
   */
  readonly handleSelectState: (stateCode: BrazilStateCode | null) => void;

  /**
   * Abre o modal simples de confirmação para o destino clicado.
   */
  readonly handleRequestUnlock: (destination: Destination) => void;

  /**
   * Confirma a liberação do ponto e aciona a regra em cascata para liberar o estado pai.
   */
  readonly handleConfirmUnlock: () => Promise<void>;

  /**
   * Cancela e fecha o modal de liberação.
   */
  readonly handleCancelUnlock: () => void;

  /**
   * Abre a gaveta de anexo de fotos ao clicar no botão '+' de um destino já liberado.
   */
  readonly handleOpenPhotoUpload: (destination: Destination) => void;

  /**
   * Fecha a gaveta de envio de fotos.
   */
  readonly handleClosePhotoModal: () => void;

  /**
   * Salva a foto enviada no IndexedDB e atualiza o slideshow superior.
   */
  readonly handleSavePhoto: (destinationId: string, photo: File, caption?: string) => Promise<void>;

  /**
   * Reseta um destino específico ou todos os dados da raspadinha.
   */
  readonly handleResetDestination: (destinationId: string) => Promise<void>;
  readonly handleResetAll: () => Promise<void>;
}

export interface BrazilMapViewModelContract {
  readonly state: BrazilMapState;
  readonly actions: BrazilMapActions;
}
```

---

## 8. Cronograma de Implementação

1. **Etapa 1: Estruturação Inicial e Modelos**
   - Inicialização do projeto Vite + React 19 + TypeScript.
   - Implementação de `models/`, contratos e serviço `IndexedDBStorage` com testes unitários no Vitest.
2. **Etapa 2: Componente do Mapa com Fronteiras IBGE**
   - Importação das coordenadas reais de [`brazil_states.json`](file:///C:/projects/estudos/BrazilTravels/brazil_states.json).
   - Renderização dos estados com camada de raspadinha prateada e revelação colorida por região.
3. **Etapa 3: Laterais Dinâmicas e Regra de Liberação em Cascata**
   - Implementação da lógica de seleção: exibir já liberados no estado inicial e filtrar ao clicar no estado.
   - Aplicação da regra em cascata: liberar um ponto libera automaticamente o estado pai no mapa.
4. **Etapa 4: Modal Minimalista e Botão '+' para Fotos**
   - Criação do modal simples com pergunta direta e botões *Cancelar* / *Confirmar*.
   - Inserção do botão `+` nos cards liberados e gaveta de upload de fotos.
5. **Etapa 5: Slideshow Superior e Ajustes para Monitor Vertical**
   - Implementação do carrossel no topo sincronizado com as fotos adicionadas.
   - Calibração de layout para monitor em pé (1080×1920) e auditoria de acessibilidade WCAG 2.1 AA.
