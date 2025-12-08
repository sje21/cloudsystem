// myrun-backend/src/utils/stats.js

function toDate(raw) {
  if (!raw) return null;
  if (raw instanceof Date) return raw;
  return new Date(raw);
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getMonday(date) {
  const d = startOfDay(date);
  const day = d.getDay(); 

  const diff = (day + 6) % 7;

  const monday = new Date(d);
  monday.setDate(d.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function isInThisWeek(date) {
  if (!date) return false;

  const today = new Date();

  const d = startOfDay(date);
  const t = startOfDay(today);

  const mondayOfDate = getMonday(d);
  const mondayOfToday = getMonday(t);

  return mondayOfDate.getTime() === mondayOfToday.getTime();
}

function weekOfMonth(date) {
  const day = date.getDate();
  return Math.ceil(day / 7);
}

const dayLabels = ["일", "월", "화", "수", "목", "금", "토"];

function buildStatsFromRuns(runs) {
  const monthDistance = [
    { name: "1주", distance: 0 },
    { name: "2주", distance: 0 },
    { name: "3주", distance: 0 },
    { name: "4주", distance: 0 },
  ];

  const weekDistance = dayLabels.map((d) => ({ name: d, distance: 0 }));

  let totalDistanceWeek = 0;
  let totalDurationWeek = 0;
  let totalCaloriesWeek = 0;

  runs.forEach((run) => {
    const d = toDate(run.run_date);
    if (!d || isNaN(d.getTime())) return;

    const dist = Number(run.distance_km);

    const w = weekOfMonth(d) - 1;
    if (w >= 0 && w < 4) {
      monthDistance[w].distance += dist;
    }

    if (isInThisWeek(d)) {
      const dayIdx = d.getDay();
      weekDistance[dayIdx].distance += dist;
      totalDistanceWeek += dist;
      totalDurationWeek += Number(run.duration_min);
      totalCaloriesWeek += Number(run.calories);
    }
  });

  const avgSpeedWeek =
    totalDistanceWeek > 0 && totalDurationWeek > 0
      ? (totalDistanceWeek / (totalDurationWeek / 60)).toFixed(1)
      : 0;

  return {
    monthDistanceData: monthDistance,
    weekDistanceData: weekDistance,
    summaryForMain: {
      totalDistanceWeek,
      totalDurationHours: (totalDurationWeek / 60).toFixed(1),
      totalCaloriesWeek,
      avgSpeedWeek,
    },
  };
}

module.exports = { buildStatsFromRuns };
