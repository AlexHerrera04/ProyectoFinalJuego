console.log('mode.js cargado');

document.querySelector('.back-btn')?.addEventListener('click', () => {
  window.location.href = 'select.html';
});

document.querySelector('.classic-btn')?.addEventListener('click', () => {
  window.location.href = 'game.html?mode=classic';
});

document.querySelector('.sudden-btn')?.addEventListener('click', () => {
  window.location.href = 'game.html?mode=sudden';
});
