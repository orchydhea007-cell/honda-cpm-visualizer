/* app.js – Main application controller */

const App = (() => {

  let currentTab = 'dag';
  let tableData = [];
  let tableSortCol = 'id';
  let tableSortDir = 1;
  let tableFilter  = 'all';
  let tableSearch  = '';
  let ganttCritOnly = false;
  let dagInited = false;
  let kahnInited = false;

  // ── Startup ───────────────────────────────────────────────────
  function init() {
    renderHeaderStats();
    buildLegend();
    buildTable();
    buildStatsCards();
    renderSubsystemFilter();

    // Tab events
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Search
    const search = document.getElementById('table-search');
    if (search) search.addEventListener('input', e => {
      tableSearch = e.target.value.toLowerCase();
      renderTableRows();
    });

    // Filter pills
    document.querySelectorAll('.pill').forEach(p => {
      p.addEventListener('click', () => {
        document.querySelectorAll('.pill').forEach(x => x.classList.remove('active'));
        p.classList.add('active');
        tableFilter = p.dataset.filter;
        renderTableRows();
      });
    });

    // Gantt toggle
    const ganttToggle = document.getElementById('gantt-cp-toggle');
    if (ganttToggle) ganttToggle.addEventListener('change', e => {
      ganttCritOnly = e.target.checked;
      Charts.renderGantt(document.getElementById('gantt-svg'), ganttCritOnly);
    });

    // DAG controls
    document.getElementById('dag-zoom-in')?.addEventListener('click', () => DAGRenderer.zoomIn());
    document.getElementById('dag-zoom-out')?.addEventListener('click', () => DAGRenderer.zoomOut());
    document.getElementById('dag-reset')?.addEventListener('click', () => DAGRenderer.resetView());
    document.getElementById('dag-focus-cp')?.addEventListener('click', () => DAGRenderer.focusCriticalPath());

    document.getElementById('dag-cp-only')?.addEventListener('change', e => {
      DAGRenderer.setCriticalOnly(e.target.checked);
    });

    document.getElementById('dag-subsys-filter')?.addEventListener('change', e => {
      DAGRenderer.setHighlightSubsystem(e.target.value);
    });

    // Kahn controls
    document.getElementById('kahn-play-btn')?.addEventListener('click', toggleKahnPlay);
    document.getElementById('kahn-step-fwd')?.addEventListener('click', () => {
      KahnAnimator.stepForward();
    });
    document.getElementById('kahn-step-back')?.addEventListener('click', () => {
      KahnAnimator.stepBack();
    });
    document.getElementById('kahn-reset-btn')?.addEventListener('click', () => {
      KahnAnimator.reset();
      const btn = document.getElementById('kahn-play-btn');
      if (btn) btn.textContent = '▶ Play';
    });
    document.getElementById('kahn-speed')?.addEventListener('input', e => {
      const speeds = [1200, 800, 400, 150, 50];
      KahnAnimator.setSpeed(speeds[parseInt(e.target.value)] || 400);
    });
    document.getElementById('kahn-progress')?.addEventListener('input', e => {
      KahnAnimator.jumpTo(parseInt(e.target.value));
    });

    // Table sort
    document.querySelectorAll('.cpm-table th[data-col]').forEach(th => {
      th.addEventListener('click', () => {
        if (tableSortCol === th.dataset.col) tableSortDir *= -1;
        else { tableSortCol = th.dataset.col; tableSortDir = 1; }
        document.querySelectorAll('.cpm-table th').forEach(x => x.classList.remove('sorted'));
        th.classList.add('sorted');
        renderTableRows();
      });
    });

    // Activate first tab
    switchTab('dag');
  }

  // ── Tab switching ─────────────────────────────────────────────
  function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.tab-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === tab);
    });
    document.querySelectorAll('.view').forEach(v => {
      v.classList.toggle('active', v.id === 'view-' + tab);
    });

    if (tab === 'dag' && !dagInited) {
      dagInited = true;
      setTimeout(() => {
        DAGRenderer.init(document.getElementById('dag-canvas'));
      }, 50);
    }

    if (tab === 'gantt') {
      setTimeout(() => {
        Charts.renderGantt(document.getElementById('gantt-svg'), ganttCritOnly);
      }, 50);
    }

    if (tab === 'stats') {
      setTimeout(() => {
        Charts.renderFloatHistogram(document.getElementById('float-hist'));
        Charts.renderSubsystemChart(document.getElementById('subsys-chart'));
      }, 50);
    }

    if (tab === 'kahn' && !kahnInited) {
      kahnInited = true;
      setTimeout(() => {
        KahnAnimator.init(document.getElementById('kahn-canvas'));
      }, 50);
    }
  }

  // ── Header stats ──────────────────────────────────────────────
  function renderHeaderStats() {
    const data = HONDA_DATA;
    const cpCount = data.criticalPathNodes.length;
    const stats = [
      { label: 'Nodes', val: data.meta.nodes },
      { label: 'Edges', val: data.meta.edges },
      { label: 'CP Nodes', val: cpCount },
      { label: 'Duration', val: data.projectDuration + 'h' }
    ];
    const el = document.getElementById('header-stats');
    if (el) el.innerHTML = stats.map(s =>
      `<div class="hstat"><span>${s.label}</span><strong>${s.val}</strong></div>`
    ).join('');
  }

  // ── Legend ────────────────────────────────────────────────────
  function buildLegend() {
    const el = document.getElementById('dag-legend');
    if (!el) return;
    el.innerHTML = HONDA_DATA.subsystems.map(s => `
      <div class="legend-row">
        <div class="legend-dot" style="background:${s.color}"></div>
        <span class="legend-label">${s.name}</span>
      </div>
    `).join('') + `
      <div class="legend-row" style="margin-top:.5rem">
        <div class="legend-dot" style="background:#FFD700;outline:2px solid #FFD700;outline-offset:1px"></div>
        <span class="legend-label">Critical Path</span>
      </div>
    `;
  }

  // ── Subsystem filter dropdown ─────────────────────────────────
  function renderSubsystemFilter() {
    const el = document.getElementById('dag-subsys-filter');
    if (!el) return;
    el.innerHTML = '<option value="">All Subsystems</option>' +
      HONDA_DATA.subsystems.map(s =>
        `<option value="${s.id}">${s.name}</option>`
      ).join('');
  }

  // ── CPM Table ─────────────────────────────────────────────────
  function buildTable() {
    tableData = HONDA_DATA.components.map(c => ({
      id: c.id,
      name: c.name,
      sub: c.sub,
      dur: c.dur,
      ES: c.ES, EF: c.EF,
      LS: c.LS, LF: c.LF,
      float: c.float,
      cp: c.onCriticalPath
    }));
    renderTableRows();
  }

  function renderTableRows() {
    let rows = [...tableData];

    // Filter
    if (tableFilter === 'cp')     rows = rows.filter(r => r.cp);
    if (tableFilter === 'noncp')  rows = rows.filter(r => !r.cp);
    if (tableFilter !== 'all' && tableFilter !== 'cp' && tableFilter !== 'noncp') {
      rows = rows.filter(r => r.sub === tableFilter);
    }

    // Search
    if (tableSearch) {
      rows = rows.filter(r =>
        r.id.toLowerCase().includes(tableSearch) ||
        r.name.toLowerCase().includes(tableSearch) ||
        r.sub.toLowerCase().includes(tableSearch)
      );
    }

    // Sort
    rows.sort((a, b) => {
      const av = a[tableSortCol], bv = b[tableSortCol];
      if (typeof av === 'number') return (av - bv) * tableSortDir;
      return (av < bv ? -1 : av > bv ? 1 : 0) * tableSortDir;
    });

    const tbody = document.getElementById('cpm-table-body');
    if (!tbody) return;

    const subsysMap = {};
    HONDA_DATA.subsystems.forEach(s => { subsysMap[s.id] = s; });

    tbody.innerHTML = rows.map(r => {
      const s = subsysMap[r.sub];
      const color = s ? s.color : '#607D8B';
      const bgAlpha = r.cp ? 'rgba(225,6,0,.08)' : '';
      return `
        <tr class="${r.cp ? 'on-cp' : ''}" style="${bgAlpha ? 'background:' + bgAlpha : ''}">
          <td><span class="comp-id">${r.id}</span></td>
          <td><span class="comp-name">${r.name}</span></td>
          <td><span class="sub-badge" style="background:${color}22;color:${color}">${r.sub}</span></td>
          <td class="num-cell">${r.dur}</td>
          <td class="num-cell">${r.ES}</td>
          <td class="num-cell">${r.EF}</td>
          <td class="num-cell">${r.LS}</td>
          <td class="num-cell">${r.LF}</td>
          <td class="num-cell ${r.float === 0 ? 'zero' : 'pos'}">${r.float}</td>
          <td style="text-align:center">${r.cp ? '<span class="cp-star">★</span>' : '<span class="cp-dash">–</span>'}</td>
        </tr>
      `;
    }).join('');
  }

  // ── Stats cards ───────────────────────────────────────────────
  function buildStatsCards() {
    const data = HONDA_DATA;
    const floats = data.components.map(c => c.float);
    const maxFloat = Math.max(...floats);
    const avgFloat = (floats.reduce((a,b) => a+b, 0) / floats.length).toFixed(1);
    const cpCount  = data.criticalPathNodes.length;
    const nonCp    = data.meta.nodes - cpCount;
    const rootN    = data.components.filter(c => c.preds.length === 0).length;
    const leafN    = data.components.filter(c => c.succs.length === 0).length;

    const cards = [
      { label: 'Project Duration', val: data.projectDuration + 'h', cls: 'red', sub: 'critical path length' },
      { label: 'Critical Path Nodes', val: cpCount, cls: 'gold', sub: `float = 0` },
      { label: 'Non-Critical Nodes', val: nonCp, cls: '', sub: `max float ${maxFloat}h` },
      { label: 'Avg Float', val: avgFloat + 'h', cls: 'green', sub: 'slack per component' },
      { label: 'Total Nodes', val: data.meta.nodes, cls: '', sub: 'components' },
      { label: 'Total Edges', val: data.meta.edges, cls: '', sub: 'dependencies' },
      { label: 'Root Nodes', val: rootN, cls: '', sub: 'no prerequisites' },
      { label: 'Leaf Nodes', val: leafN, cls: '', sub: 'final outputs' }
    ];

    const el = document.getElementById('stats-cards');
    if (!el) return;
    el.innerHTML = cards.map(c => `
      <div class="stat-card">
        <div class="stat-label">${c.label}</div>
        <div class="stat-value ${c.cls}">${c.val}</div>
        <div class="stat-sub">${c.sub}</div>
      </div>
    `).join('');
  }

  // ── Kahn play toggle ──────────────────────────────────────────
  function toggleKahnPlay() {
    const btn = document.getElementById('kahn-play-btn');
    if (KahnAnimator.isPlaying) {
      KahnAnimator.pause();
      if (btn) btn.textContent = '▶ Play';
    } else {
      KahnAnimator.play();
      if (btn) btn.textContent = '⏸ Pause';
    }
  }

  return { init };

})();

document.addEventListener('DOMContentLoaded', App.init);
