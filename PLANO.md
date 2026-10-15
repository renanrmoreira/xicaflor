# Xica Flor: plano de implementação

> Loja virtual da **Xica Flor — Moda Feminina** (Belém/PA).
> Este documento é a fonte de verdade do projeto. As regras de trabalho para agentes ficam em [AGENTS.md](AGENTS.md).
> Itens marcados com **[a confirmar]** dependem de resposta do Renan ou da proprietária.

---

## 1. Contexto do negócio

- Loja física em casa com venda direta. Hoje a divulgação é feita pelo Instagram [@xicaflor_](https://instagram.com/xicaflor_) e o contato pelo WhatsApp `wa.me/5591988008817`.
- **Produtos:**
  - **Moda feminina:** vestidos, blusas, calças, peças formais etc. Categorias finais **[a confirmar]** com a proprietária.
  - **Beleza (vitrine de afiliada):** maquiagem, skincare e perfumaria das marcas O.Lab e Rinode. A proprietária é **afiliada** e não pode vender esses produtos diretamente: o site só exibe a vitrine e leva a cliente para a loja virtual de afiliada dela, que tem todos os produtos.
- **Público:** compra principalmente pelo celular, a maioria em Belém e muitas clientes fixas. O objetivo secundário é alcançar clientes fora da cidade.
- **Escala:** no máximo cerca de 100 usuários simultâneos. Baixo volume. Custo zero no início.
- **Entrega:** a proprietária entrega de carro em Belém. Fora de Belém, o frete é combinado. Os Correios entram só na fase 5.

## 2. Decisões tomadas

| Tema | Decisão | Motivo / alternativa descartada |
|---|---|---|
| Arquitetura | **Uma app Next.js (App Router) em camadas**. A UI fica em `app/` e `components/`, a regra de negócio em `server/`. | Um back-end em deploy separado traria custo, CORS e dois deploys sem ganho nesta escala. `server/` pode virar serviço próprio no futuro. |
| Linguagem | TypeScript `strict` | — |
| Estilo | Tailwind CSS com tokens próprios, sem kit visual pronto | Evita a "cara de IA". O design segue o `DESIGN.md` (ver §6). |
| Banco/Auth/Arquivos | **Supabase** (Postgres, Auth, Storage, RLS, pg_cron) | Tudo num serviço só, com plano gratuito. |
| Hospedagem | **Cloudflare Workers** via `@opennextjs/cloudflare` (plano gratuito) | O plano Hobby da Vercel proíbe uso comercial. Na Cloudflare o gratuito permite. |
| Pagamento | **Mercado Pago Checkout Pro** (Pix + cartão) | A proprietária tem conta no MP e no PagBank. Fica o MP, com melhor documentação e sandbox. O PagBank fica como reserva, sem integração agora. O cartão nunca passa pelo nosso servidor. |
| Login do cliente | E-mail + senha **e** link mágico (Supabase Auth) | Pedido do Renan. O cadastro é mínimo: nome, e-mail, telefone e endereço. |
| E-mail transacional | **Resend** como SMTP do Supabase e para notificações | O SMTP embutido do Supabase tem limite de poucos e-mails por hora e serve só para teste. |
| Frete | Belém continental = **grátis**. Mosqueiro e Outeiro **não** entram no grátis (a combinar). Outras zonas por faixa de CEP, editáveis no admin. Fora das zonas = **"frete a combinar"**. Retirada na loja = grátis. | Simples. O Melhor Envio fica para a fase 5. |
| Carrinho | `localStorage`, sem tabela no banco | Ninguém precisa de carrinho entre dispositivos agora. |
| Beleza | **Vitrine**: produto sem preço, variante, estoque ou carrinho. Botão "Comprar na loja" abre o link da loja de afiliada (`categorias.link_vitrine` da raiz Beleza). | É venda por comissão de afiliada; a compra acontece no site da marca. Preço não aparece porque a marca altera sem aviso. |
| Dinheiro | Inteiro em **centavos** (`integer`), nunca `float` | Evita erro de arredondamento. |
| Observabilidade | **Sentry** (erros, traces e alertas; o SDK já é baseado em OpenTelemetry), Cloudflare Workers Logs e Cloudflare Web Analytics | Datadog e New Relic são pagos e duplicam o Sentry nesta escala. Como o Sentry usa OTel, dá para trocar depois. |
| Qualidade | Biome, Commitlint + lefthook, Knip, dependency-cruiser (contrato de arquitetura) e Stryker (só em `server/`) | Detalhes no §8. |
| Testes | Vitest (unidade e integração com Supabase local), Playwright (E2E) e Codecov | Detalhes no §8. |
| PWA | Apenas `manifest.webmanifest` e ícones, para instalar no celular | Um service worker offline não traz ganho para uma loja. |

## 3. Arquitetura

```
Celular / navegador
      │  HTTPS
      ▼
Cloudflare (DNS, proteção DDoS, CDN)
      │
      ▼
Next.js no Cloudflare Workers (OpenNext)
  ├─ app/(loja)/…            páginas públicas (Server Components, pouco JS)
  ├─ app/admin/…             painel mobile-first (somente papel admin)
  ├─ app/api/webhooks/mp     webhook do Mercado Pago
  ├─ app/api/health          healthcheck (consulta o banco)
  └─ server/…                regras de negócio — ÚNICA camada que fala com Supabase
      │
      ├──► Supabase (Postgres + RLS, Auth, Storage `produtos`, pg_cron)
      ├──► Mercado Pago API
      ├──► Resend (e-mails)
      └──► Sentry
```

### Estrutura de pastas

```
xicaflor/
├─ AGENTS.md  CLAUDE.md  PLANO.md  DESIGN.md
├─ .github/  workflows/  ISSUE_TEMPLATE/  pull_request_template.md
├─ docs/referencias/            prints de sites de referência (lidos pelos agentes)
├─ supabase/  migrations/  seed.sql  config.toml
├─ e2e/                         testes Playwright
└─ src/
   ├─ app/
   │  ├─ (loja)/  page.tsx  c/[slug]/  p/[slug]/  carrinho/  checkout/  conta/  entrar/
   │  ├─ admin/   produtos/  categorias/  pedidos/  frete/
   │  └─ api/     webhooks/mercadopago/route.ts  health/route.ts
   ├─ components/  ui/ (primitivos próprios)  loja/  admin/
   ├─ server/      (todo arquivo importa 'server-only')
   │  ├─ catalogo.ts  pedidos.ts  frete.ts  clientes.ts
   │  ├─ pagamentos/mercadopago.ts
   │  └─ supabase.ts            clientes Supabase de servidor (anon + service role)
   └─ lib/         dinheiro.ts  cep.ts  schemas.ts (Zod)  log.ts
```

### Contrato de camadas (verificado pelo dependency-cruiser no CI)

1. `components/**` **não** importa `server/**`. Componentes recebem dados por props ou chamam Server Actions.
2. `server/**` **não** importa `app/**` nem `components/**`.
3. Só `server/supabase.ts` usa a `SUPABASE_SERVICE_ROLE_KEY`.
4. `lib/**` não importa nada de `app/`, `components/` ou `server/`. São só funções puras.
5. Proibido import circular.

## 4. Modelo de dados

Convenção: nomes de domínio em português, `snake_case`, `id uuid default gen_random_uuid()`, `criado_em timestamptz default now()`.

```sql
-- Catálogo
categorias (id, nome, slug unique, parent_id → categorias null, ordem int, ativo bool,
            link_vitrine text null)   -- preenchido só na raiz "Beleza": link da loja de afiliada
  -- raízes: "Moda" e "Beleza"; filhas: Vestidos, Blusas, …, Maquiagem, Skincare, Perfumaria
produtos (id, nome, slug unique, descricao text, marca text null, categoria_id → categorias,
          ativo bool default true, destaque bool default false, criado_em)
produto_fotos (id, produto_id → produtos on delete cascade, path_grande, path_miniatura, alt, ordem)
variantes (id, produto_id → produtos on delete cascade, cor text null, tamanho text null,
           preco_centavos int check (preco_centavos > 0),
           estoque int check (estoque >= 0),   -- o banco garante que nunca fica negativo
           ativo bool, unique (produto_id, cor, tamanho))
  -- produto cuja categoria raiz tem link_vitrine = vitrine: sem variantes, nunca entra no carrinho

-- Clientes
perfis (id → auth.users primary key, nome, telefone,
        cep, logradouro, numero, complemento, bairro, cidade, uf,
        papel text check (papel in ('cliente','admin')) default 'cliente')
  -- criado por trigger no signup; usuário NÃO pode alterar `papel` (revoke update(papel))

-- Frete
zonas_frete (id, nome, cep_inicio char(8), cep_fim char(8),
             preco_centavos int null check (preco_centavos >= 0),  -- null = "frete a combinar"
             ativo)
  -- seed (faixas aproximadas, conferir com ViaCEP antes de produção):
  --   Belém              66000000–66999999  = 0
  --   Mosqueiro (ilha)   66910000–66920999  = null (a combinar; preço futuro)
  --   Outeiro (ilha)     66840000–66849999  = null (a combinar; preço futuro)

-- Pedidos
pedidos (id, numero serial unique,               -- número curto para falar com a cliente
         cliente_id → perfis,
         status text check in ('aguardando_pagamento','pago','separando','saiu_para_entrega',
                               'entregue','pronto_para_retirada','retirado','cancelado','expirado'),
         modalidade text check in ('entrega','retirada'),
         frete_a_combinar bool default false,
         subtotal_centavos, frete_centavos, total_centavos,
         endereco jsonb,                          -- snapshot do endereço no momento da compra
         mp_preference_id, mp_payment_id unique,  -- unique = idempotência do webhook
         reserva_expira_em timestamptz, pago_em timestamptz,
         criado_em, atualizado_em)
itens_pedido (id, pedido_id → pedidos, variante_id → variantes,
              nome_produto, cor, tamanho,          -- snapshot
              preco_unitario_centavos, quantidade int > 0)
```

### RLS (obrigatório em TODAS as tabelas)

Helper: `is_admin()`, uma função `security definer` que lê `perfis.papel` do `auth.uid()`.

| Tabela | Leitura | Escrita |
|---|---|---|
| categorias, produtos, variantes, produto_fotos, zonas_frete | pública se `ativo` (admin vê tudo) | só admin |
| perfis | a própria linha; admin vê todas | a própria linha (exceto `papel`) |
| pedidos, itens_pedido | os próprios; admin vê todos | **ninguém direto**. Só pela função `criar_pedido` e pelo servidor (service role) no webhook. Admin altera `status`. |
| Storage `produtos` | leitura pública | escrita só admin |

**Admins:** promovidos manualmente por SQL (`update perfis set papel='admin' where id=…`). Não existe tela para isso.

## 5. Fluxos críticos

### 5.1 Compra e estoque (sem vender a mesma peça duas vezes)

1. O carrinho (`localStorage`) envia ao servidor apenas `[{variante_id, quantidade}]`. **Preço e frete nunca vêm do cliente.**
2. A Server Action `finalizarCompra` valida com Zod, exige login e calcula o frete pelo CEP (§5.3).
3. Ela chama a função Postgres `criar_pedido(itens jsonb, modalidade, endereco)`, que roda **numa única transação**:
   - `select … from variantes where id = any(…) for update`, para travar as linhas;
   - confere o estoque, dá baixa (`estoque = estoque - qtd`) e grava o pedido como `aguardando_pagamento` com `reserva_expira_em = now() + 30 min`;
   - se faltar estoque em algum item, aborta tudo e devolve qual item faltou.
4. O servidor cria a preferência no Mercado Pago com `external_reference = pedido.id` e `date_of_expiration = reserva_expira_em`, para que o Pix não possa ser pago depois de a reserva expirar. Em seguida redireciona o cliente ao checkout do MP.
5. **pg_cron, a cada 5 min:** `expirar_pedidos()` devolve o estoque dos pedidos `aguardando_pagamento` vencidos e marca esses pedidos como `expirado`.

### 5.2 Webhook do Mercado Pago (`/api/webhooks/mercadopago`)

1. Valida a assinatura (`x-signature` com `MP_WEBHOOK_SECRET`). Se for inválida, responde 401 e loga.
2. **Não confia no corpo da notificação.** Consulta `GET /v1/payments/{id}` na API do MP.
3. Localiza o pedido por `external_reference` e aplica a transição de forma **idempotente** (`mp_payment_id unique`; repetir a mesma notificação não tem efeito):
   - `approved` → `pago`, `pago_em = now()`, e dispara os e-mails (§fase 3);
   - `rejected`/`cancelled` → `cancelado` e devolve o estoque;
   - aprovado **depois** de `expirado`: grava `pago`, tenta dar baixa de novo e, se faltar estoque, envia alerta no Sentry e e-mail ao admin para estorno manual.
4. Responde 200 rápido. O MP reenvia a notificação se receber erro.

### 5.3 Frete

- O CEP é preenchido no cadastro, com o endereço completado automaticamente pelo ViaCEP (gratuito).
- `calcularFrete(cep, modalidade)`:
  - `retirada` → R$ 0;
  - se o CEP cai em mais de uma zona ativa, **vence a de faixa mais estreita**. É assim que Mosqueiro e Outeiro saem do frete grátis de Belém;
  - zona com preço → preço da zona (Belém continental = R$ 0);
  - zona com `preco_centavos = null`, ou CEP fora de todas as zonas → `frete_a_combinar = true`. O cliente paga só os produtos, o checkout mostra um aviso claro de que o frete será combinado pelo WhatsApp, e a proprietária cobra o frete à parte.
- O admin cria e edita as zonas. Quando houver preço para Mosqueiro, Outeiro, Ananindeua ou Marituba, basta preencher o campo, sem mudar código.
- Teste obrigatório: CEP de Belém = 0, CEP de Mosqueiro = a combinar, CEP de São Paulo = a combinar.

### 5.4 Fotos (admin no celular)

- `<input type="file" accept="image/*" capture="environment" multiple>` abre a câmera direto.
- **Compressão no aparelho** (canvas → WebP) em 2 tamanhos: grande (1600px, cerca de 200 KB) e miniatura (600px, cerca de 50 KB). O upload vai direto ao Supabase Storage, com barra de progresso.
- A loja usa `<img srcset loading="lazy" decoding="async">` com as duas versões. Não depende de um otimizador de imagem pago.
- `// ponytail:` Storage gratuito = 1 GB e 5 GB/mês de tráfego. Se estourar, migrar as imagens para Cloudflare R2 (10 GB grátis, sem custo de tráfego).

## 6. Front-end, identidade e movimento

### Identidade Xica Flor (ponto de partida)

- **Logo atual:** círculo amarelo-manteiga, lettering cursivo bordô "XicaFlor" com ramos de folhas e o subtítulo "Moda Feminina". **Pedir o arquivo original** da logo à proprietária. Se não houver, vetorizar em SVG.
- **Paleta inicial** (refinar no `DESIGN.md`): amarelo-manteiga (cerca de `#F2DA6B`), bordô (cerca de `#9C1C31`), rosa "Pink Collection" (cerca de `#E0218A`) como acento, e neutros quentes (off-white e grafite).
- **Slogan:** "Seja você o seu próprio padrão de beleza!"
- **Tipografia:** no máximo 2 famílias, servidas localmente via `next/font`. A escolha sai do processo do `DESIGN.md`.

### Ferramentas de design para os agentes (instalar na fase 0, no escopo do projeto, depois de revisar os arquivos)

| Ferramenta | Uso | Instalação |
|---|---|---|
| [design-motion-principles](https://github.com/kylezantos/design-motion-principles) | Construir **e** auditar animações. Para loja de consumo, usar a linha "Production Polish" (Jakub Krehel). | `npx skills add https://github.com/kylezantos/design-motion-principles --skill design-motion-principles` |
| [taste-skill](https://github.com/Leonxlnx/taste-skill) (`design-taste-frontend`) | Direção estética que foge do genérico | `npx -y skills add leonxlnx/taste-skill --agent claude-code` |
| [web-design-guidelines](https://github.com/vercel-labs/agent-skills) (Vercel) | Auditoria de UI: acessibilidade, tipografia, layout | via `npx skills add` a partir de `vercel-labs/agent-skills` |
| [awesome-design-md](https://github.com/VoltAgent/awesome-design-md) | Referências de `DESIGN.md` reais para montar o nosso | consulta (não precisa instalar) |
| [Playwright CLI](https://github.com/microsoft/playwright-cli) | O agente abre o site, tira prints e inspeciona a UI | `npm i -g @playwright/cli@latest` e `playwright-cli install --skills` |
| "Image-to-code" | Desnecessário: os agentes já leem imagens. As referências ficam em `docs/referencias/`. | — |

### Regras de UI (valem para toda tela; detalhadas no AGENTS.md)

- **Mobile-first:** cada tela é desenhada primeiro em 375px. Áreas de toque com no mínimo 44px.
- **Skeleton:** toda rota com dados tem `loading.tsx` com skeleton **no formato do conteúdo final**. Componentes lentos ficam dentro de `<Suspense>`.
- **Lazy loading:** imagens abaixo da dobra com `loading="lazy"`. Componentes pesados e só de cliente (galeria com zoom, drawer do carrinho) via `next/dynamic`.
- **Movimento:** entrada, saída, carregamento e progresso em todos os elementos interativos. Primeiro com CSS (transitions, `@starting-style`, View Transitions). A biblioteca `motion` entra só onde o CSS não resolve (ex.: gesto de arrastar). Entrada entre 150 e 250 ms, saída mais curta, sem bounce exagerado.
- **Progresso:** barra no topo durante a navegação. Botões com estado de carregamento (pendente/desabilitado). Barra de progresso real no upload de fotos.
- **`prefers-reduced-motion`:** obrigatório. Com ele ativo, as animações viram fade ou são removidas.
- **Orçamento de performance** (celular médio em 4G): LCP < 2,5 s, CLS < 0,1, INP < 200 ms, JS da primeira carga < 170 KB gzip na home.

## 7. Segurança

- **SQL injection:** só o client do Supabase e funções Postgres com parâmetros. **Proibido** concatenar SQL. O RLS é a segunda barreira.
- **Validação:** Zod em toda Server Action e Route Handler, que são a fronteira de confiança.
- **Preço, frete e total:** calculados sempre no servidor ou no banco.
- **Segredos:** `SUPABASE_SERVICE_ROLE_KEY`, `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`, `RESEND_API_KEY` e `SENTRY_AUTH_TOKEN` ficam só em variáveis de ambiente do servidor (Cloudflare e GitHub Secrets). Nada com prefixo `NEXT_PUBLIC_` além da URL e da anon key do Supabase e do DSN do Sentry. Agentes **não** manipulam chaves reais: quem cadastra os segredos é o Renan.
- **Admin:** o middleware bloqueia `/admin` para quem não é admin, e o RLS bloqueia no banco. As duas camadas são obrigatórias.
- **Abuso/DDoS:** proteção da Cloudflare (gratuita), limites nativos do Supabase Auth e regra de rate limiting da Cloudflare nas rotas de login e checkout.
- **Cabeçalhos:** CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` e HSTS configurados em `next.config`.
- **Pagamento:** o cartão fica fora do nosso escopo (checkout hospedado pelo MP). O webhook é assinado e reconsultado.
- **LGPD e consumidor:** dados mínimos, política de privacidade, página de trocas/devoluções com o **direito de arrependimento de 7 dias** (CDC art. 49, compra online). O Cloudflare Web Analytics não usa cookies, então não há banner de cookies.
- **Dependências:** Dependabot ativo. `pnpm audit` no CI.

## 8. Qualidade, testes e observabilidade

| Ferramenta | O que faz | Quando roda |
|---|---|---|
| **Biome** | lint + format (substitui ESLint e Prettier) | pre-commit (lefthook) e CI |
| **TypeScript** `tsc --noEmit` | tipos | CI |
| **Commitlint** | Conventional Commits nos commits e no título do PR | commit-msg (lefthook) e CI |
| **Knip** | código, exports e dependências mortos | CI |
| **dependency-cruiser** | contrato de camadas do §3 | CI |
| **Vitest** | unidade (`lib/`, `server/`) e integração com Supabase local (RLS, `criar_pedido`, expiração) | CI |
| **Codecov** | cobertura comentada no PR. Meta: `server/` ≥ 80%, sem meta global. | CI |
| **Playwright** | E2E dos fluxos críticos em viewport mobile (Pixel 7) e desktop | CI |
| **Stryker** | teste de mutação **só em `src/server/**`** (dinheiro, estoque, frete), porque é lento | workflow semanal e manual, não em todo PR |
| **Sentry** | erros front e servidor, traces, source maps e alerta por e-mail | sempre |
| **Workers Logs** | logs estruturados em JSON (`lib/log.ts`) com `request_id` | sempre |
| **Ping diário** | GitHub Action agendada chama `/api/health`. Também evita a pausa do Supabase gratuito por inatividade. | diário |

**E2E obrigatórios:** (1) visitante navega, escolhe cor/tamanho, adiciona ao carrinho, faz login, finaliza e chega ao MP (sandbox), e o webhook simulado marca o pedido como `pago`; (2) admin cadastra produto com foto e variantes e ele aparece na loja; (3) estoque: dois pedidos simultâneos pela última peça resultam em exatamente um sucesso.

## 9. Ambientes, deploy e custos

| Ambiente | Front | Banco |
|---|---|---|
| Local | `pnpm dev` | `supabase start` (Docker) |
| Preview (cada PR) | Cloudflare: URL de preview gerada no PR | Supabase **dev** |
| Produção | `main` → Cloudflare Workers | Supabase **prod** |

- **Regiões:** projetos Supabase em **South America (São Paulo)**, a mais próxima de Belém. Sentry em US, porque não existe região no Brasil.
- **CI (`.github/workflows/ci.yml`):** em todo PR roda install → biome → tsc → knip → depcruise → vitest (com Supabase local) → Codecov → build → Playwright → upload do preview.
- **Deploy (`deploy.yml`):** quando há merge na `main`, aplica `supabase db push` (migrations na prod) e depois `opennextjs-cloudflare deploy` e o upload de source maps para o Sentry.
- **Domínio:** comprar `xicaflor.com.br` no [registro.br](https://registro.br) (cerca de R$ 40/ano; verificar disponibilidade) e apontar os nameservers para a Cloudflare. Até lá, usar o subdomínio gratuito `*.workers.dev`.
- **Custo inicial:** R$ 0, mais o domínio. Mercado Pago cobra taxa por venda.
- `// ponytail:` limites conhecidos do gratuito:
  - Worker com no máximo **3 MB** comprimido. Se o bundle passar, Workers Paid custa US$ 5/mês.
  - Supabase 500 MB de banco e 1 GB de storage.
  - Resend 100 e-mails/dia.
  - Sentry 5 mil erros/mês.

## 10. Fases e backlog

Cada item abaixo vira **uma issue no GitHub** (seguindo o AGENTS.md) e **um PR**. Todos são fatias verticais que funcionam de ponta a ponta. A ordem dentro de cada fase importa.

### Fase 0: Fundação
1. **[feature]** Repositório, Next.js + TS strict + Tailwind + pnpm, Biome, lefthook + Commitlint, AGENTS.md, CLAUDE.md, templates de issue e PR, labels, proteção da `main`.
   *Aceite:* `pnpm dev` sobe e um commit fora do padrão é rejeitado.
2. **[feature]** CI completo (§9) com Knip, dependency-cruiser e Vitest com um teste de exemplo.
   *Aceite:* PR de teste fica verde, e um PR que quebra o contrato de camadas fica vermelho.
3. **[feature]** Deploy no Cloudflare Workers via OpenNext, com preview por PR.
   *Aceite:* página "em breve" no ar em `*.workers.dev` e tamanho do bundle registrado no PR.
4. **[feature]** Supabase dev e prod, Supabase CLI, pipeline de migrations e tipos gerados (`supabase gen types`).
   *Aceite:* uma migration aplicada via CI na dev.
5. **[feature]** Sentry, `lib/log.ts`, `/api/health` e ping diário.
   *Aceite:* erro de teste aparece no Sentry com source map legível.
6. **[feature]** Fundação de design: instalar as skills do §6, criar `DESIGN.md` (identidade Xica Flor), tokens Tailwind, fontes, logo SVG, primitivos `ui/` (Button com estado de carregamento, Skeleton, Input, Sheet/Drawer, Toast, barra de progresso de navegação).
   *Aceite:* página `/dev/ui` (só em desenvolvimento) mostra todos os primitivos com animações de entrada e saída e `reduced-motion` funcionando.

### Fase 1: Catálogo
7. **[feature]** Schema do catálogo + RLS + seed de categorias.
   *Aceite:* testes de integração provam que um anônimo lê o catálogo e não consegue escrever.
8. **[feature]** Login de admin, middleware `/admin`, `is_admin()`. Na raiz Beleza, campo para editar o link da loja de afiliada.
   *Aceite:* um cliente comum recebe 404 ou redirecionamento em `/admin`.
9. **[feature]** Admin: CRUD de categorias (com subcategorias e ordem).
10. **[feature]** Admin: CRUD de produto com variantes (cor/tamanho/preço/estoque), ativar e desativar. Produto de vitrine (Beleza) é só foto, nome e descrição.
11. **[feature]** Admin: fotos pela câmera com compressão em 2 tamanhos, barra de progresso, reordenar e excluir.
12. **[feature]** Loja: home (destaques e novidades), listagem por categoria, página de produto (galeria, seletor de variante, esgotado), skeletons, metadados e OG. Produto de vitrine mostra o botão "Comprar na loja" (nova aba, `rel="sponsored noopener"`) no lugar do seletor e do preço.
13. **[feature]** Busca por nome (`ilike`) com resultado instantâneo.

### Fase 2: Compra
14. **[feature]** Cadastro e login do cliente (e-mail + senha e link mágico), SMTP Resend, perfil com endereço via ViaCEP.
15. **[feature]** Carrinho em `localStorage` com drawer animado e revalidação de preço e estoque no servidor ao abrir.
16. **[feature]** Frete: `zonas_frete`, `calcularFrete`, retirada na loja, admin de zonas.
17. **[feature]** `criar_pedido` (reserva atômica) e `expirar_pedidos` (pg_cron).
    *Aceite:* teste de concorrência do §8 passa. **Alvo do Stryker.**
18. **[feature]** Checkout com Mercado Pago (preferência, redirecionamento, páginas de sucesso/pendente/falha).
19. **[feature]** Webhook do MP (assinatura, reconsulta, idempotência, transições do §5.2).
20. **[feature]** "Minha conta": meus pedidos e status.
21. **[feature]** E2E da compra completa no sandbox.

### Fase 3: Operação
22. **[feature]** Admin de pedidos: lista por status, detalhe, mudar status, botão "chamar no WhatsApp" com mensagem pronta.
23. **[feature]** E-mails: confirmação ao cliente e aviso de novo pedido pago à proprietária.
24. **[feature]** Resumo no admin: vendas do dia e do mês, pedidos pendentes.

### Fase 4: Lançamento
25. **[melhoria]** Auditoria com `design-motion-principles` (modo audit) e `web-design-guidelines`, e correção dos achados.
26. **[feature]** PWA: manifest, ícones, splash.
27. **[feature]** SEO: `sitemap.xml`, `robots.txt`, JSON-LD `Product`, imagens OG por produto.
28. **[feature]** Páginas legais: privacidade (LGPD), trocas e devoluções (CDC art. 49), sobre e contato.
29. **[feature]** Go-live: domínio, DNS na Cloudflare, domínio verificado no Resend, credenciais de produção do MP, headers de segurança, rate limiting, checklist final.

### Fase 5: Depois (não abrir issues ainda)
Melhor Envio (cotação e etiqueta fora de Belém), cupons, lista de desejos, vídeos dos produtos, integração com Instagram Shopping, avaliações, nota fiscal.

## 11. Pré-requisitos (o Renan faz; agentes não criam contas nem manipulam chaves)

- [x] Git, Node 24, Docker Desktop, GitHub CLI instalados (verificado em 2026-10-15).
- [ ] `pnpm` (ativar com `corepack enable pnpm`).
- [ ] `gh auth login`.
- [x] Contas criadas: GitHub, Cloudflare, Supabase, Sentry, Codecov, Resend.
- [ ] Logins de CLI na fase 0 (o Renan executa no terminal dele; abrem o navegador): `npx wrangler login`, `npx supabase login`.
- [ ] Mercado Pago Developers na conta da proprietária: criar a aplicação e gerar as credenciais de **teste** e de **produção**. Só é necessário a partir da fase 2.
- [ ] Domínio comprado **antes da fase 2**: o Resend só envia e-mail (link mágico, confirmação) para terceiros com domínio verificado.
- [ ] Cadastrar os segredos no GitHub (Secrets) e na Cloudflare. Nunca colar segredos no chat.
- [ ] Verificar e comprar `xicaflor.com.br`.

## 12. Em aberto [a confirmar]

1. Lista final de categorias de roupa e de beleza. Grafia das marcas (O.Lab? Rinode?).
2. Parcelamento no cartão: até quantas vezes e com ou sem juros? (Conta MP confirmada.)
3. ~~Mosqueiro e Outeiro~~ **Resolvido:** ficam fora do grátis, com frete a combinar até haver preço.
4. Preço de frete para Mosqueiro, Outeiro, Ananindeua, Marituba e Benevides.
5. Endereço e horário para retirada na loja (aparece só depois da compra?).
6. Arquivo original da logo.
7. Fotos dos produtos: fundo e padrão de enquadramento, para o catálogo ficar uniforme.
8. Política de trocas da loja (prazo, condições).
