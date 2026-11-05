const stage = document.querySelector('#dumbbell-stage');
let started = false;

async function loadDumbbell() {
  if (!stage || started) return;
  started = true;

  try {
    const { mountDumbbell } = await import('./dumbbell3d.js');
    mountDumbbell(stage);
  } catch (error) {
    stage.dataset.webgl = 'unavailable';
    const status = stage.querySelector('.dumbbell-status');
    if (status) {
      status.hidden = false;
      status.textContent = 'A visualização 3D não pôde ser carregada neste dispositivo.';
    }
    console.warn('A cena 3D não foi carregada; o halter de fallback permanece visível.', error);
  }
}

if (stage && 'IntersectionObserver' in window) {
  const loaderObserver = new IntersectionObserver((entries, observer) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    observer.disconnect();
    loadDumbbell();
  }, { rootMargin: '120px 0px', threshold: 0.01 });
  loaderObserver.observe(stage);
} else {
  loadDumbbell();
}
