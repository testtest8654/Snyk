const express = require("express");
const getStats = require("./stats");

const app = express();
const port = 3001;

app.use((req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*");
  next();
});

const validPeriods = { "1m": 60_000, "5m": 300_000, "10m": 600_000 };
const statStore = [];

app.get("/stats", async (req, res) => {
  const { period } = req.query;

  if (!period || !validPeriods.hasOwnProperty(period)) {
    return res.json({
      success: false,
      error: `<strong>${period} is invalid.</strong> Please specify one of the following values: ${Object.keys(validPeriods).join(", ")}`,
    });
  }

  const periodData = statStore.filter((result) => result.takenAt < new Date().getTime() + validPeriods[period]);
  const averageData = periodData.reduce(
    (acc, curr) => {
      acc.memoryUsage += curr.memoryUsage;
      acc.cpuUsage += curr.cpuUsage;
      acc.diskUsage += curr.diskUsage;
      return acc;
    },
    { memoryUsage: 0, cpuUsage: 0, diskUsage: 0 }
  );

  averageData.memoryUsage /= periodData.length;
  averageData.cpuUsage /= periodData.length;
  averageData.diskUsage /= periodData.length;

  return res.json({
    success: true,
    current: await getStats(),
    average: averageData,
  });
});

app.listen(port, () => {
  console.log(`System statistic server listening at http://localhost:${port}`);

  // Collect stats every 30 seconds
  setInterval(async () => {
    const stats = await getStats();

    if (!stats) return;

    statStore.push(stats);
  }, 30_000);
});
