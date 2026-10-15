<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md: regras para qualquer agente (Claude, Codex, Cursor, Gemini…)

Leia este arquivo **inteiro** antes de qualquer tarefa. O produto, a arquitetura e o backlog estão em [PLANO.md](PLANO.md). O visual está em [DESIGN.md](DESIGN.md).
Papéis: **Renan = PO** (decide e aprova). **Agente coordenador** = abre issues, distribui o trabalho, revisa e faz merge. **Agentes executores** = implementam uma issue por vez.

## 1. Fluxo GitHub (obrigatório, sem exceção)

1. **Toda tarefa começa com uma issue.** Vale para correção, melhoria ou nova função, até as pequenas. Use o template correspondente e a label de tipo:
   - `tipo:correcao`: algo quebrado. Descrever comportamento esperado × atual e como reproduzir.
   - `tipo:melhoria`: algo que já existe e fica melhor.
   - `tipo:feature`: funcionalidade nova.
   - Labels extras: `fase:0` … `fase:5`, e `precisa-aprovacao` (ver item 7).
   - Toda issue tem **critérios de aceite** em checklist.
2. **Branch:** `<tipo>/<numero-da-issue>-<slug>`. Exemplos: `feat/12-pagina-produto`, `fix/31-estoque-negativo`, `chore/3-deploy-cloudflare`.
3. **Commits:** Conventional Commits, validados pelo Commitlint. O tipo fica em inglês e a descrição em português, no imperativo:
   `feat(loja): adiciona seletor de variante (#12)`. Tipos: `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `chore`, `ci`, `style`.
4. **Pull Request:**
   - uma issue = um PR, pequeno e focado;
   - o título segue Conventional Commits, porque vira o commit do squash;
   - **a descrição DEVE mencionar a issue** com `Closes #<n>` (ou `Fixes #<n>` para correção), para que ela feche automaticamente no merge;
   - preencher o template: o que mudou, como testar, prints e vídeo em **375px** para mudanças de UI, e o checklist do §2.
5. **CI verde é obrigatório** para o merge. Nunca use `--no-verify`, nunca desative uma regra para "passar", nunca apague um teste que falha. Corrija a causa.
6. **Merge:** sempre squash, e a branch é apagada depois. **Nunca dê push direto na `main`.** O deploy de produção acontece automaticamente no merge na `main`.
7. **Precisa de aprovação do Renan antes do merge** (label `precisa-aprovacao`) todo PR que:
   - mexe em pagamento, webhook, RLS/políticas, autenticação ou segredos;
   - tem migration destrutiva (drop, rename, mudança de tipo);
   - muda dependência de produção nova;
   - muda o visual de forma ampla (identidade, layout global).
   Os demais o coordenador pode mergear com CI verde e revisão própria.
8. Achou um problema fora do escopo da issue atual? **Abra outra issue.** Não resolva junto.

## 2. Definição de pronto (checklist de todo PR)

- [ ] Critérios de aceite da issue cumpridos.
- [ ] Testes: unidade para lógica nova em `lib/` e `server/`, integração quando tocar o banco ou RLS, E2E quando mudar fluxo crítico.
- [ ] UI testada em 375px e em desktop.
- [ ] Toda tela ou componente novo com dados tem **skeleton** no formato do conteúdo final, **estado vazio** e **estado de erro**.
- [ ] Toda interação tem **feedback e movimento** (entrada, saída, carregamento ou progresso) e respeita `prefers-reduced-motion`.
- [ ] Imagens com `alt`, `loading="lazy"` abaixo da dobra e tamanho explícito (sem CLS).
- [ ] Acessibilidade: foco visível, rótulos em inputs, contraste AA, área de toque ≥ 44px.
- [ ] Migration nova com **RLS habilitado e políticas**, e testada.
- [ ] Nenhum segredo, `console.log` solto ou código morto (o Knip acusa).
- [ ] `PLANO.md` atualizado se uma decisão mudou.

## 3. Arquitetura (o dependency-cruiser bloqueia violações)

- `src/app/` contém rotas e páginas. `src/components/` contém UI. `src/server/` contém regras de negócio e é a **única** camada que fala com o Supabase. `src/lib/` contém funções puras.
- `components/` não importa `server/`. `server/` não importa `app/` nem `components/`. Todo arquivo de `server/` começa com `import 'server-only'`.
- A service role key do Supabase é usada **só** em `src/server/supabase.ts`.
- Server Components por padrão. `'use client'` apenas no menor componente que precisa de interatividade.
- Dinheiro sempre em **centavos inteiros**. Formatação só na borda (`lib/dinheiro.ts`).
- Nomes: o domínio fica em português (`pedido`, `variante`, `calcularFrete`). Termos técnicos genéricos ficam em inglês (`useMediaQuery`, `Button`).

## 4. Segurança (inegociável)

- Toda entrada de Server Action ou Route Handler é validada com **Zod**.
- **Proibido** montar SQL concatenando strings. Usar o client do Supabase ou funções Postgres com parâmetros.
- **Preço, frete e total são calculados no servidor ou no banco.** O cliente envia só IDs e quantidades.
- Webhook do Mercado Pago: valida a assinatura, **reconsulta o pagamento na API** e processa de forma idempotente.
- Rotas `/admin` exigem as duas barreiras: middleware **e** RLS.
- Agentes **não** criam contas, não leem nem colam chaves reais e não alteram segredos. Se precisar de uma variável nova, documente em `.env.example` e peça ao Renan.

## 5. UI e movimento

- Siga o `DESIGN.md`. Não use visual padrão de kit de componentes, gradiente roxo genérico, emoji como ícone ou "cara de template".
- Antes de criar ou alterar UI, use as skills instaladas no projeto: `design-taste-frontend` (direção), `design-motion-principles` (movimento, linha "Production Polish"), `web-design-guidelines` (auditoria).
- Movimento primeiro com CSS (transitions, `@starting-style`, View Transitions). A lib `motion` só onde o CSS não resolve. Entrada de 150–250 ms, saída mais curta.
- Skeleton via `loading.tsx` e `<Suspense>`. Componentes pesados de cliente via `next/dynamic`.
- Botões de ação mostram estado pendente e ficam desabilitados durante a ação. Uploads mostram progresso real.
- Use o **Playwright CLI** para abrir a página, tirar print em 375px e conferir o resultado antes de abrir o PR.
- Referências visuais ficam em `docs/referencias/`.

## 6. Comandos

```bash
pnpm dev            # app local
pnpm check          # biome + tsc + knip + depcruise
pnpm test           # vitest (requer `supabase start`)
pnpm test:e2e       # playwright
pnpm db:migration   # nova migration
pnpm db:types       # regenerar tipos do Supabase
```

## 7. Quando estiver em dúvida

Prefira a solução mais simples que cumpre os critérios de aceite. Não crie abstração, config ou dependência "para o futuro". Se a issue estiver ambígua, comente na issue e pergunte ao Renan antes de implementar.
