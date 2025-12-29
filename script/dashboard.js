/* Role: Dashboard module. Objective: Render overview statistics and small charts for the TechStore admin. */
import { getData, KEYS } from './storage.js';

export function render(container){
  container.innerHTML = '';
  const users = getData(KEYS.USERS) || [];
  const products = getData(KEYS.PRODUCTS) || [];
  const sales = getData(KEYS.SALES) || [];

  const wrapper = document.createElement('div');
  wrapper.className = 'grid';

  const cardsHTML = document.createElement('div');
  cardsHTML.className = 'col-12 card';
  cardsHTML.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between">
      <div>
        <h2 style="margin:0 0 6px 0">Dashboard</h2>
        <div class="small">Overview of your store</div>
      </div>
      <div>
        <button class="btn" id="refreshBtn">Refresh</button>
      </div>
    </div>
    <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:12px">
      <div style="flex:1;min-width:180px">
        <div class="card p-3">
          <div class="meta">Total Users</div>
          <div class="stat-value" id="stat-users">${users.length}</div>
        </div>
      </div>
      <div style="flex:1;min-width:180px">
        <div class="card p-3">
          <div class="meta">Total Products</div>
          <div class="stat-value" id="stat-products">${products.length}</div>
        </div>
      </div>
      <div style="flex:1;min-width:180px">
        <div class="card p-3">
          <div class="meta">Total Sales</div>
          <div class="stat-value" id="stat-sales">$${(sales.reduce((s,x)=>s+x.total,0)||0).toFixed(2)}</div>
        </div>
      </div>
    </div>
  `;

  const chartsArea = document.createElement('div');
  chartsArea.className = 'card';
  chartsArea.style.marginTop = '14px';
  chartsArea.innerHTML = `
    <div style="display:flex;gap:12px;flex-wrap:wrap">
      <div style="flex:1;min-width:280px">
        <div class="card p-3">
          <canvas id="miniSalesChart" height="140"></canvas>
        </div>
      </div>
      <div style="width:260px">
        <div class="card p-3">
          <canvas id="miniProductsChart" height="140"></canvas>
        </div>
      </div>
    </div>
  `;

  wrapper.appendChild(cardsHTML);
  wrapper.appendChild(chartsArea);

  container.appendChild(wrapper);

  document.getElementById('refreshBtn').addEventListener('click', ()=> window.dispatchEvent(new Event('techstore:datachange')));

  renderMiniCharts(users, products, sales);
}

function renderMiniCharts(users, products, sales){
  try{
    const ctx = document.getElementById('miniSalesChart').getContext('2d');
    const dayBuckets = {};
    sales.forEach(s=>{
      const d = new Date(s.date).toLocaleDateString();
      dayBuckets[d] = (dayBuckets[d]||0) + s.total;
    });
    const labels = Object.keys(dayBuckets).slice(-12);
    const data = labels.map(l=>dayBuckets[l]);
    new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Sales',
          data,
          backgroundColor: 'rgba(79,70,229,0.08)',
          borderColor: '#4f46e5',
          fill: true
        }]
      }
    });
  }catch(e){console.warn(e)}

  try{
    const ctx2 = document.getElementById('miniProductsChart').getContext('2d');
    const labels = products.map(p=>p.name);
    const data = products.map(p=>p.stock);
    new Chart(ctx2, {type:'doughnut', data:{labels, datasets:[{data, backgroundColor:labels.map((_,i)=>`hsl(${i*40%360} 70% 60%)`)}]}});
  }catch(e){console.warn(e)}
}