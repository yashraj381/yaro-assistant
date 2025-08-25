// Authentication and role selection

window.session = JSON.parse(localStorage.getItem('suraksha-session') || "{}") || {};

function saveSession() {
  localStorage.setItem('suraksha-session', JSON.stringify(window.session));
}

function authScreen() {
  window.render(`
    <div class="card" style="margin-top:36px;">
      <h1>👋 Welcome to Suraksha</h1>
      <form id="auth-form">
        <label>Name</label>
        <input id="name" type="text" maxlength="18" required value="${window.session.name||''}">
        <label>Family ID</label>
        <input id="family" type="text" maxlength="10" required value="${window.session.family||''}" placeholder="Create or join...">
        <label>Role</label>
        <select id="role">
          <option value="child" ${window.session.role==='child'?'selected':''}>Child 👶</option>
          <option value="parent" ${window.session.role==='parent'?'selected':''}>Parent 👨‍👩‍👧‍👦</option>
        </select>
        <button type="submit">Continue</button>
      </form>
    </div>
  `);
  document.getElementById('auth-form').onsubmit = async (e) => {
    e.preventDefault();
    window.session = {
      name: document.getElementById('name').value.trim(),
      family: document.getElementById('family').value.trim().toUpperCase(),
      role: document.getElementById('role').value,
      accidentDetection: window.session.accidentDetection ?? true
    };
    saveSession();
    // Add to family doc if not present
    const famRef = db.collection('families').doc(window.session.family);
    await famRef.set({}, {merge:true});
    await famRef.update({
      members: firebase.firestore.FieldValue.arrayUnion(window.session.name)
    });
    showToast("Logged in!");
    window.session.role === "child" ? childScreen() : parentScreen();
  };
}