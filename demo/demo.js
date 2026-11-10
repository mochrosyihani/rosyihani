(function(){
  var $=function(i){return document.getElementById(i)};
  var fmt=new Intl.NumberFormat('id-ID',{maximumFractionDigits:0});

  /* Pengacak berbenih supaya data selalu sama */
  function rng(seed){var s=seed>>>0;return function(){s=(s+0x6D2B79F5)>>>0;var t=s;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}}

  var JENIS=[['BRG','Bearing',['6200','6201','6202','6203','6204','6205','6206','6207','6208','6300']],
    ['BLT','Baut',['M6','M8','M10','M12','M14','M16','M20']],
    ['OLI','Oli',['hidrolik 20 L','gear 5 L','mesin 4 L','pelumas 1 L']],
    ['FLT','Filter',['udara','oli','solar','hidrolik','kabin']],
    ['KBL','Kabel',['1,5 mm','2,5 mm','4 mm','6 mm','10 mm']],
    ['SRT','Sarung tangan',['katun','kulit','nitril','karet']],
    ['SLG','Seal',['25 mm','30 mm','35 mm','40 mm','50 mm']],
    ['VBT','V-belt',['A40','A45','B50','B60','C70']],
    ['LMP','Lampu',['LED 10 W','LED 20 W','TL 18 W','sorot 50 W']],
    ['PPA','Pipa',['PVC 1/2"','PVC 3/4"','PVC 1"','besi 1"','besi 2"']],
    ['KNK','Konektor',['5 mm','8 mm','12 mm','16 mm']],
    ['MBR','Mur',['M6','M8','M10','M12','M16']]];
  var MERK=['Seri A','Seri B','Seri C','Seri D','Seri E','Seri F','Seri G','Seri H'];

  function bangun(n,seed){
    var r=rng(seed),data=new Array(n);
    for(var i=0;i<n;i++){
      var j=JENIS[(r()*JENIS.length)|0],sp=j[2][(r()*j[2].length)|0],m=MERK[(r()*MERK.length)|0];
      var pakai=Math.max(1,Math.round(Math.pow(r(),2.2)*120));
      var buffer=Math.round(pakai*(4+r()*10));
      var stok=Math.round(buffer*(0.85+r()*2.4));
      var nama=j[1]+' '+sp+' '+m;
      data[i]={kode:j[0]+'-'+String(i+1).padStart(5,'0'),nama:nama,stok:stok,buffer:buffer,pakai:pakai,cari:(j[0]+' '+nama).toLowerCase(),st:''};
    }
    return data;
  }
  function status(d){
    if(d.stok<d.buffer)return 'bawah';
    if(d.stok<d.buffer*1.25)return 'hampir';
    return 'aman';
  }
  function hitungStatus(data){for(var i=0;i<data.length;i++)data[i].st=status(data[i])}

  var DATA=bangun(10000,2026);hitungStatus(DATA);

  /* KPI */
  function kpi(){
    var b=0,h=0;for(var i=0;i<DATA.length;i++){if(DATA[i].st==='bawah')b++;else if(DATA[i].st==='hampir')h++}
    $('k-sku').textContent=fmt.format(DATA.length);$('k-bawah').textContent=fmt.format(b);
    $('k-hampir').textContent=fmt.format(h);$('k-akurasi').textContent='98,6%';
  }

  /* Grafik */
  function grafik(){
    var r=rng(77),k=[],m=[],base=5200;
    for(var i=0;i<12;i++){k.push(Math.round(base*(0.88+r()*0.26)+i*60));m.push(Math.round(base*(0.80+r()*0.32)+i*45))}
    var W=800,H=280,L=56,R=16,T=18,B=34,max=Math.ceil(Math.max.apply(null,k.concat(m))/1000)*1000,min=0;
    function X(i){return L+(W-L-R)*i/11}function Y(v){return T+(H-T-B)*(1-(v-min)/(max-min))}
    var s='';
    for(var g=0;g<=4;g++){var v=max*g/4,y=Y(v);
      s+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+y+'" y2="'+y+'" stroke="#D6DDE6" stroke-width="1"/>';
      s+='<text x="'+(L-8)+'" y="'+(y+4)+'" text-anchor="end" font-size="12" fill="#3A4656" font-family="Inter,Arial,sans-serif">'+fmt.format(v)+'</text>'}
    for(var i=0;i<12;i++){s+='<text x="'+X(i)+'" y="'+(H-12)+'" text-anchor="middle" font-size="12" fill="#3A4656" font-family="Inter,Arial,sans-serif">M'+(i+1)+'</text>'}
    function path(a,c){var p='';for(var i=0;i<12;i++)p+=(i?'L':'M')+X(i).toFixed(1)+' '+Y(a[i]).toFixed(1);
      var dots='';for(var i=0;i<12;i++)dots+='<circle cx="'+X(i).toFixed(1)+'" cy="'+Y(a[i]).toFixed(1)+'" r="3" fill="'+c+'"><title>Minggu '+(i+1)+': '+fmt.format(a[i])+' unit</title></circle>';
      return '<path d="'+p+'" fill="none" stroke="'+c+'" stroke-width="2.4" stroke-linejoin="round"/>'+dots}
    s+=path(m,'#2A7A8A')+path(k,'#0F2540');
    $('grafik').innerHTML=s;
  }

  /* Tabel dan pencarian */
  var UKURAN=12,hal=0,hasil=DATA;
  function saring(){
    var q=$('cari').value.trim().toLowerCase(),st=$('saring').value;
    var kata=q?q.split(/\s+/):[],t0=performance.now(),out=[];
    for(var i=0;i<DATA.length;i++){
      var d=DATA[i];if(st&&d.st!==st)continue;
      var ok=true;for(var k=0;k<kata.length;k++){if(d.cari.indexOf(kata[k])<0){ok=false;break}}
      if(ok)out.push(d);
    }
    var ms=performance.now()-t0;hasil=out;hal=0;
    $('info-cari').textContent=fmt.format(out.length)+' barang ditemukan dalam '+ms.toFixed(1).replace('.',',')+' ms';
    gambar();
  }
  var LABEL={bawah:'Di bawah buffer',hampir:'Mendekati',aman:'Aman'};
  function gambar(){
    var tb=$('tabel').tBodies[0],mulai=hal*UKURAN,sl=hasil.slice(mulai,mulai+UKURAN),h='';
    for(var i=0;i<sl.length;i++){var d=sl[i],hari=d.pakai?(d.stok/d.pakai):0;
      h+='<tr><td>'+d.kode+'</td><td>'+d.nama+'</td><td class="n">'+fmt.format(d.stok)+'</td><td class="n">'+fmt.format(d.buffer)+'</td><td class="n">'+fmt.format(d.pakai)+'</td><td class="n">'+fmt.format(hari)+' hari</td><td><span class="status st-'+d.st+'">'+LABEL[d.st]+'</span></td></tr>'}
    if(!sl.length)h='<tr><td colspan="7">Tidak ada barang yang cocok. Coba kata kunci lain.</td></tr>';
    tb.innerHTML=h;
    var tot=Math.max(1,Math.ceil(hasil.length/UKURAN));
    $('hal-info').textContent='Halaman '+(hal+1)+' dari '+fmt.format(tot);
    $('prev').disabled=hal<=0;$('next').disabled=hal>=tot-1;
  }
  $('cari').addEventListener('input',saring);$('saring').addEventListener('change',saring);
  $('prev').addEventListener('click',function(){if(hal>0){hal--;gambar()}});
  $('next').addEventListener('click',function(){if((hal+1)*UKURAN<hasil.length){hal++;gambar()}});

  /* Uji 10.000 SKU */
  $('jalankan').addEventListener('click',function(){
    var btn=this;btn.disabled=true;btn.textContent='Menjalankan...';
    setTimeout(function(){
      var t0=performance.now(),d=bangun(10000,Date.now()&0xffff),t1=performance.now();
      hitungStatus(d);var t2=performance.now();
      var kata=['bearing','baut','oli','filter','kabel','seal','belt','lampu','pipa','mur','6204','m10','seri a','hidrolik'],r=rng(5),ketemu=0,t3=performance.now();
      for(var n=0;n<1000;n++){var q=kata[(r()*kata.length)|0],q2=kata[(r()*kata.length)|0];
        for(var i=0;i<d.length;i++){var c=d[i].cari;if(c.indexOf(q)>=0&&c.indexOf(q2)>=0)ketemu++}}
      var t4=performance.now();
      function f(ms){return ms<1?'<1 ms':ms<1000?Math.round(ms)+' ms':(ms/1000).toFixed(2).replace('.',',')+' detik'}
      $('u-buat').textContent=f(t1-t0);$('u-status').textContent=f(t2-t1);
      $('u-cari').textContent=((t4-t3)/1000).toFixed(2).replace('.',',')+' ms';$('u-total').textContent=f(t4-t3);
      $('hasil-uji').hidden=false;
      var c=$('u-cat');c.hidden=false;c.textContent='Diukur di perangkat Anda dengan pencarian penuh tanpa indeks. Sistem sungguhan memakai basis data dengan indeks, sehingga lebih cepat lagi. Uji ini hanya menguji data dan pencarian di browser, bukan beban banyak pengguna sekaligus.';
      btn.disabled=false;btn.textContent='Jalankan ulang';
    },30);
  });

  kpi();grafik();saring();
})();
