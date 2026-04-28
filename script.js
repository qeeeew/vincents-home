const sectionLinks = document.querySelectorAll("[data-section-link]");
const sections = document.querySelectorAll(".section-panel");
const categoryButtons = document.querySelectorAll(".category-card");
const categoryDetail = document.querySelector("#categoryDetail");
const insightList = document.querySelector("#insightList");
const archivePagination = document.querySelector("#archivePagination");
const cursorTrail = document.querySelector("#cursorTrail");
const housingLabForm = document.querySelector("#housingLabForm");
const runHousingLab = document.querySelector("#runHousingLab");
const labSummaryGrid = document.querySelector("#labSummaryGrid");
const closedSections = new Set(["beauty"]);
const API_BASE_URL = window.VINCENT_API_BASE_URL || "";
const POSTS_PER_ARCHIVE_PAGE = 7;
const marketLabData = Array.isArray(window.marketLabData) ? window.marketLabData : [];
let sectionTransitionTimer = null;
let archiveState = {
  key: "professional",
  posts: [],
  isFallback: false,
  page: 1,
};

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

const rankOrder = {
  "1순위": 1,
  "2순위": 2,
  "3순위": 3,
};

const LAB_PAGE_PASSWORD = "1004";
const LAB_ACCESS_STORAGE_KEY = "vincent-market-lab-access";

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
      <h3>${selected.title}</h3>
    </div>
    <p>${selected.body}</p>
    <ul>${selected.points.map((point) => `<li>${point}</li>`).join("")}</ul>
  `;

  categoryButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.category === key);
  });

  archiveState.page = 1;
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

function formatKoreanDateTime(value) {
  if (!value) return "";
  const normalizedValue = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value;
  const date = new Date(normalizedValue);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
}

function toSortableTimestamp(value) {
  if (!value) return 0;
  const normalizedValue = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value;
  const timestamp = new Date(normalizedValue).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function parseLegacyPinnedOrder(value) {
  const normalized = String(value || "").trim();
  if (!/^[1-9]\d*$/.test(normalized)) return Number.POSITIVE_INFINITY;

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed === 9999) return Number.POSITIVE_INFINITY;
  return parsed;
}

function isFeaturedPost(post) {
  if (!post) return false;
  if (post.featured === true) return true;
  return Number.isFinite(parseLegacyPinnedOrder(post.order));
}

function sortPostsByReceivedDate(posts = []) {
  return [...posts].sort((left, right) => {
    const leftFeatured = isFeaturedPost(left);
    const rightFeatured = isFeaturedPost(right);

    if (leftFeatured !== rightFeatured) {
      return leftFeatured ? -1 : 1;
    }

    const leftOrder = parseLegacyPinnedOrder(left?.order);
    const rightOrder = parseLegacyPinnedOrder(right?.order);
    const leftPinned = Number.isFinite(leftOrder);
    const rightPinned = Number.isFinite(rightOrder);

    if (leftPinned && rightPinned && leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    const receivedDiff = toSortableTimestamp(right.receivedDate) - toSortableTimestamp(left.receivedDate);
    if (receivedDiff !== 0) return receivedDiff;
    return toSortableTimestamp(right.created) - toSortableTimestamp(left.created);
  });
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

function renderArchivePagination(totalPages) {
  if (!archivePagination) return;

  if (totalPages <= 1) {
    archivePagination.innerHTML = `
      <span class="archive-page-status">1</span>
    `;
    return;
  }

  archivePagination.innerHTML = Array.from({ length: totalPages }, (_, index) => {
    const page = index + 1;
    const isCurrent = page === archiveState.page;
    return `
      <button type="button" class="archive-page-button${isCurrent ? " active" : ""}" data-page="${page}" aria-current="${isCurrent ? "page" : "false"}">
        ${page}
      </button>
    `;
  }).join("");

  archivePagination.querySelectorAll(".archive-page-button").forEach((button) => {
    button.addEventListener("click", () => {
      const nextPage = Number(button.dataset.page);
      if (!Number.isFinite(nextPage) || nextPage === archiveState.page) return;
      archiveState.page = nextPage;
      renderInsightPosts(archiveState.key, archiveState.posts, archiveState.isFallback, true);
      insightList.closest(".insight-board").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function renderInsightPosts(key, posts = [], isFallback = false, keepPage = false) {
  if (!insightList) return;
  const sortedPosts = sortPostsByReceivedDate(posts);
  archiveState = {
    key,
    posts: sortedPosts,
    isFallback,
    page: keepPage ? archiveState.page : 1,
  };

  if (!sortedPosts.length) {
    insightList.innerHTML = `
      <article class="insight-post empty-post">
        <h4>아직 공개된 상담 게시글이 없습니다.</h4>
        <p>Notion에 정리한 글이 연결되면 이 카테고리에 자동으로 표시됩니다.</p>
      </article>
    `;
    renderArchivePagination(1);
    return;
  }

  const totalPages = Math.max(1, Math.ceil(sortedPosts.length / POSTS_PER_ARCHIVE_PAGE));
  archiveState.page = Math.min(Math.max(archiveState.page, 1), totalPages);
  const startIndex = (archiveState.page - 1) * POSTS_PER_ARCHIVE_PAGE;
  const visiblePosts = sortedPosts.slice(startIndex, startIndex + POSTS_PER_ARCHIVE_PAGE);

  insightList.innerHTML = visiblePosts.map((post, index) => {
    const date = formatKoreanDateTime(post.receivedDate);
    const views = Number(post.views || 0).toLocaleString("ko-KR");
    const postId = post.id || `fallback-${key}-${startIndex + index}`;
    const pinnedBadge = isFeaturedPost(post)
      ? `<span class="post-pin-badge">인기글</span>`
      : "";

    return `
      <article class="insight-post" data-post-id="${escapeHtml(postId)}" data-fallback="${isFallback ? "true" : "false"}">
        <button class="insight-summary" type="button" aria-expanded="false">
          <span class="post-labels">
            <span class="post-category">${escapeHtml(categories[key].title)}${isFallback ? " · 예시" : ""}</span>
            ${pinnedBadge}
          </span>
          <h4>${escapeHtml(post.title)}</h4>
          <span class="post-meta">
            ${date ? `<span>접수된 시간: ${date}</span>` : ""}
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
  renderArchivePagination(totalPages);
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

function formatScore(value) {
  return Number.isFinite(value) ? `${value}점` : "-";
}

function formatPercent(value) {
  if (!Number.isFinite(value)) return "-";
  return `${(value * 100).toFixed(value >= 0.1 ? 0 : 1)}%`;
}

function formatApplicantBreakdown(record) {
  const rank1 = Number.isFinite(record.rank1Applicants) ? record.rank1Applicants : 0;
  const rank2 = Number.isFinite(record.rank2Applicants) ? record.rank2Applicants : 0;
  const rank3 = Number.isFinite(record.rank3Applicants) ? record.rank3Applicants : 0;

  return `1순위 ${rank1}명 · 2순위 ${rank2}명 · 3순위 ${rank3}명`;
}

function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((left, right) => left - right);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function percentile(values, ratio) {
  if (!values.length) return null;
  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.floor((sorted.length - 1) * ratio)));
  return sorted[index];
}

function average(values) {
  if (!values.length) return null;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatRange(min, max, suffix = "") {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return "-";
  return `${Math.round(min)}${suffix} ~ ${Math.round(max)}${suffix}`;
}

function formatPercentRange(range) {
  if (!range || !Number.isFinite(range.low) || !Number.isFinite(range.high)) return "-";
  return `${formatPercent(range.low)} ~ ${formatPercent(range.high)}`;
}

function wilsonInterval(successCount, sampleCount, z = 1.96) {
  if (!Number.isFinite(successCount) || !Number.isFinite(sampleCount) || sampleCount <= 0) {
    return null;
  }

  const proportion = successCount / sampleCount;
  const denominator = 1 + (z ** 2 / sampleCount);
  const center = (proportion + (z ** 2 / (2 * sampleCount))) / denominator;
  const spread = (
    z
    * Math.sqrt((proportion * (1 - proportion) / sampleCount) + (z ** 2 / (4 * sampleCount ** 2)))
  ) / denominator;

  return {
    low: clamp(center - spread, 0, 1),
    high: clamp(center + spread, 0, 1),
  };
}

function describeChance(winRate, reserveRate) {
  if (winRate >= 0.7) return "당첨 가능성 높음";
  if (winRate >= 0.45) return "당첨 가능성 보통 이상";
  if (winRate >= 0.2) return "당첨권 근처";
  if (reserveRate >= 0.35) return "예비권 가능성";
  return "당첨 가능성 낮음";
}

function getAvailableRounds() {
  const roundMap = new Map();

  marketLabData.forEach((record) => {
    if (!record?.roundKey) return;
    if (!roundMap.has(record.roundKey)) {
      roundMap.set(record.roundKey, {
        roundKey: record.roundKey,
        roundLabel: record.roundLabel || record.roundKey,
        noticeDate: record.noticeDate || "",
      });
    }
  });

  return [...roundMap.values()].sort((left, right) => String(right.noticeDate).localeCompare(String(left.noticeDate)));
}

function populateDistrictOptions(roundKey, nextDistrict = "all") {
  const districtSelect = document.querySelector("#labDistrict");
  if (!districtSelect) return;

  const districts = [...new Set(
    marketLabData
      .filter((record) => record.roundKey === roundKey)
      .map((record) => record.district),
  )].sort((left, right) => left.localeCompare(right, "ko"));

  districtSelect.innerHTML = [`<option value="all">전체</option>`]
    .concat(districts.map((district) => `<option value="${escapeHtml(district)}">${escapeHtml(district)}</option>`))
    .join("");

  districtSelect.value = districts.includes(nextDistrict) ? nextDistrict : "all";
}

function getMarketLabFilters() {
  const scoreInput = document.querySelector("#labScore");
  const applicantsInput = document.querySelector("#labApplicants");
  const supplyInput = document.querySelector("#labSupply");
  const rawScore = Number(scoreInput?.value ?? 0);
  const rawApplicants = Number(applicantsInput?.value ?? 0);
  const rawSupply = Number(supplyInput?.value ?? 0);

  return {
    roundKey: document.querySelector("#labRound")?.value || "2025-1",
    kind: document.querySelector("#labKind")?.value || "all",
    district: document.querySelector("#labDistrict")?.value || "all",
    gender: document.querySelector("#labGender")?.value || "all",
    rank: document.querySelector("#labRank")?.value || "1순위",
    score: Number.isFinite(rawScore) ? rawScore : 0,
    applicants: Number.isFinite(rawApplicants) ? rawApplicants : 0,
    supply: Number.isFinite(rawSupply) ? rawSupply : 0,
  };
}

function renderSummaryCards(records) {
  if (!labSummaryGrid) return;

  if (!records.length) {
    labSummaryGrid.innerHTML = `
      <article>
        <span>표본</span>
        <strong>0개</strong>
      </article>
      <article>
        <span>자치구</span>
        <strong>0곳</strong>
      </article>
      <article>
        <span>경쟁률 범위</span>
        <strong>-</strong>
      </article>
      <article>
        <span>당첨 점수 범위</span>
        <strong>-</strong>
      </article>
    `;
    return;
  }

  const districts = new Set(records.map((record) => record.district));
  const ratios = records.map((record) => record.competitionRatio).filter(Number.isFinite);
  const winningScores = records.map((record) => record.winningScore).filter(Number.isFinite);

  labSummaryGrid.innerHTML = `
    <article>
      <span>표본</span>
      <strong>${records.length}개</strong>
    </article>
    <article>
      <span>자치구</span>
      <strong>${districts.size}곳</strong>
    </article>
    <article>
      <span>경쟁률 범위</span>
      <strong>${ratios.length ? `${Math.min(...ratios).toFixed(1)}~${Math.max(...ratios).toFixed(1)}` : "-"}</strong>
    </article>
    <article>
      <span>당첨 점수 범위</span>
      <strong>${winningScores.length ? `${Math.min(...winningScores)}~${Math.max(...winningScores)}점` : "-"}</strong>
    </article>
  `;
}

function renderMarketLandingCard() {
  const recordCount = document.querySelector("#marketLandingRecords");
  const applicantRange = document.querySelector("#marketLandingApplicants");
  if (!recordCount || !applicantRange || !marketLabData.length) return;

  const latestRoundKey = getAvailableRounds()[0]?.roundKey;
  const records = latestRoundKey
    ? marketLabData.filter((record) => record.roundKey === latestRoundKey)
    : marketLabData;
  const applicants = records.map((record) => record.applicants).filter(Number.isFinite);

  recordCount.textContent = `${records.length}개`;
  applicantRange.textContent = applicants.length
    ? `${Math.min(...applicants)}~${Math.max(...applicants)}명`
    : "-";
}

function initMarketLabGate() {
  const gatedLinks = document.querySelectorAll("[data-lab-gate]");
  if (!gatedLinks.length) return;

  gatedLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const expectedPassword = link.dataset.labGate || LAB_PAGE_PASSWORD;
      const enteredPassword = window.prompt("비밀번호를 입력하세요.");

      if (enteredPassword === null) {
        event.preventDefault();
        return;
      }

      if (enteredPassword !== expectedPassword) {
        event.preventDefault();
        window.alert("비밀번호가 올바르지 않습니다.");
        return;
      }

      window.sessionStorage.setItem(LAB_ACCESS_STORAGE_KEY, "granted");
    });
  });
}

function getScopedLabRecords(filters) {
  return marketLabData.filter((record) => {
    if (record.roundKey !== filters.roundKey) return false;
    if (filters.kind !== "all" && record.kind !== filters.kind) return false;
    if (filters.district !== "all" && record.district !== filters.district) return false;
    if (filters.gender === "여성" && record.gender !== "여성") return false;
    if (filters.gender === "남성" && record.gender !== "남성") return false;
    if (filters.gender === "none" && record.gender) return false;
    return true;
  });
}

function getPeerRecords(filters) {
  const selectedRankOrder = rankOrder[filters.rank] || 3;

  return getScopedLabRecords(filters).filter((record) => {
    const winningRankOrder = rankOrder[record.winningRank] || 99;
    const reserveRankOrder = record.reserveRank ? (rankOrder[record.reserveRank] || 99) : 99;
    return selectedRankOrder <= winningRankOrder || selectedRankOrder <= reserveRankOrder;
  });
}

function calculatePriorityForecast(records, applicantCount) {
  if (!records.length || !Number.isFinite(applicantCount) || applicantCount <= 0) {
    return null;
  }

  const shareVectors = records
    .filter((record) => Number.isFinite(record.applicants) && record.applicants > 0)
    .map((record) => ({
      rank1: record.rank1Applicants / record.applicants,
      rank2: record.rank2Applicants / record.applicants,
      rank3: record.rank3Applicants / record.applicants,
    }));

  if (!shareVectors.length) return null;

  const expectedShares = {
    rank1: average(shareVectors.map((share) => share.rank1)),
    rank2: average(shareVectors.map((share) => share.rank2)),
    rank3: average(shareVectors.map((share) => share.rank3)),
  };

  const rangeFromShares = (key) => ({
    low: applicantCount * percentile(shareVectors.map((share) => share[key]), 0.1),
    high: applicantCount * percentile(shareVectors.map((share) => share[key]), 0.9),
  });

  const projectedCounts = {
    rank1: Math.round(applicantCount * expectedShares.rank1),
    rank2: Math.round(applicantCount * expectedShares.rank2),
    rank3: Math.max(0, applicantCount - Math.round(applicantCount * expectedShares.rank1) - Math.round(applicantCount * expectedShares.rank2)),
  };

  return {
    expectedShares,
    projectedCounts,
    ranges: {
      rank1: rangeFromShares("rank1"),
      rank2: rangeFromShares("rank2"),
      rank3: rangeFromShares("rank3"),
    },
  };
}

function inferClearanceLowerBounds(records) {
  const estimates = {
    fake1Rates: [],
    fake2Rates: [],
    fake12Rates: [],
  };

  records.forEach((record) => {
    const supply = Number(record.supply || 0);
    const rank1 = Number(record.rank1Applicants || 0);
    const rank2 = Number(record.rank2Applicants || 0);
    const winningRankOrder = rankOrder[record.winningRank] || 99;
    const reserveRankOrder = record.reserveRank ? (rankOrder[record.reserveRank] || 99) : 99;

    if (supply <= 0) return;

    const winningLimit = Math.max(0, supply - 1);
    const reserveLimit = Math.max(0, (supply * 3) - 1);

    const fake1Winning = winningRankOrder >= 2 && rank1 > 0
      ? Math.max(0, rank1 - winningLimit) / rank1
      : 0;
    const fake1Reserve = reserveRankOrder >= 2 && rank1 > 0
      ? Math.max(0, rank1 - reserveLimit) / rank1
      : 0;
    estimates.fake1Rates.push(Math.max(fake1Winning, fake1Reserve));

    const fake2Winning = winningRankOrder >= 3 && rank2 > 0
      ? Math.max(0, rank2 - winningLimit) / rank2
      : 0;
    const fake2Reserve = reserveRankOrder >= 3 && rank2 > 0
      ? Math.max(0, rank2 - reserveLimit) / rank2
      : 0;
    estimates.fake2Rates.push(Math.max(fake2Winning, fake2Reserve));

    const higherCount = rank1 + rank2;
    const fake12Winning = winningRankOrder >= 3 && higherCount > 0
      ? Math.max(0, higherCount - winningLimit) / higherCount
      : 0;
    const fake12Reserve = reserveRankOrder >= 3 && higherCount > 0
      ? Math.max(0, higherCount - reserveLimit) / higherCount
      : 0;
    estimates.fake12Rates.push(Math.max(fake12Winning, fake12Reserve));
  });

  return {
    fake1Rate: average(estimates.fake1Rates.filter(Number.isFinite)) || 0,
    fake2Rate: average(estimates.fake2Rates.filter(Number.isFinite)) || 0,
    fake12Rate: average(estimates.fake12Rates.filter(Number.isFinite)) || 0,
    fake1PositiveShare: average(estimates.fake1Rates.map((rate) => (rate > 0 ? 1 : 0))) || 0,
    fake2PositiveShare: average(estimates.fake2Rates.map((rate) => (rate > 0 ? 1 : 0))) || 0,
    fake12PositiveShare: average(estimates.fake12Rates.map((rate) => (rate > 0 ? 1 : 0))) || 0,
  };
}

function getReachRank(limit, rank1Count, rank2Count) {
  if (limit <= rank1Count) return "1순위";
  if (limit <= rank1Count + rank2Count) return "2순위";
  return "3순위";
}

function getHigherPriorityCount(rank, rank1Count, rank2Count) {
  if (rank === "1순위") return 0;
  if (rank === "2순위") return rank1Count;
  return rank1Count + rank2Count;
}

function buildClearanceEstimate(filters, forecast, lowerBounds) {
  if (!forecast || !lowerBounds) return null;

  const rawRank1 = forecast.projectedCounts.rank1;
  const rawRank2 = forecast.projectedCounts.rank2;
  const rawRank3 = forecast.projectedCounts.rank3;
  const effectiveRank1 = Math.round(rawRank1 * (1 - lowerBounds.fake1Rate));
  const effectiveRank2 = Math.round(rawRank2 * (1 - lowerBounds.fake2Rate));
  const effectiveRank3 = rawRank3;
  const winningSlots = Math.max(1, filters.supply);
  const reserveSlots = winningSlots * 3;

  return {
    rawCounts: { rank1: rawRank1, rank2: rawRank2, rank3: rawRank3 },
    effectiveCounts: { rank1: effectiveRank1, rank2: effectiveRank2, rank3: effectiveRank3 },
    lowerBounds,
    winningReachRank: getReachRank(winningSlots, effectiveRank1, effectiveRank2),
    reserveReachRank: getReachRank(reserveSlots, effectiveRank1, effectiveRank2),
    selectedRankWinningOpen: getHigherPriorityCount(filters.rank, effectiveRank1, effectiveRank2) < winningSlots,
    selectedRankReserveOpen: getHigherPriorityCount(filters.rank, effectiveRank1, effectiveRank2) < reserveSlots,
  };
}

function calculateHousingEstimate(filters) {
  const scopedRecords = getScopedLabRecords(filters);
  const peers = getPeerRecords(filters);
  const selectedRankOrder = rankOrder[filters.rank] || 3;

  if (!peers.length) {
    return {
      scopedRecords,
      peers,
      winRate: null,
      reserveRate: null,
      winInterval: null,
      reserveInterval: null,
      winningMedian: null,
      reserveMedian: null,
      ratioMedian: null,
      forecast: calculatePriorityForecast(scopedRecords, filters.applicants),
      clearance: buildClearanceEstimate(filters, calculatePriorityForecast(scopedRecords, filters.applicants), inferClearanceLowerBounds(scopedRecords)),
      matches: [],
    };
  }

  const winMatches = peers.filter((record) => {
    const winningRankOrder = rankOrder[record.winningRank] || 99;
    return selectedRankOrder <= winningRankOrder && filters.score >= record.winningScore;
  });

  const reserveMatches = peers.filter((record) => {
    if (!record.reserveRank || !Number.isFinite(record.reserveScore)) return false;
    const reserveRankOrder = rankOrder[record.reserveRank] || 99;
    return selectedRankOrder <= reserveRankOrder && filters.score >= record.reserveScore;
  });

  const closestMatches = [...peers]
    .sort((left, right) => {
      const leftGap = Math.abs(filters.score - left.winningScore);
      const rightGap = Math.abs(filters.score - right.winningScore);
      if (leftGap !== rightGap) return leftGap - rightGap;
      return left.competitionRatio - right.competitionRatio;
    })
    .slice(0, 6);

  const winInterval = wilsonInterval(winMatches.length, peers.length);
  const reserveInterval = wilsonInterval(reserveMatches.length, peers.length);
  const forecast = calculatePriorityForecast(scopedRecords, filters.applicants);
  const lowerBounds = inferClearanceLowerBounds(scopedRecords);
  const clearance = buildClearanceEstimate(filters, forecast, lowerBounds);

  return {
    scopedRecords,
    peers,
    winRate: winMatches.length / peers.length,
    reserveRate: reserveMatches.length / peers.length,
    winInterval,
    reserveInterval,
    winningMedian: median(peers.map((record) => record.winningScore).filter(Number.isFinite)),
    reserveMedian: median(peers.map((record) => record.reserveScore).filter(Number.isFinite)),
    ratioMedian: median(peers.map((record) => record.competitionRatio).filter(Number.isFinite)),
    forecast,
    clearance,
    matches: closestMatches,
  };
}

function renderMarketMatches(matches, score) {
  const matchList = document.querySelector("#labMatchList");
  if (!matchList) return;

  if (!matches.length) {
    matchList.innerHTML = `<p class="match-empty">지금 조건으로 비교할 모집군이 없습니다.</p>`;
    return;
  }

  matchList.innerHTML = matches.map((record) => {
    const scoreGap = score - record.winningScore;
    const scoreGapLabel = scoreGap >= 0 ? `당첨선 +${scoreGap}점` : `당첨선 ${scoreGap}점`;
    const housingType = record.housingType ? ` ${record.housingType}` : "";
    const gender = record.gender ? ` · ${record.gender}` : "";

    return `
      <article class="match-item">
        <div>
          <strong>${escapeHtml(record.district)} · ${escapeHtml(record.housingName + housingType)}</strong>
          <p>${escapeHtml(record.kind)} · 공급 ${record.supply}호 · 경쟁률 ${record.competitionRatio.toFixed(1)}${gender}</p>
          <small>${escapeHtml(formatApplicantBreakdown(record))}</small>
        </div>
        <div class="match-score">
          <span>${scoreGapLabel}</span>
          <strong>당첨 ${record.winningRank} ${record.winningScore}점</strong>
          <small>${record.reserveRank ? `예비 ${record.reserveRank} ${record.reserveScore}점` : "예비 커트라인 없음"}</small>
        </div>
      </article>
    `;
  }).join("");
}

function renderConfidenceBand(bandId, pointId, rate, interval) {
  const band = document.querySelector(`#${bandId}`);
  const point = document.querySelector(`#${pointId}`);
  if (!band || !point) return;

  point.textContent = formatPercent(rate);

  if (!interval) {
    band.style.left = "0%";
    band.style.width = "0%";
    band.classList.add("empty");
    return;
  }

  band.classList.remove("empty");
  band.style.left = `${interval.low * 100}%`;
  band.style.width = `${Math.max(2, (interval.high - interval.low) * 100)}%`;
}

function renderPriorityForecast(forecast, clearance) {
  const container = document.querySelector("#labPriorityForecast");
  if (!container) return;

  if (!forecast) {
    container.innerHTML = `<p class="match-empty">총 지원자 수를 넣으면 다음 회차의 1·2·3순위 분포를 추정합니다.</p>`;
    return;
  }

  const rows = [
    ["1순위", forecast.projectedCounts.rank1, forecast.ranges.rank1, clearance?.effectiveCounts.rank1],
    ["2순위", forecast.projectedCounts.rank2, forecast.ranges.rank2, clearance?.effectiveCounts.rank2],
    ["3순위", forecast.projectedCounts.rank3, forecast.ranges.rank3, clearance?.effectiveCounts.rank3],
  ];

  container.innerHTML = rows.map(([label, projected, range, effective]) => {
    const safeProjected = Number(projected) || 0;
    const width = clamp(safeProjected, 0, 1e9) / Math.max(1, forecast.projectedCounts.rank1, forecast.projectedCounts.rank2, forecast.projectedCounts.rank3) * 100;

    return `
      <article class="priority-row">
        <div class="priority-meta">
          <strong>${label}</strong>
          <span>예상 ${Math.round(safeProjected)}명</span>
          <small>과거 범위 ${formatRange(range.low, range.high, "명")}</small>
        </div>
        <div class="priority-bar">
          <i style="width:${width}%"></i>
        </div>
        <div class="priority-tail">
          <strong>${Number.isFinite(effective) ? `${Math.round(effective)}명` : "-"}</strong>
          <span>배제 하한 반영</span>
        </div>
      </article>
    `;
  }).join("");
}

function renderClearancePanel(clearance, filters) {
  const container = document.querySelector("#labScenarioPanel");
  if (!container) return;

  if (!clearance) {
    container.innerHTML = `<p class="match-empty">표본이 생기면 허위 1순위·2순위의 최소 배제 추정을 보여줍니다.</p>`;
    return;
  }

  const higherAhead = getHigherPriorityCount(filters.rank, clearance.effectiveCounts.rank1, clearance.effectiveCounts.rank2);
  const winningSlots = filters.supply;
  const reserveSlots = filters.supply * 3;

  container.innerHTML = `
    <div class="scenario-topline">
      <article>
        <span>1순위 평균 최소 배제율</span>
        <strong>${formatPercent(clearance.lowerBounds.fake1Rate)}</strong>
        <small>표본 중 ${formatPercent(clearance.lowerBounds.fake1PositiveShare)}에서 양수 하한</small>
      </article>
      <article>
        <span>2순위 평균 최소 배제율</span>
        <strong>${formatPercent(clearance.lowerBounds.fake2Rate)}</strong>
        <small>표본 중 ${formatPercent(clearance.lowerBounds.fake2PositiveShare)}에서 양수 하한</small>
      </article>
      <article>
        <span>1+2순위 평균 최소 배제율</span>
        <strong>${formatPercent(clearance.lowerBounds.fake12Rate)}</strong>
        <small>3순위 진입 기록을 기준으로 역산</small>
      </article>
    </div>
    <div class="scenario-queue">
      <article>
        <span>배제 하한 반영 후 상위 대기열</span>
        <strong>1순위 ${clearance.effectiveCounts.rank1}명 · 2순위 ${clearance.effectiveCounts.rank2}명</strong>
        <small>내 순위 위에 최소 ${higherAhead}명이 남는다고 보는 보수적 추정입니다.</small>
      </article>
      <article>
        <span>당첨권이 닿는 순위</span>
        <strong>${clearance.winningReachRank}</strong>
        <small>공급 ${winningSlots}호 기준</small>
      </article>
      <article>
        <span>예비권이 닿는 순위</span>
        <strong>${clearance.reserveReachRank}</strong>
        <small>예비 ${reserveSlots - winningSlots}명 포함 기준</small>
      </article>
    </div>
    <div class="scenario-notes">
      <p>${clearance.selectedRankWinningOpen ? `${filters.rank}는 배제 하한만 반영해도 당첨권이 열리는 케이스입니다.` : `${filters.rank}는 배제 하한만 반영하면 아직 당첨권까지는 닿지 않습니다.`}</p>
      <p>${clearance.selectedRankReserveOpen ? `${filters.rank}는 예비권까지는 진입 가능한 구조로 추정됩니다.` : `${filters.rank}는 예비권 진입도 추가 배제가 더 필요해 보입니다.`}</p>
    </div>
  `;
}

function renderHousingEstimate() {
  if (!housingLabForm) return;

  const filters = getMarketLabFilters();
  const result = calculateHousingEstimate(filters);
  const chanceBand = describeChance(result.winRate || 0, result.reserveRate || 0);
  const resultCopy = document.querySelector("#labResultCopy");

  document.querySelector("#labChanceBand").textContent = result.peers.length ? chanceBand : "표본 부족";
  document.querySelector("#labWinRate").textContent = formatPercent(result.winRate);
  document.querySelector("#labReserveRate").textContent = formatPercent(result.reserveRate);
  document.querySelector("#labSampleCount").textContent = result.peers.length ? `${result.peers.length}개` : "-";
  document.querySelector("#labWinInterval").textContent = formatPercentRange(result.winInterval);
  document.querySelector("#labReserveInterval").textContent = formatPercentRange(result.reserveInterval);
  document.querySelector("#labWinningMedian").textContent = formatScore(result.winningMedian);
  document.querySelector("#labReserveMedian").textContent = formatScore(result.reserveMedian);
  document.querySelector("#labRatioMedian").textContent = Number.isFinite(result.ratioMedian) ? `${result.ratioMedian.toFixed(1)} : 1` : "-";
  renderConfidenceBand("labWinBand", "labWinPoint", result.winRate, result.winInterval);
  renderConfidenceBand("labReserveBand", "labReservePoint", result.reserveRate, result.reserveInterval);

  if (resultCopy) {
    resultCopy.textContent = result.peers.length
      ? `${filters.rank} · ${filters.score}점 기준으로 같은 모집군 ${result.peers.length}개를 비교했습니다. 허위 순위 추정은 낮은 순위가 실제 당첨선·예비선에 들어온 기록을 이용해 최소 배제 규모를 역산한 값입니다.`
      : "현재 조건에서는 비교 가능한 모집군이 없습니다. 자치구나 성별 조건을 조금 넓혀서 다시 보세요.";
  }

  renderMarketMatches(result.matches, filters.score);
  renderPriorityForecast(result.forecast, result.clearance);
  renderClearancePanel(result.clearance, filters);
  renderSummaryCards(result.scopedRecords);
}

function initMarketLab() {
  if (!housingLabForm || !marketLabData.length) return;

  const roundSelect = document.querySelector("#labRound");
  const rounds = getAvailableRounds();
  if (roundSelect && rounds.length) {
    roundSelect.innerHTML = rounds
      .map((round) => `<option value="${escapeHtml(round.roundKey)}">${escapeHtml(round.roundLabel)}</option>`)
      .join("");
    roundSelect.value = rounds[0].roundKey;
    populateDistrictOptions(rounds[0].roundKey);
  }

  renderHousingEstimate();
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

if (housingLabForm) {
  housingLabForm.addEventListener("submit", (event) => {
    event.preventDefault();
    renderHousingEstimate();
  });

  housingLabForm.addEventListener("change", (event) => {
    if (event.target?.id === "labRound") {
      populateDistrictOptions(event.target.value);
    }
  });
}

if (runHousingLab) {
  runHousingLab.addEventListener("click", () => {
    window.setTimeout(() => {
      runHousingLab.blur();
    }, 0);
  });
}

const feedbackForm = document.querySelector(".feedback-form");
if (feedbackForm) {
  feedbackForm.addEventListener("submit", (event) => {
    event.preventDefault();
  });
}

const initialSection = window.location.hash.replace("#", "") || "home";
initCursorTrail();
initMarketLab();
initMarketLabGate();
renderMarketLandingCard();
updateCategory("professional");
showSection(document.getElementById(initialSection) ? initialSection : "home");
