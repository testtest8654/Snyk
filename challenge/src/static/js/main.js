let quiz;
let username;
var cquest = 0;
var score  = 0;

const getQuiz = async () => {
    var res = await fetch("/api/quiz");
    res = await res.json();
    return res;
}

const startQuiz = (u) => {
    username = u;
    showQuestion(quiz[cquest]);
}

const showQuestion = (q) => {
    const content = document.getElementById("quiz");
    content.innerHTML = `
    <h2 class="card-title mt-4">Question n°${q["id"]}</h2>
    <img class="mt-4 mb-4 img-fluid" src="/static/img/q${q["id"]}.png" style="max-width: 75%;">
    <p class="card-text mt-2 mb-4" style="font-size: 22px;">${q["question"]}</p>
    <div>
        <button type="button" onclick="response(0)" class="btn btn-outline-secondary mt-2 mb-2" style="width: 80%">${q["options"][0]}</button><br>
        <button type="button" onclick="response(1)" class="btn btn-outline-secondary mt-2 mb-2" style="width: 80%">${q["options"][1]}</button><br>
        <button type="button" onclick="response(2)" class="btn btn-outline-secondary mt-2 mb-2" style="width: 80%">${q["options"][2]}</button><br>
        <button type="button" onclick="response(3)" class="btn btn-outline-secondary mt-2 mb-5" style="width: 80%">${q["options"][3]}</button>
    </div>
    `
}

const show_results = () => {
    const content = document.getElementById("quiz");
    content.innerHTML = `
    <h2 class="card-title mb-4 mt-4">${username}'s Results</h2>
    <h1>Final score: ${score}/10</h1>
    <img class="mb-4 mt-4 img-fluid" src="/static/img/result.png" style="max-width: 75%;">
    `
}

const response = (id) => {
    if (quiz[cquest]["answer"] === id) {
        score += 1;
    }
    if (cquest != 9) {
        cquest += 1;
        showQuestion(quiz[cquest]);
    } else {
        show_results();
    }
}

window.onload = async () => {
    quiz = await getQuiz();
}
