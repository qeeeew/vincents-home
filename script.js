const sectionLinks = document.querySelectorAll("[data-section-link]");
const sections = document.querySelectorAll(".section-panel");
const categoryButtons = document.querySelectorAll(".category-card");
const categoryDetail = document.querySelector("#categoryDetail");
const insightList = document.querySelector("#insightList");
const strategyTabs = document.querySelectorAll(".strategy-tab");
const tickerInput = document.querySelector("#tickerInput");
const runAnalysis = document.querySelector("#runAnalysis");
const cursorTrail = document.querySelector("#cursorTrail");
const closedSections = new Set(["market", "beauty"]);
const API_BASE_URL = window.VINCENT_API_BASE_URL || "https://vincents-home.onrender.com";
let sectionTransitionTimer = null;

const categories = {
  professional: {
    title: "전문직 진로 고민",
    body: "진입 예정 직군, 현재 전공/학점/자격증, 준비 기간, 재정 상황을 기준으로 현실적인 선택지를 정리합니다.",
    points: ["진입 가능성", "준비 우선순위", "리스크와 대안 경로"],
  },
  career: {
    title: "취업 준비 고민",
    body: "금융권, 사기업, 공기업 등 목표 산업과 직무를 기준으로 현재 스펙과 준비 순서를 점검합니다.",
    points: ["목표 직무 정리", "스펙 보완", "지원 전략"],
  },
  major: {
    title: "대학교/학부/전공 선택",
    body: "학교 라인, 전공 선택, 복수전공, 편입/전과 가능성을 함께 놓고 진로 방향을 비교합니다.",
    points: ["전공 적합도", "진로 연결성", "선택지 비교"],
  },
  direction: {
    title: "중졸·고졸 이후 진로 방향",
    body: "학력, 시간, 비용, 취업 가능성을 기준으로 현실적인 다음 선택지를 설계합니다.",
    points: ["학업 재진입", "취업 루트", "자격증 전략"],
  },
  certificate: {
    title: "자격증·어학 준비 상담",
    body: "목표 직무에 필요한 자격증과 어학 점수를 구분하고, 효율적인 준비 순서를 잡습니다.",
    points: ["필수/선택 구분", "시험 일정", "우선순위"],
  },
  essay: {
    title: "자소서 첨삭/기타",
    body: "지원 회사, 문항, 현재 초안을 바탕으로 메시지 구조와 설득력을 다듬습니다.",
    points: ["문항 해석", "경험 구조화", "표현 정리"],
  },
  etc: {
    title: "기타 상담",
    body: "분류하기 어려운 고민, 인간관계, 한탄, 방향성 점검까지 넓게 다룹니다.",
    points: ["상황 정리", "감정 분리", "다음 행동"],
  },
};

const insightPosts = {
  professional: [
    {
      title: "전문직 진입 전에 먼저 계산해야 할 것",
      receivedDate: "2026-04-17",
      views: 0,
      concern: "전문직 준비를 시작하고 싶은데, 지금 스펙과 재정 상황에서 진입해도 되는지 고민하는 케이스.",
      insight: "기간, 비용, 실패했을 때의 대안까지 숫자로 놓고 봐야 합니다. 의지만으로 진입하기보다 감당 가능한 손실 범위를 먼저 정하는 게 핵심입니다.",
    },
  ],
  career: [
    {
      title: "금융권 취업을 준비할 때 직무부터 좁혀야 하는 이유",
      receivedDate: "2026-04-17",
      views: 0,
      concern: "금융권에 가고 싶지만 PB, 보험, 공기업, 사기업 중 어디를 목표로 해야 할지 흐릿한 케이스.",
      insight: "금융권이라는 큰 단어보다 실제로 매일 하게 될 일을 먼저 봐야 합니다. 직무가 정해져야 자격증, 영어, 경험의 우선순위가 정리됩니다.",
    },
  ],
  major: [
    {
      title: "전공 선택은 흥미와 출구를 같이 봐야 한다",
      receivedDate: "2026-04-17",
      views: 0,
      concern: "현재 전공이 맞는지 모르겠고 복수전공이나 전과를 해야 할지 고민하는 케이스.",
      insight: "전공은 좋아하는 정도와 졸업 후 선택지를 같이 봐야 합니다. 지금 당장의 선호보다 2~3년 뒤 활용 가능한 무기를 만드는 쪽으로 판단해야 합니다.",
    },
  ],
  direction: [
    {
      title: "학력보다 먼저 정리해야 할 다음 행동",
      receivedDate: "2026-04-17",
      views: 0,
      concern: "중졸 또는 고졸 이후 진학, 취업, 자격증 중 어떤 길을 먼저 잡아야 할지 고민하는 케이스.",
      insight: "선택지를 한 번에 비교하지 말고, 가장 빨리 검증할 수 있는 행동부터 잡아야 합니다. 작은 실행으로 방향을 확인한 뒤 다음 선택을 좁히는 게 좋습니다.",
    },
  ],
  certificate: [
    {
      title: "자격증은 많을수록 좋은 게 아니다",
      receivedDate: "2026-04-17",
      views: 0,
      concern: "어학과 자격증을 준비하고 있지만 어떤 시험을 먼저 봐야 할지 헷갈리는 케이스.",
      insight: "목표 직무와 연결되지 않는 자격증은 시간만 잡아먹을 수 있습니다. 필수 조건, 가산점, 자기만족용을 구분해서 순서를 정해야 합니다.",
    },
  ],
  essay: [
    {
      title: "자소서는 좋은 문장이 아니라 좋은 구조다",
      receivedDate: "2026-04-17",
      views: 0,
      concern: "경험은 있는데 자소서 문항에 어떻게 풀어야 할지 막히는 케이스.",
      insight: "먼저 문항이 묻는 능력을 정확히 잡고, 경험은 그 능력을 증명하는 재료로 써야 합니다. 표현보다 구조가 먼저입니다.",
    },
  ],
  etc: [
    {
      title: "고민이 정리되지 않을 때는 분류부터 해야 한다",
      receivedDate: "2026-04-17",
      views: 0,
      concern: "진로, 인간관계, 감정 문제가 섞여 무엇부터 해결해야 할지 모르는 케이스.",
      insight: "지금 당장 해결할 문제와 그냥 털어놓아야 하는 감정을 분리해야 합니다. 모든 고민을 결론으로 몰고 가면 오히려 판단이 흐려집니다.",
    },
  ],
};

const strategies = {
  knn: {
    title: "KNN 유사 패턴 분석",
    description: "현재 가격/기술 지표와 비슷했던 과거 구간을 찾아 이후 수익률 분포를 확인합니다.",
    metrics: ["67%", "+4.2%", "15개"],
  },
  etf: {
    title: "ETFs 활용 주가 방향 예측",
    description: "섹터 ETF, 지수 ETF, 금리/원자재 ETF 흐름을 조합해 개별 종목 방향성을 추정합니다.",
    metrics: ["72%", "+3.1%", "9개 ETF"],
  },
  cluster: {
    title: "클러스터링",
    description: "변동성, 모멘텀, 거래량, 수익률 특성으로 유사 종목 그룹을 나누고 현재 위치를 확인합니다.",
    metrics: ["4번 군집", "21개", "중립"],
  },
  value: {
    title: "가치투자 퀀트 전략",
    description: "밸류에이션, 수익성, 재무 안정성 지표를 조합해 후보 종목을 필터링합니다.",
    metrics: ["상위 18%", "B+", "12개"],
  },
};

function showSection(id) {
  if (closedSections.has(id)) {
    id = "home";
    history.replaceState(null, "", "#home");
  }

  sections.forEach((section) => {
    section.classList.toggle("active", section.id === id);
  });

  document.body.classList.toggle("home-active", id === "home");

  sectionLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.sectionLink === id);
  });
}

function navigateToSection(id) {
  if (closedSections.has(id)) {
    id = "home";
  }

  const targetExists = document.getElementById(id);
  if (!targetExists) return;

  const leavingHome = document.body.classList.contains("home-active") && id !== "home";
  history.pushState(null, "", `#${id}`);

  if (!leavingHome) {
    showSection(id);
    return;
  }

  if (sectionTransitionTimer) {
    window.clearTimeout(sectionTransitionTimer);
  }

  document.body.classList.add("stone-transitioning");
  sectionTransitionTimer = window.setTimeout(() => {
    showSection(id);
    document.body.classList.add("section-revealing");

    window.requestAnimationFrame(() => {
      document.body.classList.remove("stone-transitioning");
    });

    window.setTimeout(() => {
      document.body.classList.remove("section-revealing");
      sectionTransitionTimer = null;
    }, 900);
  }, 760);
}

async function updateCategory(key) {
  const selected = categories[key];
  if (!selected) return;

  categoryDetail.innerHTML = `
    <div class="block-title">
      <span>Selected</span>
      <h3>${selected.title}</h3>
    </div>
    <p>${selected.body}</p>
    <ul>${selected.points.map((point) => `<li>${point}</li>`).join("")}</ul>
  `;

  categoryButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.category === key);
  });

  renderInsightPosts(key, insightPosts[key] || [], true);

  const notionPosts = await fetchInsightPosts(key);
  if (notionPosts) {
    renderInsightPosts(key, notionPosts);
  }
}

async function fetchInsightPosts(key) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/consulting-posts?category=${encodeURIComponent(key)}`);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatKoreanDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}년 ${String(date.getMonth() + 1).padStart(2, "0")}월 ${String(date.getDate()).padStart(2, "0")}일`;
}

function renderRichText(segments = []) {
  if (!segments.length) return "";

  return segments.map((segment) => {
    const annotations = segment.annotations || {};
    let text = escapeHtml(segment.text || "");

    if (annotations.code) text = `<code>${text}</code>`;
    if (annotations.bold) text = `<strong>${text}</strong>`;
    if (annotations.italic) text = `<em>${text}</em>`;
    if (annotations.underline) text = `<span class="text-underline">${text}</span>`;
    if (annotations.strikethrough) text = `<s>${text}</s>`;
    if (segment.href) {
      text = `<a href="${escapeHtml(segment.href)}" target="_blank" rel="noreferrer">${text}</a>`;
    }

    return text;
  }).join("");
}

function renderFallbackDetail(post) {
  return `
    <div class="post-section">
      <strong>고민 내용</strong>
      <p>${escapeHtml(post.concern)}</p>
    </div>
    <div class="post-section">
      <strong>Vincent's insight</strong>
      <p>${escapeHtml(post.insight)}</p>
    </div>
  `;
}

function renderContentBlocks(blocks = []) {
  if (!blocks.length) return "";

  const html = [];
  let openListType = "";

  const closeOpenList = () => {
    if (!openListType) return;
    html.push(openListType === "bulleted_list_item" ? "</ul>" : "</ol>");
    openListType = "";
  };

  const appendListItem = (block, text) => {
    const tagName = block.type === "bulleted_list_item" ? "ul" : "ol";
    if (openListType !== block.type) {
      closeOpenList();
      html.push(`<${tagName}>`);
      openListType = block.type;
    }
    html.push(`<li>${text}</li>`);
  };

  blocks.forEach((block) => {
    const text = renderRichText(block.richText || []);

    if (block.type === "bulleted_list_item" || block.type === "numbered_list_item") {
      appendListItem(block, text);
      return;
    }

    closeOpenList();

    if (block.type === "heading_1") html.push(`<h2>${text}</h2>`);
    if (block.type === "heading_2") html.push(`<h3>${text}</h3>`);
    if (block.type === "heading_3") html.push(`<h4>${text}</h4>`);
    if (block.type === "paragraph" && text) html.push(`<p>${text}</p>`);
    if (block.type === "quote") html.push(`<blockquote>${text}</blockquote>`);
    if (block.type === "divider") html.push(`<hr />`);
    if (block.type === "image") {
      html.push(`
        <figure>
          <img src="${escapeHtml(block.url)}" alt="${escapeHtml(block.caption || "상담 인사이트 이미지")}" loading="lazy" />
          ${block.caption ? `<figcaption>${escapeHtml(block.caption)}</figcaption>` : ""}
        </figure>
      `);
    }
    if (block.type === "file") {
      html.push(`
        <div class="file-attachment">
          <div>
            <span>첨부파일</span>
            <strong>${escapeHtml(block.name || block.caption || "첨부파일")}</strong>
            ${block.caption ? `<p>${escapeHtml(block.caption)}</p>` : ""}
          </div>
          <a href="${escapeHtml(block.url)}" target="_blank" rel="noreferrer">다운로드</a>
        </div>
      `);
    }
  });

  closeOpenList();

  return `
    <div class="blog-content">
      ${html.join("")}
    </div>
  `;
}

async function fetchPostContent(postId) {
  const response = await fetch(`${API_BASE_URL}/api/consulting-posts/${encodeURIComponent(postId)}/content`);
  if (!response.ok) return null;
  return await response.json();
}

async function fetchComments(postId) {
  const response = await fetch(`${API_BASE_URL}/api/consulting-posts/${encodeURIComponent(postId)}/comments`);
  if (!response.ok) return [];
  return await response.json();
}

async function createComment(postId, payload) {
  const response = await fetch(`${API_BASE_URL}/api/consulting-posts/${encodeURIComponent(postId)}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error("comment-create-failed");
  return await response.json();
}

async function updateComment(commentId, payload) {
  const response = await fetch(`${API_BASE_URL}/api/comments/${encodeURIComponent(commentId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error("comment-update-failed");
  return await response.json();
}

async function deleteComment(commentId, password) {
  const response = await fetch(`${API_BASE_URL}/api/comments/${encodeURIComponent(commentId)}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });

  if (!response.ok) throw new Error("comment-delete-failed");
  return await response.json();
}

function renderCommentDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function renderCommentsShell() {
  return `
    <section class="comments-section">
      <div class="comments-head">
        <h5>댓글 <span class="comment-count">0</span></h5>
      </div>
      <div class="comment-list"></div>
      <form class="comment-form">
        <div class="comment-fields">
          <input name="nickname" type="text" maxlength="20" placeholder="닉네임" autocomplete="off" required />
          <input name="password" type="password" minlength="4" maxlength="80" placeholder="비밀번호" autocomplete="new-password" required />
        </div>
        <textarea name="content" maxlength="800" placeholder="댓글을 입력하세요." required></textarea>
        <div class="comment-actions">
          <p class="comment-message" aria-live="polite"></p>
          <button type="submit">등록</button>
        </div>
      </form>
    </section>
  `;
}

function renderCommentList(section, comments) {
  section.querySelector(".comment-count").textContent = comments.length.toLocaleString("ko-KR");
  section.querySelector(".comment-list").innerHTML = comments.length
    ? comments.map((comment) => `
      <article class="comment-item" data-comment-id="${escapeHtml(comment.id)}">
        <div class="comment-meta">
          <strong>${escapeHtml(comment.nickname)}</strong>
          <span>${escapeHtml(renderCommentDate(comment.createdAt))}</span>
        </div>
        <p>${escapeHtml(comment.content)}</p>
        <div class="comment-tools">
          <button type="button" data-comment-action="edit">수정</button>
          <button type="button" data-comment-action="delete">삭제</button>
        </div>
      </article>
    `).join("")
    : `<p class="comment-empty">아직 댓글이 없습니다.</p>`;
}

async function loadComments(postId, detail) {
  let section = detail.querySelector(".comments-section");
  if (!section) {
    detail.insertAdjacentHTML("beforeend", renderCommentsShell());
    section = detail.querySelector(".comments-section");
  }

  const message = section.querySelector(".comment-message");
  const comments = await fetchComments(postId);
  renderCommentList(section, comments);
  bindCommentControls(section, postId, detail);
  message.textContent = "";
}

function bindCommentControls(section, postId, detail) {
  const form = section.querySelector(".comment-form");
  if (!form.dataset.bound) {
    form.dataset.bound = "true";
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const message = section.querySelector(".comment-message");
      const formData = new FormData(form);
      const payload = {
        nickname: String(formData.get("nickname") || ""),
        password: String(formData.get("password") || ""),
        content: String(formData.get("content") || ""),
      };

      try {
        await createComment(postId, payload);
        form.reset();
        await loadComments(postId, detail);
      } catch {
        message.textContent = "댓글 등록에 실패했습니다.";
      }
    });
  }

  section.querySelectorAll("[data-comment-action]").forEach((button) => {
    if (button.dataset.bound) return;
    button.dataset.bound = "true";
    button.addEventListener("click", async () => {
      const item = button.closest(".comment-item");
      const commentId = item.dataset.commentId;
      const action = button.dataset.commentAction;
      const password = window.prompt("댓글 비밀번호를 입력하세요.");
      if (!password) return;

      try {
        if (action === "edit") {
          const currentContent = item.querySelector("p").textContent;
          const content = window.prompt("수정할 댓글 내용을 입력하세요.", currentContent);
          if (!content) return;
          await updateComment(commentId, { password, content });
        }

        if (action === "delete") {
          await deleteComment(commentId, password);
        }

        await loadComments(postId, detail);
      } catch {
        section.querySelector(".comment-message").textContent = "비밀번호를 확인해 주세요.";
      }
    });
  });
}

function renderInsightPosts(key, posts = [], isFallback = false) {
  if (!insightList) return;

  if (!posts.length) {
    insightList.innerHTML = `
      <article class="insight-post empty-post">
        <h4>아직 공개된 상담 게시글이 없습니다.</h4>
        <p>Notion에 정리한 글이 연결되면 이 카테고리에 자동으로 표시됩니다.</p>
      </article>
    `;
    return;
  }

  insightList.innerHTML = posts.map((post, index) => {
    const date = formatKoreanDate(post.receivedDate);
    const views = Number(post.views || 0).toLocaleString("ko-KR");
    const postId = post.id || `fallback-${key}-${index}`;

    return `
      <article class="insight-post" data-post-id="${escapeHtml(postId)}" data-fallback="${isFallback ? "true" : "false"}">
        <button class="insight-summary" type="button" aria-expanded="false">
          <span class="post-category">${escapeHtml(categories[key].title)}${isFallback ? " · 예시" : ""}</span>
          <h4>${escapeHtml(post.title)}</h4>
          <span class="post-meta">
            ${date ? `<span>접수된 날짜: ${date}</span>` : ""}
            <span class="view-count">조회수: ${views}</span>
          </span>
        </button>
        <div class="post-detail" data-loaded="${isFallback ? "true" : "false"}" hidden>
          ${renderFallbackDetail(post)}
        </div>
      </article>
    `;
  }).join("");

  bindInsightPostToggles();
}

async function incrementPostView(postId) {
  const response = await fetch(`${API_BASE_URL}/api/consulting-posts/${encodeURIComponent(postId)}/view`, {
    method: "POST",
  });

  if (!response.ok) return null;
  return await response.json();
}

function bindInsightPostToggles() {
  insightList.querySelectorAll(".insight-summary").forEach((summary) => {
    summary.addEventListener("click", async () => {
      const post = summary.closest(".insight-post");
      const detail = post.querySelector(".post-detail");
      const viewCount = post.querySelector(".view-count");
      const willOpen = summary.getAttribute("aria-expanded") !== "true";

      summary.setAttribute("aria-expanded", String(willOpen));
      post.classList.toggle("open", willOpen);
      detail.hidden = !willOpen;

      if (willOpen && post.dataset.fallback !== "true" && detail.dataset.loaded !== "true") {
        const fallbackContent = detail.innerHTML;
        detail.innerHTML = `<p class="post-loading">Notion 글을 불러오는 중입니다.</p>`;

        try {
          const content = await fetchPostContent(post.dataset.postId);
          const renderedBlocks = renderContentBlocks(content?.blocks || []);
          detail.innerHTML = renderedBlocks || fallbackContent;
          detail.dataset.loaded = "true";
        } catch {
          detail.innerHTML = fallbackContent;
        }
      }

      if (willOpen && post.dataset.fallback !== "true") {
        await loadComments(post.dataset.postId, detail);
      }

      if (!willOpen || post.dataset.viewed === "true") return;

      post.dataset.viewed = "true";

      if (post.dataset.fallback === "true") {
        const current = Number(viewCount.textContent.replace(/[^\d]/g, "")) || 0;
        viewCount.textContent = `조회수: ${(current + 1).toLocaleString("ko-KR")}`;
        return;
      }

      try {
        const result = await incrementPostView(post.dataset.postId);
        if (result && Number.isFinite(result.views)) {
          viewCount.textContent = `조회수: ${Number(result.views).toLocaleString("ko-KR")}`;
        }
      } catch {
        post.dataset.viewed = "false";
      }
    });
  });
}

function updateStrategy(key) {
  const selected = strategies[key];
  if (!selected) return;

  document.querySelector("#strategyTitle").textContent = selected.title;
  document.querySelector("#strategyDescription").textContent = selected.description;
  document.querySelector("#metricOne").textContent = selected.metrics[0];
  document.querySelector("#metricTwo").textContent = selected.metrics[1];
  document.querySelector("#metricThree").textContent = selected.metrics[2];

  strategyTabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.strategy === key);
  });
}

function initCursorTrail() {
  if (!cursorTrail) return;
  if (window.matchMedia("(pointer: coarse), (prefers-reduced-motion: reduce)").matches) return;

  const context = cursorTrail.getContext("2d");
  const points = [];
  const maxPoints = 54;
  let width = 0;
  let height = 0;
  let animationFrame = null;
  let lastPointer = null;

  function resizeCanvas() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    cursorTrail.width = Math.floor(width * pixelRatio);
    cursorTrail.height = Math.floor(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }

  function drawTrail() {
    context.clearRect(0, 0, width, height);

    if (points.length > 2) {
      context.lineCap = "round";
      context.lineJoin = "round";

      context.beginPath();
      context.moveTo(points[0].x, points[0].y);

      for (let index = 1; index < points.length - 1; index += 1) {
        const current = points[index];
        const next = points[index + 1];
        const midpointX = (current.x + next.x) / 2;
        const midpointY = (current.y + next.y) / 2;
        context.quadraticCurveTo(current.x, current.y, midpointX, midpointY);
      }

      context.globalCompositeOperation = "source-over";
      context.shadowColor = "rgba(255, 252, 244, 0.18)";
      context.shadowBlur = 10;
      context.strokeStyle = "rgba(255, 252, 244, 0.2)";
      context.lineWidth = 5;
      context.stroke();

      context.shadowBlur = 0;
      context.strokeStyle = "rgba(67, 71, 55, 0.26)";
      context.lineWidth = 1.15;
      context.stroke();

      context.strokeStyle = "rgba(255, 252, 244, 0.38)";
      context.lineWidth = 0.7;
      context.stroke();
    }

    points.forEach((point) => {
      point.x += point.vx * 0.035;
      point.y += point.vy * 0.035;
      point.vx *= 0.985;
      point.vy *= 0.985;
      point.life -= 0.018;
    });

    while (points.length && points[0].life <= 0) {
      points.shift();
    }

    animationFrame = window.requestAnimationFrame(drawTrail);
  }

  window.addEventListener("pointermove", (event) => {
    const current = { x: event.clientX, y: event.clientY };
    const velocity = lastPointer
      ? {
          x: current.x - lastPointer.x,
          y: current.y - lastPointer.y,
        }
      : { x: 0, y: 0 };

    points.push({
      x: current.x,
      y: current.y,
      vx: velocity.x,
      vy: velocity.y,
      life: 1,
    });
    lastPointer = current;

    if (points.length > maxPoints) {
      points.shift();
    }
  });

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();
  animationFrame = window.requestAnimationFrame(drawTrail);

  window.addEventListener("pagehide", () => {
    if (animationFrame) {
      window.cancelAnimationFrame(animationFrame);
    }
  });
}

sectionLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    navigateToSection(link.dataset.sectionLink);
  });
});

categoryButtons.forEach((button) => {
  button.addEventListener("click", async (event) => {
    const shouldMoveToPosts =
      Boolean(event.target.closest(".category-arrow")) ||
      window.matchMedia("(max-width: 720px)").matches;
    await updateCategory(button.dataset.category);

    if (shouldMoveToPosts && insightList) {
      window.requestAnimationFrame(() => {
        insightList.closest(".insight-board").scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }
  });
});

strategyTabs.forEach((tab) => {
  tab.addEventListener("click", () => updateStrategy(tab.dataset.strategy));
});

runAnalysis.addEventListener("click", () => {
  const ticker = tickerInput.value.trim().toUpperCase() || "NVDA";
  tickerInput.value = ticker;
  runAnalysis.textContent = `${ticker} 대기`;
  window.setTimeout(() => {
    runAnalysis.textContent = "분석";
  }, 900);
});

const feedbackForm = document.querySelector(".feedback-form");
if (feedbackForm) {
  feedbackForm.addEventListener("submit", (event) => {
    event.preventDefault();
  });
}

const initialSection = window.location.hash.replace("#", "") || "home";
initCursorTrail();
updateCategory("professional");
showSection(document.getElementById(initialSection) ? initialSection : "home");
