(function () {
  const cases = [
    {
      p: 1,
      edge: 0.1,
      title: "p = 1",
      summary: "전체 길이의 10%만 보면 된다.",
      detail: "1차원에서는 부피가 곧 길이라서 local neighborhood가 정말 작게 유지된다.",
    },
    {
      p: 2,
      edge: Math.sqrt(0.1),
      title: "p = 2",
      summary: "한 축마다 약 31.6%를 먹어야 한다.",
      detail: "면적 10%를 잡으려면 정사각형의 한 변은 생각보다 크게 늘어난다.",
    },
    {
      p: 3,
      edge: Math.cbrt(0.1),
      title: "p = 3",
      summary: "한 축마다 약 46.4%를 먹어야 한다.",
      detail: "부피 10%를 잡기 위해 이미 각 변수 범위의 절반 가까이를 써야 한다.",
    },
    {
      p: 10,
      edge: Math.pow(0.1, 1 / 10),
      title: "p = 10",
      summary: "한 축마다 약 79.4%를 덮어야 한다.",
      detail: "10차원에서 10%를 모으려면 더 이상 local하다고 보기 어려운 범위를 봐야 한다.",
    },
  ];

  function makeEl(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }

  function svgEl(tag, attrs = {}, text) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    if (text !== undefined) el.textContent = text;
    return el;
  }

  function fmt(value) {
    return value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
  }

  function drawOneDimensional(svg, edge) {
    const start = 110;
    const end = 430;
    const length = (end - start) * edge;
    const selectedEnd = start + length;

    svg.append(svgEl("line", { class: "curse-axis", x1: start, y1: 250, x2: end, y2: 250 }));
    svg.append(svgEl("line", { class: "curse-selected", x1: start, y1: 250, x2: selectedEnd, y2: 250 }));
    svg.append(svgEl("circle", { class: "curse-point", cx: start, cy: 250, r: 6 }));
    svg.append(svgEl("circle", { class: "curse-point", cx: selectedEnd, cy: 250, r: 6 }));
    svg.append(svgEl("text", { class: "curse-axis-label", x: start - 4, y: 286 }, "0"));
    svg.append(svgEl("text", { class: "curse-axis-label", x: end - 4, y: 286 }, "1"));
    svg.append(svgEl("text", { class: "curse-measure-label", x: start, y: 220 }, "길이 0.1"));
  }

  function drawTwoDimensional(svg, edge) {
    const size = 230;
    const x = 150;
    const y = 120;
    const selected = size * edge;

    svg.append(svgEl("rect", { class: "curse-unit", x, y, width: size, height: size }));
    svg.append(svgEl("rect", { class: "curse-selected-area", x, y: y + size - selected, width: selected, height: selected }));
    svg.append(svgEl("text", { class: "curse-axis-label", x: x + size + 14, y: y + size + 4 }, "1"));
    svg.append(svgEl("text", { class: "curse-measure-label", x, y: y + size - selected - 12 }, "한 변 0.316"));
  }

  function drawThreeDimensional(svg, edge, isTenDimensional) {
    const scale = isTenDimensional ? 0.794 : edge;
    const x = 150;
    const y = isTenDimensional ? 130 : 145;
    const size = 190;
    const depth = 70;
    const selected = size * scale;
    const selectedDepth = depth * scale;

    svg.append(svgEl("polygon", { class: "curse-cube-face", points: `${x},${y} ${x + size},${y} ${x + size + depth},${y - depth} ${x + depth},${y - depth}` }));
    svg.append(svgEl("polygon", { class: "curse-cube-face", points: `${x + size},${y} ${x + size},${y + size} ${x + size + depth},${y + size - depth} ${x + size + depth},${y - depth}` }));
    svg.append(svgEl("rect", { class: "curse-unit", x, y, width: size, height: size }));

    const sx = x;
    const sy = y + size - selected;
    svg.append(svgEl("polygon", {
      class: "curse-selected-area",
      points: `${sx},${sy} ${sx + selected},${sy} ${sx + selected + selectedDepth},${sy - selectedDepth} ${sx + selectedDepth},${sy - selectedDepth}`,
    }));
    svg.append(svgEl("polygon", {
      class: "curse-selected-area curse-selected-area--side",
      points: `${sx + selected},${sy} ${sx + selected},${sy + selected} ${sx + selected + selectedDepth},${sy + selected - selectedDepth} ${sx + selected + selectedDepth},${sy - selectedDepth}`,
    }));
    svg.append(svgEl("rect", { class: "curse-selected-area", x: sx, y: sy, width: selected, height: selected }));

    const label = isTenDimensional ? "각 축 0.794" : "한 변 0.464";
    svg.append(svgEl("text", { class: "curse-measure-label", x: x, y: sy - 16 }, label));
    if (isTenDimensional) {
      svg.append(svgEl("text", { class: "curse-warning-label", x: 104, y: 380 }, "10차원에서는 '근처'가 거의 전체 범위가 된다"));
    }
  }

  function render(container, index) {
    const item = cases[index];
    container.innerHTML = "";

    const shell = makeEl("section", "curse-demo");
    const head = makeEl("div", "curse-demo__head");
    head.append(makeEl("h3", "", "차원의 저주: 10% 부피가 더 이상 local하지 않다"));
    head.append(makeEl("p", "", "전체 부피의 10%를 잡는 neighborhood를 만들 때 필요한 한 축의 길이를 비교한다."));

    const body = makeEl("div", "curse-demo__body");
    const svg = svgEl("svg", {
      viewBox: "0 0 560 430",
      role: "img",
      "aria-label": "차원이 커질수록 같은 부피를 잡기 위한 각 축의 길이가 커지는 애니메이션",
    });

    svg.append(svgEl("text", { class: "curse-title", x: "36", y: "48" }, item.title));
    svg.append(svgEl("text", { class: "curse-formula", x: "36", y: "82" }, `e_${item.p}(0.1) = 0.1^(1/${item.p}) ≈ ${fmt(item.edge)}`));

    if (item.p === 1) drawOneDimensional(svg, item.edge);
    if (item.p === 2) drawTwoDimensional(svg, item.edge);
    if (item.p === 3) drawThreeDimensional(svg, item.edge, false);
    if (item.p === 10) drawThreeDimensional(svg, item.edge, true);

    const panel = makeEl("div", "curse-demo__panel");
    panel.append(makeEl("strong", "", item.summary));
    panel.append(makeEl("p", "", item.detail));

    const axisBar = makeEl("div", "curse-demo__bar");
    const fill = makeEl("span", "");
    fill.style.width = `${Math.round(item.edge * 100)}%`;
    axisBar.append(fill);
    panel.append(axisBar);
    panel.append(makeEl("small", "", `각 predictor range 중 ${Math.round(item.edge * 1000) / 10}% 필요`));

    const controls = makeEl("div", "curse-demo__controls");
    cases.forEach((next, nextIndex) => {
      const button = makeEl("button", nextIndex === index ? "active" : "", `p=${next.p}`);
      button.type = "button";
      button.addEventListener("click", () => render(container, nextIndex));
      controls.append(button);
    });
    panel.append(controls);

    body.append(svg, panel);
    shell.append(head, body);
    container.append(shell);
  }

  window.initCurseDimensionalityDemos = function initCurseDimensionalityDemos(root = document) {
    root.querySelectorAll("[data-curse-dimensionality-demo]").forEach((container) => {
      render(container, 0);
    });
  };
})();
