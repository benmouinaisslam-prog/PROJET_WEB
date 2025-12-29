/* Role: Settings module. Objective: Provide maintenance controls — clear LocalStorage and re-seed data. */
import { clearAll, ensureSeed } from './storage.js';

export function render(container){
  container.innerHTML = '';
  const root = document.createElement('div');
  root.className = 'card';
  root.innerHTML = `
    <h3 style="margin:0">Settings</h3>
    <div class="small" style="margin-bottom:12px">Application settings and maintenance</div>
    <div style="display:flex;gap:12px">
      <button class="btn danger" id="btn-clear">Clear All Data</button>
      <button class="btn" id="btn-seed">Re-seed Data</button>
    </div>
  `;
  container.appendChild(root);

  root.querySelector('#btn-clear').addEventListener('click', ()=>{
    if(!confirm('This will remove all TechStore data from LocalStorage. Continue?')) return;
    clearAll();
    alert('Data cleared');
  });

  root.querySelector('#btn-seed').addEventListener('click', async ()=>{
    await ensureSeed();
    alert('Seeded data');
    window.dispatchEvent(new Event('techstore:datachange'));
  });
}
