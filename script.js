var DT=['Valid for 15 Days.','Payment Terms : 100% Payment in Advance.','Price : Ex-Works Delhi.','TRANSPORTATION CHARGES will be additional.','Machine Installation, Services and Spare Parts Chargeable.','We are not responsible for any loss or damaged incurred during transportation of the goods.','The goods will remain exclusive property of Avon Footwear Machines until full & final payment has been received.'];
var d=new Date(),M=['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
var S={f:{date:d.getDate()+' '+M[d.getMonth()]+' '+d.getFullYear(),ref:'AFM/'+d.getFullYear()+'-',co:'Target Shoe Company',rn:'Mr. Vishesh Singh',mob:'8879314461'},
 cat:[{id:1,name:'40 Feet Pasting Conveyor without heating chamber',price:180000,gst:18,img:''},{id:2,name:'40 Feet Pasting Conveyor with heating chamber size (6,6,8) feet with nir system',price:350000,gst:18,img:''}],
 lines:[{pid:1,qty:1},{pid:2,qty:1}],terms:null,nid:3};
try{var s=JSON.parse(localStorage.getItem('afm_q'));if(s&&s.cat)S=s}catch(e){}
function save(){S.terms=document.getElementById('terms').innerHTML;try{localStorage.setItem('afm_q',JSON.stringify(S))}catch(e){}}
var $=function(i){return document.getElementById(i)};
function fmt(n){return Number(n).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2})}
function P(id){return S.cat.filter(function(p){return p.id==id})[0]}
function esc(t){return String(t).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;')}
function renderLines(){
 var opts=function(sel){return '<option value="">— select product —</option>'+S.cat.map(function(p){return '<option value="'+p.id+'"'+(p.id==sel?' selected':'')+'>'+esc(p.name)+'</option>'}).join('')};
 $('tb').innerHTML=S.lines.length?S.lines.map(function(l,i){var p=P(l.pid);
  return '<tr><td>'+(i+1)+'.</td><td><select class="np" onchange="setP('+i+',this.value)">'+opts(l.pid)+'</select><div id="d'+i+'"></div>'+(p&&p.img?'<img src="'+p.img+'">':'')+'</td><td><input class="q" type="number" min="1" value="'+l.qty+'" oninput="setQ('+i+',this.value)"> set</td><td id="u'+i+'"></td><td id="g'+i+'"></td><td id="ga'+i+'"></td><td id="t'+i+'"></td><td class="np"><button onclick="del('+i+')" title="Remove">✕</button></td></tr>'}).join(''):'<tr><td colspan="7" class="empty">No products. Click “Add product”.</td></tr>';
 calc()}
function calc(){var g=0;S.lines.forEach(function(l,i){var p=P(l.pid);var q=+l.qty||0;
 if(!p){$('d'+i).textContent='';['u','g','ga','t'].forEach(function(k){$(k+i).textContent=''});return}
 var b=q*p.price,ga=b*p.gst/100;g+=b+ga;
 $('d'+i).textContent=p.name;$('u'+i).textContent=fmt(p.price);$('g'+i).textContent=p.gst+'%';$('ga'+i).textContent=fmt(ga);$('t'+i).textContent=fmt(b+ga)});
 $('gt').textContent=fmt(g)}
function setP(i,v){S.lines[i].pid=v;renderLines();save()}
function setQ(i,v){S.lines[i].qty=v;calc();save()}
function del(i){S.lines.splice(i,1);renderLines();save()}
function addLine(){S.lines.push({pid:'',qty:1});renderLines();save()}
function tgl(){var c=$('cat');c.style.display=c.style.display=='flex'?'none':'flex'}
function renderCat(){
 $('cat').onclick=function(e){if(e.target===this)tgl()};
 $('cat').innerHTML='<div class="mbox wide"><h3>Products &amp; fixed prices</h3><small>Prices set here are used automatically in the quotation; change a price once and every line updates. Price is excl. GST.</small>'+
 S.cat.map(function(p,i){return '<div class="cr"><input type="text" value="'+esc(p.name)+'" oninput="cu('+i+',\'name\',this.value)" onchange="renderLines()"><input type="number" value="'+p.price+'" oninput="cu('+i+',\'price\',+this.value)"><input type="number" value="'+p.gst+'" oninput="cu('+i+',\'gst\',+this.value)"><span><label style="cursor:pointer;font-size:12px">📷 Photo<input type="file" accept="image/*" hidden onchange="ph('+i+',this)"></label>'+(p.img?'<img src="'+p.img+'"> <a href="#" onclick="cu('+i+',\'img\',\'\');renderCat();renderLines();return false">remove</a>':'')+'</span><button onclick="dc('+i+')">✕</button></div>'}).join('')+
 '<button onclick="S.cat.push({id:S.nid++,name:\'New product\',price:0,gst:18,img:\'\'});renderCat();renderLines();save()">＋ New product</button> <small>Columns: description · unit price · GST % · photo</small><div class="mact"><button class="p" onclick="tgl()">Done</button></div></div>'}
function cu(i,k,v){S.cat[i][k]=v;calc();save()}
function dc(i){var id=S.cat[i].id;S.cat.splice(i,1);S.lines.forEach(function(l){if(l.pid==id)l.pid=''});renderCat();renderLines();save()}
function ph(i,inp){var f=inp.files[0];if(!f)return;var r=new FileReader();r.onload=function(){var im=new Image();im.onload=function(){var m=500,s=Math.min(1,m/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=im.width*s;c.height=im.height*s;c.getContext('2d').drawImage(im,0,0,c.width,c.height);S.cat[i].img=c.toDataURL('image/jpeg',.8);renderCat();renderLines();save()};im.src=r.result};r.readAsDataURL(f)}
var BK=['co','addr','gst','rn','mob'];
function openBuyer(){var t=Date.parse(S.f.date||''),x=isNaN(t)?new Date():new Date(t);$('m_date').value=x.getFullYear()+'-'+pad(x.getMonth()+1)+'-'+pad(x.getDate());$('m_ref').value=S.f.ref||'';BK.forEach(function(k){$('m_'+k).value=S.f[k]||''});$('modal').style.display='flex';$('m_co').focus()}
function closeBuyer(){$('modal').style.display='none'}
function saveBuyer(){var v=$('m_date').value;if(v){var p=v.split('-');S.f.date=(+p[2])+' '+M[+p[1]-1]+' '+p[0]}S.f.ref=$('m_ref').value;BK.forEach(function(k){S.f[k]=$('m_'+k).value});document.querySelectorAll('.f').forEach(function(e){e.value=S.f[e.dataset.k]||''});save();closeBuyer()}
document.addEventListener('keydown',function(e){if(e.key==='Escape'){closeBuyer();$('cat').style.display='none'}});
function pad(n){return (n<10?'0':'')+n}
function pr(){var t=document.title;document.title='Quotation '+(S.f.ref||'').replace(/[\/\\]/g,'-');window.print();document.title=t}
document.querySelectorAll('.f').forEach(function(e){e.value=S.f[e.dataset.k]||'';e.oninput=function(){S.f[e.dataset.k]=e.value;save()}});
$('terms').innerHTML=S.terms||DT.map(function(t){return '<li>'+t.replace(/&/g,'&amp;')+'</li>'}).join('');
$('terms').oninput=save;
renderCat();renderLines();
