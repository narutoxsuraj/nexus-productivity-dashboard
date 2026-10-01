const $ = (id) => document.getElementById(id);

const STORAGE = {
  tasks: "nexus_tasks_v2",
  notes: "nexus_notes_v2",
  theme: "nexus_theme_v2",
  name: "nexus_name_v2",
  goal: "nexus_goal_v2",
  focus: "nexus_focus_v2",
  streak: "nexus_streak_v2",
  lastDay: "nexus_last_day_v2"
};

let tasks = JSON.parse(localStorage.getItem(STORAGE.tasks) || "[]");
let focusSeconds = Number(localStorage.getItem(STORAGE.focus) || 0);
let streak = Number(localStorage.getItem(STORAGE.streak) || 0);
let lastDay = localStorage.getItem(STORAGE.lastDay) || "";
let goal = Number(localStorage.getItem(STORAGE.goal) || 4);
let time = 25 * 60;
let timerInterval = null;

const quotes = [
  "Small progress every day leads to big results.",
  "Focus on the next step, not the whole staircase.",
  "Consistency beats motivation.",
  "Your future self will thank you for starting today.",
  "One focused hour can change your entire day.",
  "Done is better than perfect."
];

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function saveTasks() {
  localStorage.setItem(STORAGE.tasks, JSON.stringify(tasks));
}

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function updateDate() {
  const now = new Date();
  $("date").textContent = now.toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

  const hour = now.getHours();
  let greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const name = localStorage.getItem(STORAGE.name) || "Naruto";
  $("greeting").textContent = `${greeting}, ${name} 👋`;
  $("profileName").textContent = name;
}

function renderTasks() {
  const list = $("taskList");
  list.innerHTML = "";
  $("taskCount").textContent = `${tasks.length} task${tasks.length === 1 ? "" : "s"}`;
  $("taskEmpty").style.display = tasks.length ? "none" : "block";

  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.className = `task-item ${task.done ? "done" : ""}`;
    li.innerHTML = `
      <input class="task-check" type="checkbox" ${task.done ? "checked" : ""} aria-label="Complete task">
      <label>${escapeHtml(task.text)}</label>
      <button class="delete-btn" title="Delete task">×</button>
    `;
    li.querySelector(".task-check").addEventListener("change", () => {
      tasks[index].done = !tasks[index].done;
      saveTasks();
      updateStats();
      renderTasks();
    });
    li.querySelector(".delete-btn").addEventListener("click", () => {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
      updateStats();
      showToast("Task deleted");
    });
    list.appendChild(li);
  });
}

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, ch => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[ch]));
}

function addTask() {
  const input = $("taskInput");
  const text = input.value.trim();
  if (!text) {
    showToast("Write a task first ✍️");
    input.focus();
    return;
  }
  tasks.push({ text, done: false, created: Date.now() });
  input.value = "";
  saveTasks();
  renderTasks();
  updateStats();
  showToast("Task added 🚀");
}

function updateStats() {
  const completed = tasks.filter(t => t.done).length;
  const productivity = Math.min(100, Math.round((completed / Math.max(goal, 1)) * 100));
  $("completedCount").textContent = completed;
  $("productivity").textContent = `${productivity}%`;
  $("productivityBar").style.width = `${productivity}%`;
  $("productivityMessage").textContent =
    productivity >= 100 ? "Goal complete! Amazing work 🔥" :
    productivity >= 50 ? "Keep pushing forward!" : "Let's build some momentum.";

  $("focusMinutes").textContent = `${Math.floor(focusSeconds / 60)}m`;
  $("streak").textContent = streak;
  renderBars();
}

function updateTimer() {
  const timerElement = $("timer");
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  timerElement.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function startTimer() {
  if (timerInterval !== null) return;
  $("startFocus").textContent = "Pause";
  $("timerStatus").textContent = "Focus session running…";
  timerInterval = setInterval(() => {
    if (time > 0) {
      time--;
      focusSeconds++;
      localStorage.setItem(STORAGE.focus, String(focusSeconds));
      updateTimer();
      updateStats();
    } else {
      clearInterval(timerInterval);
      timerInterval = null;
      $("startFocus").textContent = "Start Focus";
      $("timerStatus").textContent = "Session completed 🎉";
      showToast("Focus session completed! 🎉");
    }
  }, 1000);
}

function toggleTimer() {
  if (timerInterval !== null) {
    clearInterval(timerInterval);
    timerInterval = null;
    $("startFocus").textContent = "Start Focus";
    $("timerStatus").textContent = "Focus session paused";
  } else {
    startTimer();
  }
}

function resetTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  time = 25 * 60;
  updateTimer();
  $("startFocus").textContent = "Start Focus";
  $("timerStatus").textContent = "Ready for a focus session";
}

function renderBars() {
  const bars = $("bars");
  const completed = tasks.filter(t => t.done).length;
  const values = [
    Math.max(1, Math.min(100, completed * 20)),
    Math.max(1, Math.min(100, completed * 18)),
    Math.max(1, Math.min(100, completed * 22)),
    Math.max(1, Math.min(100, completed * 25)),
    Math.max(1, Math.min(100, completed * 24)),
    Math.max(1, Math.min(100, completed * 28)),
    Math.max(1, Math.min(100, (completed / Math.max(goal,1))*100))
  ];
  const labels = ["M","T","W","T","F","S","Today"];
  bars.innerHTML = values.map((v,i) =>
    `<div class="bar-col"><span class="bar" style="height:${v}%"></span><span class="bar-label">${labels[i]}</span></div>`
  ).join("");
}

function updateStreak() {
  const key = todayKey();
  if (lastDay !== key) {
    const previous = new Date();
    previous.setDate(previous.getDate() - 1);
    const prevKey = previous.toISOString().slice(0,10);
    if (lastDay === prevKey) streak++;
    else if (!lastDay) streak = 1;
    else streak = 1;
    lastDay = key;
    localStorage.setItem(STORAGE.lastDay, lastDay);
    localStorage.setItem(STORAGE.streak, String(streak));
  }
}

function applyTheme(theme) {
  document.body.classList.toggle("light", theme === "light");
  $("themeBtn").textContent = theme === "light" ? "☀️" : "🌙";
  localStorage.setItem(STORAGE.theme, theme);
}

function openModal(id) { $(id).classList.remove("hidden"); }
function closeModal(id) { $(id).classList.add("hidden"); }

function setAiMessage(message) {
  const el = $("aiMessage");
  if (el) el.innerHTML = message;
}

function normalize(text) {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function makePlan() {
  const pending = tasks.filter(t => !t.done);
  if (!pending.length) {
    return "Your task list is empty. Add 2–3 important tasks and I’ll help you prioritize them. 🚀";
  }

  const top = pending.slice(0, 3);
  const lines = top.map((t, i) =>
    `<b>${i + 1}.</b> ${escapeHtml(t.text)} — ${i === 0 ? "Start now 🎯" : "After the previous task"}`
  ).join("<br>");

  return `<b>Today's suggested plan</b><br>${lines}<br><br>Use a 25-minute focus session for the first task, then take a short break.`;
}

function analyzeTasks() {
  const pending = tasks.filter(t => !t.done);
  const completed = tasks.filter(t => t.done);

  if (!tasks.length) {
    return "You don't have any tasks yet. Add your first task and I’ll analyze your workload. 📝";
  }

  const priority = pending.length ? escapeHtml(pending[0].text) : "your next project milestone";
  return `<b>Task analysis</b><br>
    ✅ Completed: ${completed.length}<br>
    ⏳ Pending: ${pending.length}<br>
    🎯 Suggested next focus: <b>${priority}</b><br><br>
    Keep the next session small and specific.`;
}

function smartAiReply(text) {
  const q = normalize(text);
  const name = localStorage.getItem(STORAGE.name) || "Naruto";

  if (!q) return `Tell me what you want to accomplish, ${escapeHtml(name)}. For example: <b>"I need to study DBMS for 2 hours."</b>`;

  // Detect a concrete task/request and offer to add it.
  const studyMatch = q.match(/(?:study|learn|revise|prepare)\s+(.+?)(?:\s+for\s+(\d+)\s*(?:hour|hours|hr|hrs))?$/i);
  if (studyMatch) {
    const subject = studyMatch[1].trim();
    const duration = studyMatch[2] ? `${studyMatch[2]} hour${studyMatch[2] == 1 ? "" : "s"}` : "25 minutes";
    return `📚 <b>Study plan for ${escapeHtml(subject)}</b><br>
      Start with ${duration} of focused study.<br>
      1️⃣ Review the main concepts<br>
      2️⃣ Practice examples/questions<br>
      3️⃣ Take a 5–10 minute break<br>
      4️⃣ Test yourself without notes<br><br>
      💡 You can add <b>${escapeHtml("Study " + subject)}</b> as a task using the button below.`;
  }

  if (q.includes("focus") || q.includes("what should") || q.includes("next")) {
    const pending = tasks.filter(t => !t.done);
    if (!pending.length) return "🎯 Your task list is clear. Add your most important goal and I’ll help you break it into steps.";
    return `🎯 <b>Focus on this:</b><br>${escapeHtml(pending[0].text)}<br><br>
      Give it one 25-minute distraction-free session.`;
  }

  if (q.includes("motivat") || q.includes("lazy") || q.includes("tired")) {
    return "🔥 You don't need to finish everything right now. Just win the next 25 minutes. Start with one small task and build momentum.";
  }

  if (q.includes("plan") || q.includes("schedule") || q.includes("today")) {
    return makePlan();
  }

  if (q.includes("task") || q.includes("workload") || q.includes("todo")) {
    return analyzeTasks();
  }

  if (q.includes("dbms") || q.includes("java") || q.includes("javascript") ||
      q.includes("python") || q.includes("exam") || q.includes("study")) {
    return `📚 <b>Study mode activated.</b><br>
      Break the topic into: <b>Concept → Example → Practice → Quick revision</b>.<br>
      Then start a 25-minute focus session. 🎯`;
  }

  return `🤖 I understand the goal, but I’m currently running in <b>Smart AI mode</b> without a cloud AI model.<br><br>
    Try asking about your <b>tasks, focus, study plan, motivation, or today's schedule</b>.`;
}

function aiReply(type) {
  const replies = {
    focus: smartAiReply("what should I focus on next?"),
    motivate: smartAiReply("motivate me"),
    plan: smartAiReply("plan my day"),
    tasks: analyzeTasks()
  };
  setAiMessage(replies[type] || smartAiReply(""));
}

function askAi() {
  const input = $("aiInput");
  const text = input.value.trim();
  if (!text) {
    input.focus();
    return;
  }
  setAiMessage(smartAiReply(text));
  input.value = "";
}

function addAiSuggestedTask() {
  const msg = $("aiMessage").innerText;
  const match = msg.match(/Study (.+?) as a task/i);
  if (match) {
    tasks.push({ text: `Study ${match[1]}`, done: false, created: Date.now() });
    saveTasks();
    renderTasks();
    updateStats();
    showToast("AI suggestion added as a task 🤖");
  }
}

$("aiSend").addEventListener("click", askAi);
$("aiInput").addEventListener("keydown", e => {
  if (e.key === "Enter") askAi();
});

$("addTaskBtn").addEventListener("click", addTask);
$("taskInput").addEventListener("keydown", e => { if (e.key === "Enter") addTask(); });
$("startFocus").addEventListener("click", toggleTimer);
$("resetFocus").addEventListener("click", resetTimer);

$("themeBtn").addEventListener("click", () => {
  const next = document.body.classList.contains("light") ? "dark" : "light";
  applyTheme(next);
  showToast(next === "light" ? "Light mode enabled ☀️" : "Dark mode enabled 🌙");
});

$("notificationBtn").addEventListener("click", () => openModal("notificationModal"));
$("profileBtn").addEventListener("click", () => {
  $("nameInput").value = localStorage.getItem(STORAGE.name) || "Naruto";
  openModal("profileModal");
});

$("saveProfile").addEventListener("click", () => {
  const name = $("nameInput").value.trim() || "Naruto";
  localStorage.setItem(STORAGE.name, name);
  updateDate();
  closeModal("profileModal");
  showToast("Profile updated 👤");
});

document.querySelectorAll("[data-close]").forEach(btn => {
  btn.addEventListener("click", () => closeModal(btn.dataset.close));
});
document.querySelectorAll(".modal").forEach(modal => {
  modal.addEventListener("click", e => { if (e.target === modal) closeModal(modal.id); });
});

document.querySelectorAll("[data-ai]").forEach(btn => {
  btn.addEventListener("click", () => aiReply(btn.dataset.ai));
});

$("notes").value = localStorage.getItem(STORAGE.notes) || "";
$("notes").addEventListener("input", () => {
  localStorage.setItem(STORAGE.notes, $("notes").value);
  $("noteSaved").textContent = "Saved";
});

$("newQuote").addEventListener("click", () => {
  const current = $("quote").textContent.replace(/[“”]/g,"");
  let next = current;
  while (next === current) next = quotes[Math.floor(Math.random() * quotes.length)];
  $("quote").textContent = `“${next}”`;
});

$("goalSelect").value = String(goal);
$("goalText").textContent = goal;
$("goalSelect").addEventListener("change", () => {
  goal = Number($("goalSelect").value);
  localStorage.setItem(STORAGE.goal, String(goal));
  $("goalText").textContent = goal;
  updateStats();
});

updateStreak();
applyTheme(localStorage.getItem(STORAGE.theme) || "dark");
updateDate();
updateTimer();
renderTasks();
updateStats();
setInterval(updateDate, 60000);

// ===== TIME-BASED GREETING =====
function updateGreeting() {
    const greetingEl = document.getElementById("greeting");
    if (!greetingEl) return;

    const hour = new Date().getHours();
    let greeting = "Good evening";

    if (hour >= 5 && hour < 12) {
        greeting = "Good morning";
    } else if (hour >= 12 && hour < 17) {
        greeting = "Good afternoon";
    }

    const savedName = localStorage.getItem(STORAGE.name) || "Naruto";
    greetingEl.textContent = `${greeting}, ${savedName} 👋`;
}

updateGreeting();
setInterval(updateGreeting, 60000);


// Add a small action when the assistant produces a concrete study suggestion.
$("aiMessage").addEventListener("dblclick", addAiSuggestedTask);
