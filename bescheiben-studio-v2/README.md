# Bescheiben Studio v1.1 — Carousel Builder

Gerador de carrosséis e stories para Instagram com agentes de IA (Gemini).
Stack: HTML estático + Vanilla JS + Vercel Serverless Functions.

---

## Estrutura do projeto

```
bescheiben-studio/
├── index.html
├── assets/
│   ├── css/styles.css
│   └── js/
│       ├── state.js       ← slides[], currentMode, fontScale, FORMAT
│       ├── builder.js     ← buildSlideHtml()
│       ├── renderer.js    ← DOM render + font scale controls
│       ├── nav.js         ← selectSlide, addSlide, deleteSlide, moveSlide
│       ├── download.js    ← PNG export adaptado ao modo (carousel/story)
│       ├── agents.js      ← Gemini agents (Storytelling + Ideias)
│       └── main.js        ← Event listeners, mode switching
├── api/
│   └── chat.js            ← Proxy Gemini (chave fica no servidor)
├── vercel.json
├── .env.example
└── README.md
```

---

## Novidades v1.1

- **Tab Story** — muda as dimensões do preview para 1080×1920 (9:16) com transição animada
- **Controles de fonte** — botões A+ / A− / ↺ na toolbar, escala de 60% a 180%
- **Badge de formato** — exibe a resolução de exportação atual (ex: `1080 × 1920 · Story 9:16`)
- **Download adaptativo** — exporta na resolução correta para o modo ativo
- **IA migrada para Gemini 2.0 Flash** — mais rápido, sem custo de API Anthropic

---

## Deploy no Vercel

### 1. Faça o deploy
```bash
npm i -g vercel
cd bescheiben-studio
vercel
```

Ou importe diretamente em [vercel.com/new](https://vercel.com/new).

### 2. Configure a variável de ambiente

**Project → Settings → Environment Variables**

| Nome             | Valor                                     |
|------------------|-------------------------------------------|
| `GEMINI_API_KEY` | `AIzaSyC9ADkMFJ_Vecho8lcF8VLf1hrxd7mBbp0` |

### 3. Redeploy
```bash
vercel --prod
```

---

## Desenvolvimento local

```bash
cp .env.example .env.local
vercel dev   # inicia em http://localhost:3000
```
