const housingLabForm = document.querySelector("#housingLabForm");
const runHousingLab = document.querySelector("#runHousingLab");
const labResultsSection = document.querySelector("#labResultsSection");
let marketLabData = [];
const LAB_PAGE_PASSWORD = "1004";
const LAB_ACCESS_STORAGE_KEY = "vincent-market-lab-access";

const rankOrder = {
  "1순위": 1,
  "2순위": 2,
  "3순위": 3,
};

const BOOTSTRAP_RUNS = 1600;
const MARKET_LAB_DATA_PATH = "market-lab-data.js";

function requestPasswordInput(title = "비밀번호 입력", description = "계속하려면 비밀번호를 입력하세요.") {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "password-gate-overlay";
    overlay.innerHTML = `
      <div class="password-gate-dialog" role="dialog" aria-modal="true" aria-labelledby="passwordGateTitle">
        <form class="password-gate-form">
          <span class="password-gate-badge">Protected</span>
          <h3 id="passwordGateTitle">${title}</h3>
          <p>${description}</p>
          <input
            name="password"
            type="password"
            inputmode="numeric"
            minlength="4"
            maxlength="80"
            placeholder="비밀번호"
            autocomplete="current-password"
            required
          />
          <div class="password-gate-actions">
            <button type="button" data-action="cancel">취소</button>
            <button type="submit">확인</button>
          </div>
        </form>
      </div>
    `;

    const cleanup = (value) => {
      overlay.remove();
      resolve(value);
    };

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) cleanup(null);
    });

    const form = overlay.querySelector(".password-gate-form");
    const input = overlay.querySelector('input[name="password"]');
    const cancelButton = overlay.querySelector('[data-action="cancel"]');

    cancelButton.addEventListener("click", () => cleanup(null));
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      cleanup(input.value);
    });

    document.body.appendChild(overlay);
    window.requestAnimationFrame(() => input.focus());
  });
}

function unlockMarketLabPage() {
  document.documentElement.classList.remove("lab-auth-pending");
}

function redirectToMarketHome() {
  window.location.replace("index.html#market");
}

async function ensureMarketLabAccess() {
  const existingAccess = window.sessionStorage.getItem(LAB_ACCESS_STORAGE_KEY);
  if (existingAccess === "granted") {
    unlockMarketLabPage();
    return true;
  }

  const enteredPassword = await requestPasswordInput(
    "Market Lab 비밀번호",
    "계산기를 보려면 비밀번호를 입력하세요.",
  );

  if (enteredPassword === null) {
    redirectToMarketHome();
    return false;
  }

  if (enteredPassword === LAB_PAGE_PASSWORD) {
    window.sessionStorage.setItem(LAB_ACCESS_STORAGE_KEY, "granted");
    unlockMarketLabPage();
    return true;
  }

  window.alert("비밀번호가 올바르지 않습니다.");
  redirectToMarketHome();
  return false;
}

async function loadMarketLabData() {
  if (marketLabData.length) return marketLabData;

  await new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `${MARKET_LAB_DATA_PATH}?v=20260428-1728`;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });

  marketLabData = Array.isArray(window.marketLabData) ? window.marketLabData : [];
  return marketLabData;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

function average(values) {
  if (!values.length) return null;
  return sum(values) / values.length;
}

function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

function percentile(values, ratio) {
  if (!values.length) return null;
  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.floor((sorted.length - 1) * ratio)));
  return sorted[index];
}

function intervalFromSamples(values, low = 0.025, high = 0.975) {
  if (!values.length) return null;
  return {
    low: percentile(values, low),
    high: percentile(values, high),
  };
}

function cappedMean(values, cap = 0.9) {
  if (!values.length) return 0;
  return average(values.map((value) => Math.min(value, cap))) || 0;
}

function formatScore(value) {
  return Number.isFinite(value) ? `${value}점` : "-";
}

function formatPercent(value) {
  if (!Number.isFinite(value)) return "-";
  return `${(value * 100).toFixed(value >= 0.1 ? 0 : 1)}%`;
}

function formatPercentRange(range) {
  if (!range || !Number.isFinite(range.low) || !Number.isFinite(range.high)) return "-";
  return `${formatPercent(range.low)} ~ ${formatPercent(range.high)}`;
}

function formatRange(min, max, suffix = "") {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return "-";
  return `${Math.round(min)}${suffix} ~ ${Math.round(max)}${suffix}`;
}

function describeChance(winRate, reserveRate) {
  if (winRate >= 0.55) return "합격권";
  if (reserveRate >= 0.4) return "예비권";
  return "탈락권";
}

function getFilters() {
  return {
    rank: document.querySelector("#labRank")?.value || "1순위",
    score: Number(document.querySelector("#labScore")?.value ?? 0),
    applicants: Number(document.querySelector("#labApplicants")?.value ?? 0),
    supply: Number(document.querySelector("#labSupply")?.value ?? 0),
    includeFakeSupport: Boolean(document.querySelector("#labIncludeFakeSupport")?.checked),
  };
}

function bootstrapRecords(records) {
  const sample = [];

  for (let index = 0; index < records.length; index += 1) {
    sample.push(records[Math.floor(Math.random() * records.length)]);
  }

  return sample;
}

function calculateRankShareStats(records) {
  const totalApplicants = sum(records.map((record) => record.applicants || 0));
  if (!totalApplicants) return null;

  const rank1Applicants = sum(records.map((record) => record.rank1Applicants || 0));
  const rank2Applicants = sum(records.map((record) => record.rank2Applicants || 0));
  const rank3Applicants = sum(records.map((record) => record.rank3Applicants || 0));

  return {
    totalApplicants,
    rank1Share: rank1Applicants / totalApplicants,
    rank2Share: rank2Applicants / totalApplicants,
    rank3Share: rank3Applicants / totalApplicants,
  };
}

function inferFakeLowerBounds(records) {
  const fake1Rates = [];
  const fake2Rates = [];
  const fake12Rates = [];

  records.forEach((record) => {
    const supply = Number(record.supply || 0);
    const rank1Applicants = Number(record.rank1Applicants || 0);
    const rank2Applicants = Number(record.rank2Applicants || 0);
    const winningRankOrder = rankOrder[record.winningRank] || 99;
    const reserveRankOrder = record.reserveRank ? (rankOrder[record.reserveRank] || 99) : 99;

    if (supply <= 0) return;

    const winningSlots = supply;
    const reserveSlots = supply * 3;

    const fake1Winning = winningRankOrder >= 2 && rank1Applicants > 0
      ? Math.max(0, rank1Applicants - winningSlots + 1) / rank1Applicants
      : 0;
    const fake1Reserve = reserveRankOrder >= 2 && rank1Applicants > 0
      ? Math.max(0, rank1Applicants - reserveSlots + 1) / rank1Applicants
      : 0;
    fake1Rates.push(Math.max(fake1Winning, fake1Reserve));

    const remainingWinningAfterRank1 = Math.max(0, winningSlots - rank1Applicants);
    const remainingReserveAfterRank1 = Math.max(0, reserveSlots - rank1Applicants);
    const fake2Winning = winningRankOrder >= 3 && rank2Applicants > 0
      ? Math.max(0, rank2Applicants - remainingWinningAfterRank1 + 1) / rank2Applicants
      : 0;
    const fake2Reserve = reserveRankOrder >= 3 && rank2Applicants > 0
      ? Math.max(0, rank2Applicants - remainingReserveAfterRank1 + 1) / rank2Applicants
      : 0;
    fake2Rates.push(Math.max(fake2Winning, fake2Reserve));

    const higherApplicants = rank1Applicants + rank2Applicants;
    const fake12Winning = winningRankOrder >= 3 && higherApplicants > 0
      ? Math.max(0, higherApplicants - winningSlots + 1) / higherApplicants
      : 0;
    const fake12Reserve = reserveRankOrder >= 3 && higherApplicants > 0
      ? Math.max(0, higherApplicants - reserveSlots + 1) / higherApplicants
      : 0;
    fake12Rates.push(Math.max(fake12Winning, fake12Reserve));
  });

  const fake1Positive = fake1Rates.filter((rate) => rate > 0);
  const fake2Positive = fake2Rates.filter((rate) => rate > 0);
  const fake12Positive = fake12Rates.filter((rate) => rate > 0);

  return {
    fake1RawRate: average(fake1Rates) || 0,
    fake2RawRate: average(fake2Rates) || 0,
    fake12RawRate: average(fake12Rates) || 0,
    fake1Rate: cappedMean(fake1Positive, 0.9),
    fake2Rate: cappedMean(fake2Positive, 0.9),
    fake12Rate: cappedMean(fake12Positive, 0.9),
    fake1PositiveShare: average(fake1Rates.map((rate) => (rate > 0 ? 1 : 0))) || 0,
    fake2PositiveShare: average(fake2Rates.map((rate) => (rate > 0 ? 1 : 0))) || 0,
    fake12PositiveShare: average(fake12Rates.map((rate) => (rate > 0 ? 1 : 0))) || 0,
  };
}

function getAheadCount(rank, rank1Count, rank2Count) {
  if (rank === "1순위") return 0;
  if (rank === "2순위") return rank1Count;
  return rank1Count + rank2Count;
}

function calculateAdjustedRates(filters, baseWinRate, baseReserveRate, fakeBounds) {
  const rank = filters.rank;
  const fakeExposure = rank === "1순위"
    ? 0
    : rank === "2순위"
      ? fakeBounds.fake1Rate * fakeBounds.fake1PositiveShare
      : fakeBounds.fake12Rate * Math.max(fakeBounds.fake12PositiveShare, fakeBounds.fake2PositiveShare);

  const winUplift = (1 - baseWinRate) * fakeExposure * (rank === "3순위" ? 0.6 : 0.42);
  const reserveUplift = (1 - baseReserveRate) * fakeExposure * (rank === "3순위" ? 0.82 : 0.56);

  return {
    adjustedWinRate: clamp(baseWinRate + winUplift, 0, 0.995),
    adjustedReserveRate: clamp(Math.max(baseWinRate + winUplift, baseReserveRate + reserveUplift), 0, 0.999),
    winUplift,
    reserveUplift,
  };
}

function getRankAwareScorePools(records, selectedRankOrder) {
  const winningPool = records
    .filter((record) => (rankOrder[record.winningRank] || 99) >= selectedRankOrder)
    .map((record) => record.winningScore)
    .filter(Number.isFinite);
  const reservePool = records
    .filter((record) => record.reserveRank && (rankOrder[record.reserveRank] || 99) >= selectedRankOrder)
    .map((record) => record.reserveScore)
    .filter(Number.isFinite);

  return {
    winningPool,
    reservePool: reservePool.length ? reservePool : winningPool,
  };
}

function calibrateScoreProbability(rawProbability, score, rank) {
  const scoreAnchor = clamp(score / 13, 0, 1);
  const exponent = rank === "1순위" ? 0.42 : rank === "2순위" ? 0.5 : 0.58;
  const anchorWeight = rank === "1순위" ? 0.28 : rank === "2순위" ? 0.18 : 0.12;
  const poweredProbability = Math.pow(clamp(rawProbability, 0, 1), exponent);

  return clamp(
    (poweredProbability * (1 - anchorWeight)) + (scoreAnchor * anchorWeight),
    0,
    0.999,
  );
}

function calculateSoftReach(aheadCount, slots, scoreProbability, rank) {
  if (slots <= 0) return 0;

  const overflow = Math.max(0, aheadCount - slots + 1);
  const slack = Math.max(1, slots * (rank === "1순위" ? 1.8 : rank === "2순위" ? 1.3 : 1.1));
  const pressure = overflow / slack;
  const scoreShield = 0.55 + (scoreProbability * (rank === "1순위" ? 1.25 : rank === "2순위" ? 0.9 : 0.7));
  const reach = 1 / (1 + (pressure / scoreShield));
  const floor = rank === "1순위" ? 0.18 : rank === "2순위" ? 0.06 : 0.02;

  return clamp(reach, floor, 1);
}

function calculateEstimate(filters) {
  if (!marketLabData.length) return null;

  const bootstrapRuns = [];

  for (let index = 0; index < BOOTSTRAP_RUNS; index += 1) {
    const sampledRecords = bootstrapRecords(marketLabData);
    const shareStats = calculateRankShareStats(sampledRecords);
    if (!shareStats) continue;

    const selectedRankOrder = rankOrder[filters.rank] || 3;
    const fakeBounds = inferFakeLowerBounds(sampledRecords);
    const scorePools = getRankAwareScorePools(sampledRecords, selectedRankOrder);
    const rank1Count = filters.applicants * shareStats.rank1Share;
    const rank2Count = filters.applicants * shareStats.rank2Share;
    const rank3Count = filters.applicants * shareStats.rank3Share;
    const effectiveRank1 = rank1Count * (1 - fakeBounds.fake1Rate);
    const effectiveRank2 = rank2Count * (1 - fakeBounds.fake2Rate);
    const aheadWithoutFake = getAheadCount(filters.rank, rank1Count, rank2Count);
    const aheadWithFake = getAheadCount(filters.rank, effectiveRank1, effectiveRank2);
    const winningSlots = filters.supply;
    const reserveSlots = filters.supply * 3;
    const rawWinScoreProbability = scorePools.winningPool.length
      ? scorePools.winningPool.filter((score) => filters.score >= score).length / scorePools.winningPool.length
      : 0;
    const rawReserveScoreProbability = scorePools.reservePool.length
      ? scorePools.reservePool.filter((score) => filters.score >= score).length / scorePools.reservePool.length
      : 0;
    const winScoreProbability = calibrateScoreProbability(rawWinScoreProbability, filters.score, filters.rank);
    const reserveScoreProbability = calibrateScoreProbability(rawReserveScoreProbability, filters.score, filters.rank);
    const baseWinReach = calculateSoftReach(aheadWithoutFake, winningSlots, winScoreProbability, filters.rank);
    const baseReserveReach = calculateSoftReach(aheadWithoutFake, reserveSlots, reserveScoreProbability, filters.rank);
    const baseWinProbability = baseWinReach * winScoreProbability;
    const baseReserveProbability = Math.max(baseWinProbability, baseReserveReach * reserveScoreProbability);
    const adjustedRates = calculateAdjustedRates(filters, baseWinProbability, baseReserveProbability, fakeBounds);

    bootstrapRuns.push({
      shareStats,
      fakeBounds,
      baseWinProbability,
      baseReserveProbability,
      adjustedWinProbability: adjustedRates.adjustedWinRate,
      adjustedReserveProbability: adjustedRates.adjustedReserveRate,
      adjustedRates,
      rawCounts: {
        rank1: rank1Count,
        rank2: rank2Count,
        rank3: rank3Count,
      },
      adjustedCounts: {
        rank1: effectiveRank1,
        rank2: effectiveRank2,
        rank3: rank3Count,
      },
    });
  }

  if (!bootstrapRuns.length) return null;

  const winSamples = bootstrapRuns.map((run) => (
    filters.includeFakeSupport ? run.adjustedWinProbability : run.baseWinProbability
  ));
  const reserveSamples = bootstrapRuns.map((run) => (
    filters.includeFakeSupport ? run.adjustedReserveProbability : run.baseReserveProbability
  ));
  const share1Samples = bootstrapRuns.map((run) => run.shareStats.rank1Share);
  const share2Samples = bootstrapRuns.map((run) => run.shareStats.rank2Share);
  const share3Samples = bootstrapRuns.map((run) => run.shareStats.rank3Share);
  const fake1Samples = bootstrapRuns.map((run) => run.fakeBounds.fake1Rate);
  const fake2Samples = bootstrapRuns.map((run) => run.fakeBounds.fake2Rate);
  const rawRank1Counts = bootstrapRuns.map((run) => run.rawCounts.rank1);
  const rawRank2Counts = bootstrapRuns.map((run) => run.rawCounts.rank2);
  const rawRank3Counts = bootstrapRuns.map((run) => run.rawCounts.rank3);
  const adjustedRank1Counts = bootstrapRuns.map((run) => run.adjustedCounts.rank1);
  const adjustedRank2Counts = bootstrapRuns.map((run) => run.adjustedCounts.rank2);

  return {
    sampleCount: marketLabData.length,
    winRate: average(winSamples) || 0,
    reserveRate: average(reserveSamples) || 0,
    winInterval: intervalFromSamples(winSamples),
    reserveInterval: intervalFromSamples(reserveSamples),
    rankShareEstimates: {
      rank1: { mean: average(share1Samples) || 0, interval: intervalFromSamples(share1Samples) },
      rank2: { mean: average(share2Samples) || 0, interval: intervalFromSamples(share2Samples) },
      rank3: { mean: average(share3Samples) || 0, interval: intervalFromSamples(share3Samples) },
    },
    fakeEstimates: {
      fake1Corrected: average(fake1Samples) || 0,
      fake2Corrected: average(fake2Samples) || 0,
      fake1Raw: average(bootstrapRuns.map((run) => run.fakeBounds.fake1RawRate)) || 0,
      fake2Raw: average(bootstrapRuns.map((run) => run.fakeBounds.fake2RawRate)) || 0,
      fake12Raw: average(bootstrapRuns.map((run) => run.fakeBounds.fake12RawRate)) || 0,
      fake1SignalMean: average(bootstrapRuns.map((run) => run.fakeBounds.fake1Rate)) || 0,
      fake2SignalMean: average(bootstrapRuns.map((run) => run.fakeBounds.fake2Rate)) || 0,
      fake12SignalMean: average(bootstrapRuns.map((run) => run.fakeBounds.fake12Rate)) || 0,
      fake1PositiveShare: average(bootstrapRuns.map((run) => run.fakeBounds.fake1PositiveShare)) || 0,
      fake2PositiveShare: average(bootstrapRuns.map((run) => run.fakeBounds.fake2PositiveShare)) || 0,
      fake12PositiveShare: average(bootstrapRuns.map((run) => run.fakeBounds.fake12PositiveShare)) || 0,
      fake1Interval: intervalFromSamples(fake1Samples, 0.1, 0.9),
      fake2Interval: intervalFromSamples(fake2Samples, 0.1, 0.9),
    },
    forecast: {
      raw: {
        rank1: { mean: average(rawRank1Counts) || 0, interval: intervalFromSamples(rawRank1Counts, 0.1, 0.9) },
        rank2: { mean: average(rawRank2Counts) || 0, interval: intervalFromSamples(rawRank2Counts, 0.1, 0.9) },
        rank3: { mean: average(rawRank3Counts) || 0, interval: intervalFromSamples(rawRank3Counts, 0.1, 0.9) },
      },
      effective: {
        rank1: { mean: average(adjustedRank1Counts) || 0, interval: intervalFromSamples(adjustedRank1Counts, 0.1, 0.9) },
        rank2: { mean: average(adjustedRank2Counts) || 0, interval: intervalFromSamples(adjustedRank2Counts, 0.1, 0.9) },
        rank3: { mean: average(rawRank3Counts) || 0, interval: intervalFromSamples(rawRank3Counts, 0.1, 0.9) },
      },
    },
    uplift: {
      win: average(bootstrapRuns.map((run) => run.adjustedRates.winUplift)) || 0,
      reserve: average(bootstrapRuns.map((run) => run.adjustedRates.reserveUplift)) || 0,
    },
    winningMedian: median(marketLabData.map((record) => record.winningScore).filter(Number.isFinite)),
    reserveMedian: median(marketLabData.map((record) => record.reserveScore).filter(Number.isFinite)),
    ratioMedian: median(marketLabData.map((record) => record.competitionRatio).filter(Number.isFinite)),
  };
}

function calculateRankShareOverview() {
  if (!marketLabData.length) return null;

  const shareRuns = [];

  for (let index = 0; index < Math.min(BOOTSTRAP_RUNS, 600); index += 1) {
    const sampledRecords = bootstrapRecords(marketLabData);
    const shareStats = calculateRankShareStats(sampledRecords);
    if (shareStats) shareRuns.push(shareStats);
  }

  if (!shareRuns.length) return null;

  const rank1Samples = shareRuns.map((run) => run.rank1Share);
  const rank2Samples = shareRuns.map((run) => run.rank2Share);
  const rank3Samples = shareRuns.map((run) => run.rank3Share);

  return {
    rankShareEstimates: {
      rank1: { mean: average(rank1Samples) || 0, interval: intervalFromSamples(rank1Samples) },
      rank2: { mean: average(rank2Samples) || 0, interval: intervalFromSamples(rank2Samples) },
      rank3: { mean: average(rank3Samples) || 0, interval: intervalFromSamples(rank3Samples) },
    },
  };
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

function renderRankShareCards(result) {
  const container = document.querySelector("#labMatchList");
  if (!container) return;

  const rows = [
    ["1순위", result.rankShareEstimates.rank1],
    ["2순위", result.rankShareEstimates.rank2],
    ["3순위", result.rankShareEstimates.rank3],
  ];

  container.innerHTML = rows.map(([label, estimate]) => `
    <article class="match-item">
      <div>
        <strong>${label}</strong>
        <p>전체 지원자 중 예상 비율</p>
        <small>95% 추정구간 ${formatPercentRange(estimate.interval)}</small>
      </div>
      <div class="match-score">
        <span>중심 추정치</span>
        <strong>${formatPercent(estimate.mean)}</strong>
      </div>
    </article>
  `).join("");
}

function renderPriorityForecast(result, includeFakeSupport) {
  const container = document.querySelector("#labPriorityForecast");
  if (!container) return;

  const source = includeFakeSupport ? result.forecast.effective : result.forecast.raw;
  const maxCount = Math.max(1, source.rank1.mean, source.rank2.mean, source.rank3.mean);
  const rows = [
    ["1순위", source.rank1, result.rankShareEstimates.rank1.mean],
    ["2순위", source.rank2, result.rankShareEstimates.rank2.mean],
    ["3순위", source.rank3, result.rankShareEstimates.rank3.mean],
  ];

  container.innerHTML = rows.map(([label, estimate, shareMean]) => `
    <article class="priority-row">
      <div class="priority-meta">
        <strong>${label}</strong>
        <span>예상 ${Math.round(estimate.mean)}명</span>
        <small>중간 80% 범위 ${formatRange(estimate.interval.low, estimate.interval.high, "명")}</small>
      </div>
      <div class="priority-bar">
        <i style="width:${(estimate.mean / maxCount) * 100}%"></i>
      </div>
      <div class="priority-tail">
        <strong>${formatPercent(shareMean)}</strong>
        <span>${includeFakeSupport ? "허위지원자 반영" : "기본 분포"}</span>
      </div>
    </article>
  `).join("");
}

function renderFakePanel(result, filters) {
  const container = document.querySelector("#labScenarioPanel");
  if (!container) return;

  const upliftCopy = filters.includeFakeSupport
    ? `<p>허위지원자 하한을 반영하면 당첨 추정치는 ${formatPercent(result.uplift.win)}p, 예비 포함 추정치는 ${formatPercent(result.uplift.reserve)}p 정도 올라가는 방향으로 보정했습니다.</p>`
    : `<p>기본값은 허위지원자 비율을 따로 반영하지 않은 상태입니다. 체크박스를 켜면 아래 하한 추정을 이용해 가능성을 보정합니다.</p>`;

  container.innerHTML = `
    <div class="scenario-topline">
      <article>
        <span>허위 1순위 보정평균 하한</span>
        <strong>${formatPercent(result.fakeEstimates.fake1SignalMean)}</strong>
        <small>단순평균 ${formatPercent(result.fakeEstimates.fake1Raw)} · 중간 80% 범위 ${formatPercentRange(result.fakeEstimates.fake1Interval)}</small>
      </article>
      <article>
        <span>허위 2순위 보정평균 하한</span>
        <strong>${formatPercent(result.fakeEstimates.fake2SignalMean)}</strong>
        <small>단순평균 ${formatPercent(result.fakeEstimates.fake2Raw)} · 중간 80% 범위 ${formatPercentRange(result.fakeEstimates.fake2Interval)}</small>
      </article>
      <article>
        <span>1+2순위 보정평균 하한</span>
        <strong>${formatPercent(result.fakeEstimates.fake12SignalMean)}</strong>
        <small>단순평균 ${formatPercent(result.fakeEstimates.fake12Raw)} · 신호 비중 ${formatPercent(result.fakeEstimates.fake12PositiveShare)}</small>
      </article>
    </div>
    <div class="scenario-notes">
      ${upliftCopy}
      <p>보정평균은 하한 신호가 실제로 관측된 모집군만 따로 모아서 평균낸 값입니다. 즉 0이 많이 섞여 과소평가되는 문제를 줄이되, 100% 같은 극단값은 90%에서 한 번 눌러 과열을 막았습니다.</p>
      <p>지금 계산은 과거 집계 데이터를 부트스트랩으로 다시 뽑아 전체 순위 비율과 허위지원자 하한을 반복 추정한 뒤, 그 분포 위에서 현재 입력값의 당첨확률을 계산하는 방식입니다.</p>
    </div>
  `;
}

function renderEstimate() {
  const filters = getFilters();
  if (!Number.isFinite(filters.score) || !Number.isFinite(filters.applicants) || !Number.isFinite(filters.supply)) return;
  if (filters.score < 0 || filters.applicants <= 0 || filters.supply <= 0) return;

  const result = calculateEstimate(filters);
  if (!result) return;

  const resultCopy = document.querySelector("#labResultCopy");
  document.querySelector("#labChanceBand").textContent = describeChance(result.winRate, result.reserveRate);
  document.querySelector("#labWinRate").textContent = formatPercent(result.winRate);
  document.querySelector("#labReserveRate").textContent = formatPercent(result.reserveRate);
  document.querySelector("#labWinInterval").textContent = formatPercentRange(result.winInterval);
  document.querySelector("#labReserveInterval").textContent = formatPercentRange(result.reserveInterval);
  document.querySelector("#labWinningMedian").textContent = formatScore(result.winningMedian);
  document.querySelector("#labReserveMedian").textContent = formatScore(result.reserveMedian);
  document.querySelector("#labRatioMedian").textContent = Number.isFinite(result.ratioMedian) ? `${result.ratioMedian.toFixed(1)} : 1` : "-";
  renderConfidenceBand("labWinBand", "labWinPoint", result.winRate, result.winInterval);
  renderConfidenceBand("labReserveBand", "labReservePoint", result.reserveRate, result.reserveInterval);

  if (resultCopy) {
    resultCopy.textContent = filters.includeFakeSupport
      ? `4548개 데이터셋을 바탕으로, 예상 지원자수 ${filters.applicants}명 · 모집호수 ${filters.supply}호 상황에서 허위지원자 하한까지 반영한 확률을 계산했습니다.`
      : `4548개 데이터셋을 바탕으로, 예상 지원자수 ${filters.applicants}명 · 모집호수 ${filters.supply}호 상황에서 지금 내 순위와 점수의 당첨확률을 계산했습니다.`;
  }

  renderRankShareCards(result);
  renderPriorityForecast(result, filters.includeFakeSupport);
  renderFakePanel(result, filters);

  if (labResultsSection) {
    labResultsSection.classList.remove("is-hidden");
    labResultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

async function init() {
  if (!(await ensureMarketLabAccess())) return;
  await loadMarketLabData();

  const overview = calculateRankShareOverview();
  if (overview) renderRankShareCards(overview);
}

if (housingLabForm) {
  housingLabForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!housingLabForm.reportValidity()) return;
    if (!marketLabData.length) await loadMarketLabData();
    renderEstimate();
  });
}

if (runHousingLab) {
  runHousingLab.addEventListener("click", () => {
    window.setTimeout(() => runHousingLab.blur(), 0);
  });
}

init().catch(() => {
  window.alert("데이터를 불러오지 못했습니다.");
  redirectToMarketHome();
});
