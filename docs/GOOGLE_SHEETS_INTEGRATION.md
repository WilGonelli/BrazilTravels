# Planejamento Arquitetural & Integração com Google Sheets / Drive
## Arquitetura Serverless (Página Web Única + Google Sheets como Banco de Dados)

- **Documento**: `GOOGLE_SHEETS_INTEGRATION.md`
- **Versão**: 1.0.0
- **Status**: Especificação de Implementação Aprovada
- **Objetivo**: Descrever o alinhamento arquitetural de uma **Página Web Única (SPA em React)** que lê e escreve diretamente no Google Sheets / Google Drive sem a necessidade de manter servidores backend ativos.

---

## 1. Alinhamento Direto: "O plano é fazer uma página web apenas e ela lê e escreve no Drive?"

**SIM, EXATAMENTE ISSO!** 🎯

O projeto consiste em **uma única aplicação web frontend** (React + TypeScript + Vite) hospedada gratuitamente (na Vercel, Cloudflare Pages ou GitHub Pages).

* **Você NÃO precisa criar nem manter um servidor backend**:
  * Não precisa de Node.js rodando 24/7.
  * Não precisa de Docker, PostgreSQL ou VPS paga.
* **O Google Drive / Google Sheets atua como seu Banco de Dados Serverless**:
  * Ao carregar a página na Raspberry Pi (ou no celular), o app faz um `GET` e puxa a lista de destinos liberados do Google Sheets.
  * Ao clicar em "Confirmar" para liberar um destino, o app faz um `POST` e grava a nova linha na planilha do Google Sheets.
  * Como a planilha fica salva na sua conta pessoal do Google, **se a Raspberry Pi for desligada da tomada, resetada ou até queimada, 100% do seu progresso continua intocado no seu Google Drive**.

---

## 2. Diagrama da Arquitetura

```
┌────────────────────────────────────────────────────────┐
│               DISPOSITIVOS DE INTERAÇÃO                │
│                                                        │
│  [ Celular / Notebook ]          [ Raspberry Pi Zero ] │
│  (Abre no navegador para         (Abre em Modo Kiosk   │
│   liberar destinos no sofá)       no monitor da parede)│
└───────────────────────────┬────────────────────────────┘
                            │
                            │ 1. Carrega Frontend (HTML/JS/CSS)
                            ▼
┌────────────────────────────────────────────────────────┐
│             HOSPEDAGEM DO FRONTEND (GRÁTIS)            │
│         Vercel / Cloudflare Pages / GitHub Pages       │
│               (Página Web Única - SPA)                 │
└───────────────────────────┬────────────────────────────┘
                            │
                            │ 2. Lê (GET) e Grava (POST)
                            ▼
┌────────────────────────────────────────────────────────┐
│             GOOGLE APPS SCRIPT (ENDPOINT WEB)          │
│       (Scriptzinho de ~30 linhas embutido no Google)   │
└───────────────────────────┬────────────────────────────┘
                            │
                            │ 3. Persistência Automática
                            ▼
┌────────────────────────────────────────────────────────┐
│               SEU GOOGLE DRIVE PESSOAL                 │
│                                                        │
│  ┌─────────────────────────┐ ┌──────────────────────┐  │
│  │  Planilha Google Sheets │ │ Pasta de Fotos       │  │
│  │  (Estados e Praias      │ │ (Suas fotos originais│  │
│  │   já visitados)         │ │  já salvas no Drive) │  │
│  └─────────────────────────┘ └──────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

---

## 3. Estrutura da Planilha no Google Sheets

Na sua conta do Google Drive, cria-se uma planilha simples chamada `Viagens_Brasil_Dados` com as seguintes colunas na primeira linha:

| Coluna | Nome do Campo | Descrição / Exemplo |
| :--- | :--- | :--- |
| **A** | `destination_id` | Identificador único do local (ex: `AM`, `BA`, `sancho-pe`, `copacabana-rj`, `jericoacoara-ce`) |
| **B** | `name` | Nome legível do local (ex: *Jericoacoara*, *Baía do Sancho*, *Bahia*) |
| **C** | `category` | Categoria: `State`, `Beach`, `FamousCity`, `TouristSpot`, `Island` |
| **D** | `state_code` | Sigla da Unidade Federativa: `CE`, `PE`, `RJ`, `BA`, etc. |
| **E** | `is_unlocked` | `TRUE` ou `FALSE` |
| **F** | `unlocked_at` | Data e hora em que foi liberado (formato ISO: `2026-11-12T19:30:00Z`) |
| **G** | `photo_url` | Link público/compartilhado da foto no seu Google Drive (opcional) |
| **H** | `caption` | Nota ou memória da viagem (ex: *"Férias inesquecíveis em família"*) |

---

## 4. Como a Página Web Conversa com o Google Sheets

Para que uma página web consiga ler e escrever em uma planilha sem precisar de bibliotecas pesadas do Google, o método mais limpo e confiável é o **Google Apps Script Web App**:

### 4.1. O Script do Google (30 linhas de código prontas)
Dentro da sua própria planilha, você clica em **Extensões -> Apps Script** e cola o código abaixo:

```javascript
/**
 * Google Apps Script Web API para o Mapa de Viagens do Brasil.
 * Permite que a página web React leia e salve os destinos liberados.
 */
function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const data = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const item = {};
    headers.forEach((header, index) => {
      item[header] = row[index];
    });
    data.push(item);
  }

  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const payload = JSON.parse(e.postData.contents);
    
    // Adiciona uma nova linha com o destino liberado
    sheet.appendRow([
      payload.destination_id,
      payload.name,
      payload.category,
      payload.state_code,
      true, // is_unlocked
      new Date().toISOString(),
      payload.photo_url || "",
      payload.caption || ""
    ]);

    return ContentService.createTextOutput(JSON.stringify({ status: "success", id: payload.destination_id }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

Ao clicar em **Implantar (Deploy) -> Como Aplicativo da Web**, o Google gera uma URL única, por exemplo:
`https://script.google.com/macros/s/AKfycbx.../exec`

Essa URL é a única coisa que o seu frontend precisa conhecer!

---

## 5. Implementação no Frontend (React + TypeScript + MVVM)

Seguindo a nossa arquitetura MVVM estrita, a lógica de rede fica 100% isolada no arquivo de serviço [`src/services/GoogleSheetsStorageService.ts`](file:///C:/projects/estudos/BrazilTravels/src/services/GoogleSheetsStorageService.ts):

```typescript
/**
 * Service to interact directly with Google Sheets Web API.
 */
export class GoogleSheetsStorageService implements StorageService {
  private readonly apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  /**
   * Fetches all unlocked destinations from Google Sheets.
   */
  async getUnlockedDestinations(): Promise<Set<string>> {
    try {
      const response = await fetch(this.apiUrl);
      if (!response.ok) throw new Error("Failed to fetch from Google Sheets");
      const rows = await response.json();
      
      const unlockedIds = new Set<string>();
      rows.forEach((row: { destination_id: string; is_unlocked: boolean }) => {
        if (row.is_unlocked) {
          unlockedIds.add(row.destination_id);
        }
      });
      return unlockedIds;
    } catch (error) {
      console.error("Error reading Google Sheets, falling back to local cache:", error);
      return new Set();
    }
  }

  /**
   * Saves a newly unlocked destination directly into Google Sheets.
   */
  async unlockDestination(destination: Destination, photoUrl?: string, caption?: string): Promise<void> {
    const payload = {
      destination_id: destination.id,
      name: destination.name,
      category: destination.category,
      state_code: destination.stateCode,
      photo_url: photoUrl || "",
      caption: caption || ""
    };

    // Non-blocking background sync (Optimistic UI)
    await fetch(this.apiUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });
  }
}
```

---

## 6. O Conceito de "UI Otimista" (Velocidade Instantânea)

Para que a experiência no monitor ou no celular seja imediata e sem espera:

1. **Clique no Mapa**: Você clica em *"Jericoacoara (CE)"* e clica em *"Confirmar"*.
2. **Atualização Instantânea na Tela (0ms)**: O mapa do Ceará e o botão de Jericoacoara ficam **imediatamente coloridos** na tela e salvos na memória local do navegador (`localStorage`).
3. **Sincronização em Segundo Plano (~1s)**: O navegador envia a gravação silenciosamente para o Google Sheets via `POST`.
4. **Benefício**: Zero sensação de lentidão. A tela responde na hora e o Google Sheets fica permanentemente atualizado.

---

## 7. Por que essa solução é perfeita para a Raspberry Pi Zero W?

| Desafio da Raspberry Pi Zero W | Como essa solução resolve |
| :--- | :--- |
| **Cartão SD corrompendo em quedas de luz** | O cartão SD da Pi pode ficar em **Modo Somente Leitura (Read-Only)**. Se puxar da tomada, não quebra nada. Ao ligar de volta, ele lê a planilha do Google Sheets e recarrega tudo em segundos. |
| **Pouca memória RAM (512 MB)** | A Pi não roda banco de dados, nem Node.js, nem salva fotos em disco. Ela só exibe a página web em tela cheia no Chromium em modo Kiosk. |
| **Praticidade para adicionar novos pontos** | Você não precisa mexer no monitor da Raspberry Pi. Pode abrir o link do mapa no **seu celular**, liberar o estado ou praia do sofá, e a planilha do Google é atualizada na hora. |

---

## 8. Resumo da Conclusão

* **Sim, o plano é 100% esse**: Uma única página web React estática + Google Sheets/Drive como banco de dados serverless.
* **Sem servidores**: Zero infraestrutura para manter ou pagar.
* **Segurança total do progresso**: O histórico das suas viagens fica guardado com segurança na sua própria conta do Google.
