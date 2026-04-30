'use strict';

/* ═══════════════════════════════════════════════════════════════
   state.js — global state, templates, data
   ═══════════════════════════════════════════════════════════════ */

var slides = [
  {
    type: 'cover', theme: 'dark',
    tag: 'STORYTELLING',
    headline: 'Toda empresa começa com uma ideia.',
    headlineHighlight: 'ideia.',
    sub: 'Crescer é uma outra história.',
    showCta: true, cta: 'DESLIZE',
    brand: 'BESCHEIBEN',
  },
  {
    type: 'content', theme: 'dark',
    step: 'CONTEXTO',
    headline: 'Muitas empresas têm produtos incríveis.',
    headlineHighlight: 'incríveis.',
    body: 'O mercado simplesmente não sabe que elas existem.',
    brand: 'BESCHEIBEN',
  },
  {
    type: 'quote', theme: 'dark',
    quoteTag: 'DIAGNÓSTICO',
    quote: 'O problema nunca foi a qualidade do produto.',
    author: 'Foi a falta de posicionamento.',
    quoteHighlight: 'posicionamento.',
  },
  {
    type: 'cta', theme: 'dark',
    eyebrow: 'MISSÃO',
    headline: 'Transformar marketing em crescimento real.',
    headlineHighlight: 'crescimento real.',
    body: 'Diagnóstico gratuito\nSem compromisso\nResposta em 24h',
    cta: 'Agendar diagnóstico gratuito',
  },
];

var currentSlide = 0;
var currentMode  = 'carousel';
var fontScale    = 1.0;

var FORMAT = {
  carousel: {
    previewW: 400, previewH: 500,
    exportScale: 2.7,
    label: '1080 × 1350 · Carrossel 4:5',
  },
  story: {
    previewW: 281, previewH: 500,
    exportScale: 3.84,
    label: '1080 × 1920 · Story 9:16',
  },
};

/* ═══════════════════════════════════════════════════════════════
   TEMPLATES — 9 estratégias
   ═══════════════════════════════════════════════════════════════ */
var TEMPLATES = [

  /* 0 ── Storytelling Premium (fiel ao print enviado) */
  {
    name: 'Storytelling', icon: '✦',
    desc: 'Narrativa completa · headline gigante · glow brand',
    color: '#6B4EFF',
    slides: [
      { type:'cover',   theme:'dark', tag:'STORYTELLING', headline:'Toda empresa começa com uma ideia.', headlineHighlight:'ideia.', sub:'Crescer é uma outra história.', showCta:true, cta:'DESLIZE', brand:'BESCHEIBEN' },
      { type:'content', theme:'dark', step:'CONTEXTO', headline:'Muitas empresas têm produtos incríveis.', headlineHighlight:'incríveis.', body:'O mercado simplesmente não sabe que elas existem. O problema nunca foi qualidade — foi visibilidade.', brand:'BESCHEIBEN' },
      { type:'quote',   theme:'dark', quoteTag:'DIAGNÓSTICO', quote:'O problema nunca foi a qualidade do produto.', author:'Foi a falta de posicionamento.', quoteHighlight:'posicionamento.' },
      { type:'content', theme:'dark', step:'A VIRADA', headline:'Presença digital com intenção muda tudo.', headlineHighlight:'intenção muda tudo.', body:'Uma estratégia clara, executada com consistência, é o que separa empresas que crescem das que estacionam.', brand:'BESCHEIBEN' },
      { type:'quote',   theme:'dark', quoteTag:'PRINCÍPIO', quote:'Não se trata de postar mais.', author:'Trata-se de posicionar melhor.', quoteHighlight:'posicionar melhor.' },
      { type:'cta',     theme:'dark', eyebrow:'PRÓXIMO PASSO', headline:'Transforme sua presença em crescimento real.', headlineHighlight:'crescimento real.', body:'Diagnóstico gratuito\nSem compromisso\nResposta em 24h', cta:'Agendar diagnóstico gratuito' },
    ],
  },

  /* 1 ── Premium Serviços (fiel aos prints anteriores com slide dinâmico) */
  {
    name: 'Serviços Premium', icon: '⭐',
    desc: 'Print fiel · dinâmico · funil visual',
    color: '#6B4EFF',
    slides: [
      { type:'cover',   theme:'dark', tag:'SERVIÇOS', headline:'O que fazemos por você.', headlineHighlight:'fazemos', sub:'Construímos sistemas completos de crescimento digital para empresas que querem resultados consistentes.', showCta:true, cta:'DESLIZE', brand:'BESCHEIBEN' },
      { type:'content', theme:'dark', step:'SERVIÇO 01', headline:'A marca que as pessoas lembram.', headlineHighlight:'lembram.', body:'Definimos o posicionamento estratégico da sua marca para que ela gere autoridade, desperte confiança e seja a escolha natural.', brand:'BESCHEIBEN' },
      { type:'content', theme:'dark', step:'SERVIÇO 02', headline:'Conteúdo que atrai o cliente certo.', headlineHighlight:'cliente certo.', body:'Cada publicação constrói percepção de valor. Copy que converte. Design consistente. SEO que gera tráfego qualificado.', brand:'BESCHEIBEN' },
      { type:'dynamic', theme:'dark', tag:'AQUISIÇÃO', step:'SERVIÇO 03', headline:'Leads que viram clientes.', headlineHighlight:'clientes.', body:'Criamos sistemas de tráfego e funis de conversão que geram oportunidades de negócio com consistência.',
        funnelItems:[
          { cat:'ALCANCE',      label:'Tráfego',  sub:'paid + organic', color:'#6B4EFF' },
          { cat:'CAPTAÇÃO',     label:'Leads',    sub:'landing pages',  color:'#6B4EFF' },
          { cat:'QUALIFICAÇÃO', label:'MQLs',     sub:'Automação',      color:'#A58BFF' },
          { cat:'CONVERSÃO',    label:'Clientes', sub:'fechado',        color:'#6B4EFF' },
        ], brand:'BESCHEIBEN' },
      { type:'cta', theme:'dark', eyebrow:'O SISTEMA COMPLETO', headline:'Tudo conectado. Tudo funcionando.', headlineHighlight:'funcionando.', body:'Diagnóstico gratuito\nSem compromisso\nResposta em 24h', cta:'Quero conhecer a Bescheiben' },
    ],
  },

  /* 2 ── Alternado Roxo × Branco */
  {
    name: 'Alternado', icon: '🔀',
    desc: 'Roxo × branco · contraste premium',
    color: '#A58BFF',
    slides: [
      { type:'cover',   theme:'dark',   tag:'ESTRATÉGIA', headline:'Sua presença digital precisa de intenção.', headlineHighlight:'intenção.', sub:'Não de mais posts. De uma estratégia que funciona.', showCta:true, cta:'DESLIZE', brand:'BESCHEIBEN' },
      { type:'content', theme:'purple', step:'PASSO 01', headline:'Defina para quem você fala.', headlineHighlight:'para quem', body:'Sem ICP definido, toda comunicação é genérica. E genérico não vende.', brand:'BESCHEIBEN' },
      { type:'content', theme:'white',  step:'PASSO 02', headline:'Posicione com clareza.', headlineHighlight:'clareza.', body:'Seu diferencial precisa ser óbvio em 3 segundos. Se o cliente precisa pensar, você já perdeu.', brand:'BESCHEIBEN' },
      { type:'quote',   theme:'purple', quoteTag:'PRINCÍPIO', quote:'Posicionamento não é o que você faz.', author:'É o que você deixa na memória do cliente.', quoteHighlight:'memória do cliente.' },
      { type:'content', theme:'white',  step:'PASSO 03', headline:'Execute com consistência.', headlineHighlight:'consistência.', body:'Uma vez não muda nada. Semana a semana — autoridade se constrói no tempo, não no viral.', brand:'BESCHEIBEN' },
      { type:'cta',     theme:'dark',   eyebrow:'PRÓXIMO PASSO', headline:'Quer esse sistema rodando pra você?', headlineHighlight:'sistema rodando', body:'Diagnóstico gratuito\nSem compromisso\nResposta em 24h', cta:'Falar com a Bescheiben' },
    ],
  },

  /* 3 ── Educativo */
  {
    name: 'Educativo', icon: '📚',
    desc: '5 erros · autoridade · hook forte',
    color: '#6B4EFF',
    slides: [
      { type:'cover',   theme:'dark', tag:'ESTRATÉGIA DIGITAL', headline:'5 erros que estão destruindo sua presença digital.', headlineHighlight:'destruindo', sub:'Se você comete qualquer um deles, está perdendo clientes todos os dias.', showCta:true, cta:'DESLIZE E DESCUBRA', brand:'BESCHEIBEN' },
      { type:'content', theme:'dark', step:'ERRO 01', headline:'Postar sem estratégia.', headlineHighlight:'sem estratégia.', body:'Conteúdo sem planejamento editorial não gera resultado. Cada post precisa de objetivo, público e CTA definidos antes de ser criado.', brand:'BESCHEIBEN' },
      { type:'content', theme:'dark', step:'ERRO 02', headline:'Ignorar os dados.', headlineHighlight:'os dados.', body:'Métricas de vaidade não pagam boletos. Acompanhe alcance, cliques e conversões reais para saber o que está funcionando.', brand:'BESCHEIBEN' },
      { type:'content', theme:'dark', step:'ERRO 03', headline:'Identidade visual inconsistente.', headlineHighlight:'inconsistente.', body:'Sua marca precisa ser reconhecida em 2 segundos. Cor, fonte e tom de voz desalinhados fazem você parecer amador.', brand:'BESCHEIBEN' },
      { type:'quote',   theme:'dark', quoteTag:'REFLEXÃO', quote:'Marca forte não é sobre parecer bonito.', author:'É sobre ser lembrado na hora certa.', quoteHighlight:'lembrado na hora certa.' },
      { type:'cta',     theme:'dark', eyebrow:'CHEGA DE ERRAR', headline:'A gente corrige isso por você.', headlineHighlight:'corrige isso', body:'Auditoria gratuita\nSem compromisso\nResposta em 24h', cta:'Quero minha auditoria' },
    ],
  },

  /* 4 ── Provocativo */
  {
    name: 'Provocativo', icon: '🔥',
    desc: 'Dor real · urgência · transformação',
    color: '#ff5566',
    slides: [
      { type:'cover',   theme:'dark', tag:'REALIDADE', headline:'Seu concorrente está crescendo. E você?', headlineHighlight:'E você?', sub:'Enquanto você espera o momento certo, outros estão capturando os seus clientes.', showCta:true, cta:'VEJA O QUE ESTÁ ACONTECENDO', brand:'BESCHEIBEN' },
      { type:'quote',   theme:'dark', quoteTag:'CONTEXTO', quote:'Muitas empresas têm produtos incríveis.', author:'O mercado simplesmente não sabe que elas existem.', quoteHighlight:'não sabe que elas existem.' },
      { type:'quote',   theme:'dark', quoteTag:'DIAGNÓSTICO', quote:'O problema nunca foi a qualidade do produto.', author:'Foi a falta de posicionamento.', quoteHighlight:'posicionamento.' },
      { type:'content', theme:'dark', step:'A SOLUÇÃO', headline:'Estratégia, design e execução.', headlineHighlight:'execução.', body:'Não é sobre estar em todo lugar. É sobre estar no lugar certo, com a mensagem certa, para o cliente certo.', brand:'BESCHEIBEN' },
      { type:'cta',     theme:'dark', eyebrow:'O MOMENTO É AGORA', headline:'Pare de perder espaço no mercado.', headlineHighlight:'perder espaço', body:'Diagnóstico gratuito\nSem compromisso\nResposta em 24h', cta:'Quero sair na frente' },
    ],
  },

  /* 5 ── Funil Dinâmico */
  {
    name: 'Funil Dinâmico', icon: '📊',
    desc: 'Split visual · funil · processo',
    color: '#c4f542',
    slides: [
      { type:'cover',   theme:'dark', tag:'CRESCIMENTO B2B', headline:'Como transformamos visitantes em clientes.', headlineHighlight:'clientes.', sub:'O método que usamos em cada cliente da Bescheiben.', showCta:true, cta:'VEJA O PROCESSO', brand:'BESCHEIBEN' },
      { type:'dynamic', theme:'dark', tag:'ATRAÇÃO', step:'FASE 01', headline:'Tráfego qualificado.', headlineHighlight:'qualificado.', body:'Paid + orgânico integrados para trazer o perfil certo.',
        funnelItems:[
          { cat:'ORGÂNICO', label:'SEO + Conteúdo', sub:'authority',    color:'#6B4EFF' },
          { cat:'PAGO',     label:'Google Ads',     sub:'search intent', color:'#4A32D4' },
          { cat:'SOCIAL',   label:'Instagram',      sub:'B2B awareness', color:'#A58BFF' },
        ], brand:'BESCHEIBEN' },
      { type:'dynamic', theme:'dark', tag:'CONVERSÃO', step:'FASE 02', headline:'Leads que entram quentes.', headlineHighlight:'quentes.', body:'Landing pages e fluxos de captura otimizados para o perfil B2B.',
        funnelItems:[
          { cat:'CAPTAÇÃO',     label:'Landing Page', sub:'taxa > 30%', color:'#6B4EFF' },
          { cat:'NUTRIÇÃO',     label:'Email Flow',   sub:'automação',  color:'#A58BFF' },
          { cat:'QUALIFICAÇÃO', label:'MQL Score',    sub:'BANT',       color:'#6B4EFF' },
        ], brand:'BESCHEIBEN' },
      { type:'quote',   theme:'dark', quoteTag:'RESULTADO', quote:'90 dias de método consistente:', author:'Primeiro contrato B2B fechado pelo Instagram.', quoteHighlight:'fechado pelo Instagram.' },
      { type:'cta',     theme:'dark', eyebrow:'IMPLANTE ESSE SISTEMA', headline:'Diagnóstico gratuito esta semana.', headlineHighlight:'Diagnóstico gratuito', body:'Análise do seu funil atual\nPlano de ação personalizado\nIniciamos em 7 dias', cta:'Quero meu diagnóstico' },
    ],
  },

  /* 6 ── Lista Rápida */
  {
    name: 'Lista Rápida', icon: '⚡',
    desc: 'Hook de lista · retenção · saves',
    color: '#A58BFF',
    slides: [
      { type:'cover',   theme:'dark', tag:'MARKETING B2B', headline:'3 perguntas que todo dono de negócio precisa responder.', headlineHighlight:'3 perguntas', sub:'Se você não sabe as respostas, está operando no escuro.', showCta:true, cta:'SALVE ESSE POST', brand:'BESCHEIBEN' },
      { type:'content', theme:'dark', step:'PERGUNTA 01', headline:'Quem é o seu cliente dos sonhos?', headlineHighlight:'cliente dos sonhos?', body:'Não "empresas do setor X". Uma pessoa real, com cargo, dor específica e orçamento definido.', brand:'BESCHEIBEN' },
      { type:'content', theme:'dark', step:'PERGUNTA 02', headline:'Por que alguém te escolhe e não o concorrente?', headlineHighlight:'te escolhe', body:'"Qualidade e atendimento" não é diferencial — é o mínimo. Seu diferencial real precisa ser claro em 1 frase.', brand:'BESCHEIBEN' },
      { type:'content', theme:'dark', step:'PERGUNTA 03', headline:'Qual é o próximo passo que você quer que ele dê?', headlineHighlight:'próximo passo', body:'Todo post, todo e-mail, toda conversa precisa de um CTA claro. Se você não conduz, o cliente some.', brand:'BESCHEIBEN' },
      { type:'quote',   theme:'dark', quoteTag:'CONCLUSÃO', quote:'Clareza não é opcional no marketing B2B.', author:'É o produto em si.', quoteHighlight:'produto em si.' },
      { type:'cta',     theme:'dark', eyebrow:'PRÓXIMO PASSO', headline:'Respondeu as 3? Hora de agir.', headlineHighlight:'agir.', body:'Diagnóstico gratuito\nAnálise do seu posicionamento\nPlano de ação em 24h', cta:'Quero meu diagnóstico' },
    ],
  },

  /* 7 ── Antes/Depois */
  {
    name: 'Antes/Depois', icon: '🔄',
    desc: 'Transformação · resultado · prova',
    color: '#22d3ee',
    slides: [
      { type:'cover',   theme:'dark', tag:'TRANSFORMAÇÃO', headline:'Como uma empresa saiu do invisível para referência.', headlineHighlight:'invisível para referência', sub:'Em 90 dias. Com método. Sem milagre.', showCta:true, cta:'VER O PROCESSO', brand:'BESCHEIBEN' },
      { type:'content', theme:'dark', step:'ANTES', headline:'Presença digital sem resultado.', headlineHighlight:'sem resultado.', body:'Perfil ativo, conteúdo saindo, mas zero leads. Seguidores aumentando, faturamento estagnado.', brand:'BESCHEIBEN' },
      { type:'content', theme:'dark', step:'DIAGNÓSTICO', headline:'O problema estava no posicionamento.', headlineHighlight:'posicionamento.', body:'Não na frequência de posts. O conteúdo certo para o público errado — ou o público certo com a mensagem errada.', brand:'BESCHEIBEN' },
      { type:'dynamic', theme:'dark', tag:'PROCESSO', step:'MÉTODO', headline:'Reposicionamento em 3 fases.', headlineHighlight:'3 fases.', body:'Cada fase conectada. Cada ação mensurável.',
        funnelItems:[
          { cat:'FASE 1', label:'Diagnóstico de Marca',    sub:'semanas 1-2', color:'#6B4EFF' },
          { cat:'FASE 2', label:'Estratégia de Conteúdo',  sub:'semanas 3-4', color:'#A58BFF' },
          { cat:'FASE 3', label:'Execução + Métricas',     sub:'meses 2-3',   color:'#6B4EFF' },
        ], brand:'BESCHEIBEN' },
      { type:'quote',   theme:'dark', quoteTag:'RESULTADO', quote:'90 dias depois do reposicionamento:', author:'Primeiro contrato B2B fechado pelo Instagram.', quoteHighlight:'fechado pelo Instagram.' },
      { type:'cta',     theme:'dark', eyebrow:'ESSA PODE SER SUA HISTÓRIA', headline:'Quer esse resultado?', headlineHighlight:'resultado?', body:'Diagnóstico gratuito\nSem compromisso\nIniciamos em 7 dias', cta:'Quero começar agora' },
    ],
  },

  /* 8 ── Autoridade */
  {
    name: 'Autoridade', icon: '🏆',
    desc: 'Expertise · confiança · liderança',
    color: '#f59e0b',
    slides: [
      { type:'cover',   theme:'dark', tag:'POSICIONAMENTO', headline:'A diferença entre ser encontrado e ser escolhido.', headlineHighlight:'ser escolhido.', sub:'Empresas que dominam o digital não postam mais. Postam melhor.', showCta:true, cta:'DESCUBRA COMO', brand:'BESCHEIBEN' },
      { type:'content', theme:'dark', step:'REALIDADE 01', headline:'Visibilidade sem autoridade não converte.', headlineHighlight:'não converte.', body:'Você pode ter mil seguidores novos por mês e continuar sem fechar contratos. O problema não é alcance — é autoridade percebida.', brand:'BESCHEIBEN' },
      { type:'content', theme:'dark', step:'REALIDADE 02', headline:'Autoridade se constrói com consistência.', headlineHighlight:'consistência.', body:'Não com um viral. Um posicionamento claro, reforçado semana a semana, cria o ativo mais valioso do digital: confiança antes do primeiro contato.', brand:'BESCHEIBEN' },
      { type:'quote',   theme:'dark', quoteTag:'PRINCÍPIO', quote:'Quando o cliente pensa no seu nicho,', author:'ele precisa pensar em você primeiro.', quoteHighlight:'pensar em você primeiro.' },
      { type:'content', theme:'dark', step:'O CAMINHO', headline:'Posicionamento → Conteúdo → Conversão.', headlineHighlight:'Conversão.', body:'Esse é o sistema. Funciona para agências, consultorias e qualquer negócio B2B que quer crescer com previsibilidade.', brand:'BESCHEIBEN' },
      { type:'cta',     theme:'dark', eyebrow:'CONSTRUA SUA AUTORIDADE', headline:'Comece pelo diagnóstico.', headlineHighlight:'diagnóstico.', body:'Diagnóstico gratuito\nPlano personalizado\nIniciamos em 7 dias', cta:'Agendar agora' },
    ],
  },
];

/* ── Load template ── */
function loadTemplate(idx) {
  var tpl = TEMPLATES[idx];
  if (!tpl) return;
  slides.length = 0;
  tpl.slides.forEach(function (s) { slides.push(Object.assign({}, s)); });
  currentSlide = 0;
  renderSlideList();
  renderSlidePreview();
  renderEditor();
  closeTemplateModal();
}
