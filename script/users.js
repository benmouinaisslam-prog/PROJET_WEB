/* Role: Users module. Objective: Provide user management UI with Add/Edit/Delete and seed capability. */
import { getData, setData, addItem, updateItem, deleteItem, KEYS } from './storage.js';

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
  const users = getData(KEYS.USERS) || [];

  const root = document.createElement('div');
  root.className = 'card';
  root.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between">
      <div>
        <h3 style="margin:0">Users</h3>
        <div class="small">Manage application users</div>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <button class="btn" id="btn-seed">Seed 5</button>
        <button class="btn" id="btn-import">Import RandomUser</button>
        <button class="btn primary" id="btn-add">Add User</button>
      </div>
    </div>
    <div style="margin-top:12px">
      ${users.length?`<table class="table" id="usersTable"><thead><tr><th>User</th><th>Email</th><th>Country</th><th>Actions</th></tr></thead><tbody></tbody></table>`:`<div class="empty">No users yet — add some.</div>`}
    </div>
  `;

  container.appendChild(root);

  const tbody = root.querySelector('tbody');
  if(tbody){
    users.forEach(u=>{
      const tr = document.createElement('tr');
      const avatar = u.avatar || 'https://via.placeholder.com/40?text=U';
      tr.innerHTML = `<td><div class="user-cell"><img src="${avatar}" class="avatar-thumb" alt="${u.name}"/><div>${u.name}</div></div></td><td>${u.email}</td><td>${u.country||''}</td><td><div class="row-actions"><button class="btn" data-id="${u.id}" data-action="edit">Edit</button><button class="btn danger" data-id="${u.id}" data-action="delete">Delete</button></div></td>`;
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
  root.querySelector('#btn-seed').addEventListener('click', async ()=>{
    const base = getData(KEYS.USERS) || [];
    for(let i=0;i<5;i++){
      const u = {id:'u_'+Date.now()+'_'+Math.random().toString(36).slice(2,7), name:'New User '+(base.length+i+1), email:`new${Math.floor(Math.random()*1000)}@example.com`, country:'', avatar:'', createdAt:new Date().toISOString()};
      addItem(KEYS.USERS, u);
    }
    window.dispatchEvent(new Event('techstore:datachange'));
  });

  // Import from RandomUser API (adds multiple users with avatars)
  const btnImport = root.querySelector('#btn-import');
  if(btnImport){
    btnImport.addEventListener('click', async ()=>{
      btnImport.disabled = true; btnImport.textContent = 'Importing...';
      try{
        const res = await fetch('https://randomuser.me/api/?results=8&nat=us,ca,gb,fr');
        const j = await res.json();
        j.results.forEach(u=>{
          const user = {id:'u_'+(u.login?.uuid || (Date.now()+''+Math.random()).slice(0,12)), name:`${u.name.first} ${u.name.last}`, email:u.email, avatar:u.picture?.thumbnail||'', country:u.location?.country||'', createdAt:new Date().toISOString()};
          addItem(KEYS.USERS, user);
        });
        window.dispatchEvent(new Event('techstore:datachange'));
      }catch(e){ console.warn('Import failed', e); alert('Import failed: '+(e.message||e)); }
      finally{ btnImport.disabled = false; btnImport.textContent = 'Import RandomUser' }
    });
  }

  function openAdd(){
    const modal = createModal(`
      <h3>Add User</h3>
      <div class="form-row"><div class="field"><label class="label">Name</label><input class="input" id="name"/></div><div class="field"><label class="label">Email</label><input class="input" id="email"/></div></div>
      <div class="form-row"><div class="field"><label class="label">Country</label><input class="input" id="country"/></div><div class="field"><label class="label">Avatar URL (optional)</label><input class="input" id="avatar"/></div></div>
      <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:12px"><button class="btn" id="cancel">Cancel</button><button class="btn primary" id="save">Save</button></div>
    `);
    modal.querySelector('#cancel').addEventListener('click', ()=>closeModal(modal));
    modal.querySelector('#save').addEventListener('click', ()=>{
      const name = modal.querySelector('#name').value.trim();
      const email = modal.querySelector('#email').value.trim();
      const country = modal.querySelector('#country').value.trim();
      const avatar = modal.querySelector('#avatar').value.trim();
      if(!name || !email){ alert('Name and email are required'); return }
      const newUser = {id:'u_'+Date.now()+'_'+Math.random().toString(36).slice(2,6), name, email, country, avatar: avatar||'', createdAt:new Date().toISOString()};
      addItem(KEYS.USERS, newUser);
      closeModal(modal);
      window.dispatchEvent(new Event('techstore:datachange'));
    });
  }

  function openEdit(id){
    const target = (getData(KEYS.USERS)||[]).find(u=>u.id===id);
    if(!target) return alert('User not found');
    const modal = createModal(`
      <h3>Edit User</h3>
      <div class="form-row"><div class="field"><label class="label">Name</label><input class="input" id="name" value="${target.name}"/></div><div class="field"><label class="label">Email</label><input class="input" id="email" value="${target.email}"/></div></div>
      <div class="form-row"><div class="field"><label class="label">Country</label><input class="input" id="country" value="${target.country||''}"/></div><div class="field"><label class="label">Avatar URL (optional)</label><input class="input" id="avatar" value="${target.avatar||''}"/></div></div>
      <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:12px"><button class="btn" id="cancel">Cancel</button><button class="btn primary" id="save">Save</button></div>
    `);
    modal.querySelector('#cancel').addEventListener('click', ()=>closeModal(modal));
    modal.querySelector('#save').addEventListener('click', ()=>{
      const name = modal.querySelector('#name').value.trim();
      const email = modal.querySelector('#email').value.trim();
      const country = modal.querySelector('#country').value.trim();
      const avatar = modal.querySelector('#avatar').value.trim();
      if(!name || !email){ alert('Name and email are required'); return }
      updateItem(KEYS.USERS, id, {name, email, country, avatar: avatar||''});
      closeModal(modal);
      window.dispatchEvent(new Event('techstore:datachange'));
    });
  }

  function doDelete(id){
    if(!confirm('Delete this user?')) return;
    deleteItem(KEYS.USERS, id);
    window.dispatchEvent(new Event('techstore:datachange'));
  }
}
