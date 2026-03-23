// app4.js — Lógica para revelar pasos estilo Duolingo

function revelarPaso(containerId, btnElement) {
  const container = document.getElementById(containerId);
  const hiddenSteps = container.querySelectorAll('.hidden-step');
  
  if (hiddenSteps.length > 0) {
    // Tomar el primer paso oculto
    const nextStep = hiddenSteps[0];
    
    // Remover clases de ocultamiento
    nextStep.classList.remove('hidden-step');
    nextStep.style.position = 'relative';
    nextStep.style.visibility = 'visible';
    
    // Si era el último paso, ocultar el botón y mostrar el resultado final
    if (hiddenSteps.length === 1) {
      btnElement.style.display = 'none';
      
      // Encontrar la caja de resultado correspondiente (usando substring para mapear steps-p1 -> res-p1)
      const resId = containerId.replace('steps-', 'res-');
      const resBox = document.getElementById(resId);
      
      if (resBox) {
        resBox.style.display = 'block';
        // Pequeño timeout para permitir la transición de opacidad
        setTimeout(() => {
          resBox.classList.remove('hidden-result');
        }, 50);
      }
    }
  }
}

// Forzar el renderizado matemático si MathJax carga después del DOM
document.addEventListener("DOMContentLoaded", () => {
  if (window.MathJax) {
    MathJax.typesetPromise();
  }
});