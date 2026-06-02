// ════════════════════════════════════════════════════════════════
// UTILS
// ════════════════════════════════════════════════════════════════

function esc(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function getStatusClass(status) {
  var s = (status || '').toUpperCase();
  if (s === 'CONFIRMED' || s === 'APPROVED') return 'pill-confirmed';
  if (s === 'REJECTED') return 'pill-rejected';
  return 'pill-pending';
}

function scaleDown(width, height, maxDim) {
  if (width > height) {
    if (width > maxDim) { height = Math.round(height * maxDim / width); width = maxDim; }
  } else {
    if (height > maxDim) { width = Math.round(width * maxDim / height); height = maxDim; }
  }
  return { w: width, h: height };
}

function handleCameraError(err, warningId, msgId) {
  var msg = 'Unable to access camera.';
  if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') msg = 'Camera permission denied. Allow camera access in browser settings.';
  else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') msg = 'No camera device found on this device.';
  else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') msg = 'Camera is in use by another app. Close it and try again.';
  else if (err.name === 'OverconstrainedError') msg = 'Camera constraints not supported. Try a different browser.';
  else msg = err.message || 'Unknown error: ' + err.name;
  var el = document.getElementById(warningId);
  if (el) { el.style.display = 'block'; document.getElementById(msgId).textContent = msg; }
  showToast(msg, 'error');
}

function formatDateTime(dt) {
  if (!dt) return '—';
  try {
    var d = new Date(dt);
    if (isNaN(d.getTime())) return dt;
    return d.toLocaleString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
  } catch(e) { return dt || '—'; }
}

function calcDuration(inTime, outTime) {
  if (!inTime || !outTime) return '—';
  var diff = Math.floor((new Date(outTime) - new Date(inTime)) / 1000);
  if (isNaN(diff) || diff < 0) return '—';
  var h = Math.floor(diff / 3600);
  var m = Math.floor((diff % 3600) / 60);
  return h + 'h ' + m + 'm';
}

function nowString() {
  return new Date().toLocaleString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit', second:'2-digit' });
}

function showToast(msg, type) {
  type = type || 'info';
  var icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle', warn: 'fa-exclamation-triangle' };
  var colors = { success: 'var(--success)', error: 'var(--danger)', info: 'var(--brand)', warn: 'var(--warning)' };
  var toast = document.createElement('div');
  toast.className = 'toast-item ' + type;
  toast.innerHTML =
    '<i class="fas ' + (icons[type]||'fa-info-circle') + '" style="color:' + (colors[type]||'var(--brand)') + ';flex-shrink:0"></i>' +
    '<span style="flex:1">' + String(msg) + '</span>' +
    '<button onclick="this.parentElement.remove()" style="background:none;border:none;color:var(--text-3);cursor:pointer;padding:2px;font-size:16px;min-width:24px">&times;</button>';
  document.getElementById('toastStack').appendChild(toast);
  setTimeout(function() {
    toast.style.opacity = '0';
    toast.style.transition = '0.4s';
    setTimeout(function() { if (toast.parentElement) toast.remove(); }, 400);
  }, 5000);
}

function showLoader() { document.getElementById('globalLoader').classList.add('visible'); }
function hideLoader() { document.getElementById('globalLoader').classList.remove('visible'); }
