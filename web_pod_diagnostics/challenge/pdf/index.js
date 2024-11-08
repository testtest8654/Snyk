const express = require("express");
const generatePDF = require("./pdf");

const app = express();
const port = 3002;

app.use((req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*");
  next();
});

app.get("/generate", async (req, res) => {
  const { url } = req.query;

  if (!url) return res.sendStatus(400);

  const pdf = await generatePDF(url);

  if (!pdf) return res.sendStatus(500);

  res.contentType("application/pdf");
  res.end(pdf);
});

app.listen(port, () => {
  console.log(`PDF generation server listening at http://localhost:${port}`);
});
