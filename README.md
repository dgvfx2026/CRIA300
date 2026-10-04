# CRIA — nova landing page

Site estático em HTML, CSS e JavaScript, sem etapa de build ou dependências de aplicação. Compatível com a hospedagem estática existente na Vercel.

## Organização

- `index.html`: conteúdo, galeria, oferta, FAQ e metadados.
- `styles.css`: identidade visual, componentes, responsividade e preferências de movimento.
- `scripts.js`: menu móvel, galeria, ampliação das imagens, vídeos, CTA fixo, Meta Pixel e apresentação do pop-up de leads.
- `media/optimized/`: imagens WebP com versões de 480 e até 1000 pixels.
- `media/posters/`: imagens de apresentação dos vídeos.
- `media/video/`: vídeos MP4 H.264/AAC otimizados, com carregamento sob demanda.
- `media/logo-cria.png`: logo oficial original, usada no cabeçalho, rodapé, mockup, favicon e compartilhamento social.
- `favicon.svg`, `robots.txt`, `sitemap.xml`: identidade e descoberta do site.

## Prévia local

Abra um terminal na pasta do site e execute `python -m http.server 4173 --bind 127.0.0.1`. Acesse `http://127.0.0.1:4173/` no navegador. Também é possível abrir o `index.html` diretamente, mas um servidor local é preferível para testar vídeos e navegação.

## Manutenção da oferta

O link de compra continua sendo `https://pay.kiwify.com.br/7fTgGYD`. Todos os botões de compra vão diretamente para esse checkout, inclusive a barra fixa e o botão após a captura de lead. Os links de navegação e “Ver como usar” conduzem às seções da página.

Condições preservadas: R$47 à vista, 11 parcelas de R$5,22 (total R$57,42 com acréscimo), compra única, garantia de 7 dias, atualizações futuras, acesso à plataforma com 300 prompts e guia de adaptação. Atualize conjuntamente o resumo da oferta, a FAQ, os textos de preço, a barra fixa, a descrição SEO e o JSON-LD quando as condições comerciais mudarem.

O pagamento é concluído na Kiwify; esta landing page não coleta dados de cartão e não contém checkout próprio. As ferramentas de IA e seus créditos são contratados separadamente.

## Medição e contato

- Meta Pixel: `1509642039730970`, evento `PageView` preservado.
- Com JavaScript, a medição só é iniciada em `cria.club`, `www.cria.club` e `cria300.vercel.app`, para evitar visitas de teste local. O fallback original de imagem sem JavaScript permanece no HTML.
- `CRIA_CheckoutClick`: evento personalizado do Pixel, com `position` para diferenciar os botões. Mede intenção de saída para a Kiwify; não é uma confirmação de início de checkout nem de compra.
- `CRIA_CouponOpen`: evento personalizado com o gatilho de abertura do pop-up.
- Instagram: `https://instagram.com/dg_vfx`.
- WhatsApp: `555180328211`.

## Decisões de experiência

A página apresenta, nesta ordem: proposta e preço, modo de uso, exemplos, diferenciação da biblioteca, criador, oferta completa, FAQ e CTA final. Preço, compra única, garantia e ferramentas de IA separadas aparecem já no início. No celular, o cartão de preço precede a lista completa de itens.

A galeria começa com seis exemplos misturando imagem e vídeo e oferece filtros e expansão. Os 12 exemplos de imagem e os 14 de vídeo foram preservados. Imagens abrem em ampliação. Vídeos começam apenas pelo controle do visitante, carregam sob demanda e param fora de vista. A barra fixa aparece depois da primeira seção e se esconde diante do cartão de compra, do CTA final e de menus ou diálogos abertos.

Sem JavaScript, a navegação, as perguntas frequentes, as imagens, os controles dos vídeos e o link de compra continuam disponíveis. Os filtros interativos ficam ocultos e a galeria mostra todos os exemplos.

Não há contagem regressiva artificial. Não foram adicionados depoimentos, avaliações, números de clientes, capturas fictícias da plataforma nem promessas de resultados idênticos. A apresentação usa exemplos existentes e explica o fluxo de encontrar, adaptar e gerar. O cliente recebe acesso à biblioteca de prompts; imagens e vídeos são gerados nas ferramentas de IA indicadas.

## Pop-up e integrações preservadas

O pop-up mantém os campos e a rotina original de captura. Endereço do Supabase, chave pública existente, tabela `leads`, cabeçalhos, corpo `{ email, whatsapp, source: "popup_cupom" }`, prefixo `+55` e marcador `cria_lead_captured` foram preservados. O fluxo de envio do formulário permanece igual. Não há webhook de compra neste repositório; nenhuma configuração externa de Kiwify ou Supabase foi alterada.

O pop-up não abre por tempo isolado nem pela profundidade de rolagem:

- Desktop a partir de 900 px: intenção de sair pelo topo, após 45 segundos de visita visível e exposição aos exemplos ou à oferta.
- Retorno pelo conteúdo: após 60 segundos de visita visível, ter visto o cartão de oferta e subir pelo menos 160 px. É o sinal utilizado no celular.
- Abertura voluntária: “Receber meu cupom”, depois das perguntas frequentes.

Os gatilhos automáticos não interrompem o cartão de compra, o CTA final, vídeos em reprodução, campos em foco, menu ou ampliação de imagem. Clicar em um botão de compra ou dispensar o pop-up desativa novas interrupções naquela sessão. Leads já capturados não recebem a oferta de cadastro. O formulário pode ser reaberto voluntariamente após fechar.

O desconto existente é de 25%, com código `CRIA25`: R$47 → R$35,25 à vista. O botão de sucesso mantém o endereço original da Kiwify e informa que o comprador precisa aplicar o código antes de pagar. A configuração e a validade comercial desse cupom continuam sendo administradas na Kiwify.

O pop-up possui fechamento por botão, Escape e fundo, foco contido no diálogo e restauração de foco. No celular, abrir o pop-up não aciona o teclado automaticamente.

## Verificação da reformulação

Foram conferidos os arquivos e destinos da página, os 26 exemplos, os campos do formulário, os links de compra e a sintaxe JavaScript. Os gatilhos e o envio de lead foram exercitados com requisições simuladas: nenhum lead de teste foi enviado ao Supabase e nenhuma compra foi realizada. Essa verificação comprova o contrato do código; a disponibilidade dos serviços e o recebimento real dependem das integrações externas existentes.

## Publicação e versionamento

Os arquivos estão prontos para o fluxo GitHub → Vercel já utilizado pelo projeto. A reformulação não exige mudar o framework, adicionar serviços ou instalar pacotes. Publique `index.html`, `styles.css`, `scripts.js` e este README juntos; os arquivos de mídia existentes não foram alterados.

O domínio canônico é `https://www.cria.club/`. Se o domínio mudar, revise canonical, Open Graph, Twitter, JSON-LD, sitemap e a lista de domínios do Pixel. Ao atualizar CSS/JS, altere a versão nos respectivos links do HTML para invalidar caches.

Os arquivos de mídia antigos foram mantidos no projeto para facilitar a reversão. A página utiliza os arquivos otimizados.

## Logo oficial

A identidade mantém os tons de azul e violeta da logo. O PNG original foi preservado integralmente, inclusive sua transparência.
