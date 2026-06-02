// ════════════════════════════════════════════════════════════════
// CHARTS & DASHBOARD METRICS
// ════════════════════════════════════════════════════════════════

function toggleChartRenderingMode() {
  currentChartType = document.getElementById('chartTypeSelector').value;
  if (globalChartCachedData) buildCharts(globalChartCachedData);
}

function buildCharts(chartData) {
  globalChartCachedData = chartData;
  if (!chartData || !chartData.length) return;
  var labels = chartData.map(function(d) { return d.date ? d.date.slice(5) : ''; });
  var inData = chartData.map(function(d) { return d.inbound; });
  var outData = chartData.map(function(d) { return d.outbound; });
  var baseOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { boxPadding: 4 } },
    scales: {
      y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { font: { family: 'Outfit', size: 10 }, maxTicksLimit: 5 } },
      x: { grid: { display: false }, ticks: { font: { family: 'Outfit', size: 10 }, maxRotation: 45 } }
    }
  };
  if (chartIn) { chartIn.destroy(); chartIn = null; }
  if (chartOut) { chartOut.destroy(); chartOut = null; }
  var isBar = currentChartType === 'bar';
  var ctxIn = document.getElementById('chartInbound');
  var ctxOut = document.getElementById('chartOutbound');
  if (!ctxIn || !ctxOut) return;
  chartIn = new Chart(ctxIn.getContext('2d'), {
    type: currentChartType,
    data: { labels: labels, datasets: [{ label: 'IN', data: inData, backgroundColor: isBar ? '#10b981' : 'rgba(16,185,129,0.15)', borderColor: '#10b981', borderWidth: 2, fill: true, tension: 0.3, borderRadius: isBar ? 5 : 0 }] },
    options: baseOpts
  });
  chartOut = new Chart(ctxOut.getContext('2d'), {
    type: currentChartType,
    data: { labels: labels, datasets: [{ label: 'OUT', data: outData, backgroundColor: isBar ? '#3b82f6' : 'rgba(59,130,246,0.15)', borderColor: '#3b82f6', borderWidth: 2, fill: true, tension: 0.3, borderRadius: isBar ? 5 : 0 }] },
    options: baseOpts
  });
}

function updateDashboardMetrics(m) {
  if (!m) return;
  var map = {
    'm-inTotal': m.inTotal, 'm-inConfirmed': m.inConfirmed, 'm-inPending': m.inPending,
    'm-outTotal': m.outTotal, 'm-outConfirmed': m.outConfirmed,
    'm-rtbMatIn': m.rtbMatIn, 'm-nrtbMatIn': m.nrtbMatIn,
    'm-rtbMatOut': m.rtbMatOut, 'm-nrtbMatOut': m.nrtbMatOut,
    'm-rtbEquipOut': m.rtbEquipOut, 'm-nrtbEquipOut': m.nrtbEquipOut,
    'm-visitorsIn': m.visitorsIn, 'm-vehiclesIn': m.vehiclesIn
  };
  Object.keys(map).forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.textContent = map[id] || 0;
  });
}

function syncData() {
  showLoader();
  google.script.run
    .withSuccessHandler(function(res) {
      hideLoader();
      if (res.success) {
        REGISTRY = res.registry || [];
        updateDashboardMetrics(res.metrics);
        buildCharts(res.chartData);
        if (DIRECTION_FILTER) renderRegistry();
      } else {
        showToast('Sync failed: ' + (res.message || ''), 'error');
      }
    })
    .withFailureHandler(function(err) { hideLoader(); showToast('Connection error: ' + (err.message || err.toString()), 'error'); })
    .fetchMatrixPackage();
}
