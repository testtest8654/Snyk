const util = require("util");
const exec = util.promisify(require("child_process").exec);
const fs = require("fs/promises");

const getUptime = async () => {
  const { err, stdout, stderr } = await exec("uptime");

  if (err) {
    console.error(`Error executing command: ${err}`);
    return "n/a";
  }

  return stdout.trim();
};

const getCPUUsage = async () => {
  const data = await fs.readFile("/proc/stat", "utf8");
  const lines = data.trim().split("\n");
  const firstLine = lines[0];

  const values = firstLine.split(/\s+/).slice(1).map(Number);
  const total = values.reduce((acc, value) => acc + value, 0);

  const idle = values[3];
  const idleFraction = idle / total;

  const notIdleFraction = 1.0 - idleFraction;
  const cpuUsage = notIdleFraction * 100;

  return cpuUsage;
};

const getMemoryUsage = async () => {
  const memInfo = await fs.readFile("/proc/meminfo", "utf8");
  const lines = memInfo.split("\n");

  const memTotal = parseInt(lines[0].replace("MemTotal:", "").replace("kB", "").trim());
  const memFree = parseInt(lines[1].replace("MemFree:", "").replace("kB", "").trim());

  const memUsed = memTotal - memFree;
  const memUsedPercentage = (memUsed / memTotal) * 100;

  return memUsedPercentage;
};

const getDiskUsage = async () => {
  const { err, stdout, stderr } = await exec("df /");

  if (err) {
    console.error(`Error executing command: ${err}`);
    return 0;
  }

  const lines = stdout.trim().split("\n");

  const values = lines[1].trim().split(/\s+/);
  const usePercentage = parseInt(values[4].replace("%", ""));

  return usePercentage;
};

const getStats = async () => {
  return {
    takenAt: new Date().getTime(),
    uptime: await getUptime(),
    memoryUsage: await getMemoryUsage(),
    cpuUsage: await getCPUUsage(),
    diskUsage: await getDiskUsage(),
  };
};

module.exports = getStats;
