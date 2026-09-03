# Migração: monólito HTML/JS → Vite + React

Este documento registra o diagnóstico, as decisões e o resultado da migração
do painel de Gestão de Membros, feita na branch `migracao-vite-react`.

## 1. Diagnóstico do estado anterior

O `index.html` original tinha 2.910 linhas e concentrava, num único arquivo:

- mais de 250 linhas de CSS num bloco `<style>` inline;
- ~125 funções JavaScript de regras de negócio, acesso ao Supabase,
  manipulação de estado e renderização de UI;
- toda a interface montada por concatenação manual de strings HTML
  (`root.innerHTML = "<div>" + valor + "</div>"`), reconstruída do zero a
  cada interação do usuário;
- um objeto `state` global mutável, lido e escrito diretamente por
  qualquer função de render;
- a URL e a chave anônima do Supabase, e a chave anônima do Google OAuth
  redirect, hardcoded no código-fonte;
- `'unsafe-inline'` tanto em `script-src` quanto em `style-src` no CSP.

Isso tornava qualquer mudança arriscada (não há como testar uma função
isoladamente), e cada busca/digitação disparava um `innerHTML` completo do
DOM — perdendo foco de campos de texto e posição de scroll, como o próprio
código já compensava manualmente (reposicionando o cursor após cada
`render()` do campo de busca).

## 2. O que mudou

| Antes | Depois |
|---|---|
| 1 arquivo de 2.910 linhas | ~60 arquivos organizados por responsabilidade |
| `innerHTML` + `addEventListener` reatribuído a cada render | JSX declarativo, React cuida do DOM |
| Objeto `state` global mutável | `AuthContext`, `DataContext`, `ModalsContext`, `ToastContext` |
| Chamadas ao Supabase espalhadas em funções de render | `src/services/*.service.js` (repository pattern) |
| Credenciais hardcoded | `import.meta.env.VITE_SUPABASE_URL/ANON_KEY`, via `.env.local` |
| `esc()` manual em toda interpolação de string | Escape automático do JSX |
| Sem build, sem bundler | Vite (dev server com HMR, build de produção) |
| xlsx via `<script>` de CDN carregado sob demanda | pacote `xlsx` via `import()` dinâmico (mesmo lazy-loading, agora versionado) |

Estrutura final (resumo — ver árvore completa em `src/`):

```
src/
├── api/supabase.js          # client único, credenciais via .env
├── config/constants.js      # tabelas, listas de opções, FIELDS
├── services/                # *.service.js — toda chamada ao Supabase
├── state/                   # AuthContext, DataContext, ModalsContext, ToastContext
├── components/               # Sidebar, Modal, Pager, FamiliaCard, modais, ícones
├── views/                    # DashboardView, TabelaView, MinisteriosView,
│                              #  FamiliasView, AgendaView, ImpressaoView,
│                              #  CadastroPublicoView (rota pública /cadastro)
├── utils/                     # funções puras (formatação, normalização, stats)
├── hooks/useUppercaseInput.js
└── styles/                    # variables.css, main.css, cadastro.css
```

## 3. Pontos que pedem atenção honesta (não é uma vitória 100% completa)

- **CSP `style-src`**: continua com `'unsafe-inline'`. Isso é deliberado —
  várias partes da UI usam cores e larguras de barra dinâmicas
  (`style={{ "--cat-color": color }}`, `style={{ width: pct + "%" }}`),
  que exigem estilo inline. Removê-lo por completo pediria reescrever
  esses casos como classes CSS geradas dinamicamente (nº finito de cores)
  ou usar nonces por requisição — viável, mas fora do escopo desta etapa.
  O que **foi** removido é o `'unsafe-inline'` de `script-src`, que é o
  risco mais sério (injeção de script arbitrário); todo o JS agora vem de
  arquivos versionados e buildados, não de `<script>` inline.
- **Chave anônima do Supabase**: mover para `.env` é boa prática
  operacional (não versionar, poder trocar por ambiente), mas tecnicamente
  a anon key do Supabase é *pensada* para ser pública — ela já era enviada
  ao navegador de qualquer forma. A proteção real dos dados depende de
  Row Level Security (RLS) configurado nas tabelas do Supabase, o que este
  código não altera. Vale revisar as políticas de RLS de `membresia`,
  `familias`, `agendamentos`, `usuarios_permitidos` etc. separadamente.
- **`dangerouslySetInnerHTML`**: usado uma única vez, em
  `CategoryIcon.jsx`, para renderizar os `<path>` dos ícones de
  ministérios/processos. São strings SVG fixas definidas em
  `utils/icons.js` — nunca dados vindos do usuário ou do banco — então
  isso não reintroduz o risco de XSS que motivou a migração.
- **Vulnerabilidade conhecida em `xlsx`**: o `npm audit` acusa uma
  vulnerabilidade "high" (`GHSA-4r6h-8v6p-xvw6`, `GHSA-5pgg-2g8v-p4x9`)
  sem correção disponível via npm — a SheetJS publica as versões
  corrigidas apenas no CDN deles, não no registro do npm. O uso aqui é
  só de **exportação** (gerar `.xlsx` a partir dos dados já carregados),
  nunca de leitura de arquivo enviado por um usuário, que é o cenário que
  essas CVEs exploram — então o risco prático é baixo, mas fica registrado.

## 4. Como rodar localmente

```bash
npm install
cp .env.example .env.local   # preencha com as credenciais do seu projeto Supabase
npm run dev                  # http://localhost:5173
```

`npm run build` gera a versão de produção em `dist/`.

## 5. Deploy na Vercel

O projeto já estava linkado a um projeto Vercel (`.vercel/project.json`
preservado). Com o Vite, a Vercel detecta o preset automaticamente
(build `vite build`, saída `dist/`). Passos:

1. Nas configurações do projeto na Vercel, cadastre as variáveis de
   ambiente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (Production e
   Preview).
2. O `vercel.json` incluído já faz o rewrite de SPA (`/(.*) → /index.html`),
   necessário porque agora há duas rotas client-side (`/` e `/cadastro`)
   servidas pelo mesmo `index.html`.
3. Deploy: `vercel --prod`, ou push para a branch que a Vercel observa.

## 6. Verificação feita nesta etapa

- `npm install` sem erros.
- `npm run build` concluído com sucesso (nenhum erro de sintaxe, import
  quebrado ou JSX inválido em nenhum dos ~60 arquivos).
- `npm run dev` sobe e responde `HTTP 200` na raiz.
- **Não foi feita verificação visual/funcional num navegador** dentro
  desta sessão (limitação do ambiente usado para a migração — o servidor
  de desenvolvimento não persiste entre chamadas de shell). Recomenda-se
  rodar `npm run dev` localmente e conferir manualmente: login com Google,
  CRUD de membros/famílias/eventos, filtros, exportação Excel e impressão,
  antes de considerar a migração pronta para produção.

## 7. O que ficou de fora desta etapa

- Testes automatizados (o objetivo da modularização era justamente
  viabilizá-los depois — services e utils puros já estão isolados e
  prontos para receber testes unitários).
- Revisão das políticas de RLS no Supabase.
- Endurecimento adicional do CSP (`style-src` sem `unsafe-inline`).
