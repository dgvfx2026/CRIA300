# CRIA — 500 prompts de vídeo para IA

Página de vendas estática reformulada para a biblioteca CRIA 500. HTML com o conteúdo completo, CSS e JavaScript sem dependências de execução. A hospedagem continua na Vercel e o domínio canônico é https://www.cria.club/.

## Conteúdo e oferta

- 500 prompts exclusivamente de vídeo, em 18 categorias, com cenas de até 15 segundos.
- FOOH: 40; UGC: 40; Comerciais de produto: 35; Packshots & loops: 35. As outras 14 categorias têm 25 cada.
- 350 prompts em 9:16 e 150 em 16:9. O horizontal fica em Cinematic pessoa, Animação & fantasia, Atmosférico & sci-fi, Drone & aerial, Microcinema & curta e Esporte & ação.
- Todos os FOOH são sem falas. As capas representam um único frame, e não um resultado garantido.
- A biblioteca inclui prévias, resumos, personalizador, busca, filtros, favoritos e vistos recentemente. O personalizador monta campos preparados localmente, sem API paga; não é um chat de reescrita livre com IA.
- R$47 à vista ou 11x de R$5,22, total R$57,42 com acréscimo. Compra única, atualizações incluídas, acesso após confirmação e garantia integral de 7 dias.
- A geração acontece na ferramenta de IA do comprador. Contas, assinaturas e créditos dessas ferramentas não estão incluídos.

Checkout preservado: https://pay.kiwify.com.br/7fTgGYD. O cupom CRIA25 oferece 25% de desconto: R$35,25 à vista, economia de R$11,75. O comprador deve aplicar e conferir o desconto no checkout; sua configuração comercial continua na Kiwify. A página não recebe dados de cartão.

## Arquivos

- `index.html`: proposta, exemplos, categorias, personalizador, criador, oferta e FAQ. Inclui metadados e dados estruturados.
- `styles.css` e `scripts.js`: fontes legíveis para manutenção.
- `styles.min.css`, `scripts.min.js` e `sample-ui.min.js`: versões compactadas carregadas pela página, prontas para hospedar sem build.
- `amostras.html`: quatro prompts reais da biblioteca, com leitura e cópia, também usada como alternativa sem JavaScript.
- `sample-ui.js`: comportamento das amostras e do diálogo nativo.
- `media/cria500/`: capturas reais da biblioteca, prévias do catálogo, capas responsivas, vídeos e imagem de compartilhamento 1200 × 630.
- `media/fonts/`: fontes hospedadas no próprio site e suas licenças OFL.
- `favicon.svg`, `robots.txt`, `sitemap.xml` e `vercel.json`: identidade, descoberta, redirecionamento de `/index.html` para `/` e cache.

Os arquivos antigos de mídia permanecem no repositório para preservar o acervo. Eles não fazem parte da nova galeria. Nenhum arquivo de prompt, automação de compra ou webhook da área de membros foi alterado neste projeto.

## Prévia e manutenção

Execute `python -m http.server 4180 --bind 127.0.0.1` na pasta e abra http://127.0.0.1:4180/.

Depois de editar CSS ou JavaScript, regenere os arquivos servidos:

```sh
npx --yes esbuild styles.css --minify --target=chrome109,safari16,firefox115 --outfile=styles.min.css
npx --yes esbuild scripts.js --minify --target=chrome109,safari16,firefox115 --outfile=scripts.min.js
npx --yes esbuild sample-ui.js --minify --target=chrome109,safari16,firefox115 --outfile=sample-ui.min.js
```

Incremente a versão das URLs no HTML a cada revisão. Novas mídias devem receber nomes novos: `media/cria500/` e as fontes usam cache imutável por um ano. CSS e JavaScript são revalidados. Os `.min` incluídos podem ser publicados diretamente; Node e esbuild só são necessários para regenerá-los.

Ao mudar quantidade, preço ou condições, atualize cópia visível, FAQ, metadados, imagem social e JSON-LD em conjunto. Não adicione avaliações ou resultados comerciais sem evidência real.

## Integrações preservadas

O formulário mantém o Supabase existente, chave pública anônima, tabela `leads`, cabeçalhos e corpo `{ email, whatsapp, source: "popup_cupom" }`, com prefixo `+55`. Não foram alteradas configurações externas do Supabase ou da Kiwify. O sucesso agora depende de resposta bem-sucedida do servidor: falhas permitem tentar novamente e não marcam um lead como capturado.

Os marcadores `cria_lead_captured` e `cria_coupon_dismissed` foram mantidos. O cupom pode ser aberto voluntariamente; gatilhos automáticos continuam exigindo envolvimento e exposição ao conteúdo, sem interromper oferta, compra, vídeo, campo em foco, menu ou diálogo. A interface restaura o foco e bloqueia o fundo enquanto o formulário está aberto.

Meta Pixel `1509642039730970` preservado: `PageView`, `CRIA_CheckoutClick` com posição e `CRIA_CouponOpen` com gatilho. A inicialização JavaScript ocorre apenas nos domínios de produção existentes. O fallback sem JavaScript foi mantido. Cliques de checkout representam intenção, não confirmação de compra.

Suporte: WhatsApp `555180328211`. Instagram: https://instagram.com/dg_vfx. Área de membros: https://cria-prompts.vercel.app/.

## Desempenho e experiência

Imagens AVIF com fallback WebP, tamanhos responsivos, dimensões declaradas e carregamento tardio fora da abertura. A captura principal é descoberta no HTML e tem prioridade alta. Fontes locais com `font-display: swap`. Nenhum MP4 carrega antes do clique.

Nove exemplos de vídeo, com filtros e expansão. Um único player em diálogo nativo, controles de reprodução e liberação do arquivo ao fechar. Os quatro exemplos de FOOH foram exportados sem áudio; todos os nove têm até 15 segundos. A galeria começa com quatro cards, um de cada frente: FOOH, UGC, comercial de produto e packshot. Sem JavaScript, os nove ficam disponíveis por links diretos.

Entradas suaves, flutuação da captura, hover nos cards e pop-up expressivo. A preferência de reduzir movimento é respeitada automaticamente. Menu móvel, FAQ nativa, foco visível, link para pular ao conteúdo e fechamento por Escape. O CTA fixo se oculta diante da abertura, da oferta, do CTA final e de menus ou diálogos abertos.

## SEO e validação

Título e descrição alinhados à oferta, um H1, títulos de seção semânticos, conteúdo rastreável sem JavaScript, canonical em `www.cria.club`, Open Graph/Twitter com imagem 1200 × 630, textos alternativos, robots e sitemap. JSON-LD com Organization, WebSite, WebPage e Product/Offer de R$47, sem avaliações inventadas. Não foram prometidas posições de busca ou resultados idênticos de geração.

Validações de entrega: viewport de 320 a 1440 px, teclado, redução de movimento, fluxo sem JavaScript, vídeos sob demanda, links, integridade dos arquivos e cupom com respostas simuladas de falha e sucesso. Nenhum lead ou pagamento real foi criado nos testes.

## Revisão de copy e design — 12/11/2026

Abertura voltada a vídeos para marcas, benefícios mais diretos, condições legíveis, resumo de compra após os exemplos e cartão de preço antes da lista de inclusões no celular. As categorias adicionais ficam em uma expansão nativa, e a biografia foi compactada. A oferta detalhada aparece antes da biblioteca completa.

O botão “Ver um prompt real” e a prévia inicial abrem o FOOH “Produto atravessando a cidade” (cria-004), que usa uma única foto de produto, sem marca ou cidade específicas. Os quatro cards de categoria abrem amostras reais: cria-004, cria-331, cria-166 e cria-366. Os textos são cópias integrais do catálogo, sem reescrita. Não há gravação nova de execução ou depoimentos adicionados.

O vídeo de relógio existente foi preparado como exemplo de comercial, com exportação de até 15s. A capa é um frame do próprio vídeo. Os exemplos não são apresentados como execuções exatas das quatro amostras.

Checkout e sua configuração externa permanecem inalterados. O cadastro, desconto, campos e gatilhos do cupom foram mantidos; apenas as proteções de interrupção abrangem o novo diálogo e o resumo de compra. Os ajustes de checkout, a gravação de demonstração e a estratégia de cupom ficaram fora desta etapa por solicitação do usuário.

## Refinamento visual — 500.4

Hierarquia do título com promessa principal em destaque e itálico curto; fotos de categoria com mais área visível e contagem no canto superior; vidro mais translúcido nos diálogos e na barra fixa, com superfície estável de leitura; borda e iluminação âmbar discretas no cartão da oferta. Conteúdo dos prompts, imagens aprovadas, checkout e captura preservados.
