
document.getElementById('year').textContent = new Date().getFullYear();
const btn = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
if(btn && nav){
  btn.addEventListener('click',()=> {
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });
}


const visitorCount = document.getElementById('visitor-count');

if (visitorCount) {
  fetch('/.netlify/functions/visitor-counter')
    .then(response => response.json())
    .then(data => {
      visitorCount.textContent = Number(data.count).toLocaleString();
    })
    .catch(() => {
      visitorCount.textContent = '—';
    });
}
