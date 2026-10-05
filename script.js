var $=function(i){return document.getElementById(i)};
function ld(k,d){try{var v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}}
function sv(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){alert('Browser storage is full. Make a Backup, then delete old quotations.');return false}}
var M=['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
var DT=['Valid for 15 Days.','Payment Terms : 100% Payment in Advance.','Price : Ex-Works Delhi.','TRANSPORTATION CHARGES will be additional.','Machine Installation, Services and Spare Parts Chargeable.','We are not responsible for any loss or damaged incurred during transportation of the goods.','The goods will remain exclusive property of Avon Footwear Machines until full & final payment has been received.'];
var DE={name:'AVON FOOTWEAR MACHINES',addr:'Plot No. 112, KH No. 22/23\nMeera Enclave, Ranhola, New Delhi 110041',title:'QUOTATION',gstin:'GSTIN : 07FSAPR8346K1Z4\nEmail Id : afmindia98@gmail.com',toL:'TO',rnL:'RECIEVER NAME :',mobL:'MOBILE NO :',
 bank:'BANK DETAILS :\n\nBANK NAME : HDFC BANK\nA/C NO. : 50200070797181\nIFSC CODE : HDFC0000328\nBRANCH : C BLOCK VIKAS PURI, DELHI',note:'WE ARE PLEASED TO OFFER OUR BEST PRICE',
 h0:'S.No.',h1:'DESCRIPTION',h2:'QTY',h3:'UNIT PRICE',h4:'GST',h5:'GST AMOUNT',h6:'TOTAL AMOUNT',totL:'TOTAL AMOUNT',tH:'Terms & Conditions',sigco:'Avon Footwear Machines',sig:'Authorized Signature'};
var C=ld('afm_cat',null);
if(!C){var o=ld('afm_q',null);C=(o&&o.cat)?{cat:o.cat,nid:o.nid||50}:{cat:[{id:1,name:'40 Feet Pasting Conveyor without heating chamber',price:180000,gst:18,img:''},{id:2,name:'40 Feet Pasting Conveyor with heating chamber size (6,6,8) feet with nir system',price:350000,gst:18,img:''}],nid:3};sv('afm_cat',C)}
var IDX=ld('afm_idx',[]),Q=null;
function csave(){sv('afm_cat',C)}
function fmt(n){return Number(n).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2})}
function P(id){return C.cat.filter(function(p){return p.id==id})[0]}
function esc(t){return String(t).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;')}
function pad(n){return (n<10?'0':'')+n}
function rd(e){return e.innerText!==undefined?e.innerText:e.textContent}
function today(){var d=new Date();return d.getDate()+' '+M[d.getMonth()]+' '+d.getFullYear()}
function total(q){var g=0;q.lines.forEach(function(l){var p=P(l.pid);if(p){var b=(+l.qty||0)*p.price;g+=b+b*p.gst/100}});return g}
function idxPut(q){var x={id:q.id,co:q.f.co||'',ref:q.f.ref||'',date:q.f.date||'',tot:total(q),ts:Date.now()},i=-1;IDX.forEach(function(r,k){if(r.id==q.id)i=k});if(i<0)IDX.push(x);else IDX[i]=x}
function save(){if(!Q)return;if(!Q.f.co&&!Q.lines.some(function(l){return l.pid})&&!IDX.some(function(x){return x.id==Q.id}))return;Q.terms=$('terms').innerHTML;if(!sv('afm_q_'+Q.id,Q))return;idxPut(Q);sv('afm_idx',IDX);sv('afm_prof',{e:Q.e,tpl:Q.tpl,ac:Q.ac,terms:Q.terms})}
/* ---------- home ---------- */
function home(){Q=null;$('ed').style.display='none';$('home').style.display='block';var s=$('q').value.toLowerCase();
 var r=IDX.filter(function(x){return (x.co+' '+x.ref+' '+x.date).toLowerCase().indexOf(s)>-1}).sort(function(a,b){return b.ts-a.ts});
 $('cnt').textContent=r.length+' of '+IDX.length+' quotations'+(r.length>200?' (showing newest 200 — use search)':'');
 $('list').innerHTML=r.slice(0,200).map(function(x){return '<tr><td>'+esc(x.ref)+'</td><td>'+esc(x.co||'—')+'</td><td>'+esc(x.date)+'</td><td class="r">'+fmt(x.tot)+'</td><td class="r" style="white-space:nowrap"><button onclick="openQ(\''+x.id+'\')">Open</button> <button onclick="dup(\''+x.id+'\')">Copy</button> <button onclick="del(\''+x.id+'\')">✕</button></td></tr>'}).join('')||'<tr><td colspan="5" class="empty">No quotations yet. Click “New quotation”.</td></tr>'}
function back(){save();home()}
function blank(){var n=ld('afm_n',0)+1;sv('afm_n',n);var p=ld('afm_prof',{}),y=new Date().getFullYear();
 return {id:'q'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),f:{date:today(),ref:'AFM/'+y+'-'+('000'+n).slice(-4)},lines:[{pid:'',qty:1}],terms:p.terms||null,e:p.e||{},tpl:p.tpl||'classic',ac:p.ac||'#d71920'}}
function newQ(){Q=blank();show()}
function openQ(id){var q=ld('afm_q_'+id,null);if(!q){alert('Quotation data not found.');return}Q=q;show()}
function dup(id){var q=ld('afm_q_'+id,null);if(!q)return;var b=blank();q.id=b.id;q.f.ref=b.f.ref;q.f.date=today();sv('afm_q_'+q.id,q);idxPut(q);sv('afm_idx',IDX);home()}
function del(id){if(!confirm('Delete this quotation permanently?'))return;try{localStorage.removeItem('afm_q_'+id)}catch(e){}IDX=IDX.filter(function(x){return x.id!=id});sv('afm_idx',IDX);home()}
/* ---------- editor ---------- */
function show(){$('home').style.display='none';$('ed').style.display='block';
 document.querySelectorAll('.f').forEach(function(e){e.value=Q.f[e.dataset.k]||''});
 document.querySelectorAll('[data-e]').forEach(function(e){var k=e.dataset.e;e.textContent=Q.e[k]!=null?Q.e[k]:DE[k]});
 $('terms').innerHTML=Q.terms||DT.map(function(t){return '<li>'+t.replace(/&/g,'&amp;')+'</li>'}).join('');
 applyTpl();renderLines();window.scrollTo(0,0)}
function applyTpl(){var s=$('sheet');s.className='sheet t-'+Q.tpl;s.style.setProperty('--ac',Q.ac);
 document.querySelectorAll('.tc').forEach(function(b){b.classList.toggle('on',b.dataset.t==Q.tpl)});$('m_ac').value=Q.ac}
function setT(t){Q.tpl=t;applyTpl();save()}
function setAc(v){Q.ac=v;applyTpl();save()}
function renderLines(){if(!Q)return;
 var opts=function(sel){return '<option value="">— select product —</option>'+C.cat.map(function(p){return '<option value="'+p.id+'"'+(p.id==sel?' selected':'')+'>'+esc(p.name)+'</option>'}).join('')};
 $('tb').innerHTML=Q.lines.length?Q.lines.map(function(l,i){var p=P(l.pid);
  return '<tr><td>'+(i+1)+'.</td><td><select class="np" onchange="setP('+i+',this.value)">'+opts(l.pid)+'</select><div class="dd" id="d'+i+'" contenteditable="true" oninput="setD('+i+',this)"></div>'+(p&&p.img?'<img src="'+p.img+'">':'')+'</td><td><input class="q" type="number" min="1" value="'+l.qty+'" oninput="setQ('+i+',this.value)"> set</td><td id="u'+i+'"></td><td id="g'+i+'"></td><td id="ga'+i+'"></td><td id="t'+i+'"></td><td class="np"><button onclick="del2('+i+')" title="Remove">✕</button></td></tr>'}).join(''):'<tr><td colspan="7" class="empty">No products. Click “Add product”.</td></tr>';
 Q.lines.forEach(function(l,i){var p=P(l.pid);$('d'+i).textContent=l.d!=null?l.d:(p?p.name:'')});calc()}
function calc(){if(!Q)return;var g=0;Q.lines.forEach(function(l,i){var p=P(l.pid),q=+l.qty||0;
 if(!p){['u','g','ga','t'].forEach(function(k){$(k+i).textContent=''});return}
 var b=q*p.price,ga=b*p.gst/100;g+=b+ga;
 $('u'+i).textContent=fmt(p.price);$('g'+i).textContent=p.gst+'%';$('ga'+i).textContent=fmt(ga);$('t'+i).textContent=fmt(b+ga)});
 $('gt').textContent=fmt(g)}
function setP(i,v){Q.lines[i].pid=v;delete Q.lines[i].d;renderLines();save()}
function setD(i,el){Q.lines[i].d=rd(el);save()}
function setQ(i,v){Q.lines[i].qty=v;calc();save()}
function del2(i){Q.lines.splice(i,1);renderLines();save()}
function addLine(){Q.lines.push({pid:'',qty:1});renderLines();save()}
/* ---------- buyer popup ---------- */
var BK=['co','addr','gst','rn','mob'];
function openBuyer(){var t=Date.parse(Q.f.date||''),x=isNaN(t)?new Date():new Date(t);$('m_date').value=x.getFullYear()+'-'+pad(x.getMonth()+1)+'-'+pad(x.getDate());$('m_ref').value=Q.f.ref||'';BK.forEach(function(k){$('m_'+k).value=Q.f[k]||''});$('modal').style.display='flex';$('m_co').focus()}
function closeBuyer(){$('modal').style.display='none'}
function saveBuyer(){var v=$('m_date').value;if(v){var p=v.split('-');Q.f.date=(+p[2])+' '+M[+p[1]-1]+' '+p[0]}Q.f.ref=$('m_ref').value;BK.forEach(function(k){Q.f[k]=$('m_'+k).value});document.querySelectorAll('.f').forEach(function(e){e.value=Q.f[e.dataset.k]||''});save();closeBuyer()}
/* ---------- products & prices popup ---------- */
function tgl(){var c=$('cat');if(c.style.display=='flex'){c.style.display='none';return}renderCat();c.style.display='flex'}
function renderCat(){
 $('cat').onclick=function(e){if(e.target===this)tgl()};
 $('cat').innerHTML='<div class="mbox wide"><h3>Products &amp; fixed prices</h3><small>Used by every quotation. Change a price once and quotations you open later use it (price excl. GST).</small>'+
 C.cat.map(function(p,i){return '<div class="cr"><input type="text" value="'+esc(p.name)+'" oninput="cu('+i+',\'name\',this.value)" onchange="renderLines()"><input type="number" value="'+p.price+'" oninput="cu('+i+',\'price\',+this.value)"><input type="number" value="'+p.gst+'" oninput="cu('+i+',\'gst\',+this.value)"><span><label style="cursor:pointer;font-size:12px">📷 Photo<input type="file" accept="image/*" hidden onchange="ph('+i+',this)"></label>'+(p.img?'<img src="'+p.img+'"> <a href="#" onclick="cu('+i+',\'img\',\'\');renderCat();renderLines();return false">remove</a>':'')+'</span><button onclick="dc('+i+')">✕</button></div>'}).join('')+
 '<button onclick="C.cat.push({id:C.nid++,name:\'New product\',price:0,gst:18,img:\'\'});renderCat();renderLines();csave()">＋ New product</button> <small>Columns: description · unit price · GST % · photo</small><div class="mact"><button class="p" onclick="tgl()">Done</button></div></div>'}
function cu(i,k,v){C.cat[i][k]=v;calc();csave();if(Q)save()}
function dc(i){var id=C.cat[i].id;C.cat.splice(i,1);if(Q)Q.lines.forEach(function(l){if(l.pid==id)l.pid=''});renderCat();renderLines();csave()}
function ph(i,inp){var f=inp.files[0];if(!f)return;var r=new FileReader();r.onload=function(){var im=new Image();im.onload=function(){var m=500,s=Math.min(1,m/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=im.width*s;c.height=im.height*s;c.getContext('2d').drawImage(im,0,0,c.width,c.height);C.cat[i].img=c.toDataURL('image/jpeg',.8);renderCat();renderLines();csave()};im.src=r.result};r.readAsDataURL(f)}
/* ---------- backup / restore ---------- */
function backup(){var all={cat:C,n:ld('afm_n',0),prof:ld('afm_prof',{}),quotes:IDX.map(function(x){return ld('afm_q_'+x.id,null)}).filter(Boolean)};
 var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(all)],{type:'application/json'}));a.download='afm_backup_'+new Date().toISOString().slice(0,10)+'.json';a.click()}
function restore(inp){var f=inp.files[0];if(!f)return;var r=new FileReader();r.onload=function(){try{var o=JSON.parse(r.result);if(o.cat){C=o.cat;csave()}if(o.prof)sv('afm_prof',o.prof);if(o.n>ld('afm_n',0))sv('afm_n',o.n);
 (o.quotes||[]).forEach(function(q){if(q&&q.id){sv('afm_q_'+q.id,q);idxPut(q)}});sv('afm_idx',IDX);home();alert('Restored '+(o.quotes||[]).length+' quotations.')}catch(e){alert('Not a valid backup file.')}inp.value=''};r.readAsText(f)}
function pr(){save();var t=document.title;document.title='Quotation '+((Q.f.ref||'')+' '+(Q.f.co||'')).replace(/[\/\\]/g,'-');window.print();document.title=t}
/* ---------- wiring ---------- */
document.querySelectorAll('.f').forEach(function(e){e.oninput=function(){if(Q){Q.f[e.dataset.k]=e.value;save()}}});
document.querySelectorAll('[data-e]').forEach(function(e){e.contentEditable='true';e.oninput=function(){if(Q){Q.e[e.dataset.e]=rd(e);save()}}});
$('terms').oninput=function(){save()};
document.addEventListener('keydown',function(e){if(e.key==='Escape'){closeBuyer();$('tplm').style.display='none';$('cat').style.display='none'}});
home();
