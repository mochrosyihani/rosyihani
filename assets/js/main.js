(function(){
  var t=document.querySelector('.menu-tombol'),m=document.getElementById('menu');
  if(!t||!m)return;
  function tutup(){m.classList.remove('buka');t.setAttribute('aria-expanded','false')}
  t.addEventListener('click',function(){
    var b=m.classList.toggle('buka');t.setAttribute('aria-expanded',b?'true':'false');
  });
  m.addEventListener('click',function(e){if(e.target.tagName==='A')tutup()});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')tutup()});
})();
