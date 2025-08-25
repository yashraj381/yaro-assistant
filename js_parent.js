// Parent mode: Real-time alerts feed

let alertUnsub = null;

function parentScreen() {
  window.render(`
    <div class="card">
      <h2>👨‍👩‍👧‍👦 Parent Dashboard</h2>
      <div id="alerts"></div>
    </div>
  `);
  loadAlerts();
}

function loadAlerts() {
  const alertsDiv = document.getElementById('alerts');
  alertsDiv.innerHTML = window.loading();
  if(alertUnsub) alertUnsub();

  alertUnsub = db.collection('families').doc(session.family)
    .collection('alerts')
    .orderBy('timestamp', 'desc')
    .limit(30)
    .onSnapshot(snap => {
      if(snap.empty) {
        alertsDiv.innerHTML = `<div style="text-align:center;color:#888;">No alerts yet.</div>`;
        return;
      }
      alertsDiv.innerHTML = `
        <div class="alert-list">
          ${snap.docs.map(doc => renderAlert(doc.data())).join("")}
        </div>
      `;
    });
}

function renderAlert(alert) {
  return `
    <div class="alert-card">
      <div class="alert-title">🚨 ${alert.name}</div>
      <div class="alert-time">🕒 ${fmtDate(alert.timestamp)}</div>
      <div>
        📍 <a class="alert-location" target="_blank"
          href="https://maps.google.com/?q=${alert.location.lat},${alert.location.lng}">
          View Location
        </a>
      </div>
      ${alert.auto ? `<div style="color:#ff9500;font-size:0.97em;margin-top:2px;">(Automatic Detection)</div>` : ""}
    </div>
  `;
}