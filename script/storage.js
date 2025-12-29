/* Role: Storage utilities for TechStore. Objective: Provide LocalStorage helpers, seeding, and CRUD helpers for users, products, and sales. */

const LS_PREFIX = 'techstore.';

function key(k){ return LS_PREFIX + k }

export function getData(name){
  const raw = localStorage.getItem(key(name));
  try{ return raw ? JSON.parse(raw) : null }catch(e){ console.error('parse error', e); return null }
}

export function setData(name, value){
  localStorage.setItem(key(name), JSON.stringify(value));
  window.dispatchEvent(new CustomEvent('techstore:datachange', {detail:{name}}));
}

export function clearAll(){
  Object.keys(localStorage).forEach(k=>{ if(k.startsWith(LS_PREFIX)) localStorage.removeItem(k) });
  window.dispatchEvent(new CustomEvent('techstore:datachange', {detail:{cleared:true}}));
}

function generateProducts(count=8){
  const sample = ['Laptop','Headphones','Mouse','Keyboard','Monitor','Webcam','Charger','Smartphone'];
  const products = [];
  for(let i=0;i<count;i++){
    const name = sample[i % sample.length] + (i>0?(' '+(i+1)):'');
    const price = Math.round((20 + Math.random()*980) * 100)/100;
    products.push({id: 'p_'+Date.now()+'_'+i, name, price, stock: Math.floor(5+Math.random()*150), category: 'Other', createdAt: new Date().toISOString()});
  }
  return products;
}

function generateSales(products, entries=30){
  const sales = [];
  for(let i=0;i<entries;i++){
    const p = products[Math.floor(Math.random()*products.length)];
    const qty = Math.floor(1+Math.random()*5);
    const total = Math.round(qty * p.price * 100)/100;
    const date = new Date(Date.now() - Math.floor(Math.random()*60)*24*3600*1000).toISOString();
    sales.push({id:'s_'+Date.now()+'_'+i, productId: p.id, productName: p.name, qty, total, date});
  }
  return sales;
}

async function fetchRandomUsers(count=12){
  try{
    const res = await fetch(`https://randomuser.me/api/?results=${count}&nat=us,ca,gb,fr`);
    const j = await res.json();
    return j.results.map((u,i)=>({
      id: 'u_'+(u.login?.uuid || (Date.now()+''+i)),
      name: `${u.name.first} ${u.name.last}`,
      email: u.email,
      avatar: u.picture?.thumbnail || '',
      country: u.location?.country || '',
      createdAt: new Date().toISOString()
    }));
  }catch(e){
    console.warn('RandomUser fetch failed', e);
    const fallback = [];
    for(let i=0;i<count;i++) fallback.push({id:'u_f_'+i, name:'User '+(i+1), email:`user${i+1}@example.com`, avatar:'', country:'', createdAt:new Date().toISOString()});
    return fallback;
  }
}

export async function ensureSeed(){
  let users = getData('users');
  let products = getData('products');
  let sales = getData('sales');
  if(!users){
    users = await fetchRandomUsers(12);
    setData('users', users);
  }
  if(!products){
    products = generateProducts(10);
    setData('products', products);
  }
  if(!sales){
    sales = generateSales(products, 40);
    setData('sales', sales);
  }
}

export function addItem(name, item){
  const arr = getData(name) || [];
  arr.unshift(item);
  setData(name, arr);
  return arr;
}
export function updateItem(name, id, patch){
  const arr = getData(name) || [];
  const idx = arr.findIndex(x=>x.id===id);
  if(idx === -1) return null;
  arr[idx] = {...arr[idx], ...patch};
  setData(name, arr);
  return arr[idx];
}
export function deleteItem(name, id){
  let arr = getData(name) || [];
  arr = arr.filter(x=>x.id!==id);
  setData(name, arr);
  return arr;
}

export const KEYS = {
  USERS: 'users',
  PRODUCTS: 'products',
  SALES: 'sales'
};
