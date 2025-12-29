/* Role: Main bootstrap. Objective: Start the SPA, ensure seeding, wire navbar routing and data-change refresh. */
import * as Storage from './storage.js';
import { render as renderDashboard } from './dashboard.js';
import { render as renderUsers } from './users.js';
import { render as renderProducts } from './products.js';
import { render as renderAnalytics } from './analytics.js';
import { render as renderSettings } from './settings.js';

const routes = {
  dashboard: renderDashboard,
  users: renderUsers,
  products: renderProducts,
  analytics: renderAnalytics,
  settings: renderSettings,
};

await Storage.ensureSeed();

const app = document.getElementById('app');
const navButtons = document.querySelectorAll('.nav-item');

function setActive(tab) {
  navButtons.forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
}

function loadTab(tab) {
  const renderer = routes[tab];
  if (!renderer) return;
  setActive(tab);
  renderer(app);
}

navButtons.forEach(btn => btn.addEventListener('click', () => loadTab(btn.dataset.tab)));

window.addEventListener('techstore:datachange', () => {
  const active = document.querySelector('.nav-item.active')?.dataset.tab || 'dashboard';
  loadTab(active);
});

loadTab('dashboard');
