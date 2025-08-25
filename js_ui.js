// UI rendering, theme, toast, and small utilities

// Theme toggle
const themeBtn = document.getElementById('toggle-btn');
const setTheme = (night) => {
  document.body.classList.toggle('night', night);
  themeBtn.innerHTML = night ? "🌙" : "☀️";
  localStorage.setItem('night', night ? "1" : "");
};
themeBtn.onclick = () => setTheme(!document.body.classList.contains('night'));
if(localStorage.getItem('night')==="1") setTheme(true); else setTheme(false);

window.showToast = (msg) => {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
};

window.render = (html) => {
  document.getElementById('app').innerHTML = html;
};

window.loading = () => `
  <div class="card" style="text-align:center;">
    <span style="font-size:2rem;">⏳</span><br/>
    <b>Loading...</b>
  </div>
`;

// Format date
window.fmtDate = (ts) => {
  const d = ts instanceof Date ? ts : new Date(ts);
  return d.toLocaleString();
};