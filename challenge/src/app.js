const { execFile } = require('child_process');
const createDOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");
const express = require("express");
const path = require("path");

// Setup app
app  = express();
app.set("view engine", "ejs");
port = 3000;

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);


// Function
const getTitle = (path) => {
    path = decodeURIComponent(path).split("/");
    path = path.slice(-1).toString();
    return DOMPurify.sanitize(path);
}


// Middlewares
app.use("/static", express.static(path.join(__dirname, "static")));


// Routes
app.get("/", (req, res) => {
    res.render("index", { title: getTitle(req.path) });
})

app.get("/api/quiz", (req, res) => {
    res.sendFile(path.join(__dirname, "quiz.json"));
})

app.get("/api/report", (req, res) => {
    const url = req.query["url"];
    if (url[0] !== "/") {
        url = "/" + url;
    }

    if (url) {
        execFile("/usr/bin/node", [ "/app/bot.js", `http://localhost:3000${url}` ], (error, stdout, stderr) => {
            // console.log(error);
        })
        res.type("text");
        res.send("URL sended to the bot!");
    } else {
        res.type("text");
        res.send("The ?url= parameter must be set!");
    }
})

app.use((req, res) => {
    res.status(404);
    res.render("404", { title: getTitle(req.path) });
})


// Start app
app.listen(port, () => {
    console.log(`[LOG] App started on port ${port}.`)
})
