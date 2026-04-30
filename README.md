# Bescheiben Studio v2

Gerador de carrosséis para Instagram da Bescheiben Digital Agency.

## Estrutura

```
bescheiben-studio/
├── index.html              # HTML principal
├── vercel.json             # Deploy config
├── api/
│   └── chat.js             # Proxy Gemini (Vercel serverless)
└── assets/
    ├── css/
    │   └── styles.css      # Todos os estilos (Space Grotesk)
    └── js/
        ├── state.js        # Dados globais, templates
        ├── builder.js      # Construtores HTML dos slides
        ├── nav.js          # Navegação, lista, editor
        ├── renderer.js     # Download PNG (html2canvas)
        ├── chat.js         # Agentes IA (Gemini 1.5 Flash)
        └── main.js         # Event listeners, init
```

## Deploy no Vercel

1. Importe o repositório no [vercel.com](https://vercel.com)
2. Nas **Environment Variables**, adicione:
   - `GEMINI_API_KEY` = sua chave Gemini (gratuita em aistudio.google.com)
3. Deploy automático

## Uso local

Sem backend:
```bash
npx serve .
```
Então abra `http://localhost:3000` e configure a chave Gemini em ⚙.

## Fonte

**Space Grotesk** — fonte primária da marca conforme Brand Guidelines v1.0 (p.4).

## Cores

| Token         | Hex       | Uso                    |
|---------------|-----------|------------------------|
| Brand primary | `#6B4EFF` | Cor principal Bescheiben |
| Brand deep    | `#4A32D4` | Hover / gradiente      |
| Brand accent  | `#A58BFF` | Destaques, badges      |
| Brand light   | `#C4B5FD` | Texto em dark          |

© 2025 Bescheiben Digital Agency
