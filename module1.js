/* Role: Module 1 script. Objective: Provide full Products CRUD demo with search, sort, detail view, FakeStoreAPI import and LocalStorage persistence. */

const LS_KEY = 'module1.products';

// DOM refs
const tableBody = document.querySelector('#productTable tbody');
const emptyEl = document.getElementById('empty');
const kpiCount = document.getElementById('kpi-count');
const kpiStock = document.getElementById('kpi-stock');
const kpiValue = document.getElementById('kpi-value');
const searchInput = document.getElementById('search');
const sortSelect = document.getElementById('sort');
const btnImport = document.getElementById('btn-import');
const btnAdd = document.getElementById('btn-add');
const detailEl = document.getElementById('detail');
const modalRoot = document.getElementById('modal-root');

// Utilities
function read(){
  try{ return JSON.parse(localStorage.getItem(LS_KEY)) || [] }catch(e){return []}
}
function write(data){
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}
function uid(prefix='p'){ return prefix+'_'+Math.random().toString(36).slice(2,9) }

// Rendering
function render(){
  const all = read();
  const q = searchInput.value.trim().toLowerCase();
  let list = all.filter(p=>p.name.toLowerCase().includes(q));
  // sorting
  const s = sortSelect.value;
  if(s==='name_asc') list.sort((a,b)=>a.name.localeCompare(b.name));
  if(s==='name_desc') list.sort((a,b)=>b.name.localeCompare(a.name));
  if(s==='price_asc') list.sort((a,b)=>a.price - b.price);
  if(s==='price_desc') list.sort((a,b)=>b.price - a.price);
  if(s==='stock_desc') list.sort((a,b)=>b.stock - a.stock);
  if(s==='newest') list.sort((a,b)=>new Date(b.createdAt) - new Date(a.createdAt));

  tableBody.innerHTML = '';
  if(!list.length){
    emptyEl.classList.remove('hidden');
  } else { emptyEl.classList.add('hidden'); }
  list.forEach(p=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td><a href="#" class="link-detail" data-id="${p.id}">${escapeHtml(p.name)}</a></td><td>$${p.price.toFixed(2)}</td><td>${p.stock}</td><td><div class="row-actions"><button class="btn" data-action="edit" data-id="${p.id}">Edit</button><button class="btn danger" data-action="delete" data-id="${p.id}">Delete</button></div></td>`;
    tableBody.appendChild(tr);
  });
  updateKPI(all);
}

function updateKPI(list){
  const count = list.length;
  const totalStock = list.reduce((s,p)=>s+p.stock,0);
  const totalValue = list.reduce((s,p)=>s + (p.price * p.stock),0);
  kpiCount.textContent = count;
  kpiStock.textContent = totalStock;
  kpiValue.textContent = '$' + totalValue.toFixed(2);
}

// Events
searchInput.addEventListener('input', render);
sortSelect.addEventListener('change', render);

// Table actions (edit/delete/detail)
tableBody.addEventListener('click', (e)=>{
  const btn = e.target.closest('button');
  if(btn){
    const id = btn.dataset.id;
    if(btn.dataset.action==='edit') openEdit(id);
    if(btn.dataset.action==='delete') doDelete(id);
  }
  const link = e.target.closest('.link-detail');
  if(link){ e.preventDefault(); openDetail(link.dataset.id); }
});

// Modal helpers
function openModal(html){
  modalRoot.innerHTML = `<div class="backdrop"><div class="modal">${html}</div></div>`;
  return modalRoot.querySelector('.modal');
}
function closeModal(){ modalRoot.innerHTML = '' }

// Add / Edit / Delete / Detail
function openAdd(){
  const form = `
    <h3>Ajouter produit</h3>
    <div class="form-row"><div class="field"><input id="mname" placeholder="Nom"/></div><div class="field"><input id="mprice" placeholder="Prix" type="number" step="0.01"/></div></div>
    <div class="form-row"><div class="field"><input id="mstock" placeholder="Stock" type="number"/></div><div class="field"><input id="mcategory" placeholder="Catégorie (optionnel)"/></div></div>
    <div class="form-actions"><button class="btn" id="cancel">Annuler</button><button class="btn primary" id="save">Enregistrer</button></div>
  `;
  const modal = openModal(form);
  modal.querySelector('#cancel').addEventListener('click', closeModal);
  modal.querySelector('#save').addEventListener('click', ()=>{
    const name = modal.querySelector('#mname').value.trim();
    const price = parseFloat(modal.querySelector('#mprice').value);
    const stock = parseInt(modal.querySelector('#mstock').value,10);
    if(!name || isNaN(price) || price<0 || isNaN(stock) || stock<0){ alert('Veuillez fournir un nom, un prix valide et un stock valide'); return }
    const p = {id:uid(), name, price, stock, category: modal.querySelector('#mcategory').value.trim() || '', createdAt: new Date().toISOString() };
    const all = read(); all.unshift(p); write(all); closeModal(); render();
  });
}

function openEdit(id){
  const all = read(); const target = all.find(x=>x.id===id); if(!target) return alert('Produit introuvable');
  const form = `
    <h3>Modifier produit</h3>
    <div class="form-row"><div class="field"><input id="mname" value="${escapeHtmlAttr(target.name)}"/></div><div class="field"><input id="mprice" value="${target.price}" type="number" step="0.01"/></div></div>
    <div class="form-row"><div class="field"><input id="mstock" value="${target.stock}" type="number"/></div><div class="field"><input id="mcategory" value="${escapeHtmlAttr(target.category||'')}"/></div></div>
    <div class="form-actions"><button class="btn" id="cancel">Annuler</button><button class="btn primary" id="save">Enregistrer</button></div>
  `;
  const modal = openModal(form);
  modal.querySelector('#cancel').addEventListener('click', closeModal);
  modal.querySelector('#save').addEventListener('click', ()=>{
    const name = modal.querySelector('#mname').value.trim();
    const price = parseFloat(modal.querySelector('#mprice').value);
    const stock = parseInt(modal.querySelector('#mstock').value,10);
    if(!name || isNaN(price) || price<0 || isNaN(stock) || stock<0){ alert('Veuillez fournir un nom, un prix valide et un stock valide'); return }
    target.name = name; target.price = price; target.stock = stock; target.category = modal.querySelector('#mcategory').value.trim() || '';
    write(all); closeModal(); render();
  });
}

function doDelete(id){
  if(!confirm('Supprimer ce produit ?')) return;
  const all = read(); const remaining = all.filter(x=>x.id!==id); write(remaining); render();
}

function openDetail(id){
  const all = read(); const p = all.find(x=>x.id===id); if(!p) return alert('Produit introuvable');
  detailEl.classList.remove('hidden');
  detailEl.innerHTML = `<h3>Détails</h3><div><strong>${escapeHtml(p.name)}</strong></div><div>Prix: $${p.price.toFixed(2)}</div><div>Stock: ${p.stock}</div><div>Catégorie: ${escapeHtml(p.category||'—')}</div><div style="margin-top:10px"><button class="btn" id="closeDetail">Fermer</button><button class="btn primary" id="editDetail">Modifier</button></div>`;
  detailEl.querySelector('#closeDetail').addEventListener('click', ()=>{ detailEl.classList.add('hidden') });
  detailEl.querySelector('#editDetail').addEventListener('click', ()=>{ detailEl.classList.add('hidden'); openEdit(id) });
}

// Import from FakeStoreAPI (https://fakestoreapi.com)
async function importFake(){
  try{
    btnImport.disabled = true; btnImport.textContent = 'Importation...';
    const res = await fetch('https://fakestoreapi.com/products');
    const data = await res.json();
    const all = read();
    data.forEach(d=>{
      // map to our shape
      const p = { id: uid(), name: d.title, price: parseFloat(d.price), stock: Math.floor(1+Math.random()*80), category: d.category || '', createdAt: new Date().toISOString() };
      all.unshift(p);
    });
    write(all); render(); alert('Importation terminée ('+data.length+' produits)');
  }catch(e){alert('Erreur d\'importation: '+e.message)}finally{btnImport.disabled=false; btnImport.textContent='Importer FakeStoreAPI'}
}

btnImport.addEventListener('click', importFake);
btnAdd.addEventListener('click', openAdd);

// Helpers for safety
function escapeHtml(str){ return String(str).replace(/[&<>"']/g, s=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[s]) }
function escapeHtmlAttr(str){ return String(str).replace(/"/g,'&quot;') }

// Seed if empty with a couple items for demo
(function seedIfEmpty(){
  const current = read(); if(current.length) return; const demo = [
    {id:uid(), name:'Laptop Pro', price:1299.99, stock:12, category:'Electronics', createdAt:new Date().toISOString()},
    {id:uid(), name:'Wireless Mouse', price:24.99, stock:90, category:'Accessories', createdAt:new Date().toISOString()},
  ]; write(demo); render();
})();

// Expose for debugging
window.module1 = {read, write, importFake};
