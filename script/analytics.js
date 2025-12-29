/* Role: Analytics module. Objective: Render charts and top-product analytics using Chart.js. */
import { getData, KEYS } from './storage.js';

export function render(container){
  container.innerHTML = '';
  const users = getData(KEYS.USERS) || [];
  const products = getData(KEYS.PRODUCTS) || [];
  const sales = getData(KEYS.SALES) || [];

  const root = document.createElement('div');
  root.className = 'card';
  root.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between">
      <div>
        <h3 style="margin:0">Analytics</h3>
        <div class="small">Store performance and charts</div>
      </div>
    </div>
    <div style="margin-top:12px;display:grid;grid-template-columns:2fr 1fr;gap:12px;align-items:start">
      <div style="display:grid;gap:12px">
        <div class="card" style="padding:12px">
          <h4 style="margin:0 0 8px 0">Monthly Sales (by month)</h4>
          <canvas id="salesChart" height="160"></canvas>
        </div>
        <div class="card" style="padding:12px">
          <h4 style="margin:0 0 8px 0">Revenue Trend (cumulative)</h4>
          <canvas id="revenueLineChart" height="140"></canvas>
        </div>
        <div class="card" style="padding:12px;display:flex;gap:12px;flex-wrap:wrap">
          <div style="flex:1;min-width:220px">
            <h4 style="margin:0 0 8px 0">Sales by Weekday</h4>
            <canvas id="salesWeekdayChart" height="120"></canvas>
          </div>
          <div style="width:260px">
            <h4 style="margin:0 0 8px 0">Sales by Category</h4>
            <canvas id="salesByCategoryChart" height="120"></canvas>
          </div>
        </div>
      </div>
      <div class="card" style="padding:12px">
        <h4 style="margin-top:0">Top Products</h4>
        <div id="topProducts"></div>
        <hr style="border:none;border-top:1px dashed rgba(255,255,255,0.03);margin:12px 0"/>
        <h4 style="margin:0 0 8px 0">Stock by Category</h4>
        <canvas id="stockByCategoryChart" height="160"></canvas>
      </div>
    </div>
  `;

  container.appendChild(root);

  renderSalesChart(sales);
  renderRevenueLineChart(sales);
  renderSalesByWeekdayChart(sales);
  renderSalesByCategoryChart(sales, products);
  renderStockByCategoryChart(products);
  renderTopProducts(sales, products);
}

function renderSalesChart(sales){
  try{
    const ctx = document.getElementById('salesChart').getContext('2d');
    const buckets = {};
    sales.forEach(s=>{
      const d = new Date(s.date);
      const key = `${d.getFullYear()}-${('0'+(d.getMonth()+1)).slice(-2)}`;
      buckets[key] = (buckets[key]||0) + s.total;
    });
    const labels = Object.keys(buckets).sort();
    const data = labels.map(l=>buckets[l]);
    new Chart(ctx, {type:'bar', data:{labels, datasets:[{label:'Sales', data, backgroundColor:'rgba(79,70,229,0.8)'}]}});
  }catch(e){console.warn(e)}
}

function renderTopProducts(sales, products){
  const map = {};
  sales.forEach(s=>{ map[s.productName] = (map[s.productName]||0) + s.total });
  const rows = Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,6);
  const el = document.getElementById('topProducts');
  if(!rows.length){ el.innerHTML = '<div class="empty">No sales yet</div>'; return }
  el.innerHTML = '<ol style="padding-left:18px;margin:6px 0">' + rows.map(r=>`<li style="margin:8px 0">${r[0]} — $${r[1].toFixed(2)}</li>`).join('') + '</ol>';
}

function renderRevenueLineChart(sales){
  try{
    const ctx = document.getElementById('revenueLineChart').getContext('2d');
    const buckets = {};
    sales.forEach(s=>{
      const d = new Date(s.date);
      const key = `${d.getFullYear()}-${('0'+(d.getMonth()+1)).slice(-2)}`;
      buckets[key] = (buckets[key]||0) + s.total;
    });
    const labels = Object.keys(buckets).sort();
    const monthly = labels.map(l=>buckets[l]);
    // cumulative
    const cum = monthly.reduce((acc,v,i)=>{ acc.push((acc[i-1]||0)+v); return acc }, []);
    new Chart(ctx, {type:'line', data:{labels, datasets:[{label:'Cumulative Revenue', data:cum, borderColor:'#34d399', backgroundColor:'rgba(52,211,153,0.08)', fill:true}]}, options:{elements:{point:{radius:3}}}});
  }catch(e){console.warn(e)}
}

function renderSalesByWeekdayChart(sales){
  try{
    const ctx = document.getElementById('salesWeekdayChart').getContext('2d');
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const buckets = {0:0,1:0,2:0,3:0,4:0,5:0,6:0};
    sales.forEach(s=>{ const d=new Date(s.date); buckets[d.getDay()] += s.total });
    const data = days.map((_,i)=>buckets[i]);
    new Chart(ctx, {type:'bar', data:{labels:days, datasets:[{label:'Sales',data, backgroundColor:'rgba(79,70,229,0.8)'}]}, options:{plugins:{legend:{display:false}}}});
  }catch(e){console.warn(e)}
}

function renderSalesByCategoryChart(sales, products){
  try{
    const ctx = document.getElementById('salesByCategoryChart').getContext('2d');
    const prodMap = {};
    (products||[]).forEach(p=>{ prodMap[p.id] = p });
    const catMap = {};
    sales.forEach(s=>{
      const p = prodMap[s.productId];
      const cat = (p && p.category) ? p.category : 'Other';
      catMap[cat] = (catMap[cat]||0) + s.total;
    });
    const labels = Object.keys(catMap);
    const data = labels.map(l=>catMap[l]);
    if(!labels.length){ const el = document.getElementById('salesByCategoryChart'); if(el) el.getContext('2d'); }
    new Chart(ctx, {type:'bar', data:{labels, datasets:[{label:'By Category', data, backgroundColor:labels.map((_,i)=>`hsl(${i*50%360} 70% 55%)`)}]}, options:{plugins:{legend:{display:false}}}});
  }catch(e){console.warn(e)}
}

function renderStockByCategoryChart(products){
  try{
    const ctx = document.getElementById('stockByCategoryChart').getContext('2d');
    const map = {};
    (products||[]).forEach(p=>{ const cat = p.category || 'Other'; map[cat] = (map[cat]||0) + (p.stock||0) });
    const labels = Object.keys(map);
    const data = labels.map(l=>map[l]);
    new Chart(ctx, {type:'doughnut', data:{labels, datasets:[{data, backgroundColor:labels.map((_,i)=>`hsl(${i*60%360} 70% 60%)`)}]}});
  }catch(e){console.warn(e)}
}
