// ════════════════════════════════════════════════════════════════
// API LAYER — connects frontend to Node.js/Express backend
// Replaces google.script.run calls
// ════════════════════════════════════════════════════════════════

var API_BASE = window.API_BASE || '';

function apiPost(path, data, onSuccess, onFailure) {
  fetch(API_BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() },
    body: JSON.stringify(data)
  })
  .then(function(res) { return res.json(); })
  .then(function(json) { onSuccess(json); })
  .catch(function(err) { onFailure(err); });
}

function apiGet(path, onSuccess, onFailure) {
  fetch(API_BASE + path, {
    headers: { 'Authorization': 'Bearer ' + getToken() }
  })
  .then(function(res) { return res.json(); })
  .then(function(json) { onSuccess(json); })
  .catch(function(err) { onFailure(err); });
}

function getToken() {
  return localStorage.getItem('gp_token') || '';
}
function setToken(t) { localStorage.setItem('gp_token', t); }
function clearToken() { localStorage.removeItem('gp_token'); }

// ── API WRAPPERS matching original google.script.run signatures ──

var google = {
  script: {
    run: (function() {
      var _success, _failure;
      var runner = {
        withSuccessHandler: function(fn) { _success = fn; return runner; },
        withFailureHandler: function(fn) { _failure = fn; return runner; },

        handleLogin: function(username, password) {
          apiPost('/api/auth/login', { username, password }, _success, _failure);
        },

        fetchMatrixPackage: function() {
          apiGet('/api/gatepasses/matrix', _success, _failure);
        },

        createNewPass: function(payload) {
          apiPost('/api/gatepasses/create', payload, _success, _failure);
        },

        updateWorkflow: function(data) {
          apiPost('/api/gatepasses/workflow', data, _success, _failure);
        },

        deletePasses: function(passNumbers, userRole) {
          apiPost('/api/gatepasses/delete', { passNumbers, userRole }, _success, _failure);
        },

        addVisitorRowToDatabase: function(v) {
          apiPost('/api/visitors/create', v, _success, _failure);
        },

        fetchVisitorRegistry: function() {
          apiGet('/api/visitors', _success, _failure);
        },

        recordVisitorExit: function(payload) {
          apiPost('/api/visitors/exit', payload, _success, _failure);
        }
      };
      // Reset handlers after each call to avoid stale closures
      var origHandlers = {};
      Object.keys(runner).forEach(function(key) {
        if (key === 'withSuccessHandler' || key === 'withFailureHandler') return;
        var orig = runner[key];
        runner[key] = function() {
          var s = _success, f = _failure;
          _success = null; _failure = null;
          orig.apply(runner, arguments);
        };
      });
      return runner;
    })()
  }
};
