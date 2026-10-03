function money(n){return Number(n||0).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2}).replace(/,/g,'');}
function parseNum(v){return parseFloat(String(v).replace(/,/g,'').replace(/[^\d.-]/g,''))||0}
function parseGst(v){return parseNum(v)}

function esc(v){return String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function openForm(){
  document.getElementById('f-company-name').value=document.getElementById('company-name').value;
  document.getElementById('f-company-address').value=document.getElementById('company-address').value;
  document.getElementById('f-company-gstin').value=document.getElementById('company-gstin').value;
  document.getElementById('f-receiver').value=document.getElementById('receiver-name').value;
  document.getElementById('f-mobile').value=document.getElementById('mobile').value;
  const d=document.getElementById('date').value;
  const parsed=new Date(d);
  document.getElementById('f-date').value=!isNaN(parsed)?parsed.toISOString().slice(0,10):'';
  document.getElementById('f-ref').value=document.getElementById('ref').value;
  const existing=[...document.querySelectorAll('.item-row')].map(r=>({desc:r.querySelector('.desc').value,qty:r.querySelector('.qty-input').value,price:r.querySelector('.price').value,gst:r.querySelector('.gst').value}));
  document.getElementById('popupItems').innerHTML='';
  existing.forEach(x=>addPopupItem(x));
  document.getElementById('formModal').classList.add('open');
}
function closeForm(){document.getElementById('formModal').classList.remove('open')}
function backdropClose(e){if(e.target.id==='formModal')closeForm()}
function addPopupItem(data={desc:'',qty:'1 set',price:'0.00',gst:'18%'}){
  const wrap=document.createElement('div'); wrap.className='popup-item';
  wrap.innerHTML=`<div class="item-form">
    <div><label>Product description</label><input class="p-desc" value="${esc(data.desc)}" placeholder="Product description"></div>
    <div><label>Quantity</label><input class="p-qty" value="${esc(data.qty)}" placeholder="1 set"></div>
    <div><label>Unit price</label><input class="p-price" value="${esc(data.price)}" inputmode="decimal" placeholder="0.00"></div>
    <button class="remove-item" type="button" onclick="this.closest('.popup-item').remove()">×</button>
  </div>`;
  document.getElementById('popupItems').appendChild(wrap);
}
function formatDateForQuotation(v){
  if(!v)return '';
  const [y,m,d]=v.split('-');
  const dt=new Date(Number(y),Number(m)-1,Number(d));
  return dt.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}).toUpperCase();
}
function applyForm(){
  const fields={
    'company-name':document.getElementById('f-company-name').value.trim(),
    'company-address':document.getElementById('f-company-address').value.trim(),
    'company-gstin':document.getElementById('f-company-gstin').value.trim(),
    'receiver-name':document.getElementById('f-receiver').value.trim(),
    'mobile':document.getElementById('f-mobile').value.trim(),
    'date':formatDateForQuotation(document.getElementById('f-date').value),
    'ref':document.getElementById('f-ref').value.trim()
  };
  Object.entries(fields).forEach(([id,v])=>document.getElementById(id).value=v);
  const items=[...document.querySelectorAll('#popupItems .popup-item')].map(x=>({desc:x.querySelector('.p-desc').value.trim(),qty:x.querySelector('.p-qty').value.trim(),price:x.querySelector('.p-price').value.trim(),gst:'18%'}));
  const tbody=document.querySelector('#items tbody'); tbody.innerHTML='';
  (items.length?items:[{desc:'',qty:'1 set',price:'0.00',gst:'18%'}]).forEach(item=>{
    const tr=document.createElement('tr');tr.className='item-row';
    tr.innerHTML=`<td class="qty"><span class="serial"></span></td><td><textarea class="editable desc">${esc(item.desc)}</textarea></td><td><input class="editable qty qty-input" value="${esc(item.qty)}"></td><td><input class="editable num price" value="${esc(item.price)}" inputmode="decimal"></td><td><input class="editable qty gst" value="${esc(item.gst)}" inputmode="decimal"></td><td><input class="editable num gstamt" value="0.00" readonly></td><td><input class="editable num line-total" value="0.00" readonly></td><td class="screen-only remove-cell"><button class="small-btn" onclick="removeRow(this)">×</button></td>`;
    tbody.appendChild(tr);
  });
  recalculate(); closeForm();
}

function autoGrowTextarea(el){
  if(!el || !el.matches('textarea.editable')) return;
  el.style.height='auto';
  el.style.height=(el.classList.contains('term-editable') ? el.scrollHeight : Math.max(el.scrollHeight, 30))+'px';
}
function autoGrowAll(){
  document.querySelectorAll('textarea.editable').forEach(autoGrowTextarea);
}
function recalculate(){
  let grand=0;
  document.querySelectorAll('.item-row').forEach((row,i)=>{
    row.querySelector('.serial').textContent=(i+1)+'.';
    const price=parseNum(row.querySelector('.price').value);
    const gst=parseGst(row.querySelector('.gst').value);
    const gstAmt=price*gst/100;
    const total=price+gstAmt;
    row.querySelector('.gstamt').value=money(gstAmt);
    row.querySelector('.line-total').value=money(total);
    grand+=total;
  });
  document.getElementById('grand-total').value=money(grand);
}
function addRow(){
  const tbody=document.querySelector('#items tbody');
  const tr=document.createElement('tr');
  tr.className='item-row';
  tr.innerHTML=`<td class="qty"><span class="serial"></span></td>
    <td><textarea class="editable desc">New item description</textarea></td>
    <td><input class="editable qty qty-input" value="1 set"></td>
    <td><input class="editable num price" value="0.00" inputmode="decimal"></td>
    <td><input class="editable qty gst" value="18%" inputmode="decimal"></td>
    <td><input class="editable num gstamt" value="0.00" readonly></td>
    <td><input class="editable num line-total" value="0.00" readonly></td>
    <td class="screen-only remove-cell"><button class="small-btn" onclick="removeRow(this)">×</button></td>`;
  tbody.appendChild(tr); autoGrowAll(); recalculate();
}
function removeRow(btn){
  const rows=document.querySelectorAll('.item-row');
  if(rows.length<=1)return;
  btn.closest('tr').remove(); recalculate();
}
function resetForm(){ if(confirm('Reset the quotation to the original sample values?')) location.reload(); }
document.addEventListener('input',e=>{ if(e.target.matches('.price,.gst')) recalculate(); });
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeForm()});
autoGrowAll();
recalculate();
