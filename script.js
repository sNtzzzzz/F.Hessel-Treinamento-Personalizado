const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');

function closeMenu() {
  if (!menuToggle || !nav) return;
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Abrir menu');
  nav.classList.remove('is-open');
}

menuToggle?.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Abrir menu' : 'Fechar menu');
  nav?.classList.toggle('is-open', !isOpen);
});

nav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', closeMenu);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});

const processSteps = [
  {
    title: 'Conversa inicial',
    copy: 'Conte seus objetivos e conheça as possibilidades de acompanhamento com Fernando.',
  },
  {
    title: 'Planejamento',
    copy: 'O treinamento é pensado para seus objetivos, sua rotina e seu ponto de partida.',
  },
  {
    title: 'Orientação',
    copy: 'A orientação profissional ajuda você a seguir o plano com atenção à execução.',
  },
  {
    title: 'Acompanhamento',
    copy: 'No Integral, o ciclo inclui check-ins mensais, análise de vídeos e suporte pelo WhatsApp.',
  },
  {
    title: 'Ajustes',
    copy: 'O acompanhamento ajuda a manter o plano conectado ao processo e à sua evolução.',
  },
];

const stepButtons = [...document.querySelectorAll('.process-step')];
const detailIndex = document.querySelector('#process-detail-index');
const detailTitle = document.querySelector('#process-detail-title');
const detailCopy = document.querySelector('#process-detail-copy');
const processTimeline = document.querySelector('.process-steps');

stepButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const stepNumber = Number(button.dataset.step);
    const step = processSteps[stepNumber];
    if (!step) return;

    stepButtons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle('is-active', isActive);
      item.setAttribute('aria-pressed', String(isActive));
    });

    detailIndex.textContent = 'ETAPA ' + String(stepNumber + 1).padStart(2, '0');
    detailTitle.textContent = step.title;
    detailCopy.textContent = step.copy;
    if (processTimeline) {
      processTimeline.style.setProperty(
        '--step-progress',
        ((stepNumber / Math.max(1, stepButtons.length - 1)) * 100) + '%',
      );
    }
  });
});

if (processTimeline) processTimeline.style.setProperty('--step-progress', '0%');

const footerYear = document.querySelector('#footer-year');
if (footerYear) footerYear.textContent = String(new Date().getFullYear());

const revealTargets = document.querySelectorAll(
  '.section-heading, .pillar-card, .process-steps, .about-photo-wrap, .about-copy, .modality-card, .plan-card, .faq-item, .closing-content',
);

if ('IntersectionObserver' in window && !reduceMotion) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  revealTargets.forEach((target) => {
    target.classList.add('will-reveal');
    revealObserver.observe(target);
  });
}
