# CRIA — nova landing page

Site estático em HTML, CSS e JavaScript, sem etapa de build ou dependências de aplicação. Compatível com a hospedagem estática existente na Vercel.

## Organização

- `index.html`: conteúdo, galeria, oferta, FAQ e metadados.
- `styles.css`: identidade visual, componentes, responsividade e preferências de movimento.
- `scripts.js`: menu móvel, galeria, ampliação das imagens, vídeos, CTA fixo e Meta Pixel.
- `media/optimized/`: imagens WebP com versões de 480 e até 1000 pixels.
- `media/posters/`: imagens de apresentação dos vídeos.
- `media/video/`: vídeos MP4 H.264/AAC otimizados, com carregamento sob demanda.
- `media/logo-cria.png`: logo oficial original, usada no cabeçalho, rodapé, mockup, favicon e compartilhamento social.
- `favicon.svg`, `robots.txt`, `sitemap.xml`: identidade e descoberta do site.

## Prévia local

Abra um terminal na pasta do site e execute `python -m http.server 4173 --bind 127.0.0.1`. Acesse `http://127.0.0.1:4173/` no navegador. Também é possível abrir o `index.html` diretamente, mas um servidor local é preferível para testar vídeos e navegação.

## Manutenção da oferta

O link de compra continua sendo `https://pay.kiwify.com.br/7fTgGYD`. Ele está no botão `.checkout-button` e nos dados estruturados do produto. Os demais CTAs conduzem à seção `#comprar`.

Condições preservadas: R$47 à vista, 11 parcelas de R$5,22 (total R$57,42 com acréscimo), compra única, garantia de 7 dias, atualizações futuras, acesso à plataforma com 300 prompts e guia de adaptação. Atualize conjuntamente o resumo da oferta, a FAQ, os textos de preço, a barra fixa, a descrição SEO e o JSON-LD quando as condições comerciais mudarem.

O pagamento é concluído na Kiwify; esta landing page não coleta dados de cartão e não contém checkout próprio. As ferramentas de IA e seus créditos são contratados separadamente.

## Medição e contato

- Meta Pixel: `1509642039730970`, evento `PageView` preservado.
- Com JavaScript, a medição só é iniciada em `cria.club`, `www.cria.club` e `cria300.vercel.app`, para evitar visitas de teste local. O fallback original de imagem sem JavaScript permanece no HTML.
- Instagram: `https://instagram.com/dg_vfx`.
- WhatsApp: `555180328211`.

## Decisões de experiência

A galeria começa com seis exemplos e oferece filtros e expansão. Os 12 exemplos de imagem e os 14 de vídeo foram preservados. Imagens abrem em ampliação; vídeos possuem controles, param fora de vista e respeitam a preferência de movimento reduzido e economia de dados. Uma pausa manual é respeitada.

Sem JavaScript, a navegação, as perguntas frequentes, as imagens, os controles dos vídeos e o link de compra continuam disponíveis. Os filtros interativos ficam ocultos e a galeria mostra todos os exemplos.

O contador que reiniciava automaticamente a oferta foi removido. Não foram adicionados depoimentos, avaliações, números de clientes nem promessas de resultados. O mockup do CRIA é identificado como representação visual. O cliente recebe acesso à plataforma de prompts, com categorias, busca e botão de copiar, conforme confirmado pelo criador. As imagens e os vídeos são gerados nas ferramentas de IA indicadas.

## Publicação e versionamento

Os arquivos estão prontos para o fluxo GitHub → Vercel já utilizado pelo projeto. A reformulação não exige mudar o framework, adicionar serviços ou instalar pacotes. A publicação deve incluir `index.html`, CSS, JavaScript e os novos assets; não publique apenas o HTML.

O domínio canônico é `https://www.cria.club/`. Se o domínio mudar, revise canonical, Open Graph, Twitter, JSON-LD, sitemap e a lista de domínios do Pixel. Ao atualizar CSS/JS, altere a versão nos respectivos links do HTML para invalidar caches.

Os arquivos de mídia antigos foram mantidos no projeto original para facilitar a reversão. A nova página utiliza os arquivos otimizados. A cópia de entrega contém somente os assets necessários e as instruções de manutenção.

## Logo oficial

A identidade foi adaptada aos tons de azul e violeta da logo enviada. O PNG original foi preservado integralmente, inclusive sua transparência. Design, estrutura, copy e interações permanecem os mesmos.
