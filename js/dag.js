/* dag.js – Canvas-based DAG renderer with pan/zoom */

const DAGRenderer = (() => {

  let canvas, ctx;
  let transform = { x: 0, y: 0, scale: 1 };
  let isDragging = false, dragStart = { x: 0, y: 0 };
  let positions = {};
  let hoveredNode = null;
  let selectedNode = null;
  let animFrame = null;
  let showCriticalOnly = false;
  let highlightSubsystem = null;

  const NODE_R = 12;
  const CRIT_R = 14;

  // ── Layout: hierarchical layered ─────────────────────────────
  function computeLayout(nodes, order) {
    // Assign layer = longest path from root
    const layer = {};
    order.forEach(id => {
      const preds = nodes[id].preds;
      layer[id] = preds.length === 0 ? 0 : Math.max(...preds.map(p => (layer[p] || 0))) + 1;
    });

    // Group by layer
    const layers = {};
    Object.keys(layer).forEach(id => {
      const l = layer[id];
      if (!layers[l]) layers[l] = [];
      layers[l].push(id);
    });

    const maxLayer = Math.max(...Object.values(layer));
    const W = 2400, H = 1600;
    const padX = 120, padY = 80;
    const layerW = (W - padX * 2) / (maxLayer + 1);

    Object.keys(layers).forEach(l => {
      const ids = layers[l];
      const layerH = (H - padY * 2) / (ids.length + 1);
      ids.forEach((id, i) => {
        positions[id] = {
          x: padX + parseInt(l) * layerW + layerW / 2,
          y: padY + (i + 1) * layerH
        };
      });
    });

    return { W, H };
  }

  // ── Draw ─────────────────────────────────────────────────────
  function draw() {
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    ctx.translate(transform.x, transform.y);
    ctx.scale(transform.scale, transform.scale);

    const data = HONDA_DATA;
    const subsysMap = {};
    data.subsystems.forEach(s => { subsysMap[s.id] = s.color; });

    const getColor = (comp) => {
      if (comp.sub in subsysMap) return subsysMap[comp.sub];
      // fallback by subsystem name
      const match = data.subsystems.find(s => s.name.toLowerCase().includes(comp.sub.toLowerCase()));
      return match ? match.color : '#607D8B';
    };

    // Draw edges first
    data.edges.forEach(([from, to]) => {
      const p1 = positions[from], p2 = positions[to];
      if (!p1 || !p2) return;

      const isCritical = data.components.find(c => c.id === from)?.onCriticalPath &&
                         data.components.find(c => c.id === to)?.onCriticalPath;

      if (showCriticalOnly && !isCritical) return;

      const isHighlighted =
        (selectedNode && (from === selectedNode || to === selectedNode)) ||
        hoveredNode && (from === hoveredNode || to === hoveredNode);

      ctx.beginPath();
      // Curved edge
      const mx = (p1.x + p2.x) / 2;
      const my = (p1.y + p2.y) / 2 - 15;
      ctx.moveTo(p1.x, p1.y);
      ctx.quadraticCurveTo(mx, my, p2.x, p2.y);

      if (isHighlighted) {
        ctx.strokeStyle = isCritical ? '#FFD700' : 'rgba(255,255,255,.6)';
        ctx.lineWidth = isCritical ? 2 : 1.5;
        ctx.globalAlpha = 1;
      } else if (isCritical) {
        ctx.strokeStyle = 'rgba(225,6,0,.6)';
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 1;
      } else {
        ctx.strokeStyle = 'rgba(90,90,114,.4)';
        ctx.lineWidth = 0.8;
        ctx.globalAlpha = highlightSubsystem ? 0.15 : 0.7;
      }

      ctx.stroke();
      ctx.globalAlpha = 1;

      // Arrowhead
      const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
      const r = data.components.find(c => c.id === to)?.onCriticalPath ? CRIT_R : NODE_R;
      const ax = p2.x - (r + 4) * Math.cos(angle);
      const ay = p2.y - (r + 4) * Math.sin(angle);
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax - 7 * Math.cos(angle - 0.4), ay - 7 * Math.sin(angle - 0.4));
      ctx.lineTo(ax - 7 * Math.cos(angle + 0.4), ay - 7 * Math.sin(angle + 0.4));
      ctx.closePath();
      if (isCritical && !isHighlighted) {
        ctx.fillStyle = 'rgba(225,6,0,.5)';
      } else if (isHighlighted) {
        ctx.fillStyle = isCritical ? '#FFD700' : 'rgba(255,255,255,.5)';
      } else {
        ctx.fillStyle = 'rgba(90,90,114,.4)';
      }
      ctx.globalAlpha = highlightSubsystem ? 0.15 : 1;
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    // Draw nodes
    data.components.forEach(comp => {
      const p = positions[comp.id];
      if (!p) return;

      const isSelected = comp.id === selectedNode;
      const isHovered = comp.id === hoveredNode;
      const isCrit = comp.onCriticalPath;
      const r = isCrit ? CRIT_R : NODE_R;
      const isDimmed = highlightSubsystem && comp.sub !== highlightSubsystem;

      if (showCriticalOnly && !isCrit) return;

      ctx.globalAlpha = isDimmed ? 0.15 : 1;

      // Shadow for critical
      if (isCrit && !isDimmed) {
        ctx.shadowColor = 'rgba(225,6,0,.5)';
        ctx.shadowBlur = isSelected || isHovered ? 20 : 10;
      }

      // Node circle
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);

      const color = getColor(comp);
      const gradient = ctx.createRadialGradient(p.x - r*0.3, p.y - r*0.3, 0, p.x, p.y, r);
      gradient.addColorStop(0, lighten(color, 0.3));
      gradient.addColorStop(1, color);
      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.shadowBlur = 0;

      // Border
      ctx.strokeStyle = isSelected ? '#FFD700' :
                         isHovered ? 'rgba(255,255,255,.8)' :
                         isCrit ? 'rgba(255,215,0,.7)' : 'rgba(255,255,255,.15)';
      ctx.lineWidth = isSelected || isHovered ? 2.5 : isCrit ? 1.5 : 0.5;
      ctx.stroke();

      // Label
      if (transform.scale > 0.5) {
        ctx.fillStyle = 'rgba(255,255,255,.9)';
        ctx.font = `bold ${transform.scale > 0.8 ? 7 : 6}px IBM Plex Mono, monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(comp.id, p.x, p.y);
      }

      ctx.globalAlpha = 1;
    });

    ctx.restore();
  }

  function lighten(hex, amount) {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return `rgb(${Math.min(255,r+Math.round(255*amount))},${Math.min(255,g+Math.round(255*amount))},${Math.min(255,b+Math.round(255*amount))})`;
  }

  // ── Hit test ─────────────────────────────────────────────────
  function hitTest(mx, my) {
    const wx = (mx - transform.x) / transform.scale;
    const wy = (my - transform.y) / transform.scale;
    for (const comp of HONDA_DATA.components) {
      const p = positions[comp.id];
      if (!p) continue;
      const r = comp.onCriticalPath ? CRIT_R + 4 : NODE_R + 4;
      if ((wx - p.x)**2 + (wy - p.y)**2 <= r**2) return comp.id;
    }
    return null;
  }

  // ── Events ───────────────────────────────────────────────────
  function attachEvents() {
    canvas.addEventListener('mousedown', e => {
      const hit = hitTest(e.offsetX, e.offsetY);
      if (hit) {
        selectedNode = hit;
        showNodeDetail(hit);
        draw();
        return;
      }
      isDragging = true;
      canvas.classList.add('grabbing');
      dragStart = { x: e.clientX - transform.x, y: e.clientY - transform.y };
    });

    canvas.addEventListener('mousemove', e => {
      if (isDragging) {
        transform.x = e.clientX - dragStart.x;
        transform.y = e.clientY - dragStart.y;
        cancelAnimationFrame(animFrame);
        animFrame = requestAnimationFrame(draw);
        return;
      }
      const hit = hitTest(e.offsetX, e.offsetY);
      if (hit !== hoveredNode) {
        hoveredNode = hit;
        if (hit) showTooltip(hit, e.clientX, e.clientY);
        else hideTooltip();
        cancelAnimationFrame(animFrame);
        animFrame = requestAnimationFrame(draw);
      } else if (hit) {
        moveTooltip(e.clientX, e.clientY);
      }
    });

    canvas.addEventListener('mouseup', () => {
      isDragging = false;
      canvas.classList.remove('grabbing');
    });

    canvas.addEventListener('mouseleave', () => {
      isDragging = false;
      canvas.classList.remove('grabbing');
      hoveredNode = null;
      hideTooltip();
      draw();
    });

    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.min(3, Math.max(0.1, transform.scale * delta));
      transform.x = mx - (mx - transform.x) * (newScale / transform.scale);
      transform.y = my - (my - transform.y) * (newScale / transform.scale);
      transform.scale = newScale;
      cancelAnimationFrame(animFrame);
      animFrame = requestAnimationFrame(draw);
    }, { passive: false });

    // Touch support
    let lastTouchDist = 0;
    canvas.addEventListener('touchstart', e => {
      if (e.touches.length === 2) {
        lastTouchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      } else {
        const rect = canvas.getBoundingClientRect();
        isDragging = true;
        dragStart = { x: e.touches[0].clientX - transform.x, y: e.touches[0].clientY - transform.y };
      }
    });
    canvas.addEventListener('touchmove', e => {
      e.preventDefault();
      if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const delta = dist / lastTouchDist;
        transform.scale = Math.min(3, Math.max(0.1, transform.scale * delta));
        lastTouchDist = dist;
      } else if (isDragging) {
        transform.x = e.touches[0].clientX - dragStart.x;
        transform.y = e.touches[0].clientY - dragStart.y;
      }
      draw();
    }, { passive: false });
    canvas.addEventListener('touchend', () => { isDragging = false; });
  }

  // ── Tooltip ──────────────────────────────────────────────────
  function showTooltip(id, mx, my) {
    const comp = HONDA_DATA.components.find(c => c.id === id);
    if (!comp) return;
    const tt = document.getElementById('tooltip');
    tt.innerHTML = `
      <div class="tt-id">${comp.id} · ${comp.sub}</div>
      <div class="tt-name">${comp.name}</div>
      <div class="tt-grid">
        <span class="tt-key">Duration</span><span class="tt-val">${comp.dur} hrs</span>
        <span class="tt-key">ES</span><span class="tt-val">${comp.ES}</span>
        <span class="tt-key">EF</span><span class="tt-val">${comp.EF}</span>
        <span class="tt-key">LS</span><span class="tt-val">${comp.LS}</span>
        <span class="tt-key">LF</span><span class="tt-val">${comp.LF}</span>
        <span class="tt-key">Float</span>
        <span class="tt-val ${comp.onCriticalPath ? 'critical' : ''}">${comp.float} ${comp.onCriticalPath ? '★ CP' : ''}</span>
      </div>
    `;
    moveTooltip(mx, my);
    tt.classList.add('show');
  }

  function moveTooltip(mx, my) {
    const tt = document.getElementById('tooltip');
    const pad = 14;
    let tx = mx + pad, ty = my + pad;
    if (tx + 290 > window.innerWidth) tx = mx - 290 - pad;
    if (ty + 160 > window.innerHeight) ty = my - 160 - pad;
    tt.style.left = tx + 'px';
    tt.style.top  = ty + 'px';
  }

  function hideTooltip() {
    document.getElementById('tooltip').classList.remove('show');
  }

  // ── Node detail panel ─────────────────────────────────────────
  function showNodeDetail(id) {
    const comp = HONDA_DATA.components.find(c => c.id === id);
    if (!comp) return;
    const panel = document.getElementById('node-detail');

    const predNames = comp.preds.map(pid => {
      const c = HONDA_DATA.components.find(x => x.id === pid);
      return `${pid} ${c ? '– ' + c.name.substring(0,22) : ''}`;
    }).join('\n');

    const succNames = comp.succs.map(sid => {
      const c = HONDA_DATA.components.find(x => x.id === sid);
      return `${sid} ${c ? '– ' + c.name.substring(0,22) : ''}`;
    }).join('\n');

    panel.innerHTML = `
      <button class="nd-close" onclick="document.getElementById('node-detail').classList.remove('show')">✕</button>
      <div class="nd-id">${comp.id} · ${comp.sub}</div>
      <div class="nd-name">${comp.name}</div>
      <table class="nd-table">
        <tr><td>Duration</td><td>${comp.dur} hrs</td></tr>
        <tr><td>Earliest Start</td><td>${comp.ES}</td></tr>
        <tr><td>Earliest Finish</td><td>${comp.EF}</td></tr>
        <tr><td>Latest Start</td><td>${comp.LS}</td></tr>
        <tr><td>Latest Finish</td><td>${comp.LF}</td></tr>
        <tr><td>Total Float</td><td class="${comp.onCriticalPath ? 'cp' : ''}">${comp.float}${comp.onCriticalPath ? ' ★' : ''}</td></tr>
        <tr><td>Predecessors</td><td>${comp.preds.length}</td></tr>
        <tr><td>Successors</td><td>${comp.succs.length}</td></tr>
      </table>
      ${comp.preds.length ? `<div class="nd-deps"><div class="nd-deps-title">Depends On</div><div class="nd-deps-list">${predNames}</div></div>` : ''}
      ${comp.succs.length ? `<div class="nd-deps"><div class="nd-deps-title">Required By</div><div class="nd-deps-list">${succNames}</div></div>` : ''}
    `;
    panel.classList.add('show');
  }

  // ── Public API ───────────────────────────────────────────────
  return {
    init(canvasEl) {
      canvas = canvasEl;
      ctx = canvas.getContext('2d');

      const resize = () => {
        canvas.width  = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        draw();
      };

      const nodes = {};
      HONDA_DATA.components.forEach(c => {
        nodes[c.id] = { ...c };
      });
      const layout = computeLayout(nodes, HONDA_DATA.topoOrder);

      // Initial transform: fit to viewport
      const fitScale = Math.min(
        canvas.offsetWidth  / layout.W,
        canvas.offsetHeight / layout.H
      ) * 0.9;
      transform = {
        scale: fitScale,
        x: (canvas.offsetWidth  - layout.W * fitScale) / 2,
        y: (canvas.offsetHeight - layout.H * fitScale) / 2
      };

      resize();
      attachEvents();
      window.addEventListener('resize', resize);
    },

    zoomIn()  { transform.scale = Math.min(3, transform.scale * 1.2); draw(); },
    zoomOut() { transform.scale = Math.max(0.1, transform.scale * 0.8); draw(); },
    resetView() {
      const layout = { W: 2400, H: 1600 };
      const fitScale = Math.min(
        canvas.offsetWidth / layout.W,
        canvas.offsetHeight / layout.H
      ) * 0.9;
      transform = {
        scale: fitScale,
        x: (canvas.offsetWidth  - layout.W * fitScale) / 2,
        y: (canvas.offsetHeight - layout.H * fitScale) / 2
      };
      draw();
    },

    setCriticalOnly(v) { showCriticalOnly = v; draw(); },
    setHighlightSubsystem(s) { highlightSubsystem = s || null; draw(); },

    focusCriticalPath() {
      const cpNodes = HONDA_DATA.components.filter(c => c.onCriticalPath);
      if (!cpNodes.length) return;
      const xs = cpNodes.map(c => positions[c.id]?.x).filter(Boolean);
      const ys = cpNodes.map(c => positions[c.id]?.y).filter(Boolean);
      const minX = Math.min(...xs), maxX = Math.max(...xs);
      const minY = Math.min(...ys), maxY = Math.max(...ys);
      const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
      const fitScale = Math.min(
        canvas.offsetWidth  / ((maxX - minX) + 200),
        canvas.offsetHeight / ((maxY - minY) + 200)
      ) * 0.85;
      transform = {
        scale: Math.min(2, fitScale),
        x: canvas.offsetWidth  / 2 - cx * Math.min(2, fitScale),
        y: canvas.offsetHeight / 2 - cy * Math.min(2, fitScale)
      };
      draw();
    },

    redraw: draw
  };

})();
