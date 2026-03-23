document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.fase-tab');
  const panels = {
    'inter': document.getElementById('panel-inter'),
    'cond': document.getElementById('panel-cond')
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remover active de todos los tabs
      tabs.forEach(t => t.classList.remove('active'));
      // Ocultar todos los paneles
      Object.values(panels).forEach(p => p.classList.add('hidden'));

      // Activar tab actual
      tab.classList.add('active');
      // Mostrar panel correspondiente
      const target = tab.getAttribute('data-tab');
      panels[target].classList.remove('hidden');
    });
  });
});