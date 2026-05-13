const DEFAULT_NOTE = "notes/investment-asset-manager/overview.md";

const catalogTitle = "투자자산운용사 자격증";
const catalogDescription =
  "과목별 핵심 개념, 계산 문제, 법규 포인트, 기출 복기를 마크다운 문서로 계속 쌓아가는 전용 페이지입니다.";

const noteGroups = [
  {
    title: "시작",
    notes: [
      {
        title: "자격증 개요와 공부 로드맵",
        href: "notes/investment-asset-manager/overview.md",
        summary: "시험 구조, 과목 범위, 준비 순서, 노트 운영 방식을 한 번에 정리합니다.",
      },
    ],
  },
  {
    title: "1과목",
    notes: [
      {
        title: "세제관련 법규 및 세무전략",
        href: "notes/investment-asset-manager/tax-laws-and-tax-strategy.md",
        summary: "세제 구조, 과세 원칙, 절세 포인트와 세무전략의 큰 흐름을 정리합니다.",
      },
      {
        title: "금융상품",
        href: "notes/investment-asset-manager/financial-products.md",
        summary: "주식, 채권, 펀드, 파생결합상품 등 주요 금융상품의 구조를 비교합니다.",
      },
      {
        title: "부동산 관련 상품",
        href: "notes/investment-asset-manager/real-estate-products.md",
        summary: "부동산 펀드, 리츠, 부동산 간접투자 상품의 개념과 특징을 정리합니다.",
      },
    ],
  },
  {
    title: "2과목",
    notes: [
      {
        title: "대안투자운용 및 투자전략",
        href: "notes/investment-asset-manager/alternative-investment-strategies.md",
        summary: "사모, 인프라, 원자재 등 대안투자의 구조와 운용전략을 정리합니다.",
      },
      {
        title: "해외증권투자운용 및 투자전략",
        href: "notes/investment-asset-manager/global-securities-investment-strategies.md",
        summary: "해외 주식과 채권 투자 시 환율, 국가리스크, 전략 구성을 정리합니다.",
      },
      {
        title: "기본적 분석",
        href: "notes/investment-asset-manager/fundamental-analysis.md",
        summary: "재무제표, 산업, 기업가치를 바탕으로 한 기본적 분석 틀을 정리합니다.",
      },
      {
        title: "기술적 분석",
        href: "notes/investment-asset-manager/technical-analysis.md",
        summary: "가격, 거래량, 추세, 보조지표를 활용한 기술적 분석의 기초를 정리합니다.",
      },
    ],
  },
  {
    title: "3과목",
    notes: [
      {
        title: "자본시장과 금융투자업에 관한 법률",
        href: "notes/investment-asset-manager/capital-markets-act.md",
        summary: "자본시장법의 핵심 체계와 투자자 보호 관련 규정을 정리합니다.",
      },
      {
        title: "금융위원회 규정",
        href: "notes/investment-asset-manager/fsc-regulations.md",
        summary: "금융위원회 관련 규정에서 반복 출제되는 항목을 모아 정리합니다.",
      },
      {
        title: "한국금융투자협회 규정",
        href: "notes/investment-asset-manager/kofia-regulations.md",
        summary: "협회 규정과 실무 기준 중 시험 포인트가 되는 부분을 정리합니다.",
      },
      {
        title: "주식투자운용",
        href: "notes/investment-asset-manager/equity-investment-management.md",
        summary: "주식 투자 전략, 종목 선별, 포트폴리오 운용 포인트를 정리합니다.",
      },
      {
        title: "채권투자운용",
        href: "notes/investment-asset-manager/bond-investment-management.md",
        summary: "채권 가격, 금리, 듀레이션, 채권 운용 전략을 정리합니다.",
      },
      {
        title: "파생상품투자운용",
        href: "notes/investment-asset-manager/derivatives-investment-management.md",
        summary: "선물, 옵션, 스왑의 구조와 헤지 및 운용 전략을 정리합니다.",
      },
      {
        title: "투자운용결과분석",
        href: "notes/investment-asset-manager/performance-analysis.md",
        summary: "수익률, 위험조정성과, 벤치마크 비교를 통한 운용성과 분석을 정리합니다.",
      },
      {
        title: "거시경제",
        href: "notes/investment-asset-manager/macroeconomics.md",
        summary: "금리, 물가, 경기, 환율 등 거시 지표를 투자와 연결해 정리합니다.",
      },
      {
        title: "분산투자기법",
        href: "notes/investment-asset-manager/diversification-techniques.md",
        summary: "분산의 원리와 자산배분 기법을 중심으로 리스크 관리 틀을 정리합니다.",
      },
    ],
  },
];

const allNotes = noteGroups.flatMap((group) => group.notes);
const noteEl = document.querySelector("#note");
const prerequisitesEl = document.querySelector("#prerequisites");
const reviewEl = document.querySelector("#review");
const relatedEl = document.querySelector("#related");
const mathStore = [];

function parseFrontmatter(markdown) {
  if (!markdown.startsWith("---")) {
    return { data: {}, body: markdown };
  }

  const end = markdown.indexOf("\n---", 3);
  if (end === -1) {
    return { data: {}, body: markdown };
  }

  const raw = markdown.slice(3, end).trim();
  const body = markdown.slice(end + 4).trim();
  const data = {};
  let currentKey = null;

  raw.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    if (trimmed.startsWith("- ") && currentKey) {
      data[currentKey] = data[currentKey] || [];
      data[currentKey].push(trimmed.slice(2).trim());
      return;
    }

    const separator = trimmed.indexOf(":");
    if (separator === -1) return;

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();
    currentKey = key;
    data[key] = value || [];
  });

  return { data, body };
}

function protectMath(markdown) {
  mathStore.length = 0;
  return markdown
    .replace(/\$\$[\s\S]*?\$\$/g, (match) => {
      const token = `@@MATH_BLOCK_${mathStore.length}@@`;
      mathStore.push(match);
      return token;
    })
    .replace(/\\\([\s\S]*?\\\)/g, (match) => {
      const token = `@@MATH_INLINE_${mathStore.length}@@`;
      mathStore.push(match);
      return token;
    })
    .replace(/(?<!\\)\$(?!\$)([\s\S]*?)(?<!\\)\$/g, (match) => {
      const token = `@@MATH_INLINE_${mathStore.length}@@`;
      mathStore.push(match);
      return token;
    });
}

function restoreMath(html) {
  return html.replace(/@@MATH_(?:BLOCK|INLINE)_(\d+)@@/g, (_, index) => mathStore[Number(index)]);
}

function renderList(target, items) {
  target.innerHTML = "";
  const values = Array.isArray(items) ? items : [];

  if (!values.length) {
    const empty = document.createElement("span");
    empty.textContent = "아직 없음";
    target.append(empty);
    return;
  }

  values.forEach((item) => {
    const span = document.createElement("span");
    span.textContent = item.replace(/^\[\[(.*)\]\]$/, "$1");
    target.append(span);
  });
}

function renderMeta(data) {
  const meta = document.createElement("div");
  meta.className = "note-meta";

  const fields = [
    data.level && `수준: ${data.level}`,
    data.date && data.date,
    ...(Array.isArray(data.tags) ? data.tags.map((tag) => `#${tag}`) : []),
  ].filter(Boolean);

  fields.forEach((field) => {
    const chip = document.createElement("span");
    chip.className = "note-chip";
    chip.textContent = field;
    meta.append(chip);
  });

  return meta;
}

function clearRightRail() {
  renderList(prerequisitesEl, []);
  renderList(reviewEl, []);
  renderList(relatedEl, []);
}

function renderCatalog() {
  noteEl.className = "catalog-view";
  noteEl.innerHTML = `
    <p class="catalog-kicker">Vincent's Investment Notes</p>
    <h1 class="catalog-title">${catalogTitle}</h1>
    <p class="catalog-description">${catalogDescription}</p>
    ${noteGroups
      .map(
        (group) => `
          <section class="category-section">
            <h2>${group.title}</h2>
            <div class="note-list">
              ${group.notes
                .map(
                  (note) => `
                    <a class="note-list-item" href="#${note.href}">
                      <strong>${note.title}</strong>
                      <span>${note.summary}</span>
                    </a>
                  `,
                )
                .join("")}
            </div>
          </section>
        `,
      )
      .join("")}
  `;

  clearRightRail();
  document.querySelectorAll("[data-note-link]").forEach((link) => link.classList.remove("active"));
  document.querySelectorAll("[data-home-link]").forEach((link) => link.classList.add("active"));
}

function enhanceMarkdownLinks(container) {
  container.querySelectorAll("a").forEach((link) => {
    const href = link.getAttribute("href") || "";
    if (href.endsWith(".md")) {
      link.setAttribute("href", `#${href}`);
    }
  });
}

async function loadNote(path) {
  const notePath = path || DEFAULT_NOTE;
  noteEl.className = "note-article";
  noteEl.innerHTML = "<p>노트를 불러오는 중입니다...</p>";

  try {
    const markdown = await loadNoteMarkdown(notePath);
    const { data, body } = parseFrontmatter(markdown);
    const html = restoreMath(marked.parse(protectMath(body), { mangle: false, headerIds: true }));

    noteEl.innerHTML = "";
    noteEl.append(renderMeta(data));
    noteEl.insertAdjacentHTML("beforeend", html);

    renderList(prerequisitesEl, data.prerequisites);
    renderList(reviewEl, data.review);
    renderList(relatedEl, data.related);
    enhanceMarkdownLinks(noteEl);

    document.querySelectorAll("[data-note-link]").forEach((link) => {
      link.classList.toggle("active", link.dataset.noteLink === notePath);
    });
    document.querySelectorAll("[data-home-link]").forEach((link) => link.classList.remove("active"));

    if (!allNotes.some((note) => note.href === notePath)) {
      document.querySelectorAll("[data-note-link]").forEach((link) => link.classList.remove("active"));
    }

    window.initInvestmentDemos?.(noteEl);

    if (window.MathJax?.typesetPromise) {
      await window.MathJax.typesetPromise([noteEl]);
    }
  } catch (error) {
    noteEl.innerHTML = `
      <div class="callout">
        노트를 불러오지 못했습니다. 로컬 파일을 직접 열었다면
        <code>python3 -m http.server</code>로 서버를 켠 뒤 접속해 주세요.
        <br />
        오류: ${error.message}
      </div>
    `;
  }
}

async function loadNoteMarkdown(notePath) {
  const registry = window.__INVESTMENT_NOTE_REGISTRY__;
  if (registry && typeof registry[notePath] === "string") {
    return registry[notePath];
  }

  try {
    const response = await fetch(notePath);
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return await response.text();
  } catch (error) {
    if (window.location.protocol !== "file:") {
      throw error;
    }

    return await loadNoteMarkdownFromFile(notePath, error);
  }
}

function loadNoteMarkdownFromFile(notePath, originalError) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("GET", notePath, true);
    request.overrideMimeType("text/plain; charset=utf-8");

    request.onload = () => {
      if (request.status === 0 || (request.status >= 200 && request.status < 300)) {
        resolve(request.responseText);
        return;
      }
      reject(new Error(`${request.status} ${request.statusText}`));
    };

    request.onerror = () => {
      reject(originalError);
    };

    request.send();
  });
}

function currentNoteFromHash() {
  const value = decodeURIComponent(window.location.hash.slice(1));
  return value.endsWith(".md") ? value : "";
}

function route() {
  const note = currentNoteFromHash();

  if (note) {
    loadNote(note);
    return;
  }

  renderCatalog();
}

window.addEventListener("hashchange", route);
window.addEventListener("DOMContentLoaded", route);
