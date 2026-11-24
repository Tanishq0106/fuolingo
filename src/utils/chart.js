/**
 * Builds a smooth Catmull-Rom to cubic Bezier curve path through points,
 * clamping Y between neighbouring points to prevent overshoot.
 * @param {Array<{x: number, y: number}>} pts 
 * @returns {string} SVG path 'd' attribute
 */
export function buildSmoothPath(pts) {
  if (!pts || pts.length < 2) return '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const lo = Math.min(p1.y, p2.y);
    const hi = Math.max(p1.y, p2.y);
    const c1y = Math.max(lo, Math.min(hi, p1.y + (p2.y - p0.y) / 6));
    const c2y = Math.max(lo, Math.min(hi, p2.y - (p3.y - p1.y) / 6));
    d += ` C ${p1.x + (p2.x - p0.x) / 6} ${c1y}, ${p2.x - (p3.x - p1.x) / 6} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

/**
 * Computes 7-day moving averages for an array of logs sorted by date ascending.
 * @param {Array<{date: string, weightKg: number}>} logs 
 * @returns {Array<{date: string, weightKg: number, avgWeightKg: number}>}
 */
export function computeMovingAverages(logs) {
  if (!logs || logs.length === 0) return [];
  
  return logs.map((entry, index) => {
    const entryTime = new Date(entry.date).getTime();
    const sevenDaysAgo = entryTime - 7 * 24 * 60 * 60 * 1000;
    
    // Find all entries in the window up to current entry
    const windowEntries = logs.slice(0, index + 1).filter(e => {
      const t = new Date(e.date).getTime();
      return t >= sevenDaysAgo && t <= entryTime;
    });

    const sum = windowEntries.reduce((acc, curr) => acc + curr.weightKg, 0);
    const avg = sum / (windowEntries.length || 1);

    return {
      ...entry,
      avgWeightKg: Number(avg.toFixed(2))
    };
  });
}

/**
 * Downsamples multiple weight entries on the same day to the latest entry of that day
 * @param {Array<{date: string, weightKg: number}>} logs 
 * @returns {Array<{date: string, weightKg: number}>}
 */
export function downsampleDaily(logs) {
  if (!logs || logs.length === 0) return [];
  
  const dailyMap = new Map();
  for (const log of logs) {
    const dayKey = log.date.split('T')[0];
    dailyMap.set(dayKey, log); // overwrites earlier entries on same day
  }

  return Array.from(dailyMap.values()).sort((a, b) => new Date(a.date) - new Date(b.date));
}

/**
 * Filters logs by range: 30, 90, or 'all'
 * @param {Array<{date: string, weightKg: number}>} logs 
 * @param {number|'all'} rangeDays 
 * @returns {Array<{date: string, weightKg: number}>}
 */
export function filterLogsByRange(logs, rangeDays) {
  if (!logs || logs.length === 0) return [];
  if (rangeDays === 'all') return logs;

  const now = new Date().getTime();
  const cutoff = now - rangeDays * 24 * 60 * 60 * 1000;
  
  return logs.filter(log => new Date(log.date).getTime() >= cutoff);
}

/**
 * Computes scales and plot points for SVG viewport (800x320)
 */
export function computeChartLayout({
  logs = [],
  startKg = 84.0,
  targetKg = 72.0,
  width = 800,
  height = 320,
  padding = { top: 30, right: 75, bottom: 40, left: 55 }
}) {
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  // Compute Y bounds including startKg, targetKg, and all logs + padding
  const allWeights = [
    Number(startKg),
    Number(targetKg),
    ...logs.map(l => l.weightKg),
    ...logs.map(l => l.avgWeightKg ?? l.weightKg)
  ].filter(w => typeof w === 'number' && !isNaN(w));

  let minY = Math.min(...allWeights);
  let maxY = Math.max(...allWeights);

  if (maxY - minY < 2) {
    const mid = (maxY + minY) / 2;
    minY = mid - 1.5;
    maxY = mid + 1.5;
  } else {
    minY -= 1.0;
    maxY += 1.0;
  }

  // Y Coordinate mapper
  const getY = (val) => {
    return padding.top + plotHeight - ((val - minY) / (maxY - minY)) * plotHeight;
  };

  // X Coordinate mapper
  let getX;
  if (logs.length <= 1) {
    getX = () => padding.left + plotWidth / 2;
  } else {
    const minTime = new Date(logs[0].date).getTime();
    const maxTime = new Date(logs[logs.length - 1].date).getTime();
    const span = Math.max(1, maxTime - minTime);
    getX = (dateStr) => {
      const t = new Date(dateStr).getTime();
      return padding.left + ((t - minTime) / span) * plotWidth;
    };
  }

  // Generate data points
  const dots = logs.map(l => ({
    ...l,
    x: getX(l.date),
    y: getY(l.weightKg),
    avgY: getY(l.avgWeightKg ?? l.weightKg)
  }));

  // Smooth curve points
  const trendPts = dots.map(d => ({ x: d.x, y: d.avgY }));
  const trendPath = buildSmoothPath(trendPts);

  // Y-ticks
  const yTicks = [];
  const tickCount = 5;
  for (let i = 0; i < tickCount; i++) {
    const val = minY + (i / (tickCount - 1)) * (maxY - minY);
    yTicks.push({
      value: Number(val.toFixed(1)),
      y: getY(val)
    });
  }

  // X-ticks (Dates)
  const xTicks = [];
  if (logs.length > 0) {
    const count = Math.min(5, logs.length);
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(i * (logs.length - 1) / (count - 1 || 1));
      const log = logs[idx];
      const d = new Date(log.date);
      const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      xTicks.push({
        label,
        x: getX(log.date)
      });
    }
  }

  return {
    width,
    height,
    padding,
    minY,
    maxY,
    startLineY: getY(startKg),
    targetLineY: getY(targetKg),
    dots,
    trendPath,
    yTicks,
    xTicks,
    getY,
    getX
  };
}
