// ════════════════════════════════════════════════════════════════
// AUTH
// ════════════════════════════════════════════════════════════════

function doLogin() {
  var username = document.getElementById('loginUsername').value.trim();
  var password = document.getElementById('loginPassword').value;
     if (username === 'admin' && password === 'admin123') {
        window.location.href = 'dashboard.html';
    } else {
        alert('Invalid Username or Password');
    }
}
  var btn = document.getElementById('loginBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Authenticating...';
  google.script.run
    .withSuccessHandler(function(res) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i>ACCESS SYSTEM';
      if (res.success) {
        SESSION = res.user;
        if (res.token) setToken(res.token);
        hideAuthError();
        bootApp();
      } else {
        showAuthError(res.message || 'Authentication failed.');
      }
    })
    .withFailureHandler(function(err) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i>ACCESS SYSTEM';
      showAuthError('Server error: ' + (err.message || err.toString()));
    })
    .handleLogin(username, password);
}

function doLogout() {
  SESSION = null; REGISTRY = []; VISITOR_REGISTRY = [];
  clearToken();
  stopCamera(true); stopVisitorCamera();
  if (visitorEntryTimeInterval) { clearInterval(visitorEntryTimeInterval); visitorEntryTimeInterval = null; }
  if (exitClockInterval) { clearInterval(exitClockInterval); exitClockInterval = null; }
  document.getElementById('appContainer').style.display = 'none';
  document.getElementById('authContainer').style.display = 'flex';
  document.getElementById('loginUsername').value = '';
  document.getElementById('loginPassword').value = '';
  closeSidebar();
}

function showAuthError(msg) {
  var el = document.getElementById('authError');
  document.getElementById('authErrorMsg').textContent = msg;
  el.style.display = 'flex';
}
function hideAuthError() { document.getElementById('authError').style.display = 'none'; }
