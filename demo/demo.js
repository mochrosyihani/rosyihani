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
  var HARGA=[9000,600,16000,7500,3200,2500,1800,9500,5500,4200,1200,400];
  var MERK=['Seri A','Seri B','Seri C','Seri D','Seri E','Seri F','Seri G','Seri H'];

  function bangun(n,seed){
    var r=rng(seed),data=new Array(n);
    for(var i=0;i<n;i++){
      var ki=(r()*JENIS.length)|0,j=JENIS[ki],sp=j[2][(r()*j[2].length)|0],m=MERK[(r()*MERK.length)|0];
      var pakai=Math.max(1,Math.round(Math.pow(r(),2.2)*120));
      var buffer=Math.round(pakai*(4+r()*10));
      var stok=Math.round(buffer*(0.85+r()*2.4));
      var harga=Math.max(100,Math.round(HARGA[ki]*(0.5+r()*1.6)/100)*100);
      var diam=Math.round(Math.pow(r(),1.6)*(pakai<6?320:110));
      var nama=j[1]+' '+sp+' '+m;
      data[i]={kode:j[0]+'-'+String(i+1).padStart(5,'0'),nama:nama,stok:stok,buffer:buffer,pakai:pakai,cari:(j[0]+' '+nama).toLowerCase(),st:'',kat:ki,harga:harga,diam:diam};
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

  /* Pemakaian bersama */
  var KAT=-1; /* -1 = semua */
  function rp(v){return v>=1e9?'Rp '+(v/1e9).toFixed(1).replace('.',',')+' miliar':v>=1e6?'Rp '+(v/1e6).toFixed(1).replace('.',',')+' juta':'Rp '+fmt.format(v)}
  function pct(a,b){return b?(a/b*100).toFixed(1).replace('.',',')+'%':'0%'}
  function pilih(){var o=[];for(var i=0;i<DATA.length;i++){if(KAT<0||DATA[i].kat===KAT)o.push(DATA[i])}return o}

  /* Tren mingguan per kategori (berbenih) */
  var WK=(function(){var r=rng(77),w=[];for(var c=0;c<JENIS.length;c++){var k=[],m=[],base=380+r()*900;
    for(var i=0;i<12;i++){k.push(Math.round(base*(0.86+r()*0.28)+i*5));m.push(Math.round(base*(0.78+r()*0.34)+i*4))}
    w.push({k:k,m:m})}return w})();

  /* Opname terakhir: 360 barang dihitung, 5 selisih */
  var OPN=(function(){var r=rng(360),o=[],idx=[41,903,2718,5206,8841];
    var sel=[-3,2,-1,-6,4];
    for(var i=0;i<idx.length;i++){var d=DATA[idx[i]];o.push({d:d,sis:d.stok,fis:d.stok+sel[i],sel:sel[i]})}
    return o})();

  function kpi(){
    var L=pilih(),b=0,h=0,sv=0,sp=0,nilai=0,diamN=0,nb=0;
    for(var i=0;i<L.length;i++){var d=L[i],n=d.stok*d.harga;nilai+=n;sv+=d.stok;sp+=d.pakai;
      if(d.st==='bawah'){b++;nb+=n}else if(d.st==='hampir')h++;
      if(d.diam>90)diamN+=n}
    $('k-nilai').textContent=rp(nilai);$('k-nilai-s').textContent=fmt.format(L.length)+' SKU terpantau';
    $('k-hari').textContent=fmt.format(sp?sv/sp:0)+' hari';
    $('k-akurasi').textContent='98,6%';
    $('k-bawah').textContent=fmt.format(b);$('k-bawah-s').textContent=pct(b,L.length)+' dari SKU';
    $('k-hampir').textContent=fmt.format(h);$('k-hampir-s').textContent=pct(h,L.length)+' dari SKU';
    $('k-diam').textContent=rp(diamN);$('k-diam-s').textContent=pct(diamN,nilai)+' dari nilai persediaan';
    var a=pct(b,L.length),c=L.length-b-h;
    var P=[['bawah',b,'Di bawah buffer'],['hampir',h,'Mendekati'],['aman',c,'Aman']],g='',lg='';
    for(var p=0;p<3;p++){g+='<i class="seg seg-'+P[p][0]+'" style="width:'+(L.length?P[p][1]/L.length*100:0)+'%" title="'+P[p][2]+': '+fmt.format(P[p][1])+'"></i>';
      lg+='<span><i class="seg seg-'+P[p][0]+'"></i>'+P[p][2]+' '+fmt.format(P[p][1])+' ('+pct(P[p][1],L.length)+')</span>'}
    $('komp').innerHTML=g;$('komp-leg').innerHTML=lg;
    $('komp').setAttribute('aria-label','Komposisi status buffer: '+P[0][1]+' di bawah, '+P[1][1]+' mendekati, '+P[2][1]+' aman');
  }

  function grafik(){
    var n=+$('f-per').value,k=[],m=[];
    for(var i=12-n;i<12;i++){var tk=0,tm=0;for(var c=0;c<JENIS.length;c++){if(KAT>=0&&c!==KAT)continue;tk+=WK[c].k[i];tm+=WK[c].m[i]}k.push(tk);m.push(tm)}
    var W=800,H=280,L=56,R=16,T=18,B=34,mx=Math.max.apply(null,k.concat(m)),step=mx>6000?2000:mx>2500?1000:mx>1200?500:200,max=Math.ceil(mx*1.05/step)*step,min=Math.max(0,Math.floor(Math.min.apply(null,k.concat(m))*0.85/step)*step),N=n-1;
    function X(i){return L+(W-L-R)*i/N}function Y(v){return T+(H-T-B)*(1-(v-min)/(max-min))}
    var s='';
    for(var g=0;g<=4;g++){var v=min+(max-min)*g/4,y=Y(v);
      s+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+y+'" y2="'+y+'" stroke="#D6DDE6" stroke-width="1"/>';
      s+='<text x="'+(L-8)+'" y="'+(y+4)+'" text-anchor="end" font-size="12" fill="#3A4656" font-family="Inter,Arial,sans-serif">'+fmt.format(v)+'</text>'}
    for(var i=0;i<n;i++){s+='<text x="'+X(i)+'" y="'+(H-12)+'" text-anchor="middle" font-size="12" fill="#3A4656" font-family="Inter,Arial,sans-serif">M'+(i+1)+'</text>'}
    function path(a,c,area){var p='';for(var i=0;i<n;i++)p+=(i?'L':'M')+X(i).toFixed(1)+' '+Y(a[i]).toFixed(1);
      var ar=area?'<path d="'+p+'L'+X(n-1).toFixed(1)+' '+Y(min)+'L'+X(0).toFixed(1)+' '+Y(min)+'Z" fill="'+c+'" fill-opacity=".07"/>':'';
      var dots='';for(var i=0;i<n;i++)dots+='<circle cx="'+X(i).toFixed(1)+'" cy="'+Y(a[i]).toFixed(1)+'" r="3" fill="'+c+'"><title>Minggu '+(i+1)+': '+fmt.format(a[i])+' unit</title></circle>';
      return ar+'<path d="'+p+'" fill="none" stroke="'+c+'" stroke-width="2.4" stroke-linejoin="round"/>'+dots}
    s+=path(m,'#2A7A8A',true)+path(k,'#0F2540',false);
    $('grafik').innerHTML=s;
    var tk=0,tm=0;for(var i=0;i<n;i++){tk+=k[i];tm+=m[i]}
    var dl=k[n-1]-k[n-2],dp=k[n-2]?dl/k[n-2]*100:0;
    $('tren-ket').textContent='Total '+fmt.format(tk)+' unit keluar dan '+fmt.format(tm)+' unit masuk dalam '+n+' minggu. Keluar minggu terakhir '+(dl>=0?'naik ':'turun ')+Math.abs(dp).toFixed(1).replace('.',',')+'% dari minggu sebelumnya.';
  }

  function batang(){
    var tot=[],mx=0;for(var c=0;c<JENIS.length;c++)tot.push(0);
    for(var i=0;i<DATA.length;i++){tot[DATA[i].kat]+=DATA[i].stok*DATA[i].harga}
    var ord=[];for(var c=0;c<JENIS.length;c++)ord.push(c);ord.sort(function(a,b){return tot[b]-tot[a]});mx=tot[ord[0]];
    var h='';for(var o=0;o<ord.length;o++){var c=ord[o];
      h+='<li><button type="button" class="'+(KAT===c?'aktif':'')+'" data-k="'+c+'" aria-pressed="'+(KAT===c)+'"><span class="b-nama">'+JENIS[c][1]+'</span><span class="b-rel"><i style="width:'+(tot[c]/mx*100).toFixed(1)+'%"></i></span><span class="b-nilai">'+rp(tot[c])+'</span></button></li>'}
    $('batang').innerHTML=h;
  }

  function daftar(){
    var L=pilih(),a=[],z=[],i;
    for(i=0;i<L.length;i++){var d=L[i];if(d.st==='bawah')a.push(d);if(d.diam>90)z.push(d)}
    a.sort(function(x,y){return x.stok/x.pakai-y.stok/y.pakai});
    z.sort(function(x,y){return y.stok*y.harga-x.stok*x.harga});
    var h='';for(i=0;i<Math.min(8,a.length);i++){var d=a[i];
      h+='<tr><td>'+d.nama+'<br><small>'+d.kode+'</small></td><td class="n">'+fmt.format(d.stok)+'</td><td class="n">'+fmt.format(d.stok/d.pakai)+' hari</td><td class="n">'+fmt.format(Math.max(0,d.buffer*2-d.stok))+'</td></tr>'}
    $('t-pesan').tBodies[0].innerHTML=h||'<tr><td colspan="4">Tidak ada barang di bawah buffer.</td></tr>';
    h='';for(i=0;i<Math.min(8,z.length);i++){var d=z[i];
      h+='<tr><td>'+d.nama+'<br><small>'+d.kode+'</small></td><td class="n">'+d.diam+' hari</td><td class="n">'+rp(d.stok*d.harga)+'</td></tr>'}
    $('t-diam').tBodies[0].innerHTML=h||'<tr><td colspan="3">Tidak ada barang diam.</td></tr>';
  }

  function opname(){
    var h='';for(var i=0;i<OPN.length;i++){var o=OPN[i],nv=o.sel*o.d.harga;
      h+='<tr><td>'+o.d.nama+'<br><small>'+o.d.kode+'</small></td><td class="n">'+fmt.format(o.sis)+'</td><td class="n">'+fmt.format(o.fis)+'</td><td class="n">'+(o.sel>0?'+':'−')+Math.abs(o.sel)+'</td><td class="n">'+(nv<0?'−':'+')+'Rp '+fmt.format(Math.abs(nv))+'</td></tr>'}
    $('t-opname').tBodies[0].innerHTML=h;
  }

  function segar(){
    $('f-info').textContent=KAT<0?'Menampilkan semua kategori.':'Menampilkan kategori '+JENIS[KAT][1]+'. Pilih "Semua kategori" untuk kembali.';
    kpi();grafik();batang();daftar();
  }
  (function(){var o='',sel=$('f-kat');for(var c=0;c<JENIS.length;c++)o+='<option value="'+c+'">'+JENIS[c][1]+'</option>';sel.insertAdjacentHTML('beforeend',o);
    sel.addEventListener('change',function(){KAT=this.value===''?-1:+this.value;segar();saring()});
    $('f-per').addEventListener('change',grafik);
    $('batang').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var c=+b.getAttribute('data-k');KAT=KAT===c?-1:c;sel.value=KAT<0?'':KAT;segar();saring()})})();

  /* Tabel dan pencarian */
  var UKURAN=12,hal=0,hasil=DATA;
  function saring(){
    var q=$('cari').value.trim().toLowerCase(),st=$('saring').value;
    var kata=q?q.split(/\s+/):[],t0=performance.now(),out=[];
    for(var i=0;i<DATA.length;i++){
      var d=DATA[i];if(KAT>=0&&d.kat!==KAT)continue;if(st&&d.st!==st)continue;
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

  segar();opname();saring();
})();
