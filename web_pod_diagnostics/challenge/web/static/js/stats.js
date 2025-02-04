const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});

const errorAlert = document.getElementById("error-message");
const periodSelector = document.getElementById("period-selector");

const updateData = async () => {
  fetch("/stats?period=" + periodSelector.value)
    .then((data) => data.json())
    .then((data) => {
      const { current, average, success, error } = data;

      if (success) {
        const currentDate = new Date();

        document.getElementById("last-updated").innerText = `Last updated at ${currentDate.toLocaleTimeString()}`;
        document.getElementById("system-uptime").innerText = current.uptime;

        RPGUI.set_value(document.getElementById("cpu-usage"), current.cpuUsage / 100);
        RPGUI.set_value(document.getElementById("disk-usage"), current.diskUsage / 100);
        RPGUI.set_value(document.getElementById("memory-usage"), current.memoryUsage / 100);

        document.getElementById("cpu-usage-average").innerText = `${current.cpuUsage - average.cpuUsage > 0 ? "+" : ""}${Math.round(
          current.cpuUsage - average.cpuUsage
        )}`;

        document.getElementById("disk-usage-average").innerText = `${current.diskUsage - average.diskUsage > 0 ? "+" : ""}${Math.round(
          current.diskUsage - average.diskUsage
        )}`;

        document.getElementById("memory-usage-average").innerText = `${
          current.memoryUsage - average.memoryUsage > 0 ? "+" : ""
        }${Math.round(current.memoryUsage - average.memoryUsage)}`;

        errorAlert.innerHTML = "";
        errorAlert.style.display = "none";
      } else {
        errorAlert.innerHTML = error;
        errorAlert.style.display = "";
      }
    });
};

const updateLabels = () => {
  Array.from(document.querySelectorAll(".time-label")).forEach((el) => (el.innerText = periodSelector.value));
  updateData();
};

updateData();
setTimeout(updateData, 30_000);

updateLabels();
periodSelector.addEventListener("change", updateLabels);
