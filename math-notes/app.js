const DEFAULT_NOTE = "notes/linear-algebra/affine-transformation.md";

const catalogItems = [
  {
    id: "matrix-algebra",
    number: "01",
    name: "행렬대수학",
    description: "벡터, 행렬, 선형변환, 고윳값, 분해를 정리합니다.",
    notes: [
      {
        title: "아핀 변환",
        href: "notes/linear-algebra/affine-transformation.md",
        summary: "선형 변환에 평행이동을 더한 변환을 동차 좌표로 이해합니다.",
      },
    ],
  },
  {
    id: "statistics-intro",
    number: "02",
    name: "통계학원론",
    description: "기술통계, 확률분포, 추정, 검정의 기본기를 정리합니다.",
    sections: [
      {
        number: "1",
        title: "SE vs SD",
        notes: [
          {
            title: "표준편차와 표준오차",
            href: "notes/statistics-intro/standard-deviation-standard-error.md",
            summary: "데이터의 흩어짐을 보는 SD와 추정량의 흔들림을 보는 SE를 구분합니다.",
          },
        ],
      },
      {
        number: "2",
        title: "Bias vs MSE",
        notes: [
          {
            title: "편향, 분산, MSE",
            href: "notes/statistics-intro/bias-variance-mse.md",
            summary: "추정량의 평균적 오차를 bias, 전체 제곱오차를 MSE로 정리합니다.",
          },
        ],
      },
      {
        number: "3",
        title: "가설검정",
        notes: [
          {
            title: "가설검정의 기본 구조",
            href: "notes/statistics-intro/hypothesis-testing.md",
            summary: "귀무가설, 대립가설, 검정통계량, 유의수준, 기각 판단의 흐름을 정리합니다.",
          },
        ],
      },
      {
        number: "4",
        title: "지수분포",
        notes: [
          {
            title: "지수분포",
            href: "notes/statistics-intro/exponential-distribution.md",
            summary: "사건이 발생할 때까지의 대기시간을 모델링하는 지수분포를 정리합니다.",
          },
        ],
      },
      {
        number: "5",
        title: "Phi(x)",
        notes: [
          {
            title: "표준정규분포의 누적확률 Phi",
            href: "notes/statistics-intro/standard-normal-cdf.md",
            summary: "표준정규분포에서 누적확률 Phi(x)의 의미와 대칭성을 정리합니다.",
          },
        ],
      },
      {
        number: "6",
        title: "p-value",
        notes: [
          {
            title: "p-value",
            href: "notes/statistics-intro/p-value.md",
            summary: "귀무가설이 맞다고 볼 때 현재 결과가 얼마나 극단적인지 나타내는 p-value를 정리합니다.",
          },
        ],
      },
      {
        number: "7",
        title: "카이제곱",
        notes: [
          {
            title: "카이제곱분포와 카이제곱검정",
            href: "notes/statistics-intro/chi-square.md",
            summary: "제곱합으로 만들어지는 카이제곱분포와 적합도, 독립성, 분산 검정을 정리합니다.",
          },
        ],
      },
      {
        number: "8",
        title: "가우시안 정규분포",
        notes: [
          {
            title: "정규분포",
            href: "notes/statistics-intro/normal-distribution.md",
            summary: "평균과 분산으로 결정되는 정규분포, 표준화, 68-95-99.7 규칙을 정리합니다.",
          },
        ],
      },
      {
        number: "9",
        title: "우도",
        notes: [
          {
            title: "우도와 최대우도추정",
            href: "notes/statistics-intro/likelihood.md",
            summary: "관측된 데이터를 가장 그럴듯하게 만드는 모수를 찾는 우도의 관점을 정리합니다.",
          },
        ],
      },
      {
        number: "10",
        title: "테일러급수",
        notes: [
          {
            title: "테일러급수",
            href: "notes/statistics-intro/taylor-series.md",
            summary: "복잡한 함수를 한 점 주변의 다항식으로 근사하는 테일러급수를 정리합니다.",
          },
        ],
      },
    ],
    notes: [],
  },
  {
    id: "r-programming",
    number: "03",
    name: "R프로그래밍",
    description: "R 문법, 데이터프레임, 시각화, 분석 워크플로를 정리합니다.",
    notes: [],
  },
  {
    id: "time-series",
    number: "04",
    name: "시계열분석",
    description: "추세, 계절성, 정상성, ARIMA 같은 시계열 개념을 정리합니다.",
    notes: [],
  },
  {
    id: "financial-statistics",
    number: "05",
    name: "금융통계학",
    description: "수익률, 리스크, 포트폴리오, 금융 데이터 분석을 정리합니다.",
    notes: [],
  },
  {
    id: "nonparametric-statistics",
    number: "06",
    name: "비모수통계",
    description: "분포 가정이 약한 검정과 순위 기반 방법을 정리합니다.",
    notes: [],
  },
  {
    id: "sqld",
    number: "07",
    name: "SQLD 자격증",
    description: "데이터 모델링, SQL 기본, SQL 활용 문제를 정리합니다.",
    notes: [
      {
        title: "SQLD 핵심 정리",
        href: "notes/sqld/sql-core-summary.md",
        summary: "SQLD 핵심정리노트의 흐름을 바탕으로 데이터 모델링, SQL 기본과 활용, 관리 명령어를 시험용 형식으로 정리합니다.",
      },
      {
        title: "50회 기출 요약 정리",
        href: "notes/sqld/sqld-exam-50.md",
        summary: "50회 복원 기출의 데이터 모델링, 조인, 계층형 질의, ROLLUP/CUBE, DML/DDL 포인트를 정리합니다.",
      },
      {
        title: "49회 기출 요약 정리",
        href: "notes/sqld/sqld-exam-49.md",
        summary: "49회 복원 기출의 정규화, 식별관계, NULL, 윈도우 함수, 권한, DDL 포인트를 정리합니다.",
      },
      {
        title: "48회 기출 요약 정리",
        href: "notes/sqld/sqld-exam-48.md",
        summary: "48회 복원 기출의 모델링, SELECT 실행 순서, 윈도우 함수, 계층형 질의, 집계 함수를 정리합니다.",
      },
      {
        title: "47회 기출 요약 정리",
        href: "notes/sqld/sqld-exam-47.md",
        summary: "47회 복원 기출의 반정규화, CUBE/ROLLUP, 조인, 서브쿼리, 집합 연산 포인트를 정리합니다.",
      },
      {
        title: "46회 기출 요약 정리",
        href: "notes/sqld/sqld-exam-46.md",
        summary: "46회 복원 기출의 정규형, 계층형 쿼리, NULL, GROUPING SETS, 윈도우 함수 포인트를 정리합니다.",
      },
    ],
  },
  {
    id: "machine-learning-basics",
    number: "08",
    name: "머신러닝 기초",
    description: "AI 시대의 데이터 분석, 데이터마이닝, 머신러닝, 통계적 학습의 기본 개념을 정리합니다.",
    sections: [
      {
        number: "1",
        title: "기초",
        notes: [
          {
            title: "AI 시대의 데이터 분석과 머신러닝 개요",
            href: "notes/machine-learning-basics/foundation.md",
            summary: "DM_Lecure1.pdf의 핵심 내용을 바탕으로 데이터마이닝, 머신러닝, 통계적 학습의 관계를 정리합니다.",
          },
        ],
      },
      {
        number: "2",
        title: "지도학습",
        notes: [
          {
            title: "지도학습",
            href: "notes/machine-learning-basics/supervised-learning.md",
            summary: "DM_Lecure2의 슬라이드 흐름을 따라 지도학습의 표기법, 예측/추론, 오차, 모수/비모수 방법, KNN, 모델 평가를 정리합니다.",
          },
        ],
      },
      {
        number: "3",
        title: "분류 문제",
        notes: [
          {
            title: "분류 문제와 KNN 분류기",
            href: "notes/machine-learning-basics/classification-knn.md",
            summary: "DM_Lecure2의 25페이지 이후 내용을 바탕으로 KNN 회귀의 bias-variance, classification error, Bayes classifier, KNN classifier를 정리합니다.",
          },
        ],
      },
      {
        number: "4",
        title: "선형회귀",
        notes: [
          {
            title: "선형회귀",
            href: "notes/machine-learning-basics/linear-regression.md",
            summary: "DM_Lecure3의 내용을 바탕으로 선형회귀, 최소제곱추정, 가설검정, 예측구간, KNN 회귀와 차원의 저주를 정리합니다.",
          },
        ],
      },
      {
        number: "5",
        title: "분류 모형",
        notes: [
          {
            title: "분류 모형",
            href: "notes/machine-learning-basics/classification-models.md",
            summary: "DM_Lecure4의 내용을 바탕으로 logistic regression, multinomial logistic regression, LDA, QDA를 정리합니다.",
          },
        ],
      },
      {
        number: "6",
        title: "중간 점검 1",
        notes: [
          {
            title: "중간 점검 1",
            href: "notes/machine-learning-basics/mid-check-1.md",
            summary: "flexible/inflexible 판단, classification/regression 구분, KNN, Bayes classifier, 선형회귀 계산 문제를 정리합니다.",
          },
        ],
      },
      {
        number: "7",
        title: "표본 재사용 방법",
        notes: [
          {
            title: "표본 재사용 방법",
            href: "notes/machine-learning-basics/sample-reuse-methods.md",
            summary: "DM_Lecure5의 내용을 바탕으로 validation set, LOOCV, K-fold CV, bootstrap, time-series CV를 정리합니다.",
          },
        ],
      },
      {
        number: "8",
        title: "선형모형 선택과 정규화",
        notes: [
          {
            title: "선형모형 선택과 정규화",
            href: "notes/machine-learning-basics/model-selection-regularization.md",
            summary: "DM_Lecure6의 내용을 바탕으로 Cp/AIC/BIC, subset selection, ridge, lasso, elastic net, PCA/PCR/PLS를 정리합니다.",
          },
        ],
      },
      {
        number: "9",
        title: "중간 점검 2",
        notes: [
          {
            title: "중간 점검 2",
            href: "notes/machine-learning-basics/mid-check-2.md",
            summary: "공선성, LDA/QDA, logistic likelihood, multinomial logistic regression, k-fold CV, bootstrap 문제를 풀이합니다.",
          },
        ],
      },
      {
        number: "10",
        title: "중간 점검 3",
        notes: [
          {
            title: "중간 점검 3",
            href: "notes/machine-learning-basics/mid-check-3.md",
            summary: "연습 중간고사의 참거짓, 지도학습, 회귀모형 비교, AIC, F-test, LOOCV, bootstrap 문제를 풀이합니다.",
          },
        ],
      },
    ],
    notes: [],
  },
];

const noteEl = document.querySelector("#note");
const prerequisitesEl = document.querySelector("#prerequisites");
const reviewEl = document.querySelector("#review");
const relatedEl = document.querySelector("#related");
const mathStore = [];
const SQLD_CATEGORY_ID = "sqld";
const sqldCategory = catalogItems.find((item) => item.id === SQLD_CATEGORY_ID);
const sqldNotes = Array.isArray(sqldCategory?.notes) ? sqldCategory.notes : [];

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
    <p class="catalog-kicker">Vincent's Math Notes</p>
    <h1 class="catalog-title">SQLD 자격증</h1>
    <p class="catalog-description">
      SQLD 정리 노트와 기출 요약만 따로 모아둔 전용 페이지입니다. 원하는 문서를 바로 열어보면 됩니다.
    </p>
    <div class="note-list">
      ${sqldNotes
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
  `;

  clearRightRail();
  document.querySelectorAll("[data-note-link]").forEach((link) => link.classList.remove("active"));
  document.querySelectorAll("[data-category-link]").forEach((link) => link.classList.remove("active"));
  document.querySelectorAll("[data-home-link]").forEach((link) => link.classList.add("active"));
}

function renderCategory(categoryId) {
  if (categoryId !== SQLD_CATEGORY_ID) {
    renderCatalog();
    return;
  }

  const category = catalogItems.find((item) => item.id === categoryId);
  if (!category) {
    renderCatalog();
    return;
  }

  noteEl.className = "catalog-view";
  const sections = Array.isArray(category.sections) ? category.sections : [];
  const flatNotes = Array.isArray(category.notes) ? category.notes : [];
  const hasContent = sections.length || flatNotes.length;

  noteEl.innerHTML = `
    <div class="category-header">
      <p class="catalog-kicker">${category.number}</p>
      <h1 class="catalog-title">${category.name}</h1>
      <p class="catalog-description">${category.description}</p>
    </div>
    ${
      hasContent
        ? `${sections
            .map(
              (section) => `
                <section class="category-section">
                  <h2>${section.number}. ${section.title}</h2>
                  <div class="note-list">
                    ${section.notes
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
          ${
            flatNotes.length
              ? `<div class="note-list">
                  ${flatNotes
                    .map(
                      (note) => `
                        <a class="note-list-item" href="#${note.href}">
                          <strong>${note.title}</strong>
                          <span>${note.summary}</span>
                        </a>
                      `,
                    )
                    .join("")}
                </div>`
              : ""
          }`
        : `<div class="empty-note">아직 노트가 없습니다. 이 과목의 첫 글을 나에게 부탁하면 여기에 연결해둘 수 있어요.</div>`
    }
  `;

  clearRightRail();
  document.querySelectorAll("[data-home-link]").forEach((link) => link.classList.remove("active"));
  document.querySelectorAll("[data-note-link]").forEach((link) => link.classList.remove("active"));
  document.querySelectorAll("[data-category-link]").forEach((link) => {
    link.classList.toggle("active", link.dataset.categoryLink === categoryId);
  });
}

function enhanceMarkdownLinks(container) {
  container.querySelectorAll("a").forEach((link) => {
    const href = link.getAttribute("href") || "";
    if (href.endsWith(".md")) {
      link.setAttribute("href", `#${href}`);
    }
  });
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function highlightSql(code) {
  const keywords = [
    "ADD",
    "ALTER",
    "AND",
    "AS",
    "ASC",
    "BEGIN",
    "BETWEEN",
    "BY",
    "CASE",
    "CHECK",
    "COMMIT",
    "CONNECT",
    "CONSTRAINT",
    "CREATE",
    "CROSS",
    "DELETE",
    "DESC",
    "DISTINCT",
    "DROP",
    "ELSE",
    "END",
    "EXCEPT",
    "FETCH",
    "FIRST",
    "FOR",
    "FOREIGN",
    "FROM",
    "FULL",
    "GRANT",
    "GROUP",
    "HAVING",
    "IN",
    "INNER",
    "INSERT",
    "INTERSECT",
    "INTO",
    "IS",
    "JOIN",
    "KEY",
    "LEFT",
    "LIKE",
    "LIMIT",
    "MERGE",
    "MINUS",
    "NATURAL",
    "NOT",
    "NULL",
    "ON",
    "OR",
    "ORDER",
    "OUTER",
    "OVER",
    "PARTITION",
    "PRIMARY",
    "PRIOR",
    "REFERENCES",
    "RENAME",
    "REVOKE",
    "RIGHT",
    "ROLLBACK",
    "ROWNUM",
    "ROWS",
    "SAVEPOINT",
    "SELECT",
    "SET",
    "START",
    "TABLE",
    "THEN",
    "TO",
    "TRUNCATE",
    "UNION",
    "UPDATE",
    "USING",
    "VALUES",
    "WHEN",
    "WHERE",
    "WITH",
  ];
  const functions = [
    "AVG",
    "CAST",
    "COALESCE",
    "COUNT",
    "DENSE_RANK",
    "LAG",
    "LEAD",
    "MAX",
    "MIN",
    "NVL",
    "RANK",
    "ROUND",
    "ROW_NUMBER",
    "SUM",
  ];
  const keywordPattern = keywords.join("|");
  const functionPattern = functions.join("|");
  const tokenPattern = new RegExp(
    `(--.*$|'(?:''|[^'])*'|\\b(?:${functionPattern})\\b(?=\\s*\\()|\\b(?:${keywordPattern})\\b|\\b\\d+(?:\\.\\d+)?\\b|[(),.*=<>+\\-/])`,
    "gim",
  );

  let html = "";
  let lastIndex = 0;
  let match;

  while ((match = tokenPattern.exec(code)) !== null) {
    const token = match[0];
    html += escapeHtml(code.slice(lastIndex, match.index));

    if (token.startsWith("--")) {
      html += `<span class="sql-comment">${escapeHtml(token)}</span>`;
    } else if (token.startsWith("'")) {
      html += `<span class="sql-string">${escapeHtml(token)}</span>`;
    } else if (/^\d/.test(token)) {
      html += `<span class="sql-number">${escapeHtml(token)}</span>`;
    } else if (functions.includes(token.toUpperCase())) {
      html += `<span class="sql-function">${escapeHtml(token)}</span>`;
    } else if (keywords.includes(token.toUpperCase())) {
      html += `<span class="sql-keyword">${escapeHtml(token)}</span>`;
    } else {
      html += `<span class="sql-operator">${escapeHtml(token)}</span>`;
    }

    lastIndex = tokenPattern.lastIndex;
  }

  html += escapeHtml(code.slice(lastIndex));
  return html;
}

function enhanceCodeBlocks(container) {
  container.querySelectorAll("pre code.language-sql").forEach((block) => {
    block.innerHTML = highlightSql(block.textContent);
    block.closest("pre")?.classList.add("code-block", "code-block-sql");
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
    enhanceCodeBlocks(noteEl);

    document.querySelectorAll("[data-note-link]").forEach((link) => {
      link.classList.toggle("active", link.dataset.noteLink === notePath);
    });
    document.querySelectorAll("[data-home-link]").forEach((link) => link.classList.remove("active"));
    document.querySelectorAll("[data-category-link]").forEach((link) => link.classList.remove("active"));

    if (window.MathJax?.typesetPromise) {
      await window.MathJax.typesetPromise([noteEl]);
    }

    window.initAffineDemos?.(noteEl);
    window.initExpectedTestMseDemos?.(noteEl);
    window.initOrthogonalResidualDemos?.(noteEl);
    window.initCurseDimensionalityDemos?.(noteEl);
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
  const hash = decodeURIComponent(window.location.hash.slice(1));
  const note = currentNoteFromHash();

  if (note) {
    loadNote(note);
    return;
  }

  if (hash.startsWith("category/")) {
    renderCategory(hash.replace("category/", ""));
    return;
  }

  renderCatalog();
}

window.addEventListener("hashchange", route);
window.addEventListener("DOMContentLoaded", route);
