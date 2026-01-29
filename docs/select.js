console.log('select.js cargado');


document.querySelector('.song-card')?.addEventListener('click', () => {
  window.location.href = 'mode.html';
});


document.querySelector('.back-btn')?.addEventListener('click', () => {
  window.location.href = 'index.html';
});
