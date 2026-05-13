function createSvgElement(name) {
  return document.createElementNS("http://www.w3.org/2000/svg", name);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatPercent(value, digits = 1) {
  return `${(value * 100).toFixed(digits)}%`;
}

function formatNumber(value, digits = 4) {
  return Number(value).toFixed(digits);
}

function renderSliderControl({ key, label, min, max, step, value }) {
  return `
    <label class="slider-control">
      <span class="slider-label">
        <span>${label}</span>
        <span data-value="${key}"></span>
      </span>
      <input type="range" min="${min}" max="${max}" step="${step}" value="${value}" data-key="${key}" />
    </label>
  `;
}

function drawAxes(svg, x1, y1, x2, y2, labels = {}) {
  const axisGroup = createSvgElement("g");
  axisGroup.setAttribute("stroke", "#8d877e");
  axisGroup.setAttribute("stroke-width", "1.2");

  const xAxis = createSvgElement("line");
  xAxis.setAttribute("x1", x1);
  xAxis.setAttribute("y1", y2);
  xAxis.setAttribute("x2", x2);
  xAxis.setAttribute("y2", y2);
  axisGroup.append(xAxis);

  const yAxis = createSvgElement("line");
  yAxis.setAttribute("x1", x1);
  yAxis.setAttribute("y1", y1);
  yAxis.setAttribute("x2", x1);
  yAxis.setAttribute("y2", y2);
  axisGroup.append(yAxis);

  svg.append(axisGroup);

  const textGroup = createSvgElement("g");
  textGroup.setAttribute("fill", "#5d5a54");
  textGroup.setAttribute("font-size", "12");
  textGroup.setAttribute("font-family", "Inter, Noto Sans KR, sans-serif");

  Object.entries(labels).forEach(([text, attrs]) => {
    const el = createSvgElement("text");
    el.textContent = text;
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    textGroup.append(el);
  });

  svg.append(textGroup);
}

function drawPlotFrame(svg, plot) {
  const rect = createSvgElement("rect");
  rect.setAttribute("x", plot.left);
  rect.setAttribute("y", plot.top);
  rect.setAttribute("width", plot.right - plot.left);
  rect.setAttribute("height", plot.bottom - plot.top);
  rect.setAttribute("rx", "14");
  rect.setAttribute("fill", "rgba(250, 247, 241, 0.92)");
  rect.setAttribute("stroke", "#ebe3d6");
  rect.setAttribute("stroke-width", "1");
  svg.append(rect);
}

function drawGrid(svg, plot, xValues, yValues, xFor, yFor) {
  const grid = createSvgElement("g");
  grid.setAttribute("stroke", "#e7e0d5");
  grid.setAttribute("stroke-width", "1");
  grid.setAttribute("stroke-dasharray", "4 5");

  xValues.forEach((value) => {
    const x = xFor(value);
    const line = createSvgElement("line");
    line.setAttribute("x1", x);
    line.setAttribute("y1", plot.top);
    line.setAttribute("x2", x);
    line.setAttribute("y2", plot.bottom);
    grid.append(line);
  });

  yValues.forEach((value) => {
    const y = yFor(value);
    const line = createSvgElement("line");
    line.setAttribute("x1", plot.left);
    line.setAttribute("y1", y);
    line.setAttribute("x2", plot.right);
    line.setAttribute("y2", y);
    grid.append(line);
  });

  svg.append(grid);
}

function drawTickLabels(svg, options) {
  const { plot, xValues = [], yValues = [], xFor, yFor, formatX, formatY } = options;
  const group = createSvgElement("g");
  group.setAttribute("fill", "#6a645b");
  group.setAttribute("font-size", "11");
  group.setAttribute("font-family", "Inter, Noto Sans KR, sans-serif");

  xValues.forEach((value) => {
    const x = xFor(value);
    const tick = createSvgElement("line");
    tick.setAttribute("x1", x);
    tick.setAttribute("y1", plot.bottom);
    tick.setAttribute("x2", x);
    tick.setAttribute("y2", plot.bottom + 6);
    tick.setAttribute("stroke", "#8d877e");
    group.append(tick);

    const label = createSvgElement("text");
    label.textContent = formatX(value);
    label.setAttribute("x", x);
    label.setAttribute("y", plot.bottom + 20);
    label.setAttribute("text-anchor", "middle");
    group.append(label);
  });

  yValues.forEach((value) => {
    const y = yFor(value);
    const tick = createSvgElement("line");
    tick.setAttribute("x1", plot.left - 6);
    tick.setAttribute("y1", y);
    tick.setAttribute("x2", plot.left);
    tick.setAttribute("y2", y);
    tick.setAttribute("stroke", "#8d877e");
    group.append(tick);

    const label = createSvgElement("text");
    label.textContent = formatY(value);
    label.setAttribute("x", plot.left - 10);
    label.setAttribute("y", y + 4);
    label.setAttribute("text-anchor", "end");
    group.append(label);
  });

  svg.append(group);
}

function pathFromPoints(points) {
  return points
    .map(([x, y], index) => `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`)
    .join(" ");
}

function renderPortfolioRiskDemo(root) {
  if (root.dataset.ready === "true") return;
  root.dataset.ready = "true";

  const state = {
    weight: 0.45,
    ex: 0.13,
    ey: 0.07,
    sigmaX: 0.16,
    sigmaY: 0.08,
    rho: 0.2,
  };

  root.innerHTML = `
    <div class="investment-demo">
      <div class="investment-demo-header">
        <div>
          <strong>효율적 투자선과 최소분산포트폴리오</strong>
          <p>같은 두 자산이라도 상관계수와 비중에 따라 \(\sigma_p\)가 달라진다. 그래프에서 아래쪽 굽은 구간 전체가 아니라, MVP 위쪽만 효율적 투자선이다.</p>
        </div>
        <div class="demo-metrics" data-metrics></div>
      </div>
      <div class="investment-demo-stage">
        <svg class="investment-demo-canvas" viewBox="0 0 620 340" role="img" aria-label="포트폴리오 기대수익률과 위험 그래프"></svg>
      </div>
      <div class="slider-grid">
        ${renderSliderControl({ key: "weight", label: "자산 X 비중", min: 0, max: 1, step: 0.01, value: state.weight })}
        ${renderSliderControl({ key: "rho", label: "상관계수", min: -1, max: 1, step: 0.05, value: state.rho })}
      </div>
      <div class="demo-reading" data-reading></div>
    </div>
  `;

  const svg = root.querySelector("svg");
  const metrics = root.querySelector("[data-metrics]");
  const reading = root.querySelector("[data-reading]");

  function expectedReturn(weight) {
    const wx = clamp(weight, 0, 1);
    const wy = 1 - wx;
    return wx * state.ex + wy * state.ey;
  }

  function sigmaFor(weight, rho) {
    const wx = clamp(weight, 0, 1);
    const wy = 1 - wx;
    const variance =
      wx ** 2 * state.sigmaX ** 2 +
      wy ** 2 * state.sigmaY ** 2 +
      2 * wx * wy * state.sigmaX * state.sigmaY * rho;
    return Math.sqrt(Math.max(variance, 0));
  }

  function drawCurve(rho, color, dash = "") {
    const plot = { left: 64, top: 24, right: 580, bottom: 292 };
    const maxSigma = Math.max(state.sigmaX, state.sigmaY, sigmaFor(0.5, -1), sigmaFor(0.5, 1)) * 1.2;
    const minReturn = Math.min(state.ex, state.ey) - 0.02;
    const maxReturn = Math.max(state.ex, state.ey) + 0.04;
    const points = [];

    for (let i = 0; i <= 100; i += 1) {
      const weight = i / 100;
      const sigma = sigmaFor(weight, rho);
      const ret = expectedReturn(weight);
      const x = plot.left + (sigma / maxSigma) * (plot.right - plot.left);
      const y = plot.bottom - ((ret - minReturn) / (maxReturn - minReturn)) * (plot.bottom - plot.top);
      points.push([x, y]);
    }

    const path = createSvgElement("path");
    path.setAttribute("d", pathFromPoints(points));
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", color);
    path.setAttribute("stroke-width", rho === state.rho ? "4" : "2.2");
    if (dash) path.setAttribute("stroke-dasharray", dash);
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    svg.append(path);

    return { plot, maxSigma };
  }

  function draw() {
    svg.innerHTML = "";

    const plot = { left: 64, top: 24, right: 580, bottom: 292 };
    const maxSigma = Math.max(state.sigmaX, state.sigmaY, sigmaFor(0.5, -1), sigmaFor(0.5, 1)) * 1.2;
    const minReturn = 0;
    const maxReturn = Math.max(state.ex, state.ey) + 0.04;
    const xForSigma = (sigma) => plot.left + (sigma / maxSigma) * (plot.right - plot.left);
    const yForReturn = (ret) => plot.bottom - ((ret - minReturn) / (maxReturn - minReturn)) * (plot.bottom - plot.top);

    drawPlotFrame(svg, plot);
    drawAxes(svg, plot.left, plot.top, plot.right, plot.bottom, {
      "위험 σp": { x: plot.right - 16, y: plot.bottom + 28, "text-anchor": "end" },
      "기대수익률 E(Rp)": { x: plot.left - 2, y: plot.top - 8, "text-anchor": "start" },
    });
    const xTicks = [0, maxSigma * 0.25, maxSigma * 0.5, maxSigma * 0.75, maxSigma];
    const yTicks = [0, maxReturn * 0.25, maxReturn * 0.5, maxReturn * 0.75, maxReturn];
    drawGrid(svg, plot, xTicks, yTicks, xForSigma, yForReturn);
    drawTickLabels(svg, {
      plot,
      xValues: xTicks,
      yValues: yTicks,
      xFor: xForSigma,
      yFor: yForReturn,
      formatX: (value) => formatPercent(value, 0),
      formatY: (value) => formatPercent(value, 0),
    });

    drawCurve(1, "#bbb3a7", "8 6");
    drawCurve(-1, "#c8d5ff", "8 6");
    drawCurve(state.rho, "#3366df");

    const mvpWeight = state.rho === -1
      ? state.sigmaY / (state.sigmaX + state.sigmaY)
      : (state.sigmaY ** 2 - state.sigmaX * state.sigmaY * state.rho) /
        (state.sigmaX ** 2 + state.sigmaY ** 2 - 2 * state.sigmaX * state.sigmaY * state.rho);
    const clampedMvpWeight = clamp(mvpWeight, 0, 1);
    const mvpSigma = sigmaFor(clampedMvpWeight, state.rho);
    const mvpReturn = expectedReturn(clampedMvpWeight);

    const currentSigma = sigmaFor(state.weight, state.rho);
    const currentReturn = expectedReturn(state.weight);
    const x = xForSigma(currentSigma);
    const y = yForReturn(currentReturn);

    const assetX = { x: xForSigma(state.sigmaX), y: yForReturn(state.ex) };
    const assetY = { x: xForSigma(state.sigmaY), y: yForReturn(state.ey) };
    const mvp = { x: xForSigma(mvpSigma), y: yForReturn(mvpReturn) };

    const efficientFrontier = createSvgElement("path");
    const frontierPoints = [];
    const start = clampedMvpWeight;
    for (let i = 0; i <= 100; i += 1) {
      const weight = start + ((1 - start) * i) / 100;
      frontierPoints.push([xForSigma(sigmaFor(weight, state.rho)), yForReturn(expectedReturn(weight))]);
    }
    efficientFrontier.setAttribute("d", pathFromPoints(frontierPoints));
    efficientFrontier.setAttribute("fill", "none");
    efficientFrontier.setAttribute("stroke", "#d95c58");
    efficientFrontier.setAttribute("stroke-width", "4.5");
    efficientFrontier.setAttribute("stroke-linecap", "round");
    svg.append(efficientFrontier);

    const crosshair = createSvgElement("g");
    crosshair.setAttribute("stroke", "#8aa8ff");
    crosshair.setAttribute("stroke-dasharray", "5 5");
    const vx = createSvgElement("line");
    vx.setAttribute("x1", x);
    vx.setAttribute("y1", y);
    vx.setAttribute("x2", x);
    vx.setAttribute("y2", plot.bottom);
    crosshair.append(vx);
    const hy = createSvgElement("line");
    hy.setAttribute("x1", plot.left);
    hy.setAttribute("y1", y);
    hy.setAttribute("x2", x);
    hy.setAttribute("y2", y);
    crosshair.append(hy);
    svg.append(crosshair);

    const point = createSvgElement("circle");
    point.setAttribute("cx", x);
    point.setAttribute("cy", y);
    point.setAttribute("r", "6.5");
    point.setAttribute("fill", "#d95c58");
    svg.append(point);

    [
      { ...assetX, fill: "#3366df", r: 5.5, label: "자산 X" },
      { ...assetY, fill: "#171717", r: 5.5, label: "자산 Y" },
      { ...mvp, fill: "#2aa775", r: 6, label: "MVP" },
    ].forEach((item) => {
      const c = createSvgElement("circle");
      c.setAttribute("cx", item.x);
      c.setAttribute("cy", item.y);
      c.setAttribute("r", item.r);
      c.setAttribute("fill", item.fill);
      svg.append(c);

      const t = createSvgElement("text");
      t.textContent = item.label;
      t.setAttribute("x", item.x + 10);
      t.setAttribute("y", item.y - 10);
      t.setAttribute("fill", "#4a4741");
      t.setAttribute("font-size", "12");
      t.setAttribute("font-family", "Inter, Noto Sans KR, sans-serif");
      svg.append(t);
    });

    const legend = createSvgElement("g");
    legend.setAttribute("font-size", "12");
    legend.setAttribute("font-family", "Inter, Noto Sans KR, sans-serif");
    legend.setAttribute("fill", "#4a4741");
    [
      { x: 420, y: 30, color: "#3366df", text: `현재 ρ = ${state.rho.toFixed(2)}`, dash: "" },
      { x: 420, y: 52, color: "#bbb3a7", text: "ρ = +1", dash: "8 6" },
      { x: 420, y: 74, color: "#c8d5ff", text: "ρ = -1", dash: "8 6" },
    ].forEach((item) => {
      const line = createSvgElement("line");
      line.setAttribute("x1", item.x);
      line.setAttribute("y1", item.y);
      line.setAttribute("x2", item.x + 28);
      line.setAttribute("y2", item.y);
      line.setAttribute("stroke", item.color);
      line.setAttribute("stroke-width", "3");
      if (item.dash) line.setAttribute("stroke-dasharray", item.dash);
      legend.append(line);

      const label = createSvgElement("text");
      label.textContent = item.text;
      label.setAttribute("x", item.x + 38);
      label.setAttribute("y", item.y + 4);
      legend.append(label);
    });
    svg.append(legend);

    const note = createSvgElement("g");
    note.setAttribute("font-size", "12");
    note.setAttribute("font-family", "Inter, Noto Sans KR, sans-serif");
    note.setAttribute("fill", "#5b5750");
    const noteText = createSvgElement("text");
    noteText.textContent = "곡선은 위험자산끼리의 결합, 붉은 구간은 실제 선택 대상인 효율적 투자선";
    noteText.setAttribute("x", plot.left);
    noteText.setAttribute("y", plot.top + 16);
    note.append(noteText);
    svg.append(note);

    const wx = state.weight;
    const wy = 1 - wx;
    const variance =
      wx ** 2 * state.sigmaX ** 2 +
      wy ** 2 * state.sigmaY ** 2 +
      2 * wx * wy * state.sigmaX * state.sigmaY * state.rho;
    const sigmaAtPerfectPositive = sigmaFor(state.weight, 1);
    const diversificationGain = Math.max(sigmaAtPerfectPositive - currentSigma, 0);

    metrics.innerHTML = `
      <div class="metric-chip">X: E(R) ${formatPercent(state.ex)} / σ ${formatPercent(state.sigmaX)}</div>
      <div class="metric-chip">Y: E(R) ${formatPercent(state.ey)} / σ ${formatPercent(state.sigmaY)}</div>
      <div class="metric-chip">wX ${formatPercent(wx, 0)}</div>
      <div class="metric-chip">wY ${formatPercent(wy, 0)}</div>
      <div class="metric-chip">MVP 비중 ${formatPercent(clampedMvpWeight, 0)}</div>
      <div class="metric-chip">분산 ${formatNumber(variance)}</div>
      <div class="metric-chip">기대수익률 ${formatPercent(currentReturn)}</div>
      <div class="metric-chip metric-chip-strong">표준편차 ${formatPercent(currentSigma)}</div>
    `;

    reading.innerHTML = `
      <p><strong>읽는 법</strong> 현재 점은 자산 X와 Y를 섞었을 때의 포트폴리오 조합입니다. 초록 점인 MVP는 가능한 조합 중 \(\sigma_p\)가 가장 낮은 지점입니다.</p>
      <p><strong>분산효과</strong> 지금 상관계수 \(${state.rho.toFixed(2)}\)에서는, 같은 비중이라도 \(\rho = 1\)일 때보다 위험이 ${formatPercent(diversificationGain)}만큼 줄어듭니다.</p>
      <p><strong>시험 포인트</strong> MVP 아래쪽은 비효율적 조합이고, 실제 선택 대상은 항상 MVP 위쪽 효율적 투자선입니다.</p>
    `;

    root.querySelector('[data-value="weight"]').textContent = formatPercent(state.weight, 0);
    root.querySelector('[data-value="rho"]').textContent = state.rho.toFixed(2);
  }

  root.querySelectorAll("input[type='range']").forEach((input) => {
    input.addEventListener("input", () => {
      state[input.dataset.key] = Number(input.value);
      draw();
    });
  });

  draw();
}

function renderRiskDecompositionChart(root) {
  if (root.dataset.ready === "true") return;
  root.dataset.ready = "true";

  root.innerHTML = `
    <div class="investment-demo investment-demo-static">
      <div class="investment-demo-header">
        <div>
          <strong>분산투자효과와 위험 분해</strong>
          <p>종목 수가 늘어날수록 비체계적 위험은 줄어들고, 체계적 위험은 남는다.</p>
        </div>
      </div>
      <div class="investment-demo-stage">
        <svg class="investment-demo-canvas" viewBox="0 0 620 340" role="img" aria-label="분산투자효과 그래프"></svg>
      </div>
    </div>
  `;

  const svg = root.querySelector("svg");
  const plot = { left: 72, top: 28, right: 580, bottom: 286 };
  drawPlotFrame(svg, plot);
  drawAxes(svg, plot.left, plot.top, plot.right, plot.bottom, {
    "증권의 수": { x: plot.right - 6, y: plot.bottom + 28, "text-anchor": "end" },
    "포트폴리오 위험": { x: plot.left - 2, y: plot.top - 8, "text-anchor": "start" },
  });

  const totalPoints = [];
  const idioPoints = [];
  const xFor = (value) => plot.left + ((value - 1) / 39) * (plot.right - plot.left);
  const maxRisk = 0.82;
  const minRisk = 0;
  const yFor = (value) => plot.bottom - ((value - minRisk) / (maxRisk - minRisk)) * (plot.bottom - plot.top);
  const systematicRisk = 0.28;

  const xTicks = [1, 10, 20, 30, 40];
  const yTicks = [0, 0.2, 0.4, 0.6, 0.8];
  drawGrid(svg, plot, xTicks, yTicks, xFor, yFor);
  drawTickLabels(svg, {
    plot,
    xValues: xTicks,
    yValues: yTicks,
    xFor,
    yFor,
    formatX: (value) => String(value),
    formatY: (value) => formatPercent(value, 0),
  });

  for (let n = 1; n <= 40; n += 1) {
    const t = (n - 1) / 39;
    const idioRisk = 0.42 * Math.exp(-4.2 * t);
    const totalRisk = systematicRisk + idioRisk;
    totalPoints.push([xFor(n), yFor(totalRisk)]);
    idioPoints.push([xFor(n), yFor(systematicRisk + idioRisk)]);
  }

  const area = createSvgElement("path");
  const areaPoints = [...totalPoints, [xFor(40), yFor(systematicRisk)], [xFor(1), yFor(systematicRisk)]];
  area.setAttribute("d", `${pathFromPoints(areaPoints)} Z`);
  area.setAttribute("fill", "rgba(51, 102, 223, 0.12)");
  area.setAttribute("stroke", "none");
  svg.append(area);

  const totalLine = createSvgElement("path");
  totalLine.setAttribute("d", pathFromPoints(totalPoints));
  totalLine.setAttribute("fill", "none");
  totalLine.setAttribute("stroke", "#2d2d2d");
  totalLine.setAttribute("stroke-width", "3.2");
  svg.append(totalLine);

  const systematicY = yFor(systematicRisk);
  const systematicLine = createSvgElement("line");
  systematicLine.setAttribute("x1", plot.left);
  systematicLine.setAttribute("y1", systematicY);
  systematicLine.setAttribute("x2", plot.right);
  systematicLine.setAttribute("y2", systematicY);
  systematicLine.setAttribute("stroke", "#c94942");
  systematicLine.setAttribute("stroke-width", "2.2");
  systematicLine.setAttribute("stroke-dasharray", "8 6");
  svg.append(systematicLine);

  const idioOnlyPoints = [];
  for (let n = 1; n <= 40; n += 1) {
    const t = (n - 1) / 39;
    const idioRisk = 0.42 * Math.exp(-4.2 * t);
    idioOnlyPoints.push([xFor(n), yFor(systematicRisk + idioRisk)]);
  }
  const idioLine = createSvgElement("path");
  idioLine.setAttribute("d", pathFromPoints(idioOnlyPoints));
  idioLine.setAttribute("fill", "none");
  idioLine.setAttribute("stroke", "#3366df");
  idioLine.setAttribute("stroke-width", "3");
  svg.append(idioLine);

  const labelGroup = createSvgElement("g");
  labelGroup.setAttribute("fill", "#4a4741");
  labelGroup.setAttribute("font-size", "12");
  labelGroup.setAttribute("font-family", "Inter, Noto Sans KR, sans-serif");
  [
    { text: "총위험", x: plot.left + 18, y: yFor(0.74) },
    { text: "분산가능위험(비체계적 위험)", x: plot.left + 186, y: yFor(0.48) },
    { text: "분산불능위험(체계적 위험)", x: plot.left + 218, y: systematicY - 10 },
  ].forEach((item) => {
    const text = createSvgElement("text");
    text.textContent = item.text;
    text.setAttribute("x", item.x);
    text.setAttribute("y", item.y);
    labelGroup.append(text);
  });
  svg.append(labelGroup);
}

function renderCalDemo(root) {
  if (root.dataset.ready === "true") return;
  root.dataset.ready = "true";

  const state = {
    rf: 0.03,
    er: 0.11,
    sigma: 0.16,
    riskAversion: 3.5,
  };

  root.innerHTML = `
    <div class="investment-demo">
      <div class="investment-demo-header">
        <div>
          <strong>자본배분선(CAL)과 최적 선택</strong>
          <p>위험회피 성향이 다르면 같은 CAL 위에서도 선택점이 달라진다. 최적 포트폴리오는 가장 높은 무차별곡선이 CAL에 접하는 점이다.</p>
        </div>
        <div class="demo-metrics" data-metrics></div>
      </div>
      <div class="investment-demo-stage">
        <svg class="investment-demo-canvas" viewBox="0 0 620 340" role="img" aria-label="자본배분선 그래프"></svg>
      </div>
      <div class="slider-grid">
        ${renderSliderControl({ key: "rf", label: "무위험이자율 Rf", min: 0.01, max: 0.08, step: 0.005, value: state.rf })}
        ${renderSliderControl({ key: "er", label: "위험포트폴리오 기대수익률", min: 0.06, max: 0.2, step: 0.005, value: state.er })}
        ${renderSliderControl({ key: "sigma", label: "위험포트폴리오 표준편차", min: 0.06, max: 0.28, step: 0.01, value: state.sigma })}
        ${renderSliderControl({ key: "riskAversion", label: "위험회피계수 A", min: 1, max: 8, step: 0.25, value: state.riskAversion })}
      </div>
      <div class="demo-reading" data-reading></div>
    </div>
  `;

  const svg = root.querySelector("svg");
  const metrics = root.querySelector("[data-metrics]");
  const reading = root.querySelector("[data-reading]");

  function expectedReturn(w) {
    return state.rf + w * (state.er - state.rf);
  }

  function sigmaP(w) {
    return Math.abs(w) * state.sigma;
  }

  function draw() {
    svg.innerHTML = "";
    const plot = { left: 64, top: 24, right: 580, bottom: 292 };
    const maxW = 1.5;
    const maxSigma = sigmaP(maxW) * 1.1;
    const minReturn = 0;
    const maxReturn = expectedReturn(maxW) + 0.03;
    const xFor = (sigma) => plot.left + (sigma / maxSigma) * (plot.right - plot.left);
    const yFor = (ret) => plot.bottom - ((ret - minReturn) / (maxReturn - minReturn)) * (plot.bottom - plot.top);
    const slope = (state.er - state.rf) / state.sigma;
    const optimalAlloc = (state.er - state.rf) / (state.riskAversion * state.sigma ** 2);

    drawPlotFrame(svg, plot);
    drawAxes(svg, plot.left, plot.top, plot.right, plot.bottom, {
      "위험 σp": { x: plot.right - 16, y: plot.bottom + 28, "text-anchor": "end" },
      "기대수익률 E(Rp)": { x: plot.left - 2, y: plot.top - 8, "text-anchor": "start" },
    });

    const xTicks = [0, maxSigma * 0.25, maxSigma * 0.5, maxSigma * 0.75, maxSigma];
    const yTicks = [0, maxReturn * 0.25, maxReturn * 0.5, maxReturn * 0.75, maxReturn];
    drawGrid(svg, plot, xTicks, yTicks, xFor, yFor);
    drawTickLabels(svg, {
      plot,
      xValues: xTicks,
      yValues: yTicks,
      xFor,
      yFor,
      formatX: (value) => formatPercent(value, 0),
      formatY: (value) => formatPercent(value, 0),
    });

    const line = createSvgElement("line");
    line.setAttribute("x1", xFor(0));
    line.setAttribute("y1", yFor(state.rf));
    line.setAttribute("x2", xFor(sigmaP(maxW)));
    line.setAttribute("y2", yFor(expectedReturn(maxW)));
    line.setAttribute("stroke", "#3366df");
    line.setAttribute("stroke-width", "4");
    svg.append(line);

    const rfPoint = createSvgElement("circle");
    rfPoint.setAttribute("cx", xFor(0));
    rfPoint.setAttribute("cy", yFor(state.rf));
    rfPoint.setAttribute("r", "6");
    rfPoint.setAttribute("fill", "#171717");
    svg.append(rfPoint);

    const riskyPoint = createSvgElement("circle");
    riskyPoint.setAttribute("cx", xFor(state.sigma));
    riskyPoint.setAttribute("cy", yFor(state.er));
    riskyPoint.setAttribute("r", "6");
    riskyPoint.setAttribute("fill", "#3366df");
    svg.append(riskyPoint);

    const currentSigma = sigmaP(optimalAlloc);
    const currentReturn = expectedReturn(optimalAlloc);
    const cx = xFor(currentSigma);
    const cy = yFor(currentReturn);
    const point = createSvgElement("circle");
    point.setAttribute("cx", cx);
    point.setAttribute("cy", cy);
    point.setAttribute("r", "7");
    point.setAttribute("fill", "#d95c58");
    svg.append(point);

    const utility = currentReturn - 0.5 * state.riskAversion * currentSigma ** 2;
    const utilityPoints = [];
    for (let i = 0; i <= 140; i += 1) {
      const sigma = (maxSigma * i) / 140;
      const ret = utility + 0.5 * state.riskAversion * sigma ** 2;
      if (ret >= minReturn && ret <= maxReturn) {
        utilityPoints.push([xFor(sigma), yFor(ret)]);
      }
    }
    if (utilityPoints.length > 1) {
      const path = createSvgElement("path");
      path.setAttribute("d", pathFromPoints(utilityPoints));
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", "#2aa775");
      path.setAttribute("stroke-width", "2.5");
      path.setAttribute("stroke-dasharray", "7 6");
      svg.append(path);
    }

    const guide = createSvgElement("g");
    guide.setAttribute("stroke", "#8aa8ff");
    guide.setAttribute("stroke-dasharray", "5 5");
    const v = createSvgElement("line");
    v.setAttribute("x1", cx);
    v.setAttribute("y1", cy);
    v.setAttribute("x2", cx);
    v.setAttribute("y2", plot.bottom);
    guide.append(v);
    const h = createSvgElement("line");
    h.setAttribute("x1", plot.left);
    h.setAttribute("y1", cy);
    h.setAttribute("x2", cx);
    h.setAttribute("y2", cy);
    guide.append(h);
    svg.append(guide);

    const textGroup = createSvgElement("g");
    textGroup.setAttribute("fill", "#4a4741");
    textGroup.setAttribute("font-size", "12");
    textGroup.setAttribute("font-family", "Inter, Noto Sans KR, sans-serif");
    [
      { text: "Rf", x: xFor(0) + 10, y: yFor(state.rf) - 10 },
      { text: "위험포트폴리오 A", x: xFor(state.sigma) + 10, y: yFor(state.er) - 10 },
      { text: optimalAlloc > 1 ? "차입 최적점" : optimalAlloc < 0 ? "대출 최적점" : "최적 접점", x: cx + 10, y: cy - 10 },
      { text: "무차별 효용곡선", x: plot.left + 380, y: plot.top + 34 },
    ].forEach((item) => {
      const t = createSvgElement("text");
      t.textContent = item.text;
      t.setAttribute("x", item.x);
      t.setAttribute("y", item.y);
      textGroup.append(t);
    });
    svg.append(textGroup);

    metrics.innerHTML = `
      <div class="metric-chip">Rf ${formatPercent(state.rf)}</div>
      <div class="metric-chip">E(RA) ${formatPercent(state.er)}</div>
      <div class="metric-chip">σA ${formatPercent(state.sigma)}</div>
      <div class="metric-chip">RVAR ${slope.toFixed(3)}</div>
      <div class="metric-chip">최적 위험자산비중 ${optimalAlloc.toFixed(2)}</div>
      <div class="metric-chip metric-chip-strong">E(Rp) ${formatPercent(currentReturn)} / σp ${formatPercent(currentSigma)}</div>
    `;

    const positionText =
      optimalAlloc > 1
        ? "위험자산 비중이 1을 초과하므로 차입하여 위험포트폴리오를 더 확대하는 공격적 선택이다."
        : optimalAlloc < 1
          ? "위험자산 일부만 담고 나머지는 무위험자산에 두는 대출형 조합이다."
          : "위험포트폴리오 자체를 그대로 보유하는 선택이다.";

    reading.innerHTML = `
      <p><strong>읽는 법</strong> 검은 점은 무위험자산, 파란 점은 위험포트폴리오 A, 빨간 점은 현재 위험회피계수 \(A\)에서의 최적 접점입니다.</p>
      <p><strong>최적선택원리</strong> 초록 점선 무차별곡선이 CAL에 딱 한 번 접하는 곳에서 효용이 최대가 됩니다. 이것이 시험에서 말하는 포트폴리오 최적선택입니다.</p>
      <p><strong>현재 해석</strong> ${positionText}</p>
    `;

    root.querySelector('[data-value="rf"]').textContent = formatPercent(state.rf);
    root.querySelector('[data-value="er"]').textContent = formatPercent(state.er);
    root.querySelector('[data-value="sigma"]').textContent = formatPercent(state.sigma);
    root.querySelector('[data-value="riskAversion"]').textContent = state.riskAversion.toFixed(2);
  }

  root.querySelectorAll("input[type='range']").forEach((input) => {
    input.addEventListener("input", () => {
      state[input.dataset.key] = Number(input.value);
      if (state.er <= state.rf) state.er = Math.min(0.2, state.rf + 0.01);
      draw();
    });
  });

  draw();
}

function renderCapmRelationshipDemo(root) {
  if (root.dataset.ready === "true") return;
  root.dataset.ready = "true";

  root.innerHTML = `
    <div class="investment-demo investment-demo-static">
      <div class="investment-demo-header">
        <div>
          <strong>효율적 투자선, CML, SML, CAPM 관계도</strong>
          <p>왼쪽은 곡선과 직선의 관계, 오른쪽은 CAPM 식이 SML 그래프로 바뀌는 관계를 한 번에 정리한 그림입니다.</p>
        </div>
      </div>
      <div class="investment-demo-stage">
        <svg class="investment-demo-canvas" viewBox="0 0 940 380" role="img" aria-label="CAPM 관계도"></svg>
      </div>
    </div>
  `;

  const svg = root.querySelector("svg");
  const left = { left: 42, top: 34, right: 446, bottom: 324 };
  const right = { left: 500, top: 34, right: 898, bottom: 324 };

  drawPlotFrame(svg, left);
  drawPlotFrame(svg, right);

  const xForLeft = (v) => left.left + (v / 0.26) * (left.right - left.left);
  const yForLeft = (v) => left.bottom - (v / 0.18) * (left.bottom - left.top);
  const xForRight = (v) => right.left + ((v + 0.2) / 2.2) * (right.right - right.left);
  const yForRight = (v) => right.bottom - (v / 0.18) * (right.bottom - right.top);

  drawAxes(svg, left.left, left.top, left.right, left.bottom, {
    "위험 σ": { x: left.right - 10, y: left.bottom + 26, "text-anchor": "end" },
    "기대수익률 E(R)": { x: left.left, y: left.top - 10, "text-anchor": "start" },
  });
  drawAxes(svg, right.left, right.top, right.right, right.bottom, {
    "베타 β": { x: right.right - 10, y: right.bottom + 26, "text-anchor": "end" },
    "기대수익률 E(R)": { x: right.left, y: right.top - 10, "text-anchor": "start" },
  });

  drawGrid(svg, left, [0, 0.065, 0.13, 0.195, 0.26], [0, 0.045, 0.09, 0.135, 0.18], xForLeft, yForLeft);
  drawGrid(svg, right, [0, 0.5, 1, 1.5, 2], [0, 0.045, 0.09, 0.135, 0.18], xForRight, yForRight);

  const frontier = [];
  for (let i = 0; i <= 100; i += 1) {
    const t = i / 100;
    const sigma = 0.05 + 0.17 * t;
    const ret = 0.04 + 0.05 * t + 0.07 * t ** 2;
    frontier.push([xForLeft(sigma), yForLeft(ret)]);
  }
  const frontierPath = createSvgElement("path");
  frontierPath.setAttribute("d", pathFromPoints(frontier));
  frontierPath.setAttribute("fill", "none");
  frontierPath.setAttribute("stroke", "#355fd6");
  frontierPath.setAttribute("stroke-width", "4");
  svg.append(frontierPath);

  const cml = createSvgElement("line");
  cml.setAttribute("x1", xForLeft(0));
  cml.setAttribute("y1", yForLeft(0.03));
  cml.setAttribute("x2", xForLeft(0.22));
  cml.setAttribute("y2", yForLeft(0.17));
  cml.setAttribute("stroke", "#d95c58");
  cml.setAttribute("stroke-width", "4");
  svg.append(cml);

  [
    { x: xForLeft(0), y: yForLeft(0.03), label: "Rf", color: "#171717" },
    { x: xForLeft(0.16), y: yForLeft(0.132), label: "M", color: "#2aa775" },
  ].forEach((point) => {
    const circle = createSvgElement("circle");
    circle.setAttribute("cx", point.x);
    circle.setAttribute("cy", point.y);
    circle.setAttribute("r", "6");
    circle.setAttribute("fill", point.color);
    svg.append(circle);

    const text = createSvgElement("text");
    text.textContent = point.label;
    text.setAttribute("x", point.x + 10);
    text.setAttribute("y", point.y - 10);
    text.setAttribute("fill", "#4a4741");
    text.setAttribute("font-size", "12");
    text.setAttribute("font-family", "Inter, Noto Sans KR, sans-serif");
    svg.append(text);
  });

  const sml = createSvgElement("line");
  sml.setAttribute("x1", xForRight(-0.2));
  sml.setAttribute("y1", yForRight(0.014));
  sml.setAttribute("x2", xForRight(2));
  sml.setAttribute("y2", yForRight(0.17));
  sml.setAttribute("stroke", "#355fd6");
  sml.setAttribute("stroke-width", "4");
  svg.append(sml);

  [
    { x: xForRight(0), y: yForRight(0.03), label: "Rf", color: "#171717" },
    { x: xForRight(1), y: yForRight(0.10), label: "M", color: "#2aa775" },
  ].forEach((point) => {
    const circle = createSvgElement("circle");
    circle.setAttribute("cx", point.x);
    circle.setAttribute("cy", point.y);
    circle.setAttribute("r", "6");
    circle.setAttribute("fill", point.color);
    svg.append(circle);

    const text = createSvgElement("text");
    text.textContent = point.label;
    text.setAttribute("x", point.x + 10);
    text.setAttribute("y", point.y - 10);
    text.setAttribute("fill", "#4a4741");
    text.setAttribute("font-size", "12");
    text.setAttribute("font-family", "Inter, Noto Sans KR, sans-serif");
    svg.append(text);
  });

  const textGroup = createSvgElement("g");
  textGroup.setAttribute("fill", "#4a4741");
  textGroup.setAttribute("font-size", "12");
  textGroup.setAttribute("font-family", "Inter, Noto Sans KR, sans-serif");
  [
    { text: "효율적 투자선: 위험자산끼리 섞어서 만든 곡선", x: left.left + 10, y: left.top + 16 },
    { text: "CML: Rf와 시장포트폴리오 M을 잇는 최적 직선", x: left.left + 10, y: left.top + 36 },
    { text: "CAPM 식", x: right.left + 14, y: right.top + 20 },
    { text: "E(Ri) = Rf + [E(Rm) - Rf] × βi", x: right.left + 14, y: right.top + 42 },
    { text: "이 식을 (β, E(R)) 평면에 그린 직선이 SML", x: right.left + 14, y: right.top + 64 },
  ].forEach((item) => {
    const text = createSvgElement("text");
    text.textContent = item.text;
    text.setAttribute("x", item.x);
    text.setAttribute("y", item.y);
    textGroup.append(text);
  });
  svg.append(textGroup);
}

function renderSmlDemo(root) {
  if (root.dataset.ready === "true") return;
  root.dataset.ready = "true";

  const state = {
    rf: 0.03,
    rm: 0.11,
    beta: 1.1,
  };

  root.innerHTML = `
    <div class="investment-demo">
      <div class="investment-demo-header">
        <div>
          <strong>SML과 요구수익률</strong>
          <p>무위험이자율, 시장 기대수익률, 베타를 조절하면 증권시장선과 요구수익률이 같이 변합니다.</p>
        </div>
        <div class="demo-metrics" data-metrics></div>
      </div>
      <div class="investment-demo-stage">
        <svg class="investment-demo-canvas" viewBox="0 0 620 340" role="img" aria-label="증권시장선 그래프"></svg>
      </div>
      <div class="slider-grid">
        ${renderSliderControl({ key: "rf", label: "무위험이자율 Rf", min: 0.01, max: 0.08, step: 0.005, value: state.rf })}
        ${renderSliderControl({ key: "rm", label: "시장 기대수익률 E(Rm)", min: 0.06, max: 0.2, step: 0.005, value: state.rm })}
        ${renderSliderControl({ key: "beta", label: "베타 beta", min: -0.5, max: 2, step: 0.05, value: state.beta })}
      </div>
    </div>
  `;

  const svg = root.querySelector("svg");
  const metrics = root.querySelector("[data-metrics]");

  function requiredReturn(beta) {
    return state.rf + (state.rm - state.rf) * beta;
  }

  function draw() {
    svg.innerHTML = "";
    const plot = { left: 64, top: 24, right: 580, bottom: 292 };
    const minBeta = -0.5;
    const maxBeta = 2;
    const minReturn = 0;
    const maxReturn = Math.max(state.rm + 0.05, requiredReturn(maxBeta) + 0.02);

    const xFor = (beta) => plot.left + ((beta - minBeta) / (maxBeta - minBeta)) * (plot.right - plot.left);
    const yFor = (ret) => plot.bottom - ((ret - minReturn) / (maxReturn - minReturn)) * (plot.bottom - plot.top);

    drawPlotFrame(svg, plot);
    drawAxes(svg, plot.left, plot.top, plot.right, plot.bottom, {
      "베타 β": { x: plot.right - 24, y: plot.bottom + 28, "text-anchor": "end" },
      "기대수익률 E(R)": { x: plot.left - 2, y: plot.top - 8, "text-anchor": "start" },
    });

    const xTicks = [-0.5, 0, 0.5, 1, 1.5, 2];
    const yTicks = [0, maxReturn * 0.25, maxReturn * 0.5, maxReturn * 0.75, maxReturn];
    drawGrid(svg, plot, xTicks, yTicks, xFor, yFor);
    drawTickLabels(svg, {
      plot,
      xValues: xTicks,
      yValues: yTicks,
      xFor,
      yFor,
      formatX: (value) => value.toFixed(1),
      formatY: (value) => formatPercent(value, 0),
    });

    const line = createSvgElement("line");
    line.setAttribute("x1", xFor(minBeta));
    line.setAttribute("y1", yFor(requiredReturn(minBeta)));
    line.setAttribute("x2", xFor(maxBeta));
    line.setAttribute("y2", yFor(requiredReturn(maxBeta)));
    line.setAttribute("stroke", "#3366df");
    line.setAttribute("stroke-width", "4");
    svg.append(line);

    const marketPoint = createSvgElement("circle");
    marketPoint.setAttribute("cx", xFor(1));
    marketPoint.setAttribute("cy", yFor(state.rm));
    marketPoint.setAttribute("r", "6");
    marketPoint.setAttribute("fill", "#171717");
    svg.append(marketPoint);

    const currentReturn = requiredReturn(state.beta);
    const x = xFor(state.beta);
    const y = yFor(currentReturn);

    const guides = createSvgElement("g");
    guides.setAttribute("stroke", "#8aa8ff");
    guides.setAttribute("stroke-dasharray", "5 5");
    const vertical = createSvgElement("line");
    vertical.setAttribute("x1", x);
    vertical.setAttribute("y1", y);
    vertical.setAttribute("x2", x);
    vertical.setAttribute("y2", plot.bottom);
    guides.append(vertical);
    const horizontal = createSvgElement("line");
    horizontal.setAttribute("x1", plot.left);
    horizontal.setAttribute("y1", y);
    horizontal.setAttribute("x2", x);
    horizontal.setAttribute("y2", y);
    guides.append(horizontal);
    svg.append(guides);

    const currentPoint = createSvgElement("circle");
    currentPoint.setAttribute("cx", x);
    currentPoint.setAttribute("cy", y);
    currentPoint.setAttribute("r", "7");
    currentPoint.setAttribute("fill", "#d95c58");
    svg.append(currentPoint);

    const labelGroup = createSvgElement("g");
    labelGroup.setAttribute("fill", "#4a4741");
    labelGroup.setAttribute("font-size", "12");
    labelGroup.setAttribute("font-family", "Inter, Noto Sans KR, sans-serif");

    [
      { text: "Rf", x: plot.left - 10, y: yFor(state.rf) + 4, anchor: "end" },
      { text: "M", x: xFor(1) + 10, y: yFor(state.rm) - 10, anchor: "start" },
      { text: "현재 점", x: x + 12, y: y - 10, anchor: "start" },
    ].forEach((item) => {
      const text = createSvgElement("text");
      text.textContent = item.text;
      text.setAttribute("x", item.x);
      text.setAttribute("y", item.y);
      text.setAttribute("text-anchor", item.anchor);
      labelGroup.append(text);
    });
    svg.append(labelGroup);

    metrics.innerHTML = `
      <div class="metric-chip">Rf ${formatPercent(state.rf)}</div>
      <div class="metric-chip">E(Rm) ${formatPercent(state.rm)}</div>
      <div class="metric-chip">beta ${state.beta.toFixed(2)}</div>
      <div class="metric-chip metric-chip-strong">요구수익률 ${formatPercent(currentReturn)}</div>
    `;

    root.querySelector('[data-value="rf"]').textContent = formatPercent(state.rf);
    root.querySelector('[data-value="rm"]').textContent = formatPercent(state.rm);
    root.querySelector('[data-value="beta"]').textContent = state.beta.toFixed(2);
  }

  root.querySelectorAll("input[type='range']").forEach((input) => {
    input.addEventListener("input", () => {
      state[input.dataset.key] = Number(input.value);
      if (state.rm <= state.rf) {
        state.rm = Math.min(0.2, state.rf + 0.01);
      }
      draw();
    });
  });

  draw();
}

window.initInvestmentDemos = function initInvestmentDemos(scope = document) {
  scope.querySelectorAll("[data-demo='portfolio-risk']").forEach(renderPortfolioRiskDemo);
  scope.querySelectorAll("[data-demo='risk-decomposition']").forEach(renderRiskDecompositionChart);
  scope.querySelectorAll("[data-demo='cal']").forEach(renderCalDemo);
  scope.querySelectorAll("[data-demo='capm-relationship']").forEach(renderCapmRelationshipDemo);
  scope.querySelectorAll("[data-demo='sml']").forEach(renderSmlDemo);
};
