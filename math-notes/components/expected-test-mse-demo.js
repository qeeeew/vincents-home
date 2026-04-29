function createExpectedTestMseSvgElement(name) {
  return document.createElementNS("http://www.w3.org/2000/svg", name);
}

function renderExpectedTestMseDemo(root) {
  if (root.dataset.ready === "true") return;
  root.dataset.ready = "true";

  const state = {
    step: 0,
    autoplay: null,
    values: [],
    samples: [
      { id: 1, mse: 1.82, label: "sample 1", curve: "M 78 326 C 158 262, 225 243, 306 214" },
      { id: 2, mse: 0.96, label: "sample 2", curve: "M 78 314 C 145 284, 216 176, 306 205" },
      { id: 3, mse: 1.31, label: "sample 3", curve: "M 78 330 C 135 202, 220 280, 306 169" },
      { id: 4, mse: 1.08, label: "sample 4", curve: "M 78 302 C 148 252, 225 235, 306 191" },
      { id: 5, mse: 1.49, label: "sample 5", curve: "M 78 338 C 150 190, 214 270, 306 224" },
    ],
  };

  root.innerHTML = `
    <div class="chalk-demo">
      <div class="chalk-board">
        <svg class="chalk-svg" viewBox="0 0 980 560" role="img" aria-label="Expected test MSE chalkboard animation"></svg>
      </div>
      <div class="chalk-controls">
        <button type="button" data-action="next">Next</button>
        <button type="button" data-action="auto">Auto play</button>
        <button type="button" data-action="reset">Reset</button>
        <span data-caption>Population에서 가능한 training sample들을 생각합니다.</span>
      </div>
    </div>
  `;

  const svg = root.querySelector(".chalk-svg");
  const caption = root.querySelector("[data-caption]");

  function el(name, attrs = {}, text = "") {
    const node = createExpectedTestMseSvgElement(name);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    if (text) node.textContent = text;
    return node;
  }

  function append(parent, name, attrs = {}, text = "") {
    const node = el(name, attrs, text);
    parent.append(node);
    return node;
  }

  function marker(id, color) {
    const defs = svg.querySelector("defs") || append(svg, "defs");
    const m = append(defs, "marker", {
      id,
      viewBox: "0 0 10 10",
      refX: "8",
      refY: "5",
      markerWidth: "8",
      markerHeight: "8",
      orient: "auto-start-reverse",
    });
    append(m, "path", { d: "M 0 0 L 10 5 L 0 10 z", fill: color });
  }

  function scribbleCircle(cx, cy, rx, ry, color = "#151515", width = 3, klass = "") {
    const g = append(svg, "g", { class: klass });
    const variants = [
      `M ${cx - rx} ${cy} C ${cx - rx} ${cy - ry}, ${cx + rx} ${cy - ry}, ${cx + rx} ${cy} C ${cx + rx} ${cy + ry}, ${cx - rx} ${cy + ry}, ${cx - rx} ${cy}`,
      `M ${cx - rx + 6} ${cy + 5} C ${cx - rx - 8} ${cy - ry + 8}, ${cx + rx - 3} ${cy - ry - 8}, ${cx + rx + 4} ${cy - 3} C ${cx + rx - 1} ${cy + ry + 8}, ${cx - rx + 4} ${cy + ry - 2}, ${cx - rx + 6} ${cy + 5}`,
    ];
    variants.forEach((d) => append(g, "path", { d, fill: "none", stroke: color, "stroke-width": width, "stroke-linecap": "round" }));
    return g;
  }

  function handwritten(text, x, y, size = 28, color = "#151515", attrs = {}) {
    return append(svg, "text", {
      x,
      y,
      fill: color,
      "font-size": size,
      "font-weight": attrs.weight || "700",
      "font-family": "Bradley Hand, Comic Sans MS, Marker Felt, cursive",
      transform: attrs.rotate ? `rotate(${attrs.rotate} ${x} ${y})` : "",
      class: attrs.class || "",
    }, text);
  }

  function redPath(d, klass = "") {
    return append(svg, "path", {
      d,
      fill: "none",
      stroke: "#c7254e",
      "stroke-width": "4",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      class: klass,
    });
  }

  function blackPath(d, klass = "") {
    return append(svg, "path", {
      d,
      fill: "none",
      stroke: "#111",
      "stroke-width": "4",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      class: klass,
    });
  }

  function drawStaticBoard() {
    svg.innerHTML = "";
    append(svg, "defs");
    marker("arrow-red", "#c7254e");
    marker("arrow-black", "#111");
    append(svg, "rect", { x: 0, y: 0, width: 980, height: 560, fill: "#9fd1ff" });

    handwritten("E[Test MSE]", 34, 70, 34, "#c7254e", { rotate: -8 });
    redPath("M 26 86 C 98 70, 156 65, 236 72");
    redPath("M 76 124 C 30 198, 34 276, 92 337", "chalk-late");
    handwritten("Average", 45, 347, 30, "#c7254e", { rotate: -18, class: "chalk-late" });

    scribbleCircle(500, 82, 96, 48, "#111", 4);
    handwritten("Population", 425, 94, 32);

    const samplePositions = [
      [220, 206],
      [490, 204],
      [720, 208],
    ];
    samplePositions.forEach(([cx, cy], index) => {
      const visibleClass = index === 0 ? "sample-one" : index === 1 ? "sample-two" : "sample-three";
      if (state.step < index + 1) return;
      scribbleCircle(cx, cy, 70, 52, "#111", 4, visibleClass);
      handwritten(`n obs`, cx - 36, cy + 8, 26, "#111", { class: visibleClass });
      blackPath(`M ${cx} ${cy + 55} L ${cx} ${cy + 116}`, visibleClass).setAttribute("marker-end", "url(#arrow-black)");
      scribbleCircle(cx, cy + 160, 42, 46, "#c7254e", 3, visibleClass);
      handwritten("f̂", cx - 15, cy + 174, 46, "#111", { class: visibleClass });
    });

    if (state.step >= 1) blackPath("M 430 112 C 340 116, 272 126, 224 154", "sample-one").setAttribute("marker-end", "url(#arrow-black)");
    if (state.step >= 2) blackPath("M 508 130 C 500 150, 493 160, 490 172", "sample-two").setAttribute("marker-end", "url(#arrow-black)");
    if (state.step >= 3) {
      blackPath("M 590 107 C 680 116, 729 141, 724 176", "sample-three").setAttribute("marker-end", "url(#arrow-black)");
      handwritten("...", 590, 218, 34, "#111", { class: "sample-three" });
    }

    scribbleCircle(850, 250, 92, 40, "#111", 4);
    handwritten("X₁ ... Xₚ", 790, 264, 32);
    blackPath("M 925 132 L 875 204 L 944 246");

    append(svg, "rect", { x: 192, y: 436, width: 562, height: 72, fill: "none", stroke: "#111", "stroke-width": 4 });
    scribbleCircle(472, 473, 274, 42, "#111", 4);
    handwritten("test set", 407, 486, 36);
  }

  function drawDynamic() {
    const step = state.step;
    const activeSamples = Math.min(step, 5);
    for (let i = 0; i < activeSamples; i += 1) {
      const sample = state.samples[i % state.samples.length];
      const x = [220, 490, 720, 314, 620][i];
      const y = [366, 364, 368, 410, 414][i];
      const klass = `flow-${i}`;
      redPath(`M ${x} ${y} C ${x - 42} ${y + 42}, 390 ${438 + i * 4}, 462 ${454 + i * 3}`, klass).setAttribute("marker-end", "url(#arrow-red)");
      handwritten(`Test MSE ${sample.mse.toFixed(2)}`, x - 58, y + 34, 20, "#c7254e", { rotate: -8, class: klass });
      state.values[i] = sample.mse;
    }

    if (activeSamples > 0) {
      const avg = state.values.slice(0, activeSamples).reduce((sum, value) => sum + value, 0) / activeSamples;
      scribbleCircle(122, 410, 86, 42, "#c7254e", 3, "average-bubble");
      handwritten(`avg ≈ ${avg.toFixed(2)}`, 67, 421, 28, "#c7254e", { class: "average-bubble" });
      redPath("M 182 415 C 250 455, 338 470, 407 474", "average-bubble").setAttribute("marker-end", "url(#arrow-red)");
    }

    if (step >= 5) {
      handwritten("현실에서는 모든 training set을 볼 수 없다", 300, 548, 25, "#c7254e", { class: "chalk-final" });
      handwritten("→ test set / CV / bootstrap으로 추정", 608, 548, 23, "#c7254e", { class: "chalk-final" });
    }
  }

  function updateCaption() {
    const messages = [
      "Population에서 가능한 training sample들을 생각합니다.",
      "Training sample 1에서 첫 번째 f-hat을 학습하고 test set에 평가합니다.",
      "다른 sample을 뽑으면 다른 f-hat이 생깁니다.",
      "각 f-hat은 같은 test set에서 Test MSE를 냅니다.",
      "이 Test MSE들을 평균내면 Expected Test MSE의 직관이 됩니다.",
      "현실에서는 모든 sample을 볼 수 없으므로 test set, cross-validation, bootstrap으로 추정합니다.",
    ];
    caption.textContent = messages[Math.min(state.step, messages.length - 1)];
  }

  function draw() {
    drawStaticBoard();
    drawDynamic();
    updateCaption();
  }

  function next() {
    state.step = Math.min(5, state.step + 1);
    draw();
  }

  function toggleAuto() {
    const button = root.querySelector('[data-action="auto"]');
    if (state.autoplay) {
      clearInterval(state.autoplay);
      state.autoplay = null;
      button.textContent = "Auto play";
      return;
    }
    next();
    state.autoplay = setInterval(() => {
      if (state.step >= 5) toggleAuto();
      else next();
    }, 1050);
    button.textContent = "Pause";
  }

  root.querySelector('[data-action="next"]').addEventListener("click", next);
  root.querySelector('[data-action="auto"]').addEventListener("click", toggleAuto);
  root.querySelector('[data-action="reset"]').addEventListener("click", () => {
    if (state.autoplay) toggleAuto();
    state.step = 0;
    state.values = [];
    draw();
  });

  draw();
}

window.initExpectedTestMseDemos = function initExpectedTestMseDemos(scope = document) {
  scope.querySelectorAll("[data-demo='expected-test-mse']").forEach(renderExpectedTestMseDemo);
};
