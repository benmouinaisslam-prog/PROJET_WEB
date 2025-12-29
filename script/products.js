/* Role: Products module. Objective: Provide product management UI with Add/Edit/Delete and seed capability. */
import { getData, addItem, updateItem, deleteItem, KEYS } from './storage.js';

function createModal(html){
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `<div class="modal">${html}</div>`;
  document.body.appendChild(backdrop);
  return backdrop;
}
function closeModal(backdrop){ if(backdrop) backdrop.remove() }

export function render(container){
  container.innerHTML = '';
  const products = getData(KEYS.PRODUCTS) || [];

  const root = document.createElement('div');
  root.className = 'card';
  root.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between">
      <div>
        <h3 style="margin:0">Products</h3>
        <div class="small">Manage products and inventory</div>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <button class="btn" id="btn-seed">Seed 5</button>
        <button class="btn" id="btn-import-api">Import FakeStoreAPI</button>
        <button class="btn primary" id="btn-add">Add Product</button>
      </div>
    </div>
    <div style="margin-top:12px">
      ${products.length?`<table class="table" id="productsTable"><thead><tr><th>Product</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead><tbody></tbody></table>`:`<div class="empty">No products yet — add some.</div>`}
    </div>
  `;

  container.appendChild(root);

  const tbody = root.querySelector('tbody');
  if(tbody){
    products.forEach(p=>{
      const tr = document.createElement('tr');
      const imgSrc = p.image || 'https://via.placeholder.com/48?text=No';
      tr.innerHTML = `<td><div class="product-cell"><img src="${imgSrc}" class="product-thumb" alt="${p.name}"/><div>${p.name}</div></div></td><td>$${p.price.toFixed(2)}</td><td>${p.stock}</td><td><div class="row-actions"><button class="btn" data-id="${p.id}" data-action="edit">Edit</button><button class="btn danger" data-id="${p.id}" data-action="delete">Delete</button></div></td>`;
      tbody.appendChild(tr);
    });
    tbody.addEventListener('click', (e)=>{
      const btn = e.target.closest('button');
      if(!btn) return;
      const id = btn.dataset.id;
      const action = btn.dataset.action;
      if(action==='edit') openEdit(id);
      if(action==='delete') doDelete(id);
    });
  }

  root.querySelector('#btn-add').addEventListener('click', openAdd);
  root.querySelector('#btn-seed').addEventListener('click', ()=>{
    const base = getData(KEYS.PRODUCTS) || [];
    for(let i=0;i<5;i++){
      const p = {id:'p_'+Date.now()+'_'+Math.random().toString(36).slice(2,6), name:'Product '+(base.length+i+1), price:Math.round((10+Math.random()*400)*100)/100, stock:Math.floor(1+Math.random()*250), createdAt:new Date().toISOString()};
      addItem(KEYS.PRODUCTS, p);
    }
    window.dispatchEvent(new Event('techstore:datachange'));
  });

  // Import from FakeStoreAPI
  const btnImportApi = root.querySelector('#btn-import-api');
  if(btnImportApi) btnImportApi.addEventListener('click', async ()=>{
    btnImportApi.disabled = true; btnImportApi.textContent = 'Importing...';
    try{
      const res = await fetch('https://fakestoreapi.com/products');
      const data = await res.json();
      data.forEach(d=>{
        const p = { id:'p_'+Date.now()+'_'+Math.random().toString(36).slice(2,6), name: d.title, price: parseFloat(d.price), stock: Math.floor(1+Math.random()*120), image: d.image || '', category: d.category || 'Other', createdAt: new Date().toISOString() };
        addItem(KEYS.PRODUCTS, p);
      });
      window.dispatchEvent(new Event('techstore:datachange'));
    }catch(e){ console.warn('Import failed', e); alert('Import failed: '+e.message) }
    finally{ btnImportApi.disabled = false; btnImportApi.textContent = 'Import FakeStoreAPI' }
  });

  function openAdd(){
    const modal = createModal(`
      <h3>Add Product</h3>
      <div class="form-row"><div class="field"><label class="label">Name</label><input class="input" id="name"/></div><div class="field"><label class="label">Price</label><input class="input" id="price" type="number" step="0.01"/></div></div>
      <div class="form-row"><div class="field"><label class="label">Stock</label><input class="input" id="stock" type="number"/></div><div class="field"><label class="label">Image URL (optional)</label><input class="input" id="image"/></div></div>
      <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:12px"><button class="btn" id="cancel">Cancel</button><button class="btn primary" id="save">Save</button></div>
    `);
    modal.querySelector('#cancel').addEventListener('click', ()=>closeModal(modal));
    modal.querySelector('#save').addEventListener('click', ()=>{
      const name = modal.querySelector('#name').value.trim();
      const price = parseFloat(modal.querySelector('#price').value);
      const stock = parseInt(modal.querySelector('#stock').value,10);
      const image = modal.querySelector('#image').value.trim();
      if(!name || isNaN(price)){ alert('Name and valid price are required'); return }
      const newP = {id:'p_'+Date.now()+'_'+Math.random().toString(36).slice(2,6), name, price, stock: isNaN(stock)?0:stock, image: image || '', createdAt:new Date().toISOString()};
      addItem(KEYS.PRODUCTS, newP);
      closeModal(modal);
      window.dispatchEvent(new Event('techstore:datachange'));
    });
  }

  function openEdit(id){
    const target = (getData(KEYS.PRODUCTS)||[]).find(p=>p.id===id);
    if(!target) return alert('Product not found');
    const modal = createModal(`
      <h3>Edit Product</h3>
      <div class="form-row"><div class="field"><label class="label">Name</label><input class="input" id="name" value="${target.name}"/></div><div class="field"><label class="label">Price</label><input class="input" id="price" type="number" step="0.01" value="${target.price}"/></div></div>
      <div class="form-row"><div class="field"><label class="label">Stock</label><input class="input" id="stock" type="number" value="${target.stock}"/></div><div class="field"><label class="label">Image URL (optional)</label><input class="input" id="image" value="${target.image||''}"/></div></div>
      <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:12px"><button class="btn" id="cancel">Cancel</button><button class="btn primary" id="save">Save</button></div>
    `);
    modal.querySelector('#cancel').addEventListener('click', ()=>closeModal(modal));
    modal.querySelector('#save').addEventListener('click', ()=>{
      const name = modal.querySelector('#name').value.trim();
      const price = parseFloat(modal.querySelector('#price').value);
      const stock = parseInt(modal.querySelector('#stock').value,10);
      const image = modal.querySelector('#image').value.trim();
      if(!name || isNaN(price)){ alert('Name and valid price are required'); return }
      updateItem(KEYS.PRODUCTS, id, {name, price, stock: isNaN(stock)?0:stock, image: image || ''});
      closeModal(modal);
      window.dispatchEvent(new Event('techstore:datachange'));
    });
  }

  function doDelete(id){
    if(!confirm('Delete this product?')) return;
    deleteItem(KEYS.PRODUCTS, id);
    window.dispatchEvent(new Event('techstore:datachange'));
  }
}
