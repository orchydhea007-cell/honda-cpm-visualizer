/* charts.js – Gantt chart + stats visualizations */

const Charts = (() => {

  // ── Gantt Chart ───────────────────────────────────────────────
  function renderGantt(svgEl, filterCritical = false) {
    const comps = filterCritical
      ? HONDA_DATA.components.filter(c => c.onCriticalPath)
      : HONDA_DATA.components;

    const sorted = [...comps].sort((a, b) => a.ES - b.ES || a.id.localeCompare(b.id));

    const rowH     = 22;
    const labelW   = 160;
    const padding  = { top: 50, right: 30, bottom: 30, left: labelW + 10 };
    const barTrack = 16;
    const maxTime  = HONDA_DATA.projectDuration;
    const timelineW = svgEl.parentElement.clientWidth - padding.left - padding.right - 20 || 900;
    const chartH   = sorted.length * rowH + padding.top + padding.bottom;
    const totalW   = timelineW + padding.left + padding.right;

    svgEl.setAttribute('width', totalW);
    svgEl.setAttribute('height', chartH);
    svgEl.innerHTML = '';

    const ns = 'http://www.w3.org/2000/svg';
    const g = (tag, attrs = {}) => {
      const el = document.createElementNS(ns, tag);
      Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
      return el;
    };

    // Background
    const bg = g('rect', { width: totalW, height: chartH, fill: '#0A0A0C' });
    svgEl.appendChild(bg);

    // Timeline ticks
    const tickGroup = g('g');
    const tickCount = 20;
    for (let i = 0; i <= tickCount; i++) {
      const t = (i / tickCount) * maxTime;
      const x = padding.left + (t / maxTime) * timelineW;

      // Gridline
      const line = g('line', {
        x1: x, y1: padding.top - 20,
        x2: x, y2: chartH - padding.bottom,
        stroke: 'rgba(42,42,56,.7)', 'stroke-width': 1
      });
      tickGroup.appendChild(line);

      // Label
      if (i % 4 === 0) {
        const txt = g('text', {
          x, y: padding.top - 28,
          fill: '#A0A0C0',
          'font-family': 'IBM Plex Mono, monospace',
          'font-size': '9',
          'text-anchor': 'middle'
        });
        txt.textContent = `${Math.round(t)}h`;
        tickGroup.appendChild(txt);
      }
    }
    svgEl.appendChild(tickGroup);

    // Header
    const hdr = g('text', {
      x: padding.left + timelineW / 2,
      y: padding.top - 30,
      fill: '#C0C0D8',
      'font-family': 'Barlow Condensed, sans-serif',
      'font-size': '11',
      'font-weight': '700',
      'letter-spacing': '2',
      'text-transform': 'uppercase',
      'text-anchor': 'middle'
    });
    hdr.textContent = filterCritical
      ? `CRITICAL PATH – ${sorted.length} COMPONENTS · ${maxTime}h`
      : `ALL ${sorted.length} COMPONENTS · PROJECT DURATION ${maxTime}h`;
    svgEl.appendChild(hdr);

    // Bars
    sorted.forEach((comp, i) => {
      const y = padding.top + i * rowH;
      const barY = y + (rowH - barTrack) / 2;

      // Row background (alternate)
      const rowBg = g('rect', {
        x: 0, y,
        width: totalW, height: rowH,
        fill: i % 2 === 0 ? 'rgba(17,17,22,.5)' : 'rgba(14,14,18,.5)'
      });
      svgEl.appendChild(rowBg);

      // Float bar (LS → LF)
      if (comp.float > 0) {
        const floatX = padding.left + (comp.LS / maxTime) * timelineW;
        const floatW = Math.max(1, (comp.float / maxTime) * timelineW);
        const floatBar = g('rect', {
          x: floatX, y: barY,
          width: floatW, height: barTrack,
          rx: 2,
          fill: 'rgba(90,90,114,.3)',
          stroke: 'rgba(90,90,114,.2)',
          'stroke-width': 0.5
        });
        svgEl.appendChild(floatBar);
      }

      // Activity bar (ES → EF)
      const barX = padding.left + (comp.ES / maxTime) * timelineW;
      const barW = Math.max(3, (comp.dur / maxTime) * timelineW);

      const subsys = HONDA_DATA.subsystems.find(s => s.id === comp.sub);
      const baseColor = subsys ? subsys.color : '#607D8B';
      const barColor = comp.onCriticalPath ? '#E10600' : baseColor;

      const bar = g('rect', {
        x: barX, y: barY,
        width: barW, height: barTrack,
        rx: 2,
        fill: barColor,
        opacity: comp.onCriticalPath ? '1' : '0.7'
      });
      bar.style.cursor = 'pointer';
      svgEl.appendChild(bar);

      // Critical path marker
      if (comp.onCriticalPath) {
        const star = g('text', {
          x: barX - 8, y: barY + barTrack / 2 + 3.5,
          fill: '#FFD700', 'font-size': '8', 'text-anchor': 'middle'
        });
        star.textContent = '★';
        svgEl.appendChild(star);
      }

      // Bar label
      if (barW > 22) {
        const lbl = g('text', {
          x: barX + barW / 2, y: barY + barTrack / 2 + 3.5,
          fill: 'rgba(255,255,255,.9)',
          'font-family': 'IBM Plex Mono, monospace',
          'font-size': '7',
          'font-weight': '600',
          'text-anchor': 'middle'
        });
        lbl.textContent = comp.id;
        svgEl.appendChild(lbl);
      }

      // Component name label
      const nameLbl = g('text', {
        x: padding.left - 6, y: barY + barTrack / 2 + 3.5,
        fill: comp.onCriticalPath ? '#FFD700' : '#7070A0',
        'font-family': 'IBM Plex Mono, monospace',
        'font-size': '8',
        'text-anchor': 'end',
        'font-weight': comp.onCriticalPath ? '600' : '400'
      });
      nameLbl.textContent = comp.id;
      svgEl.appendChild(nameLbl);
    });

    // Current time line (project end)
    const endLine = g('line', {
      x1: padding.left + timelineW,
      y1: padding.top - 20,
      x2: padding.left + timelineW,
      y2: chartH - padding.bottom,
      stroke: '#E10600', 'stroke-width': 1.5,
      'stroke-dasharray': '4,3'
    });
    svgEl.appendChild(endLine);
  }

  // ── Float Histogram ───────────────────────────────────────────
  function renderFloatHistogram(canvasEl) {
    const floats = HONDA_DATA.components.map(c => c.float);
    const maxFloat = Math.max(...floats);
    const binCount = Math.min(20, maxFloat + 1);
    const bins = Array(binCount).fill(0);
    const binSize = (maxFloat + 1) / binCount;

    floats.forEach(f => {
      const bin = Math.min(binCount - 1, Math.floor(f / binSize));
      bins[bin]++;
    });

    const ctx = canvasEl.getContext('2d');
    const W = canvasEl.offsetWidth || 400;
    const H = canvasEl.offsetHeight || 200;
    canvasEl.width = W;
    canvasEl.height = H;

    ctx.clearRect(0, 0, W, H);

    const padL = 35, padB = 35, padT = 15, padR = 10;
    const chartW = W - padL - padR;
    const chartH = H - padB - padT;
    const maxBin = Math.max(...bins);
    const barW = chartW / binCount - 2;

    bins.forEach((count, i) => {
      const x = padL + i * (chartW / binCount);
      const bh = (count / maxBin) * chartH;
      const y = padT + chartH - bh;
      const binStart = Math.round(i * binSize);

      ctx.fillStyle = binStart === 0 ? '#E10600' : 'rgba(33,150,243,.6)';
      ctx.fillRect(x + 1, y, barW, bh);
      ctx.strokeStyle = 'rgba(255,255,255,.1)';
      ctx.strokeRect(x + 1, y, barW, bh);
    });

    // Axes
    ctx.strokeStyle = 'rgba(120,120,160,.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, padT + chartH);
    ctx.lineTo(padL + chartW, padT + chartH);
    ctx.stroke();

    // X labels
    ctx.fillStyle = '#A0A0C0';
    ctx.font = '9px IBM Plex Mono, monospace';
    ctx.textAlign = 'center';
    for (let i = 0; i < binCount; i += 4) {
      const x = padL + i * (chartW / binCount) + barW / 2;
      ctx.fillText(Math.round(i * binSize), x, padT + chartH + 14);
    }

    // Y labels
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const y = padT + chartH - (i / 4) * chartH;
      ctx.fillText(Math.round((i / 4) * maxBin), padL - 4, y + 3);
    }

    // Zero line label
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 9px IBM Plex Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('CP', padL + (chartW / binCount) / 2, padT + chartH + 14);
  }

  // ── Subsystem Duration Chart ──────────────────────────────────
  function renderSubsystemChart(canvasEl) {
    const subGroups = {};
    HONDA_DATA.components.forEach(c => {
      if (!subGroups[c.sub]) subGroups[c.sub] = { total: 0, critical: 0, count: 0 };
      subGroups[c.sub].total += c.dur;
      subGroups[c.sub].count++;
      if (c.onCriticalPath) subGroups[c.sub].critical++;
    });

    const subsysInfo = HONDA_DATA.subsystems;
    const labels = subsysInfo.map(s => s.name.split('/')[0].trim().substring(0, 10));
    const totals = subsysInfo.map(s => subGroups[s.id]?.total || 0);
    const crits  = subsysInfo.map(s => subGroups[s.id]?.critical || 0);
    const colors = subsysInfo.map(s => s.color);

    const ctx = canvasEl.getContext('2d');
    const W = canvasEl.offsetWidth || 400;
    const H = canvasEl.offsetHeight || 200;
    canvasEl.width = W;
    canvasEl.height = H;

    ctx.clearRect(0, 0, W, H);

    const padL = 50, padB = 55, padT = 15, padR = 10;
    const chartW = W - padL - padR;
    const chartH = H - padB - padT;
    const maxVal = Math.max(...totals);
    const n = labels.length;
    const groupW = chartW / n;
    const barW   = groupW * 0.5;

    totals.forEach((val, i) => {
      const x = padL + i * groupW + groupW / 2 - barW / 2;
      const bh = (val / maxVal) * chartH;
      const y = padT + chartH - bh;

      ctx.fillStyle = colors[i] + 'AA';
      ctx.fillRect(x, y, barW, bh);
      ctx.strokeStyle = colors[i];
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, barW, bh);

      // Critical overlay
      if (crits[i] > 0) {
        const subG = subGroups[subsysInfo[i].id];
        const critH = (subG.critical / subG.count) * bh;
        ctx.fillStyle = '#E10600AA';
        ctx.fillRect(x, y + bh - critH, barW, critH);
      }

      // Value
      ctx.fillStyle = colors[i];
      ctx.font = 'bold 8px IBM Plex Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(val + 'h', x + barW / 2, y - 3);

      // Label
      ctx.fillStyle = '#A0A0C0';
      ctx.font = '8px IBM Plex Mono, monospace';
      ctx.save();
      ctx.translate(x + barW / 2, padT + chartH + 8);
      ctx.rotate(-Math.PI / 4);
      ctx.fillText(labels[i], 0, 0);
      ctx.restore();
    });

    // Axes
    ctx.strokeStyle = 'rgba(120,120,160,.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, padT + chartH);
    ctx.lineTo(padL + chartW, padT + chartH);
    ctx.stroke();

    ctx.fillStyle = '#A0A0C0';
    ctx.font = '8px IBM Plex Mono, monospace';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const y = padT + chartH - (i / 4) * chartH;
      ctx.fillText(Math.round((i / 4) * maxVal) + 'h', padL - 4, y + 3);
    }
  }

  return { renderGantt, renderFloatHistogram, renderSubsystemChart };

})();
