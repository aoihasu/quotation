var $=function(i){return document.getElementById(i)};
function ld(k,d){try{var v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}}
function sv(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){alert('Browser storage is full. Make a Backup, then delete old quotations.');return false}}
var M=['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
var DT=['Valid for 15 Days.','Payment Terms : 100% Payment in Advance.','Price : Ex-Works Delhi.','TRANSPORTATION CHARGES will be additional.','Machine Installation, Services and Spare Parts Chargeable.','We are not responsible for any loss or damaged incurred during transportation of the goods.','The goods will remain exclusive property of Avon Footwear Machines until full & final payment has been received.'];
var DE={name:'AVON FOOTWEAR MACHINES',addr:'Plot No. 112, KH No. 22/23\nMeera Enclave, Ranhola, New Delhi 110041',title:'QUOTATION',gstin:'GSTIN : 07FSAPR8346K1Z4\nEmail Id : afmindia98@gmail.com',toL:'TO',rnL:'RECIEVER NAME :',mobL:'MOBILE NO :',
 bank:'BANK DETAILS :\n\nBANK NAME : HDFC BANK\nA/C NO. : 50200070797181\nIFSC CODE : HDFC0000328\nBRANCH : C BLOCK VIKAS PURI, DELHI',note:'WE ARE PLEASED TO OFFER OUR BEST PRICE',
 h0:'S.No.',h1:'DESCRIPTION',h2:'QTY',h3:'UNIT PRICE',h4:'GST',h5:'GST AMOUNT',h6:'TOTAL AMOUNT',totL:'TOTAL AMOUNT',tH:'Terms & Conditions',sigco:'Avon Footwear Machines',sig:'Authorized Signature'};
var DC=[{id:1,name:'40 Feet Pasting Conveyor without heating chamber',price:180000,gst:18,img:''},{id:2,name:'40 Feet Pasting Conveyor with heating chamber size (6,6,8) feet with nir system',price:350000,gst:18,img:''}];
var C={cat:DC,nid:3},IDX=[],Q=null,PROF={},API=false,tm=null;
function api(m,u,b){return fetch(u,{method:m,headers:{'Content-Type':'application/json'},body:b===undefined?undefined:JSON.stringify(b)}).then(function(r){if(!r.ok)throw new Error(r.status);return r.json()})}
var ME=null;
function down(e){if(e&&e.message==='401'){showLogin(false)}else{$('st').textContent='🔴 Cannot reach the server. Check your internet and refresh.';$('st').style.color='#c62828'}}
function status(){$('st').textContent='🟢 Connected to the database — all changes are saved automatically.';$('st').style.color='#2e7d32';
 $('who').innerHTML='👤 <b>'+esc(ME.username)+'</b> ('+ME.role+') <button onclick="logout()">Log out</button>';
 ['bU','bB','bE','xf'].forEach(function(i){$(i).style.display=ME.role==='admin'?'':'none'});$('bR').style.display=ME.role==='admin'?'':'none'}
function csave(){if(API)api('PUT','/api/cat',C).catch(down);else sv('afm_cat',C)}
function psave(){var p={e:Q.e,tpl:Q.tpl,ac:Q.ac,terms:Q.terms};PROF=p;if(API)api('PUT','/api/prof',p).catch(down);else sv('afm_prof',p)}
function nextN(cb){if(API)api('POST','/api/next').then(function(r){cb(r.n)}).catch(down);else{var n=ld('afm_n',0)+1;sv('afm_n',n);cb(n)}}
function getQ(id,cb){if(API)api('GET','/api/quote/'+id).then(cb).catch(function(){cb(null)});else cb(ld('afm_q_'+id,null))}
function putQ(q){if(API)api('PUT','/api/quote/'+q.id,{q:q,tot:total(q)}).catch(down);else{sv('afm_q_'+q.id,q);sv('afm_idx',IDX)}}
function fmt(n){return Number(n).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2})}
function LP(l){if(l.fz)return{name:l.fz.name,price:l.fz.price,gst:l.fz.gst,img:(P(l.pid)||{}).img};return P(l.pid)}
function P(id){return C.cat.filter(function(p){return p.id==id})[0]}
function esc(t){return String(t).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;')}
function pad(n){return (n<10?'0':'')+n}
function rd(e){return e.innerText!==undefined?e.innerText:e.textContent}
function today(){var d=new Date();return d.getDate()+' '+M[d.getMonth()]+' '+d.getFullYear()}
function total(q){var g=0;q.lines.forEach(function(l){var p=LP(l);if(p){var b=(+l.qty||0)*p.price;g+=b+b*p.gst/100}});return g}
function idxPut(q){var x={id:q.id,co:q.f.co||'',ref:q.f.ref||'',date:q.f.date||'',tot:total(q),ts:Date.now(),sent:q.sent||0},i=-1;IDX.forEach(function(r,k){if(r.id==q.id)i=k});if(i<0)IDX.push(x);else IDX[i]=x}
function save(){if(!Q)return;if(!Q.f.co&&!Q.lines.some(function(l){return l.pid})&&!IDX.some(function(x){return x.id==Q.id}))return;Q.terms=$('terms').innerHTML;idxPut(Q);clearTimeout(tm);tm=setTimeout(flush,350)}
function flush(){clearTimeout(tm);tm=null;if(!Q||!IDX.some(function(x){return x.id==Q.id}))return;Q.terms=$('terms').innerHTML;putQ(Q);psave()}
/* ---------- sent tracking ---------- */
function freeze(){Q.lines.forEach(function(l){if(!l.fz){var p=P(l.pid);if(p)l.fz={name:p.name,price:p.price,gst:p.gst}}})}
function sentUI(){var b=$('bS');if(!b||!Q)return;b.textContent=Q.sent?'\u2714 Sent '+dts(Q.sent).slice(0,10)+' (undo)':'\uD83D\uDCE4 Mark as sent';b.classList.toggle('on',!!Q.sent)}
function markSent(on){if(on){freeze();if(!Q.sent)Q.sent=Date.now()}else{delete Q.sent;Q.lines.forEach(function(l){delete l.fz})}sentUI();renderLines();save()}
function toggleSent(){markSent(!Q.sent)}
function dts(t){if(!t)return'';var d=new Date(t);return pad(d.getDate())+'-'+pad(d.getMonth()+1)+'-'+d.getFullYear()+' '+pad(d.getHours())+':'+pad(d.getMinutes())}
/* ---------- home ---------- */
function home(){Q=null;$('ed').style.display='none';$('home').style.display='block';var s=$('q').value.toLowerCase();
 var r=IDX.filter(function(x){return (x.co+' '+x.ref+' '+x.date).toLowerCase().indexOf(s)>-1}).sort(function(a,b){return b.ts-a.ts});
 $('cnt').textContent=r.length+' of '+IDX.length+' quotations'+(r.length>200?' (showing newest 200 — use search)':'');
 $('list').innerHTML=r.slice(0,200).map(function(x){return '<tr><td>'+esc(x.ref)+'</td><td>'+esc(x.co||'—')+'</td><td>'+esc(x.date)+'</td><td>'+(x.sent?'<span class="bd ok">✔ Sent</span>':'<span class="bd">Draft</span>')+'</td><td class="r">'+fmt(x.tot)+'</td><td class="r" style="white-space:nowrap"><button onclick="openQ(\''+x.id+'\')">Open</button> <button onclick="dup(\''+x.id+'\')">Copy</button> <button onclick="del(\''+x.id+'\')">✕</button></td></tr>'}).join('')||'<tr><td colspan="6" class="empty">No quotations yet. Click “New quotation”.</td></tr>'}
function back(){flush();home()}
function blank(n){var p=PROF||{},y=new Date().getFullYear();
 return {id:'q'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),f:{date:today(),ref:'AFM/'+y+'-'+('000'+n).slice(-4)},lines:[{pid:'',qty:1}],terms:p.terms||null,e:JSON.parse(JSON.stringify(p.e||{})),tpl:p.tpl||'classic',ac:p.ac||'#d71920'}}
function newQ(){nextN(function(n){Q=blank(n);show()})}
function openQ(id){getQ(id,function(q){if(!q){alert('Quotation data not found.');return}Q=q;show()})}
function dup(id){getQ(id,function(q){if(!q)return;nextN(function(n){var b=blank(n);q.id=b.id;q.f.ref=b.f.ref;q.f.date=today();delete q.sent;q.lines.forEach(function(l){delete l.fz});idxPut(q);putQ(q);home()})})}
function del(id){if(!confirm('Delete this quotation permanently?'))return;IDX=IDX.filter(function(x){return x.id!=id});if(API)api('DELETE','/api/quote/'+id).catch(down);else{try{localStorage.removeItem('afm_q_'+id)}catch(e){}sv('afm_idx',IDX)}home()}
/* ---------- editor ---------- */
function show(){$('home').style.display='none';$('ed').style.display='block';
 document.querySelectorAll('.f').forEach(function(e){e.value=Q.f[e.dataset.k]||''});
 document.querySelectorAll('[data-e]').forEach(function(e){var k=e.dataset.e;e.textContent=Q.e[k]!=null?Q.e[k]:DE[k]});
 $('terms').innerHTML=Q.terms||DT.map(function(t){return '<li>'+t.replace(/&/g,'&amp;')+'</li>'}).join('');
 applyTpl();sentUI();renderLines();window.scrollTo(0,0)}
function applyTpl(){var s=$('sheet');s.className='sheet t-'+Q.tpl;s.style.setProperty('--ac',Q.ac);
 document.querySelectorAll('.tc').forEach(function(b){b.classList.toggle('on',b.dataset.t==Q.tpl)});$('m_ac').value=Q.ac}
function setT(t){Q.tpl=t;applyTpl();save()}
function setAc(v){Q.ac=v;applyTpl();save()}
function renderLines(){if(!Q)return;
 var opts=function(sel){return '<option value="">— select product —</option>'+C.cat.map(function(p){return '<option value="'+p.id+'"'+(p.id==sel?' selected':'')+'>'+esc(p.name)+'</option>'}).join('')};
 $('tb').innerHTML=Q.lines.length?Q.lines.map(function(l,i){var p=LP(l);
  return '<tr><td>'+(i+1)+'.</td><td><select class="np" onchange="setP('+i+',this.value)">'+opts(l.pid)+'</select><div class="dd" id="d'+i+'" contenteditable="true" oninput="setD('+i+',this)"></div>'+(p&&p.img?'<img src="'+p.img+'">':'')+'</td><td><input class="q" type="number" min="1" value="'+l.qty+'" oninput="setQ('+i+',this.value)"> set</td><td id="u'+i+'"></td><td id="g'+i+'"></td><td id="ga'+i+'"></td><td id="t'+i+'"></td><td class="np"><button onclick="del2('+i+')" title="Remove">✕</button></td></tr>'}).join(''):'<tr><td colspan="7" class="empty">No products. Click “Add product”.</td></tr>';
 Q.lines.forEach(function(l,i){var p=LP(l);$('d'+i).textContent=l.d!=null?l.d:(p?p.name:'')});calc()}
function calc(){if(!Q)return;var g=0;Q.lines.forEach(function(l,i){var p=LP(l),q=+l.qty||0;
 if(!p){['u','g','ga','t'].forEach(function(k){$(k+i).textContent=''});return}
 var b=q*p.price,ga=b*p.gst/100;g+=b+ga;
 $('u'+i).textContent=fmt(p.price);$('g'+i).textContent=p.gst+'%';$('ga'+i).textContent=fmt(ga);$('t'+i).textContent=fmt(b+ga)});
 $('gt').textContent=fmt(g)}
function setP(i,v){Q.lines[i].pid=v;delete Q.lines[i].d;delete Q.lines[i].fz;renderLines();save()}
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
function dc(i){var id=C.cat[i].id;C.cat.splice(i,1);if(Q)Q.lines.forEach(function(l){if(l.pid==id&&!l.fz)l.pid=''});renderCat();renderLines();csave()}
function ph(i,inp){var f=inp.files[0];if(!f)return;var r=new FileReader();r.onload=function(){var im=new Image();im.onload=function(){var m=500,s=Math.min(1,m/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=im.width*s;c.height=im.height*s;c.getContext('2d').drawImage(im,0,0,c.width,c.height);C.cat[i].img=c.toDataURL('image/jpeg',.8);renderCat();renderLines();csave()};im.src=r.result};r.readAsDataURL(f)}
/* ---------- backup / restore ---------- */
function dl(all){var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(all)],{type:'application/json'}));a.download='afm_backup_'+new Date().toISOString().slice(0,10)+'.json';a.click()}
function backup(){if(API)api('GET','/api/export').then(dl);else dl({cat:C,n:ld('afm_n',0),prof:PROF,quotes:IDX.map(function(x){return ld('afm_q_'+x.id,null)}).filter(Boolean)})}
function importAll(o,done){var qs=(o.quotes||[]).filter(function(q){return q&&q.id&&q.f});
 if(API)api('POST','/api/import',{cat:o.cat,prof:o.prof,n:o.n,quotes:qs.map(function(q){return {q:q,tot:total(q),id:q.id,f:q.f}})}).then(function(r){IDX=r.idx;if(o.cat)C=o.cat;done(qs.length)}).catch(down);
 else{if(o.cat){C=o.cat;csave()}if(o.prof)sv('afm_prof',o.prof);qs.forEach(function(q){sv('afm_q_'+q.id,q);idxPut(q)});sv('afm_idx',IDX);done(qs.length)}}
function restore(inp){var f=inp.files[0];if(!f)return;var r=new FileReader();r.onload=function(){try{importAll(JSON.parse(r.result),function(n){home();alert('Restored '+n+' quotations.')})}catch(e){alert('Not a valid backup file.')}inp.value=''};r.readAsText(f)}
function csvCell(v){v=String(v==null?'':v);return /[",\n\r]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v}
function flat(o,only){var cat={};((o.cat&&o.cat.cat)||[]).forEach(function(p){cat[p.id]=p});
 return(o.quotes||[]).filter(function(q){return q&&q.f&&(!only||q.sent)}).sort(function(a,b){return String(a.f.ref).localeCompare(String(b.f.ref))}).map(function(q){
  var sub=0,gt=0,ls=[];(q.lines||[]).forEach(function(l){var p=l.fz||cat[l.pid];if(!p)return;var b=(+l.qty||0)*p.price,g=b*p.gst/100;sub+=b;gt+=g;ls.push({no:ls.length+1,name:l.d!=null?l.d:p.name,qty:+l.qty||0,price:p.price,gst:p.gst,ga:g,tot:b+g})});
  return{q:q,ls:ls,sub:sub,gt:gt,tot:sub+gt}})}
var H1=['Ref','Date','Status','Sent on','Company','Company address','GSTIN','Receiver name','Mobile','Products','Subtotal (excl. GST)','GST amount','Total (incl. GST)'];
var H2=['Ref','Date','Company','S.No','Product','Qty','Unit price','GST %','GST amount','Line total'];
function sheets(F){var a1=[H1],a2=[H2];F.forEach(function(x){var f=x.q.f;
  a1.push([f.ref||'',f.date||'',x.q.sent?'Sent':'Draft',dts(x.q.sent),f.co||'',f.addr||'',f.gst||'',f.rn||'',f.mob||'',x.ls.map(function(l){return l.qty+' x '+l.name}).join('; '),x.sub,x.gt,x.tot]);
  x.ls.forEach(function(l){a2.push([f.ref||'',f.date||'',f.co||'',l.no,l.name,l.qty,l.price,l.gst,l.ga,l.tot])})});return[a1,a2]}
function numFmt(ws,cols){var r=XLSX.utils.decode_range(ws['!ref']);for(var R=1;R<=r.e.r;R++)cols.forEach(function(C){var c=ws[XLSX.utils.encode_cell({r:R,c:C})];if(c&&typeof c.v==='number')c.z='#,##0.00'})}
function xlsxAll(F,name){var d=sheets(F),wb=XLSX.utils.book_new(),s1=XLSX.utils.aoa_to_sheet(d[0]),s2=XLSX.utils.aoa_to_sheet(d[1]);
 var cw=function(a){return a.map(function(w){return{wch:w}})};
 s1['!cols']=cw([16,14,8,17,28,36,18,20,14,55,18,14,18]);s2['!cols']=cw([16,14,28,6,55,6,14,8,14,14]);
 s1['!freeze']=s2['!freeze']={xSplit:0,ySplit:1};
 numFmt(s1,[10,11,12]);numFmt(s2,[6,8,9]);
 XLSX.utils.book_append_sheet(wb,s1,'Quotations');XLSX.utils.book_append_sheet(wb,s2,'Line items');XLSX.writeFile(wb,name+'.xlsx')}
function csvAll(F,name){var d=sheets(F),rows=[H1.concat(['S.No','Product','Qty','Unit price','GST %','GST amount','Line total'])];
 F.forEach(function(x,i){var h=d[0][i+1].slice(0,10).concat([d[0][i+1][12]]);(x.ls.length?x.ls:[{no:'',name:'',qty:'',price:'',gst:'',ga:'',tot:''}]).forEach(function(l){rows.push(d[0][i+1].concat([l.no,l.name,l.qty,l.price,l.gst,l.ga,l.tot]))})});
 var a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+rows.map(function(r){return r.map(csvCell).join(',')}).join('\r\n')],{type:'text/csv;charset=utf-8'}));a.download=name+'.csv';a.click()}
function exportExcel(){var only=$('xf').value==='sent';var go=function(o){var F=flat(o,only);
  if(!F.length){alert(only?'No quotations have been marked as sent yet.':'No quotations to export.');return}
  var nm='afm_quotations_'+(only?'sent_':'')+new Date().toISOString().slice(0,10);
  if(window.XLSX)xlsxAll(F,nm);else{alert('Excel library could not load (no internet?). Saving as CSV instead.');csvAll(F,nm)}};
 if(API)api('GET','/api/export').then(go).catch(down);else go({cat:C,quotes:IDX.map(function(x){return ld('afm_q_'+x.id,null)}).filter(Boolean)})}
function pr(){if(!Q.sent&&(Q.f.co||Q.lines.some(function(l){return l.pid})))markSent(true);save();flush();var t=document.title;document.title='Quotation '+((Q.f.ref||'')+' '+(Q.f.co||'')).replace(/[\/\\]/g,'-');window.print();document.title=t}
/* ---------- wiring ---------- */
document.querySelectorAll('.f').forEach(function(e){e.oninput=function(){if(Q){Q.f[e.dataset.k]=e.value;save()}}});
document.querySelectorAll('[data-e]').forEach(function(e){e.contentEditable='true';e.oninput=function(){if(Q){Q.e[e.dataset.e]=rd(e);save()}}});
$('terms').oninput=function(){save()};
document.addEventListener('keydown',function(e){if(e.key==='Escape'){closeBuyer();$('tplm').style.display='none';$('cat').style.display='none'}});
function showLogin(setup){Q=null;API=false;$('home').style.display='none';$('ed').style.display='none';$('login').style.display='flex';
 $('lt').textContent=setup?'Create admin account':'Log in';$('ls').style.display=setup?'block':'none';$('lb').textContent=setup?'Create & log in':'Log in';$('lb').dataset.setup=setup?'1':'';$('lp').value='';$('le').textContent='';$('lu').focus()}
function doLogin(){var s=$('lb').dataset.setup==='1';
 fetch(s?'/api/setup':'/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({u:$('lu').value.trim(),p:$('lp').value})}).then(function(r){return r.json().then(function(d){if(!r.ok)throw new Error(d.error||'Failed');return d})})
 .then(function(d){ME=d.user;$('login').style.display='none';start()}).catch(function(e){$('le').textContent=e.message})}
function logout(){flush();fetch('/api/logout',{method:'POST'}).then(function(){ME=null;showLogin(false)})}
function start(){
 api('GET','/api/state').then(function(s){API=true;C=s.cat;PROF=s.prof||{};IDX=s.idx||[];
  if(!C||!C.cat){C={cat:DC,nid:3};csave()}
  var lx=ld('afm_idx',[]);
  if(ME.role==='admin'&&!IDX.length&&lx.length&&confirm('Found '+lx.length+' quotations saved in this browser. Copy them into the database now?')){
   var cat=ld('afm_cat',null);importAll({cat:cat||C,prof:ld('afm_prof',{}),n:ld('afm_n',0),quotes:lx.map(function(x){return ld('afm_q_'+x.id,null)})},function(){status();home()})}
  else{status();home()}
 }).catch(down)}
function init(){api('GET','/api/session').then(function(s){if(s.user){ME=s.user;start()}else showLogin(s.setup)}).catch(function(){$('login').style.display='flex';$('le').textContent='Cannot reach the server.'})}
/* ---------- users (admin) ---------- */
function openUsers(){api('GET','/api/users').then(function(us){
 $('ul').innerHTML=us.map(function(u){var n=esc(u.username);return '<div class="ur"><b>'+n+'</b><span>'+u.role+(u.active?'':' · <i>locked</i>')+'</span><button onclick="uPw(\''+n+'\')">Reset password</button><button onclick="uAct(\''+n+'\','+(u.active?0:1)+')">'+(u.active?'Lock':'Unlock')+'</button><button onclick="uDel(\''+n+'\')">✕</button></div>'}).join('');$('usrm').style.display='flex'}).catch(down)}
function uCall(m,u,b){api(m,'/api/users'+(u?'/'+u:''),b).then(openUsers).catch(function(e){alert(e.message==='400'||e.message==='403'?'Not allowed (check ID/password rules).':e.message);down(e)})}
function addUser(){uCall('POST','',{u:$('nu').value.trim(),p:$('np').value,role:$('nr').value});$('nu').value='';$('np').value=''}
function uPw(u){var p=prompt('New password for '+u+' (8+ characters):');if(p)uCall('PUT',u,{p:p})}
function uAct(u,a){uCall('PUT',u,{active:a})}
function uDel(u){if(confirm('Delete login ID '+u+'? Their quotations stay.'))uCall('DELETE',u)}
init();
