(function(){
  var $=function(i){return document.getElementById(i)};
  var fmt=new Intl.NumberFormat('id-ID',{maximumFractionDigits:0});
  var fmt1=new Intl.NumberFormat('id-ID',{maximumFractionDigits:1});
  function num(v){var n=parseFloat(String(v).replace(',','.'));return isFinite(n)?n:0}

  /* Safety stock dan ROP */
  function hitungSS(){
    var d=num($('ss-d').value),s=num($('ss-s').value),l=num($('ss-l').value),z=num($('ss-z').value);
    var ss=Math.ceil(z*s*Math.sqrt(Math.max(l,0)));
    var ld=d*l;
    $('o-ss').textContent=fmt.format(ss);
    $('o-ld').textContent=fmt.format(Math.ceil(ld));
    $('o-rop').textContent=fmt.format(Math.ceil(ld+ss));
  }
  ['ss-d','ss-s','ss-l','ss-z'].forEach(function(i){$(i).addEventListener('input',hitungSS)});
  hitungSS();

  /* Baris dinamis */
  function inp(type,val,label,cls){
    var i=document.createElement('input');i.type=type;i.value=val;i.setAttribute('aria-label',label);
    if(type==='number'){i.min='0';i.step='any';i.inputMode='decimal'}
    if(cls)i.className=cls;return i}
  function td(child,cls){var c=document.createElement('td');if(cls)c.className=cls;if(child)c.appendChild(child);return c}
  function hapus(tr,after){
    var b=document.createElement('button');b.type='button';b.className='tombol-polos';b.textContent='Hapus';
    b.setAttribute('aria-label','Hapus baris');
    b.addEventListener('click',function(){tr.remove();after()});return td(b)}

  /* Nilai persediaan */
  var tbN=$('t-nilai').tBodies[0];
  function barisNilai(nama,jml,hrg){
    var tr=document.createElement('tr');
    var out=td(null,'n');out.textContent='0';
    var a=inp('text',nama,'Nama barang'),b=inp('number',jml,'Jumlah'),c=inp('number',hrg,'Harga satuan');
    function h(){var t=num(b.value)*num(c.value);out.textContent=fmt.format(t);total()}
    [a,b,c].forEach(function(e){e.addEventListener('input',h)});
    tr.appendChild(td(a));tr.appendChild(td(b,'n'));tr.appendChild(td(c,'n'));tr.appendChild(out);
    tr.appendChild(hapus(tr,total));tbN.appendChild(tr);h();
  }
  function total(){
    var t=0;[].forEach.call(tbN.rows,function(r){t+=num(r.cells[1].firstChild.value)*num(r.cells[2].firstChild.value)});
    $('o-total').textContent=fmt.format(t);
  }
  barisNilai('Bearing 6204',120,45000);barisNilai('Oli hidrolik 20 L',18,980000);barisNilai('Sarung tangan',300,12500);
  $('tambah-nilai').addEventListener('click',function(){barisNilai('',0,0)});

  /* Opname */
  var tbO=$('t-opname').tBodies[0];
  function barisOpname(nama,sis,fis,hrg){
    var tr=document.createElement('tr');
    var su=td(null,'n'),sn=td(null,'n');
    var a=inp('text',nama,'Nama barang'),b=inp('number',sis,'Jumlah di sistem'),c=inp('number',fis,'Jumlah fisik'),d=inp('number',hrg,'Harga satuan');
    function h(){
      var u=num(c.value)-num(b.value);
      su.textContent=(u>0?'+':'')+fmt.format(u);sn.textContent=(u>0?'+':'')+fmt.format(u*num(d.value));
      var k=u===0?'':(u<0?'merah':'hijau');su.className='n '+k;sn.className='n '+k;
      ringkas();
    }
    [a,b,c,d].forEach(function(e){e.addEventListener('input',h)});
    tr.appendChild(td(a));tr.appendChild(td(b,'n'));tr.appendChild(td(c,'n'));tr.appendChild(td(d,'n'));
    tr.appendChild(su);tr.appendChild(sn);tr.appendChild(hapus(tr,ringkas));tbO.appendChild(tr);h();
  }
  function ringkas(){
    var n=tbO.rows.length,cocok=0,nilai=0,beda=0;
    [].forEach.call(tbO.rows,function(r){
      var u=num(r.cells[2].firstChild.value)-num(r.cells[1].firstChild.value);
      if(u===0)cocok++;else beda++;
      nilai+=u*num(r.cells[3].firstChild.value);
    });
    $('o-akurasi').textContent=n?fmt1.format(cocok/n*100)+'%':'–';
    $('o-selisih').textContent=n?(nilai>0?'+':'')+'Rp '+fmt.format(nilai):'–';
    $('o-jml').textContent=n?beda+' dari '+n:'–';
  }
  barisOpname('Bearing 6204',120,120,45000);barisOpname('Oli hidrolik 20 L',18,17,980000);
  barisOpname('Sarung tangan',300,300,12500);barisOpname('Baut M10',2500,2480,850);
  $('tambah-opname').addEventListener('click',function(){barisOpname('',0,0,0)});
})();
