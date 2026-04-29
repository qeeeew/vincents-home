(function () {
  const steps = [
    {
      key: "space",
      label: "공간",
      title: "Col(X)는 가능한 예측값들의 공간",
      caption: "X의 열벡터들을 섞어서 만들 수 있는 모든 벡터가 이 평면 위에 놓인다.",
      formula: "Col(X) = { Xβ : β ∈ Rᵖ }",
    },
    {
      key: "project",
      label: "투영",
      title: "y를 그 공간에 가장 가깝게 내린다",
      caption: "least squares는 y 자체를 맞추는 것이 아니라, Col(X) 위에서 y와 가장 가까운 Xβ̂를 찾는다.",
      formula: "Xβ̂ = projCol(X)(y)",
    },
    {
      key: "orthogonal",
      label: "직교",
      title: "남은 잔차 e는 공간에 수직",
      caption: "e = y - Xβ̂ 는 열공간으로 설명하지 못한 부분이다. 그래서 X의 모든 열벡터와 직교한다.",
      formula: "e = y - Xβ̂,   Xᵀe = 0",
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

  function marker(id, color) {
    const markerEl = svgEl("marker", {
      id,
      markerWidth: "11",
      markerHeight: "11",
      refX: "9",
      refY: "5.5",
      orient: "auto",
      markerUnits: "strokeWidth",
    });
    markerEl.append(svgEl("path", { d: "M 0 0 L 11 5.5 L 0 11 z", fill: color }));
    return markerEl;
  }

  function render(container, stepIndex) {
    const step = steps[stepIndex];
    container.innerHTML = "";

    const shell = makeEl("section", `orthogonal-demo orthogonal-demo--${step.key}`);
    const board = makeEl("div", "orthogonal-board");

    const svg = svgEl("svg", {
      viewBox: "0 0 820 500",
      role: "img",
      "aria-label": "열공간에 y를 투영하고 잔차가 직교하는 직관 애니메이션",
    });

    const defs = svgEl("defs");
    defs.append(marker("arrow-blue", "#7dd3fc"));
    defs.append(marker("arrow-red", "#fb7185"));
    defs.append(marker("arrow-gold", "#fde68a"));
    svg.append(defs);

    svg.append(svgEl("text", { class: "orthogonal-title", x: "38", y: "54" }, "Least squares = y를 Col(X)에 투영하기"));
    svg.append(svgEl("line", { class: "orthogonal-title-rule", x1: "38", y1: "76", x2: "782", y2: "76" }));

    svg.append(svgEl("polygon", {
      class: "orthogonal-plane-shadow",
      points: "128,360 446,236 718,328 397,452",
    }));
    svg.append(svgEl("polygon", {
      class: "orthogonal-plane",
      points: "118,342 436,218 708,310 387,434",
    }));

    const grid = svgEl("g", { class: "orthogonal-plane-grid" });
    [
      ["170,322", "442,415"],
      ["230,299", "502,392"],
      ["290,275", "562,369"],
      ["350,252", "622,346"],
      ["410,229", "682,322"],
      ["190,370", "508,246"],
      ["270,398", "588,274"],
      ["350,426", "668,302"],
    ].forEach(([a, b]) => {
      const [x1, y1] = a.split(",");
      const [x2, y2] = b.split(",");
      grid.append(svgEl("line", { x1, y1, x2, y2 }));
    });
    svg.append(grid);

    svg.append(svgEl("text", { class: "orthogonal-plane-label", x: "262", y: "302" }, "Col(X)"));
    svg.append(svgEl("text", { class: "orthogonal-plane-formula", x: "235", y: "332" }, "{ Xβ : β ∈ Rᵖ }"));

    const origin = { x: 390, y: 434 };
    const y = { x: 482, y: 116 };
    const projection = { x: 444, y: 286 };

    svg.append(svgEl("line", {
      class: "orthogonal-vector orthogonal-vector--basis orthogonal-vector--basis-one",
      x1: origin.x,
      y1: origin.y,
      x2: "645",
      y2: "336",
      markerEnd: "url(#arrow-gold)",
    }));
    svg.append(svgEl("line", {
      class: "orthogonal-vector orthogonal-vector--basis orthogonal-vector--basis-two",
      x1: origin.x,
      y1: origin.y,
      x2: "212",
      y2: "376",
      markerEnd: "url(#arrow-gold)",
    }));
    svg.append(svgEl("text", { class: "orthogonal-small-label", x: "652", y: "336" }, "x₁"));
    svg.append(svgEl("text", { class: "orthogonal-small-label", x: "185", y: "377" }, "x₂"));

    svg.append(svgEl("line", {
      class: "orthogonal-vector orthogonal-vector--y",
      x1: origin.x,
      y1: origin.y,
      x2: y.x,
      y2: y.y,
      markerEnd: "url(#arrow-blue)",
    }));
    svg.append(svgEl("line", {
      class: "orthogonal-vector orthogonal-vector--projection",
      x1: origin.x,
      y1: origin.y,
      x2: projection.x,
      y2: projection.y,
      markerEnd: "url(#arrow-blue)",
    }));
    svg.append(svgEl("line", {
      class: "orthogonal-drop",
      x1: y.x,
      y1: y.y,
      x2: projection.x,
      y2: projection.y,
    }));
    svg.append(svgEl("line", {
      class: "orthogonal-vector orthogonal-vector--residual",
      x1: projection.x,
      y1: projection.y,
      x2: y.x,
      y2: y.y,
      markerEnd: "url(#arrow-red)",
    }));
    svg.append(svgEl("path", {
      class: "orthogonal-corner",
      d: "M 446 263 L 471 270 L 465 295",
    }));

    svg.append(svgEl("circle", { class: "orthogonal-dot orthogonal-dot--origin", cx: origin.x, cy: origin.y, r: "5" }));
    svg.append(svgEl("circle", { class: "orthogonal-dot orthogonal-dot--projection", cx: projection.x, cy: projection.y, r: "8" }));
    svg.append(svgEl("circle", { class: "orthogonal-dot orthogonal-dot--y", cx: y.x, cy: y.y, r: "9" }));

    svg.append(svgEl("text", { class: "orthogonal-main-label orthogonal-main-label--y", x: "500", y: "116" }, "y"));
    svg.append(svgEl("text", { class: "orthogonal-main-label orthogonal-main-label--projection", x: "457", y: "303" }, "Xβ̂"));
    svg.append(svgEl("text", { class: "orthogonal-main-label orthogonal-main-label--residual", x: "500", y: "210" }, "e = y - Xβ̂"));

    const explanation = svgEl("g", { class: "orthogonal-equation-card" });
    explanation.append(svgEl("rect", { x: "42", y: "104", width: "284", height: "128", rx: "8" }));
    explanation.append(svgEl("text", { x: "62", y: "139" }, step.title));
    explanation.append(svgEl("text", { x: "62", y: "174" }, step.formula));
    explanation.append(svgEl("text", { x: "62", y: "205" }, "핵심: 가능한 예측값은 평면 위에만 있다."));
    svg.append(explanation);

    board.append(svg);

    const footer = makeEl("div", "orthogonal-demo__footer");
    const copy = makeEl("div", "orthogonal-demo__copy");
    copy.append(makeEl("strong", "", step.title));
    copy.append(makeEl("p", "", step.caption));
    footer.append(copy);

    const controls = makeEl("div", "orthogonal-demo__controls orthogonal-demo__controls--three");
    steps.forEach((item, index) => {
      const button = makeEl("button", index === stepIndex ? "active" : "", item.label);
      button.type = "button";
      button.addEventListener("click", () => render(container, index));
      controls.append(button);
    });
    footer.append(controls);

    shell.append(board, footer);
    container.append(shell);
  }

  window.initOrthogonalResidualDemos = function initOrthogonalResidualDemos(root = document) {
    root.querySelectorAll("[data-orthogonal-residual-demo]").forEach((container) => {
      render(container, 0);
    });
  };
})();
