/* kahn.js – Step-by-step Kahn's Algorithm + CPM animation */

const KahnAnimator = (() => {

  let canvas, ctx;
  let transform = { x: 0, y: 0, scale: 1 };
  let isDragging = false, dragStart = { x: 0, y: 0 };

  // Animation state
  let steps = [];       // precomputed algorithm steps
  let currentStep = 0;
  let isPlaying = false;
  let playTimer = null;
  let speed = 600;      // ms per step

  // Node visual state
  let nodeStates = {};  // 'ready' | 'processing' | 'done' | 'waiting'
  let currentQueue = [];
  let processedOrder = [];
  let positions = {};

  // ── Layout ────────────────────────────────────────────────────
  function computeLayout() {
    // Simplified layout: group by in-degree-based level
    const nodes = {};
    HONDA_DATA.components.forEach(c => { nodes[c.id] = { ...c }; });

    const layer = {};
    HONDA_DATA.topoOrder.forEach(id => {
      const preds = nodes[id]?.preds || [];
      layer[id] = preds.length === 0 ? 0 : Math.max(...preds.map(p => (layer[p] ?? 0))) + 1;
    });

    const layers = {};
    Object.keys(layer).forEach(id => {
      const l = layer[id];
      if (!layers[l]) layers[l] = [];
      layers[l].push(id);
    });

    const numLayers = Math.max(...Object.values(layer)) + 1;
    const CW = 2200, CH = 1500;
    const padX = 100, padY = 60;

    Object.keys(layers).forEach(l => {
      const ids = layers[l];
      const lx = padX + (parseInt(l) / (numLayers - 1)) * (CW - padX * 2);
      ids.forEach((id, i) => {
        const ly = padY + ((i + 1) / (ids.length + 1)) * (CH - padY * 2);
        positions[id] = { x: lx, y: ly };
      });
    });

    return { W: CW, H: CH };
  }

  // ── Precompute Kahn steps ─────────────────────────────────────
  function buildSteps() {
    steps = [];

    const nodes = {};
    HONDA_DATA.components.forEach(c => { nodes[c.id] = { ...c }; });

    const inDeg = {};
    HONDA_DATA.components.forEach(c => { inDeg[c.id] = c.preds.length; });

    const queue = HONDA_DATA.components
      .filter(c => c.preds.length === 0)
      .map(c => c.id)
      .sort();

    const order = [];

    // Step 0: initial state
    steps.push({
      type: 'init',
      queue: [...queue],
      processing: null,
      processed: [],
      description: `Inisialisasi: ${queue.length} root nodes (in-degree = 0) dimasukkan ke queue.`,
      queueSnapshot: [...queue],
      inDegree: { ...inDeg }
    });

    while (queue.length) {
      const node = queue.shift();
      order.push(node);

      // Step: dequeue
      steps.push({
        type: 'dequeue',
        queue: [...queue],
        processing: node,
        processed: [...order],
        description: `Dequeue ${node} (${nodes[node]?.name}). Tambahkan ke topo_order[${order.length - 1}].`,
        queueSnapshot: [...queue],
        inDegree: { ...inDeg }
      });

      // Update successors
      const succs = nodes[node]?.succs || [];
      succs.forEach(s => {
        inDeg[s]--;
        if (inDeg[s] === 0) queue.push(s);
      });

      if (succs.length) {
        steps.push({
          type: 'update',
          queue: [...queue],
          processing: node,
          processed: [...order],
          description: `Kurangi in-degree ${succs.length} successor(s) dari ${node}. ${queue.length} node di queue.`,
          queueSnapshot: [...queue],
          inDegree: { ...inDeg },
          updatedSuccs: [...succs]
        });
      }
    }

    steps.push({
      type: 'done',
      queue: [],
      processing: null,
      processed: [...order],
      description: `✓ Topological sort selesai! ${order.length} node diproses. is_valid = ${order.length === HONDA_DATA.components.length}`,
      queueSnapshot: [],
      inDegree: { ...inDeg }
    });
  }

  // ── Apply step ───────────────────────────────────────────────
  function applyStep(stepIdx) {
    const step = steps[stepIdx];
    if (!step) return;

    // Reset all states
    HONDA_DATA.components.forEach(c => { nodeStates[c.id] = 'waiting'; });

    // Processed = done
    step.processed.forEach(id => { nodeStates[id] = 'done'; });

    // Queue = ready
    step.queueSnapshot.forEach(id => { nodeStates[id] = 'ready'; });

    // Currently processing
    if (step.processing) nodeStates[step.processing] = 'processing';

    currentQueue = step.queueSnapshot;
    processedOrder = step.processed;

    updateInfoPanel(step);
    draw();
  }

  // ── Draw ─────────────────────────────────────────────────────
  function draw() {
    if (!canvas || !ctx) return;
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    ctx.translate(transform.x, transform.y);
    ctx.scale(transform.scale, transform.scale);

    // Edges
    HONDA_DATA.edges.forEach(([from, to]) => {
      const p1 = positions[from], p2 = positions[to];
      if (!p1 || !p2) return;

      const fromState = nodeStates[from];
      const toState   = nodeStates[to];
      const isActive  = fromState === 'processing' || toState === 'processing' ||
                        fromState === 'ready' && toState !== 'done';

      ctx.beginPath();
      const mx = (p1.x + p2.x) / 2;
      const my = (p1.y + p2.y) / 2 - 15;
      ctx.moveTo(p1.x, p1.y);
      ctx.quadraticCurveTo(mx, my, p2.x, p2.y);

      if (fromState === 'done' && toState === 'done') {
        ctx.strokeStyle = 'rgba(76,175,80,.4)';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.6;
      } else if (isActive) {
        ctx.strokeStyle = 'rgba(225,6,0,.8)';
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 1;
      } else {
        ctx.strokeStyle = 'rgba(60,60,80,.5)';
        ctx.lineWidth = 0.7;
        ctx.globalAlpha = 0.4;
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    });

    // Nodes
    HONDA_DATA.components.forEach(comp => {
      const p = positions[comp.id];
      if (!p) return;

      const state = nodeStates[comp.id] || 'waiting';
      const r = 11;

      const colors = {
        waiting:    ['rgba(30,30,40,1)', 'rgba(50,50,70,1)', 'rgba(80,80,110,.4)'],
        ready:      ['rgba(33,150,243,.9)', 'rgba(13,110,200,.9)', 'rgba(33,150,243,.8)'],
        processing: ['rgba(255,100,50,1)', 'rgba(225,6,0,1)', 'rgba(255,100,50,1)'],
        done:       ['rgba(80,175,100,1)', 'rgba(50,140,70,1)', 'rgba(76,175,80,.7)']
      };

      const [fill1, fill2, stroke] = colors[state];

      if (state === 'processing') {
        ctx.shadowColor = 'rgba(225,6,0,.8)';
        ctx.shadowBlur = 20;
      } else if (state === 'ready') {
        ctx.shadowColor = 'rgba(33,150,243,.5)';
        ctx.shadowBlur = 10;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      const g = ctx.createRadialGradient(p.x - r*.3, p.y - r*.3, 0, p.x, p.y, r);
      g.addColorStop(0, fill1);
      g.addColorStop(1, fill2);
      ctx.fillStyle = g;
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.strokeStyle = stroke;
      ctx.lineWidth = state === 'processing' ? 2.5 : 1;
      ctx.stroke();

      // Label
      if (transform.scale > 0.5) {
        ctx.fillStyle = state === 'waiting' ? 'rgba(120,120,160,.7)' : 'rgba(255,255,255,.9)';
        ctx.font = `${transform.scale > 0.8 ? 'bold ' : ''}${Math.round(6.5 / transform.scale * transform.scale)}px IBM Plex Mono, monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (transform.scale > 0.4) {
          ctx.font = 'bold 6px IBM Plex Mono, monospace';
          ctx.fillText(comp.id, p.x, p.y);
        }
      }
    });

    ctx.restore();
  }

  // ── Info panel ────────────────────────────────────────────────
  function updateInfoPanel(step) {
    const stepEl  = document.getElementById('kahn-step-display');
    const descEl  = document.getElementById('kahn-description');
    const queueEl = document.getElementById('kahn-queue-list');
    const procEl  = document.getElementById('kahn-processed-list');

    if (stepEl) stepEl.textContent = `Step ${currentStep + 1} / ${steps.length}`;
    if (descEl) descEl.textContent = step.description;

    if (queueEl) {
      queueEl.innerHTML = step.queueSnapshot.length
        ? step.queueSnapshot.slice(0, 8).map(id => {
            const c = HONDA_DATA.components.find(x => x.id === id);
            return `<div class="queue-item">${id} <span style="color:var(--text2);font-size:.65rem">${c?.name.substring(0,18) || ''}</span></div>`;
          }).join('') + (step.queueSnapshot.length > 8 ? `<div class="queue-item" style="color:var(--text2)">+${step.queueSnapshot.length - 8} more</div>` : '')
        : '<div style="color:var(--text2);font-family:var(--mono);font-size:.7rem;padding:.3rem 0">Queue kosong</div>';
    }

    if (procEl) {
      const lastFive = step.processed.slice(-5).reverse();
      procEl.innerHTML = step.processed.length
        ? `<div class="queue-title">Processed (${step.processed.length})</div>` +
          lastFive.map(id => {
            const c = HONDA_DATA.components.find(x => x.id === id);
            return `<div class="queue-item done">${id} <span style="color:rgba(76,175,80,.7);font-size:.65rem">${c?.name.substring(0,16) || ''}</span></div>`;
          }).join('') +
          (step.processed.length > 5 ? `<div style="color:var(--text2);font-family:var(--mono);font-size:.65rem;padding:.3rem 0">... dan ${step.processed.length - 5} lainnya</div>` : '')
        : '';
    }

    // Progress bar
    const progress = document.getElementById('kahn-progress');
    if (progress) {
      progress.value = currentStep;
      progress.max = steps.length - 1;
    }
  }

  // ── Pan / zoom events ─────────────────────────────────────────
  function attachEvents() {
    canvas.addEventListener('mousedown', e => {
      isDragging = true;
      canvas.style.cursor = 'grabbing';
      dragStart = { x: e.clientX - transform.x, y: e.clientY - transform.y };
    });
    canvas.addEventListener('mousemove', e => {
      if (!isDragging) return;
      transform.x = e.clientX - dragStart.x;
      transform.y = e.clientY - dragStart.y;
      draw();
    });
    canvas.addEventListener('mouseup', () => { isDragging = false; canvas.style.cursor = 'grab'; });
    canvas.addEventListener('mouseleave', () => { isDragging = false; });
    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.min(3, Math.max(0.1, transform.scale * delta));
      transform.x = mx - (mx - transform.x) * (newScale / transform.scale);
      transform.y = my - (my - transform.y) * (newScale / transform.scale);
      transform.scale = newScale;
      draw();
    }, { passive: false });
  }

  return {
    init(canvasEl) {
      canvas = canvasEl;
      ctx = canvas.getContext('2d');

      const resize = () => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        // Fit transform
        const layout = { W: 2200, H: 1500 };
        const fitScale = Math.min(canvas.offsetWidth / layout.W, canvas.offsetHeight / layout.H) * 0.9;
        transform = {
          scale: fitScale,
          x: (canvas.offsetWidth - layout.W * fitScale) / 2,
          y: (canvas.offsetHeight - layout.H * fitScale) / 2
        };
        draw();
      };

      computeLayout();
      buildSteps();

      // Init node states
      HONDA_DATA.components.forEach(c => { nodeStates[c.id] = 'waiting'; });
      applyStep(0);

      attachEvents();
      resize();
      window.addEventListener('resize', resize);
    },

    stepForward() {
      if (currentStep < steps.length - 1) {
        currentStep++;
        applyStep(currentStep);
      }
    },

    stepBack() {
      if (currentStep > 0) {
        currentStep--;
        applyStep(currentStep);
      }
    },

    jumpTo(idx) {
      currentStep = Math.max(0, Math.min(steps.length - 1, idx));
      applyStep(currentStep);
    },

    play() {
      if (isPlaying) return;
      isPlaying = true;
      const tick = () => {
        if (!isPlaying || currentStep >= steps.length - 1) {
          isPlaying = false;
          const btn = document.getElementById('kahn-play-btn');
          if (btn) btn.textContent = '▶ Play';
          return;
        }
        currentStep++;
        applyStep(currentStep);
        playTimer = setTimeout(tick, speed);
      };
      playTimer = setTimeout(tick, speed);
    },

    pause() {
      isPlaying = false;
      clearTimeout(playTimer);
    },

    reset() {
      isPlaying = false;
      clearTimeout(playTimer);
      currentStep = 0;
      HONDA_DATA.components.forEach(c => { nodeStates[c.id] = 'waiting'; });
      applyStep(0);
      const btn = document.getElementById('kahn-play-btn');
      if (btn) btn.textContent = '▶ Play';
    },

    setSpeed(ms) { speed = ms; },

    get isPlaying() { return isPlaying; },
    get totalSteps() { return steps.length; }
  };

})();
