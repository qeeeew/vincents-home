function createSvgElement(name) {
  return document.createElementNS("http://www.w3.org/2000/svg", name);
}

function transformPoint(point, state) {
  const [x, y] = point;
  return [
    state.a11 * x + state.a12 * y + state.tx,
    state.a21 * x + state.a22 * y + state.ty,
  ];
}

function project(point) {
  const scale = 42;
  const origin = [210, 160];
  return [origin[0] + point[0] * scale, origin[1] - point[1] * scale];
}

function pointsToPath(points) {
  return points
    .map((point, index) => {
      const [x, y] = project(point);
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function drawGrid(svg) {
  const group = createSvgElement("g");
  group.setAttribute("stroke", "#dedbd3");
  group.setAttribute("stroke-width", "1");

  for (let i = -4; i <= 4; i += 1) {
    const verticalA = project([i, -3]);
    const verticalB = project([i, 3]);
    const horizontalA = project([-4, i]);
    const horizontalB = project([4, i]);

    const v = createSvgElement("line");
    v.setAttribute("x1", verticalA[0]);
    v.setAttribute("y1", verticalA[1]);
    v.setAttribute("x2", verticalB[0]);
    v.setAttribute("y2", verticalB[1]);
    group.append(v);

    const h = createSvgElement("line");
    h.setAttribute("x1", horizontalA[0]);
    h.setAttribute("y1", horizontalA[1]);
    h.setAttribute("x2", horizontalB[0]);
    h.setAttribute("y2", horizontalB[1]);
    group.append(h);
  }

  const axis = createSvgElement("g");
  axis.setAttribute("stroke", "#242424");
  axis.setAttribute("stroke-width", "1.4");

  const xAxisA = project([-4.2, 0]);
  const xAxisB = project([4.2, 0]);
  const yAxisA = project([0, -3.2]);
  const yAxisB = project([0, 3.2]);

  const xAxis = createSvgElement("line");
  xAxis.setAttribute("x1", xAxisA[0]);
  xAxis.setAttribute("y1", xAxisA[1]);
  xAxis.setAttribute("x2", xAxisB[0]);
  xAxis.setAttribute("y2", xAxisB[1]);
  axis.append(xAxis);

  const yAxis = createSvgElement("line");
  yAxis.setAttribute("x1", yAxisA[0]);
  yAxis.setAttribute("y1", yAxisA[1]);
  yAxis.setAttribute("x2", yAxisB[0]);
  yAxis.setAttribute("y2", yAxisB[1]);
  axis.append(yAxis);

  svg.append(group, axis);
}

function renderAffineDemo(root) {
  if (root.dataset.ready === "true") return;
  root.dataset.ready = "true";

  const state = {
    a11: 1,
    a12: -0.4,
    a21: 0,
    a22: 1,
    tx: 0.8,
    ty: 0.2,
  };

  const square = [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
    [-1, -1],
  ];

  root.innerHTML = `
    <div class="affine-demo">
      <div class="affine-stage">
        <svg class="affine-canvas" viewBox="0 0 420 320" role="img" aria-label="아핀 변환 시각화"></svg>
        <div class="matrix-panel">
          <div class="matrix-title">Current Matrix</div>
          <div class="matrix-box" data-matrix></div>
          <p>파란 도형은 원래 정사각형이고, 붉은 도형은 현재 행렬로 변환된 결과입니다.</p>
        </div>
      </div>
      <div class="slider-grid"></div>
      <div class="demo-actions">
        <button type="button" data-preset="identity">Identity</button>
        <button type="button" data-preset="shear">Shear</button>
        <button type="button" data-preset="scale">Scale</button>
        <button type="button" data-preset="rotate">Rotate</button>
      </div>
    </div>
  `;

  const svg = root.querySelector("svg");
  const matrix = root.querySelector("[data-matrix]");
  const sliderGrid = root.querySelector(".slider-grid");

  const controls = [
    ["a11", -2, 2, 0.1],
    ["a12", -2, 2, 0.1],
    ["a21", -2, 2, 0.1],
    ["a22", -2, 2, 0.1],
    ["tx", -3, 3, 0.1],
    ["ty", -3, 3, 0.1],
  ];

  controls.forEach(([key, min, max, step]) => {
    const label = document.createElement("label");
    label.className = "slider-control";
    label.innerHTML = `
      <span class="slider-label">
        <span>${key}</span>
        <span data-value="${key}">${state[key].toFixed(1)}</span>
      </span>
      <input type="range" min="${min}" max="${max}" step="${step}" value="${state[key]}" data-key="${key}" />
    `;
    sliderGrid.append(label);
  });

  function draw() {
    svg.innerHTML = "";
    drawGrid(svg);

    const original = createSvgElement("path");
    original.setAttribute("d", pointsToPath(square));
    original.setAttribute("fill", "rgba(51, 102, 223, 0.12)");
    original.setAttribute("stroke", "#3366df");
    original.setAttribute("stroke-width", "3");
    svg.append(original);

    const transformedPoints = square.map((point) => transformPoint(point, state));
    const transformed = createSvgElement("path");
    transformed.setAttribute("d", pointsToPath(transformedPoints));
    transformed.setAttribute("fill", "rgba(217, 92, 88, 0.2)");
    transformed.setAttribute("stroke", "#d95c58");
    transformed.setAttribute("stroke-width", "3");
    svg.append(transformed);

    matrix.innerHTML = `
      \\[
      A =
      \\begin{bmatrix}
      ${state.a11.toFixed(1)} & ${state.a12.toFixed(1)} & ${state.tx.toFixed(1)} \\\\
      ${state.a21.toFixed(1)} & ${state.a22.toFixed(1)} & ${state.ty.toFixed(1)} \\\\
      0 & 0 & 1
      \\end{bmatrix}
      \\]
    `;

    Object.keys(state).forEach((key) => {
      root.querySelector(`[data-value="${key}"]`).textContent = state[key].toFixed(1);
      root.querySelector(`[data-key="${key}"]`).value = state[key];
    });

    if (window.MathJax?.typesetPromise) {
      window.MathJax.typesetPromise([matrix]);
    }
  }

  root.querySelectorAll("input[type='range']").forEach((input) => {
    input.addEventListener("input", () => {
      state[input.dataset.key] = Number(input.value);
      draw();
    });
  });

  root.querySelectorAll("[data-preset]").forEach((button) => {
    button.addEventListener("click", () => {
      const presets = {
        identity: { a11: 1, a12: 0, a21: 0, a22: 1, tx: 0, ty: 0 },
        shear: { a11: 1, a12: -0.8, a21: 0.3, a22: 1, tx: 0.8, ty: 0.2 },
        scale: { a11: 1.6, a12: 0, a21: 0, a22: 0.7, tx: 0, ty: 0 },
        rotate: { a11: 0.7, a12: -0.7, a21: 0.7, a22: 0.7, tx: 0.2, ty: 0.4 },
      };
      Object.assign(state, presets[button.dataset.preset]);
      draw();
    });
  });

  draw();
}

window.initAffineDemos = function initAffineDemos(scope = document) {
  scope.querySelectorAll("[data-demo='affine']").forEach(renderAffineDemo);
};
