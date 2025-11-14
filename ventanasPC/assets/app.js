const SUPABASE_URL = "https://tuqzmelxuxgmbrdfreea.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1cXptZWx4dXhnbWJyZGZyZWVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNzExMTMsImV4cCI6MjA3Mzc0NzExM30.3716bNEomS77kiBsGgJ23P76WPKzBYGwKBH1xLEFwL0";

let supabaseClient;
(function init() {
  if (window.supabase && !supabaseClient) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    window.supabaseClient = supabaseClient;
  }
})();

const CART_KEY = "ventas:cart:v1";
const WELCOME_KEY = "ventas:welcome_seen";

const Cart = {
  read() {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); } catch { return [] }
  },
  write(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    renderCartCount();
    // notify pages to refresh stock UI if defined
    try{ window.refreshProductStocks?.(); }catch{}
  },
  add(item) {
    const items = this.read();
    const i = items.findIndex(x => String(x.producto_id) === String(item.producto_id));
    if (i >= 0) items[i].cantidad += item.cantidad || 1; else items.push({...item, cantidad: item.cantidad || 1});
    this.write(items);
  },
  inc(id){ const items=this.read(); const it=items.find(x=>String(x.producto_id)===String(id)); if(it){it.cantidad++; this.write(items);} },
  dec(id){ const items=this.read(); const it=items.find(x=>String(x.producto_id)===String(id)); if(it){ it.cantidad=Math.max(0,it.cantidad-1); if(it.cantidad===0){this.remove(id); return;} this.write(items);} },
  remove(id){ const items=this.read().filter(x=>String(x.producto_id)!==String(id)); this.write(items); },
  clear(){ this.write([]); },
  total(){ return this.read().reduce((a,b)=> a + (Number(b.precio_unitario)||0) * (b.cantidad||0), 0); }
};

function navLinks(){
  return `
  <a class="text-sm font-medium text-text-main transition-colors hover:text-primary dark:text-background-light dark:hover:text-card-light" href="home.html">Inicio</a>
  <a class="text-sm font-medium text-text-main transition-colors hover:text-primary dark:text-background-light dark:hover:text-card-light" href="categorias.html">Categorías</a>
  <a class="text-sm font-medium text-text-main transition-colors hover:text-primary dark:text-background-light dark:hover:text-card-light" href="carrito.html">Carrito</a>
  <a data-auth="required" class="hidden text-sm font-medium text-text-main transition-colors hover:text-primary dark:text-background-light dark:hover:text-card-light" href="mis-ordenes.html">Mis Órdenes</a>
  <a data-auth="required" class="hidden text-sm font-medium text-text-main transition-colors hover:text-primary dark:text-background-light dark:hover:text-card-light" href="perfil.html">Perfil</a>
  `;
}

function headerTemplate(){
  return `
  <header class="sticky top-0 z-50 w-full border-b border-primary/20 bg-background-light/90 backdrop-blur-sm dark:bg-background-dark/90 dark:border-primary/20">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="size-6 text-primary">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" fill="currentColor"/></svg>
          </div>
          <h2 class="text-lg font-bold tracking-tight text-text-main dark:text-background-light">Makitu Store</h2>
        </div>
        <nav class="hidden items-center gap-6 md:flex">${navLinks()}</nav>
        <div class="flex items-center gap-3">
          <div class="hidden sm:flex text-sm font-semibold text-text-main dark:text-background-light"><span id="cart-total-label">Total:&nbsp;</span><span id="cart-total" class="tabular-nums">S/. 0.00</span></div>
          <a href="carrito.html" class="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-primary/20">
            <span class="material-symbols-outlined text-xl">shopping_cart</span>
            <span id="cart-count" class="absolute -top-1 -right-1 hidden h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-white"></span>
          </a>
          <div id="auth-area" class="flex items-center gap-2"></div>
        </div>
      </div>
      <!-- Nav compacto para móvil -->
      <nav class="md:hidden pb-2 pt-1 overflow-x-auto">
        <div class="flex items-center gap-4 text-xs font-medium text-text-main/80 dark:text-background-light/80">
          <a href="home.html" class="flex items-center gap-1 px-1 py-1">
            <span class="material-symbols-outlined text-base">home</span>
            <span>Inicio</span>
          </a>
          <a href="categorias.html" class="flex items-center gap-1 px-1 py-1">
            <span class="material-symbols-outlined text-base">category</span>
            <span>Categorías</span>
          </a>
          <a data-auth="required" href="mis-ordenes.html" class="flex items-center gap-1 px-1 py-1">
            <span class="material-symbols-outlined text-base">receipt_long</span>
            <span>Mis órdenes</span>
          </a>
          <a data-auth="required" href="perfil.html" class="flex items-center gap-1 px-1 py-1">
            <span class="material-symbols-outlined text-base">person</span>
            <span>Perfil</span>
          </a>
        </div>
      </nav>
    </div>
  </header>`
}

function footerTemplate(){
  return `<footer class="bg-primary/10 dark:bg-background-dark/50 mt-8"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div class="py-6 text-center"><p class="text-sm font-normal text-gray-600 dark:text-gray-300">© 2025 Makitu Store</p></div></div></footer>`;
}

function mountChrome(){
  const h = document.createElement('div');
  h.innerHTML = headerTemplate();
  document.body.prepend(h.firstElementChild);
  const f = document.createElement('div');
  f.innerHTML = footerTemplate();
  document.body.append(f.firstElementChild);
  renderCartCount();
}

function renderCartCount(){
  const count = Cart.read().reduce((a,b)=>a+(b.cantidad||0),0);
  const el = document.getElementById('cart-count');
  if(!el) return;
  if(count>0){ el.textContent = String(count); el.classList.remove('hidden','flex'); el.classList.add('flex'); } else { el.classList.add('hidden'); }
  const tEl = document.getElementById('cart-total');
  if(tEl){ const tot = Cart.total(); tEl.textContent = `S/. ${Number(tot||0).toFixed(2)}`; }
}

document.addEventListener('click', (e)=>{
  const t = e.target.closest('[data-add]');
  if(t){
    e.preventDefault();
    const payload = JSON.parse(t.getAttribute('data-add'));
    const qtySrc = t.getAttribute('data-qty-src');
    if(qtySrc){
      const input = document.querySelector(qtySrc);
      const max = Math.max(1, parseInt(input?.getAttribute('max')||'9999',10) || 9999);
      const v = parseInt(input?.value || '1', 10);
      let desired = isNaN(v) || v < 1 ? 1 : Math.min(v, max);
      // respetar stock restante según lo que ya está en carrito
      const existing = Cart.read().find(x=>String(x.producto_id)===String(payload.producto_id));
      const already = existing?.cantidad || 0;
      const remaining = Math.max(0, max - already);
      if(remaining <= 0){ showModal('Este producto no tiene más unidades disponibles en este momento. Intenta reducir la cantidad o elige otro producto.', { title: 'Stock agotado' }); return; }
      payload.cantidad = Math.min(desired, remaining);
    }
    Cart.add(payload);
    animateAddFeedback(t);
  }
  const inc = e.target.closest('[data-inc]');
  if(inc){ Cart.inc(inc.getAttribute('data-inc')); window.refreshCartPage?.(); }
  const dec = e.target.closest('[data-dec]');
  if(dec){ Cart.dec(dec.getAttribute('data-dec')); window.refreshCartPage?.(); }
  const rem = e.target.closest('[data-remove]');
  if(rem){ Cart.remove(rem.getAttribute('data-remove')); window.refreshCartPage?.(); }
  // Qty selectors on product cards
  const qInc = e.target.closest('[data-qty-inc]');
  if(qInc){
    const sel = qInc.getAttribute('data-qty-inc');
    const input = document.querySelector(sel);
    if(input){
      const maxStock = Math.max(1, parseInt(input.getAttribute('max')||'9999',10) || 9999);
      // restar lo que ya está en carrito
      let remaining = maxStock;
      const payloadStr = qInc.getAttribute('data-qty-add');
      if(payloadStr){
        try{
          const payload = JSON.parse(payloadStr);
          const existing = Cart.read().find(x=>String(x.producto_id)===String(payload.producto_id));
          const already = existing?.cantidad || 0;
          remaining = Math.max(1, maxStock - already);
        }catch{}
      }
      const cur = Math.max(1, parseInt(input.value||'1',10) || 1);
      input.value = String(Math.min(remaining, cur + 1));
    }
  }
  const qDec = e.target.closest('[data-qty-dec]');
  if(qDec){
    const sel = qDec.getAttribute('data-qty-dec');
    const input = document.querySelector(sel);
    if(input){
      const cur = Math.max(1, parseInt(input.value||'1',10) || 1);
      input.value = String(Math.max(1, cur - 1));
    }
  }
});

async function enforceRouteAccess(){
  const isAdminPage = document.body.hasAttribute('data-admin-page');
  const s = await getSession();
  // Si no hay sesión, limpiar flag de admin para evitar redirecciones indebidas
  if(!s){ try{ sessionStorage.removeItem('is_admin_flag'); }catch{} }
  // Si venimos de logout explícito, no hacer redirecciones automáticas
  try{ if(window.qsParam?.('logged_out')==='1'){ return; } }catch{}
  if(isAdminPage){
    // Solo admin puede entrar; si no hay sesión -> requireAuth ya hará redirect
    if(!s){ return; }
    // Si ya tenemos flag de admin en esta sesión, no forzar salida
    try{ if(sessionStorage.getItem('is_admin_flag')==='1'){ return; } }catch{}
    const adm = await isAdmin();
    if(adm === false){ location.href = 'home.html'; return; }
    // Si es true o indeterminado, activar flag y permanecer
    try{ sessionStorage.setItem('is_admin_flag','1'); }catch{}
    return;
  }
  // Páginas normales: si el usuario es admin, lo mandamos al dashboard
  if(s){
    // Si el flag ya está activo, redirigir sin reconsultar para evitar parpadeos
    try{ if(sessionStorage.getItem('is_admin_flag')==='1'){ if(!location.pathname.endsWith('admin-dashboard.html')) location.href='admin-dashboard.html'; return; } }catch{}
    const adm = await isAdmin();
    if(adm === true){
      try{ sessionStorage.setItem('is_admin_flag','1'); }catch{}
      // permitir cerrar sesión y quizá perfil admin si existiera, pero por ahora redirige
      if(!location.pathname.endsWith('admin-dashboard.html')){
        location.href = 'admin-dashboard.html';
      }
    }
  }
}

window.addEventListener('DOMContentLoaded', ()=>{
  if(!document.body.hasAttribute('data-admin-page')){
    mountChrome();
  }
  enforceRouteAccess();
  renderAuthArea();
  if(window.supabaseClient){
    supabaseClient.auth.onAuthStateChange((_e, _s)=>{
      renderAuthArea();
    });
  }
});

// Small helpers
window.qsParam = function qsParam(k){
  try { return new URL(location.href).searchParams.get(k); } catch { return null }
}

// Simple centered modal
function showModal(message, options={}){
  const existing = document.getElementById('app-modal');
  if(existing) existing.remove();
  const wrapper = document.createElement('div');
  wrapper.id = 'app-modal';
  wrapper.className = 'fixed inset-0 z-[100]';
  wrapper.innerHTML = `
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
    <div class="absolute inset-0 flex items-center justify-center p-4">
      <div class="max-w-md w-full rounded-2xl bg-white p-6 shadow-lg text-center">
        <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-gray-700">
          <span class="material-symbols-outlined">inventory_2</span>
        </div>
        <h3 class="text-lg font-bold mb-2">${options.title || 'Stock agotado'}</h3>
        <p class="text-sm mb-5">${message}</p>
        <button id="app-modal-close" class="inline-flex h-10 items-center justify-center rounded-lg bg-gray-800 px-4 text-sm font-bold text-white hover:opacity-90">Entendido</button>
      </div>
    </div>`;
  document.body.appendChild(wrapper);
  document.getElementById('app-modal-close')?.addEventListener('click', ()=> wrapper.remove());
  wrapper.addEventListener('click', (ev)=>{ if(ev.target===wrapper) wrapper.remove(); });
}

// Pequeña animación de confirmación al añadir al carrito
function animateAddFeedback(btn){
  try{
    // badge flotante
    btn.classList.add('relative');
    const tag = document.createElement('span');
    tag.textContent = 'Añadido';
    tag.style.transition = 'transform .6s ease, opacity .6s ease';
    tag.className = 'pointer-events-none absolute -top-2 right-2 text-[11px] bg-primary text-white rounded-full px-2 py-[2px] opacity-0';
    btn.appendChild(tag);
    requestAnimationFrame(()=>{
      tag.style.opacity = '1';
      tag.style.transform = 'translateY(-6px)';
    });
    setTimeout(()=>{
      tag.style.opacity = '0';
      tag.style.transform = 'translateY(-16px)';
    }, 450);
    setTimeout(()=>{ tag.remove(); }, 1100);

    // feedback extra: ring verde y micro-scale
    const label = btn.querySelector('span:last-child');
    const original = label ? label.textContent : '';
    if(label){ label.textContent = 'Añadido'; }
    btn.classList.add('ring-2','ring-green-500');
    btn.style.transition = 'transform .15s ease';
    btn.style.transform = 'scale(0.98)';
    setTimeout(()=>{ btn.style.transform = 'scale(1)'; }, 150);
    setTimeout(()=>{
      if(label && original) label.textContent = original;
      btn.classList.remove('ring-2','ring-green-500');
    }, 700);
  }catch{}
}

async function getSession(){
  if(!supabaseClient) return null;
  const { data } = await supabaseClient.auth.getSession();
  return data.session || null;
}

async function currentUser(){
  const s = await getSession();
  return s?.user || null;
}

async function isAdmin(){
  const u = await currentUser();
  if(!u) return false;
  try{
    // caché de sesión para evitar parpadeos por errores transitorios
    try{ if(sessionStorage.getItem('is_admin_flag')==='1'){ return true; } }catch{}
    // Intentar primero RPC para evitar RLS
    try{
      const { data:rpcVal, error:rpcErr } = await supabaseClient.rpc('fn_is_admin');
      if(!rpcErr && typeof rpcVal === 'boolean'){ return rpcVal; }
    }catch(_e){}
    const { data, error } = await supabaseClient.from('usuarios').select('es_admin').eq('id', u.id).maybeSingle();
    if(error){ console.warn('isAdmin select error', error); return undefined; }
    const val = !!data?.es_admin;
    if(val){ try{ sessionStorage.setItem('is_admin_flag','1'); }catch{} }
    return val;
  }catch(err){ console.warn('isAdmin exception', err); return undefined }
}

async function ensureUsuarioExists(){
  const u = await currentUser();
  if(!u) return;
  await supabaseClient.from('usuarios').upsert({ id: u.id }, { onConflict: 'id' });
}

function redirectToNextOr(defaultPath){
  const rt = window.qsParam?.('redirect_to');
  location.href = rt ? rt : defaultPath;
}

async function postLoginRedirect(){
  // Si es admin, siempre ir al dashboard
  const adm = await isAdmin();
  if(adm === true || adm === undefined){ try{ sessionStorage.setItem('is_admin_flag','1'); }catch{} location.href = 'admin-dashboard.html'; return; }
  const rt = window.qsParam?.('redirect_to');
  if(rt){ location.href = rt; return; }
  location.href = 'home.html';
}

async function signInEmail(email, password){
  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if(error) throw error;
  await ensureUsuarioExists();
}

async function signUpEmail(email, password, nombre){
  if(!nombre || !nombre.trim()){
    throw new Error('El nombre es obligatorio');
  }
  const { data, error } = await supabaseClient.auth.signUp({ email, password, options: { data: { nombre: nombre.trim() } } });
  if(error) throw error;
  // Si las confirmaciones por email están desactivadas, el usuario suele quedar confirmado automáticamente.
  // Aseguramos sesión (si no vino) iniciando con email/pass y guardamos nombre en usuarios.
  let session = (await supabaseClient.auth.getSession()).data.session;
  if(!session){
    const { error: e2 } = await supabaseClient.auth.signInWithPassword({ email, password });
    if(e2) throw e2;
    session = (await supabaseClient.auth.getSession()).data.session;
  }
  const u = session?.user;
  if(u){
    await supabaseClient.from('usuarios').upsert({ id: u.id, nombre: nombre.trim() }, { onConflict: 'id' });
    try{
      await supabaseClient.functions.invoke('send-welcome', { body: { email, nombre: nombre.trim() } });
    }catch(_e){ /* opcional: ignorar si no existe la función */ }
  }
}

async function signInGoogle(){
  const redirect = location.origin + location.pathname.replace(/[^\/]*$/, '') + 'login.html';
  await supabaseClient.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: redirect } });
}

async function signOut(){
  try{ await supabaseClient.auth.signOut(); } finally {
    try{ localStorage.removeItem(CART_KEY); }catch{}
    try{ localStorage.removeItem(WELCOME_KEY); }catch{}
    try{ sessionStorage.removeItem('is_admin_flag'); }catch{}
    // Limpiar posibles tokens de supabase almacenados
    try{
      const toDel=[]; for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if(k && k.startsWith('sb-')) toDel.push(k); }
      toDel.forEach(k=>localStorage.removeItem(k));
    }catch{}
    location.href = 'home.html?logged_out=1';
  }
}

async function requireAuth(){
  const s = await getSession();
  if(!s){
    const back = encodeURIComponent(location.pathname.split('/').pop() + location.search);
    location.href = `login.html?redirect_to=${back}`;
    return false;
  }
  return true;
}

async function renderAuthArea(){
  const c = document.getElementById('auth-area');
  if(!c) return;
  const s = await getSession();
  // toggle auth-required nav links
  const protectedLinks = document.querySelectorAll('[data-auth="required"]');
  protectedLinks.forEach(el=>{
    if(s){ el.classList.remove('hidden'); }
    else { el.classList.add('hidden'); }
  });
  if(!s){
    c.classList.remove('hidden');
    c.innerHTML = `<a href="login.html" class="flex min-w-[84px] items-center justify-center rounded-lg h-10 px-4 bg-primary/20 text-primary text-sm font-bold hover:bg-primary/30">Iniciar sesión</a>`;
  } else {
    c.classList.remove('hidden');
    c.innerHTML = `<button id="btn-logout" class="flex min-w-[84px] items-center justify-center rounded-lg h-10 px-4 bg-primary/20 text-primary text-sm font-bold hover:bg-primary/30">Cerrar sesión</button>`;
    const b = c.querySelector('#btn-logout');
    b?.addEventListener('click', signOut);
  }
}

window.Auth = { signInEmail, signUpEmail, signInGoogle, signOut, ensureUsuarioExists, requireAuth, getSession, currentUser };
window.Auth.isAdmin = isAdmin;
window.Auth.postLoginRedirect = postLoginRedirect;
