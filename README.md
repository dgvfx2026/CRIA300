# CRIA — nova landing page

Site estático em HTML, CSS e JavaScript, sem etapa de build ou dependências de aplicação. Compatível com a hospedagem estática existente na Vercel.

## Organização

- `index.html`: conteúdo, galeria, oferta, FAQ e metadados.
- `styles.css`: identidade visual, componentes, responsividade e preferências de movimento.
- `scripts.js`: menu móvel, galeria, ampliação das imagens, vídeos, CTA fixo, Meta Pixel e apresentação do pop-up de leads.
- `media/optimized/`: imagens WebP com versões de 480 e até 1000 pixels.
- `media/posters/`: imagens de apresentação dos vídeos. As capas `*-impact.webp` são frames reais dos exemplos, escolhidos para mostrar o efeito ou a cena em destaque.
- `media/video/`: vídeos MP4 H.264/AAC otimizados, com carregamento sob demanda.
- `media/logo-cria.png`: logo oficial original, usada no cabeçalho, rodapé, mockup, favicon e compartilhamento social.
- `favicon.svg`, `robots.txt`, `sitemap.xml`: identidade e descoberta do site.

## Prévia local

Abra um terminal na pasta do site e execute `python -m http.server 4173 --bind 127.0.0.1`. Acesse `http://127.0.0.1:4173/` no navegador. Também é possível abrir o `index.html` diretamente, mas um servidor local é preferível para testar vídeos e navegação.

## Migração Cakto — 18/10/2026

O HTML foi atualizado para a Cakto, incluindo sete botões, JSON-LD, parcelamento, FAQ e instruções do cupom. O proprietário autorizou manter temporariamente a taxa de R$0,99 e pediu expressamente o parcelamento de 11x de R$5,33.

Por solicitação do proprietário, o hero e seu botão no cabeçalho apresentam R$47,00. A explicação da taxa aparece somente no último bloco da página, #final-cta. Os demais totais continuam conforme o checkout: R$47,99 à vista (R$47 do produto + R$0,99 de taxa da Cakto), 11x de R$5,33 (total R$58,63) ou R$36,24 à vista com CRIA25. O desconto de 25% aplica-se ao preço do produto, sem descontar a taxa. Se a taxa for retirada, atualizar os totais na página após conferir novamente o checkout.

O webhook existente aceita data.customer.email no formato Individual/V1. O payload Agrupado/V2 não é aceito. Como o código atual não filtra eventos, a Cakto foi configurada somente para compra aprovada. O teste de compatibilidade foi local, com armazenamento simulado. Nenhum teste de compra nem comprador fictício foi enviado ao banco; a confirmação de entrega real deve ser acompanhada nos logs da primeira compra aprovada.

## Manutenção da oferta

O link de compra nesta versão é `https://pay.cakto.com.br/hb6td8v_1132886`. Todos os botões de compra vão diretamente para esse checkout, inclusive a barra fixa e o botão após a captura de lead. Os links de navegação e “Ver vídeos do CRIA” conduzem às seções da página.

Condições: R$47,99 à vista com taxa, 11 parcelas de R$5,33 (total R$58,63 com acréscimo e taxa), compra única, garantia de 7 dias, atualizações futuras, acesso à plataforma com 300 prompts e guia de adaptação. Atualize conjuntamente o resumo da oferta, a FAQ, os textos de preço, a barra fixa, a descrição SEO e o JSON-LD quando as condições comerciais mudarem.

O pagamento é concluído na Cakto; esta landing page não coleta dados de cartão e não contém checkout próprio. As ferramentas de IA e seus créditos são contratados separadamente.

## Medição e contato

- Meta Pixel: `1509642039730970`, evento `PageView` preservado.
- Com JavaScript, a medição só é iniciada em `cria.club`, `www.cria.club` e `cria300.vercel.app`, para evitar visitas de teste local. O fallback original de imagem sem JavaScript permanece no HTML.
- `CRIA_CheckoutClick`: evento personalizado do Pixel, com `position` para diferenciar os botões. Mede intenção de saída para a Cakto; não é uma confirmação de início de checkout nem de compra.
- `CRIA_CouponOpen`: evento personalizado com o gatilho de abertura do pop-up.
- Instagram: `https://instagram.com/dg_vfx`.
- WhatsApp: `555180328211`.

## Decisões de experiência

A página apresenta, nesta ordem: proposta e preço, modo de uso, exemplos, diferenciação da biblioteca, criador, oferta completa, FAQ e CTA final. Preço, compra única, garantia e ferramentas de IA separadas aparecem já no início. No celular, o cartão de preço precede a lista completa de itens.

A apresentação inicial destaca um vídeo FOOH e prévias reproduzíveis de animação e UGC, com capas reais e botões centrais de play. No celular, o FOOH ocupa toda a largura do bloco e fica logo após os botões e a garantia. A galeria também destaca o primeiro FOOH em toda a largura no celular, mantendo os demais em uma grade compacta. Os vídeos da galeria usam a proporção original de 9:16; os vídeos da abertura preservam o enquadramento completo durante a reprodução.

A galeria agrupa os vídeos nesta ordem: FOOH, Animação, UGC e Cinematic; o exemplo adicional de Packshot vem após esses grupos. Começa com seis vídeos no desktop e sete no celular (um FOOH em destaque seguido de três duplas), oferece filtros e expansão, e mantém todos os 14 vídeos antes das 12 imagens. O filtro de imagens permite acessá-las diretamente. Os 12 exemplos de imagem e os 14 de vídeo foram preservados. Imagens abrem em ampliação. Vídeos começam apenas pelo controle do visitante, carregam sob demanda e param fora de vista. Iniciar um vídeo pausa o anterior. Os controles nativos ficam disponíveis durante a reprodução, inclusive para volume e tela cheia. A barra fixa aparece depois da primeira seção e se esconde diante do cartão de compra, do CTA final e de menus ou diálogos abertos.

A direção visual mantém o grafite e a marca azul/violeta, reserva o azul claro dos botões para ações principais e usa fundos discretamente diferentes entre conteúdo, galeria e oferta. Textos secundários têm mais contraste. Molduras e etiquetas foram simplificadas para priorizar os exemplos visuais; o card de preço mantém a hierarquia original.

Sem JavaScript, a navegação, as perguntas frequentes, as imagens, os controles dos vídeos e o link de compra continuam disponíveis. Os filtros interativos ficam ocultos e a galeria mostra todos os exemplos.

Não há contagem regressiva artificial. Não foram adicionados depoimentos, avaliações, números de clientes, capturas fictícias da plataforma nem promessas de resultados idênticos. A apresentação usa exemplos existentes e explica o fluxo de encontrar, adaptar e gerar. O cliente recebe acesso à biblioteca de prompts; imagens e vídeos são gerados nas ferramentas de IA indicadas.

## Pop-up e integrações preservadas

O pop-up mantém os campos e a rotina original de captura. Endereço do Supabase, chave pública existente, tabela `leads`, cabeçalhos, corpo `{ email, whatsapp, source: "popup_cupom" }`, prefixo `+55` e marcador `cria_lead_captured` foram preservados. O fluxo de envio do formulário permanece igual. O receptor de compras fica em outro projeto, na rota https://cria-prompts.vercel.app/api/webhook. A integração de compra da Cakto foi cadastrada em 18/10/2026 para o produto CRIA, somente purchase_approved e formato Individual (V1), sem alterar o receptor nem o banco. Não use o formato Agrupado (V2) com esse receptor.

O pop-up não abre por tempo isolado nem pela profundidade de rolagem:

- Desktop a partir de 900 px: intenção de sair pelo topo, após 45 segundos de visita visível e exposição aos exemplos ou à oferta.
- Retorno pelo conteúdo: após 60 segundos de visita visível, ter visto o cartão de oferta e subir pelo menos 160 px. É o sinal utilizado no celular.
- Abertura voluntária: “Receber meu cupom”, depois das perguntas frequentes.

Os gatilhos automáticos não interrompem o cartão de compra, o CTA final, vídeos em reprodução, campos em foco, menu ou ampliação de imagem. Clicar em um botão de compra ou dispensar o pop-up desativa novas interrupções naquela sessão. Leads já capturados não recebem a oferta de cadastro. O formulário pode ser reaberto voluntariamente após fechar.

O desconto existente é de 25%, com código `CRIA25`: R$47 → R$35,25 pelo produto, mais R$0,99 de taxa da Cakto; total à vista de R$36,24. O botão de sucesso mantém o endereço original da Cakto e informa que o comprador precisa aplicar o código antes de pagar. O cupom foi criado na Cakto em 18/10/2026, com 25%, sem prazo final e oculto para afiliados; sua aplicação pública foi conferida sem realizar compra.

O pop-up possui fechamento por botão, Escape e fundo, foco contido no diálogo e restauração de foco. No celular, abrir o pop-up não aciona o teclado automaticamente.

## Verificação da reformulação

Foram conferidos os arquivos e destinos da página, os 26 exemplos, os campos do formulário, os links de compra e a sintaxe JavaScript. Os gatilhos e o envio de lead foram exercitados com requisições simuladas: nenhum lead de teste foi enviado ao Supabase e nenhuma compra foi realizada. Essa verificação comprova o contrato do código; a disponibilidade dos serviços e o recebimento real dependem das integrações externas existentes.

## Publicação e versionamento

Os arquivos estão prontos para o fluxo GitHub → Vercel já utilizado pelo projeto. A reformulação não exige mudar o framework, adicionar serviços ou instalar pacotes. Publique `index.html`, `styles.css`, `scripts.js`, este README e os 14 novos arquivos `media/posters/*-impact.webp` juntos. Os vídeos e as imagens anteriores não foram alterados. Esta revisão usa CSS `20261004.3` e JavaScript `20261004.4`.

O domínio canônico é `https://www.cria.club/`. Se o domínio mudar, revise canonical, Open Graph, Twitter, JSON-LD, sitemap e a lista de domínios do Pixel. Ao atualizar CSS/JS, altere a versão nos respectivos links do HTML para invalidar caches.

Os arquivos de mídia antigos foram mantidos no projeto para facilitar a reversão. A página utiliza os arquivos otimizados.

## Logo oficial

A identidade mantém os tons de azul e violeta da logo. O PNG original foi preservado integralmente, inclusive sua transparência.
