const reportTitleEl = document.getElementById("report-title");
const reportDescriptionEl = document.getElementById("report-description");

document.getElementById("submit").addEventListener("click", () => {
  fetch(window.location.href, {
    method: "POST",
    body: JSON.stringify({
      title: reportTitleEl.value,
      description: reportDescriptionEl.value,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((resp) => resp.json())
    .then((data) => {
      if (data.success) {
        window.location = "/";
      } else {
        alert(data.error);
      }
    });
});
