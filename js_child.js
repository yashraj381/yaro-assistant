// Child main UI, SOS, accident detection, settings

let accidentActive = false;
let shakeTimeout = null;

function childScreen() {
  window.render(`
    <div class="card">
      <h2>Hi, ${session.name} 👶</h2>
      <button class="sos-btn" id="sos-btn">🚨 SOS</button>
      <div id="sos-status"></div>
    </div>
    <div class="card settings-panel">
      <h3>Quick Settings</h3>
      <label>
        Name
        <input id="set-name" type="text" maxlength="18" value="${session.name}">
      </label>
      <label>
        Family ID
        <input id="set-family" type="text" maxlength="10" value="${session.family}">
      </label>
      <div class="toggle-switch">
        <label>
          <input id="toggle-acc" type="checkbox" ${session.accidentDetection?'checked':''}/>
          Accident Detection
        </label>
      </div>
      <button id="save-set">Save</button>
    </div>
  `);

  document.getElementById('sos-btn').onclick = sendSOS;
  document.getElementById('save-set').onclick = () => {
    session.name = document.getElementById('set-name').value.trim();
    session.family = document.getElementById('set-family').value.trim().toUpperCase();
    session.accidentDetection = document.getElementById('toggle-acc').checked;
    localStorage.setItem('suraksha-session', JSON.stringify(session));
    showToast("Settings saved!");
    // Immediate effect: reload
    childScreen();
  };

  if(session.accidentDetection && window.DeviceMotionEvent) enableShake();
  else disableShake();
}

function sendSOS(opts={auto:false}) {
  const btn = document.getElementById('sos-btn');
  btn.disabled = true;
  btn.innerText = "Sending...";
  if(navigator.vibrate) navigator.vibrate([200, 80, 140]);
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const alert = {
      name: session.name,
      role: "child",
      timestamp: Date.now(),
      location: {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      },
      cancelled: false,
      auto: opts.auto||false
    };
    await db.collection('families').doc(session.family)
      .collection('alerts').add(alert);
    document.getElementById('sos-status').innerHTML = `
      <b style="color:#ff3b30;">SOS Sent!</b>
      <br/><span style="color:#666;">${new Date().toLocaleString()}</span>
      ${opts.auto ? `<br/><small>(Automatic Detection)</small>` : ""}
    `;
    btn.disabled = false;
    btn.innerText = "🚨 SOS";
  }, (err) => {
    showToast("Location permission denied!");
    btn.disabled = false;
    btn.innerText = "🚨 SOS";
  });
}

// ACCIDENT/CRASH DETECTION
function enableShake() {
  if(accidentActive) return;
  accidentActive = true;
  let last = {x:0, y:0, z:0, t:0};
  window.ondevicemotion = (e) => {
    const acc = e.accelerationIncludingGravity;
    if(!acc) return;
    const now = Date.now();
    if(now - last.t < 400) return;
    // Calculate shake intensity
    const dx = Math.abs(acc.x - last.x);
    const dy = Math.abs(acc.y - last.y);
    const dz = Math.abs(acc.z - last.z);
    last = {x:acc.x, y:acc.y, z:acc.z, t:now};
    if(dx+dy+dz > 30) { // Threshold
      if(shakeTimeout) return;
      // Show countdown
      let countdown = 5;
      document.getElementById('sos-status').innerHTML = `
        <b>Possible accident detected!</b>
        <br>Sending SOS in <span id="countdown">${countdown}</span> sec...
        <br><button id="cancel-shake">Cancel</button>
      `;
      shakeTimeout = setInterval(() => {
        countdown--;
        if(countdown <= 0) {
          clearInterval(shakeTimeout);
          shakeTimeout = null;
          sendSOS({auto:true});
        } else {
          document.getElementById('countdown').textContent = countdown;
        }
      }, 1000);
      document.getElementById('cancel-shake').onclick = () => {
        clearInterval(shakeTimeout);
        shakeTimeout = null;
        document.getElementById('sos-status').innerHTML = "";
      };
    }
  };
}
function disableShake() {
  accidentActive = false;
  shakeTimeout && clearInterval(shakeTimeout);
  shakeTimeout = null;
  window.ondevicemotion = null;
}