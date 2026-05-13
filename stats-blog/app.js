const postPaths = Array.isArray(window.__STATS_BLOG_POSTS__) ? window.__STATS_BLOG_POSTS__ : [];

const postNav = document.querySelector("#postNav");
const quickList = document.querySelector("#quickList");
const homeView = document.querySelector("#homeView");
const postView = document.querySelector("#postView");
const postCategory = document.querySelector("#postCategory");
const postTitle = document.querySelector("#postTitle");
const postDate = document.querySelector("#postDate");
const postReadingTime = document.querySelector("#postReadingTime");
const postSummary = document.querySelector("#postSummary");
const postTags = document.querySelector("#postTags");
const postBody = document.querySelector("#postBody");

const postCache = new Map();

function parseFrontmatter(raw) {
  const text = String(raw || "");
  if (!text.startsWith("---\n")) {
    return { meta: {}, body: text.trim() };
  }

  const closingIndex = text.indexOf("\n---\n", 4);
  if (closingIndex === -1) {
    return { meta: {}, body: text.trim() };
  }

  const frontmatter = text.slice(4, closingIndex).trim();
  const body = text.slice(closingIndex + 5).trim();
  const lines = frontmatter.split("\n");
  const meta = {};
  let currentArrayKey = null;

  lines.forEach((line) => {
    if (/^\s*-\s+/.test(line) && currentArrayKey) {
      meta[currentArrayKey].push(line.replace(/^\s*-\s+/, "").trim());
      return;
    }

    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) return;

    const [, key, value] = match;
    const trimmedValue = value.trim();
    if (!trimmedValue) {
      meta[key] = [];
      currentArrayKey = key;
      return;
    }

    meta[key] = trimmedValue;
    currentArrayKey = null;
  });

  return { meta, body };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function estimateReadingTime(text) {
  const wordCount = String(text || "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 220));
  return `${minutes} min read`;
}

async function loadPost(path) {
  if (postCache.has(path)) return postCache.get(path);

  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }

  const raw = await response.text();
  const parsed = parseFrontmatter(raw);
  const post = {
    path,
    slug: path,
    meta: parsed.meta,
    body: parsed.body,
    html: window.marked.parse(parsed.body),
  };
  postCache.set(path, post);
  return post;
}

function getHashPath() {
  return decodeURIComponent(window.location.hash.replace(/^#/, "").trim());
}

function setActiveNav(path) {
  postNav.querySelectorAll("a").forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${path}`);
  });
}

function renderTagRow(tags) {
  if (!Array.isArray(tags) || !tags.length) {
    postTags.innerHTML = "";
    return;
  }

  postTags.innerHTML = tags
    .map((tag) => `<span>${escapeHtml(tag)}</span>`)
    .join("");
}

function renderHome(posts) {
  homeView.hidden = false;
  postView.hidden = true;
  setActiveNav("");

  quickList.innerHTML = posts.map((post, index) => `
    <a class="quick-card" href="#${post.path}">
      <span>${String(index + 1).padStart(2, "0")}</span>
      <strong>${escapeHtml(post.meta.title || post.path)}</strong>
      <p>${escapeHtml(post.meta.summary || "")}</p>
      <small>${escapeHtml(formatDate(post.meta.date || ""))}</small>
    </a>
  `).join("");
}

function renderPost(post) {
  homeView.hidden = true;
  postView.hidden = false;
  setActiveNav(post.path);

  postCategory.textContent = post.meta.category || "Statistics";
  postTitle.textContent = post.meta.title || post.path;
  postDate.textContent = formatDate(post.meta.date || "");
  postReadingTime.textContent = estimateReadingTime(post.body);
  postSummary.textContent = post.meta.summary || "";
  renderTagRow(post.meta.tags);
  postBody.innerHTML = post.html;
}

async function bootstrap() {
  const posts = await Promise.all(postPaths.map(loadPost));
  posts.sort((left, right) => String(right.meta.date || "").localeCompare(String(left.meta.date || "")));

  postNav.innerHTML = posts.map((post) => `
    <a href="#${post.path}">
      <strong>${escapeHtml(post.meta.title || post.path)}</strong>
      <small>${escapeHtml(formatDate(post.meta.date || ""))}</small>
    </a>
  `).join("");

  const hashPath = getHashPath();
  const activePost = posts.find((post) => post.path === hashPath);

  if (activePost) {
    renderPost(activePost);
    return;
  }

  renderHome(posts);
}

window.addEventListener("hashchange", async () => {
  const path = getHashPath();
  if (!path) {
    const posts = await Promise.all(postPaths.map(loadPost));
    posts.sort((left, right) => String(right.meta.date || "").localeCompare(String(left.meta.date || "")));
    renderHome(posts);
    return;
  }

  try {
    const post = await loadPost(path);
    renderPost(post);
  } catch {
    window.location.hash = "";
  }
});

bootstrap().catch(() => {
  homeView.hidden = false;
  postView.hidden = true;
  quickList.innerHTML = `
    <article class="quick-card quick-card-error">
      <span>!</span>
      <strong>글을 불러오지 못했습니다.</strong>
      <p>파일 경로와 registry 설정을 다시 확인해 주세요.</p>
      <small>stats-blog/post-registry.js</small>
    </article>
  `;
});
