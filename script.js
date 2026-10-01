// ===============================
// NEXUS PRODUCTIVITY DASHBOARD
// ===============================


// ---------- DATE ----------

function updateDate() {
    const now = new Date();

    const dateElement = document.getElementById("date");

    if (dateElement) {
        dateElement.textContent = now.toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    }
}

updateDate();


// ---------- TASKS ----------

function addTask() {
    const input = document.getElementById("taskInput");
    const taskList = document.getElementById("tasks");

    if (!input || !taskList) return;

    const taskText = input.value.trim();

    if (taskText === "") {
        return;
    }

    const task = document.createElement("div");

    task.className = "task";

    task.innerHTML = `
        <input type="checkbox">
        <span>${taskText}</span>
    `;

    taskList.appendChild(task);

    input.value = "";
}


// ---------- FOCUS TIMER ----------

let time = 25 * 60;
let timerInterval = null;

function updateTimer() {
    const timerElement = document.getElementById("timer");

    if (!timerElement) return;

    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    timerElement.textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}


function startTimer() {

    if (timerInterval !== null) {
        return;
    }

    timerInterval = setInterval(() => {

        if (time > 0) {
            time--;
            updateTimer();
        } else {
            clearInterval(timerInterval);
            timerInterval = null;

            alert("🎉 Focus session completed!");

        }

    }, 1000);
}


function resetTimer() {

    clearInterval(timerInterval);

    timerInterval = null;

    time = 25 * 60;

    updateTimer();
}


updateTimer();


// ---------- ENTER KEY FOR TASK ----------

const taskInput = document.getElementById("taskInput");

if (taskInput) {

    taskInput.addEventListener("keydown", function(event) {

        if (event.key === "Enter") {
            addTask();
        }

    });

}