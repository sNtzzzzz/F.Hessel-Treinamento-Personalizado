# Fernando Hessel — Treinamento Personalizado

Site estático em HTML, CSS e JavaScript puros. Não requer framework nem etapa de build. A única biblioteca de renderização é o Three.js, incluído localmente em versão fixa.

## Executar localmente

Abra a pasta no VS Code e use a extensão Live Server, ou inicie um servidor estático na pasta do projeto:

    npx serve .

Depois, acesse o endereço local exibido pelo servidor. Para publicar, envie a pasta do projeto para GitHub Pages, Netlify ou outro host de arquivos estáticos. Preserve a pasta assets na publicação.

## Organização

- **index.html**: estrutura semântica, conteúdo, SEO e links de contato.
- **styles.css**: paleta, layout responsivo, estados de interação e animações.
- **script.js**: menu móvel, linha do tempo, ano do rodapé e revelações ao rolar.
- **dumbbell-loader.js**: inicia a cena 3D quando o hero se aproxima da tela.
- **dumbbell3d.js**: geometria, materiais, iluminação e interação do halter 3D.
- **assets/vendor/**: arquivos locais do Three.js 0.187.0 e sua licença MIT.
- **assets/**: logotipo, favicons, foto original e cópia JPEG otimizada para o site.
- **og:image** usa a foto local otimizada. Como o domínio definitivo ainda não foi informado, troque o caminho relativo por uma URL absoluta ao publicar.

## Design e interações

- Paleta Carbon & Ember: #151718, #FF683B, #E9EDE8, #A1A8A6 e #30383B.
- Hero editorial com halter WebGL interativo; a fotografia aparece somente na apresentação do Fernando.
- Público do treinamento, linha do tempo interativa, modalidades, apresentação, planos, FAQ e CTAs de WhatsApp.
- O halter usa geometria procedural, materiais metálicos e iluminação de estúdio gerada localmente. Arraste com mouse ou toque para girar; após a interação, retoma a rotação lenta.
- O carregador importa a cena sob demanda perto do hero. A renderização pausa fora da área visível ou quando a aba fica oculta; em telas menores usa menos segmentos e resolução limitada.
- Em falha de WebGL ou do módulo, permanece um fallback CSS estático claramente identificado. A página e os CTAs continuam acessíveis.
- prefers-reduced-motion desativa a rotação automática; a interação manual continua disponível.
- Three.js 0.187.0 está vendorizado para evitar dependência de CDN durante a execução. Manrope e DM Mono são carregadas do Google Fonts com fontes de sistema como fallback.

## Conteúdo comercial a confirmar

- Número do CREF: não informado no código disponível; por isso não é exibido.
- Plano Start: o valor não constava no site anterior; o CTA orienta consultar.
- Performance+: confirmar se há acompanhamento nutricional, quem o presta e quais condições estão incluídas antes de acrescentar benefícios à descrição pública.
- Treinamento presencial: confirmar regiões atendidas, locais e disponibilidade.

Os nomes dos planos, durações, preços e condições de pagamento publicados foram mantidos conforme o site anterior. A descrição de Performance+ foi neutralizada até que seus serviços sejam confirmados.
