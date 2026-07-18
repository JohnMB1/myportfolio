/* =============================================
   planner.js – Academic Task Manager
   John Moses Bahago Portfolio
   ============================================= */

'use strict';

/* ── State & Storage ────────────────────────── */
const STORAGE_KEY = 'jmb_planner_tasks';

// Load tasks from localStorage or seed with defaults
function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : seedTasks();
  } catch {
    return seedTasks();
  }
}

function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function seedTasks() {
  const tasks = [
    {
      id: uid(), title: 'Complete COS 106 HTML Assignment',
      course: 'COS 106', due: todayPlus(2),
      priority: 'high', completed: false,
      createdAt: Date.now()
    },
    {
      id: uid(), title: 'Read Chapter 4 – Data Structures',
      course: 'CSC 102', due: todayPlus(4),
      priority: 'medium', completed: false,
      createdAt: Date.now() - 3600000
    },
    {
      id: uid(), title: 'Review Python basics (lists & dicts)',
      course: 'CSC 102', due: todayPlus(1),
      priority: 'high', completed: false,
      createdAt: Date.now() - 7200000
    },
    {
      id: uid(), title: 'Submit GES 101 essay draft',
      course: 'GES 101', due: todayPlus(5),
      priority: 'medium', completed: true,
      createdAt: Date.now() - 86400000
    },
    {
      id: uid(), title: 'Watch recorded lecture – MAT 101 Week 3',
      course: 'MAT 101', due: todayPlus(0),
      priority: 'low', completed: false,
      createdAt: Date.now() - 1800000
    }
  ];
  saveTasks(tasks);
  return tasks;
}

/* ── Helpers ────────────────────────────────── */
function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function todayPlus(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d    = new Date(dateStr + 'T00:00:00');
  const now  = new Date();
  const diff = Math.floor((d - now) / 86400000);

  if (diff < 0)  return 'Overdue';
  if (diff === 0) return 'Due today';
  if (diff === 1) return 'Due tomorrow';
  return d.toLocaleDateString('en-GB', { day:'numeric', month:'short' });
}

function isOverdue(dateStr) {
  if (!dateStr) return false;
  const d   = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  now.setHours(0,0,0,0);
  return d < now;
}

/* ── DOM refs ───────────────────────────────── */
const taskForm        = document.getElementById('taskForm');
const taskTitleInput  = document.getElementById('taskTitle');
const taskCourseInput = document.getElementById('taskCourse');
const taskDueInput    = document.getElementById('taskDue');
const taskList        = document.getElementById('taskList');
const filterTabs      = document.querySelectorAll('.filter-tab');
const progressFill    = document.getElementById('progressFill');
const progressLabel   = document.getElementById('progressLabel');
const statTotal       = document.getElementById('statTotal');
const statPending     = document.getElementById('statPending');
const statDone        = document.getElementById('statDone');
const statOverdue     = document.getElementById('statOverdue');

let tasks     = loadTasks();
let activeFilter = 'all';
let activePriority = 'medium';

/* ── Priority buttons ───────────────────────── */
document.querySelectorAll('.priority-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.priority-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activePriority = btn.dataset.priority;
  });
});
// Set default active
document.querySelector('.priority-btn[data-priority="medium"]')?.classList.add('active');

/* ── Add Task ────────────────────────────────── */
taskForm?.addEventListener('submit', (e) => {
  e.preventDefault();

  const title  = taskTitleInput.value.trim();
  const course = taskCourseInput.value.trim();
  const due    = taskDueInput.value;

  if (!title) {
    shake(taskTitleInput);
    return;
  }

  const newTask = {
    id:        uid(),
    title,
    course:    course || 'General',
    due,
    priority:  activePriority,
    completed: false,
    createdAt: Date.now()
  };

  tasks.unshift(newTask);
  saveTasks(tasks);
  renderTasks();
  updateStats();

  // Reset form
  taskTitleInput.value  = '';
  taskCourseInput.value = '';
  taskDueInput.value    = '';
  taskTitleInput.focus();

  showToast('Task added!', 'success');
});

/* ── Toggle complete ─────────────────────────── */
function toggleComplete(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.completed = !task.completed;
  saveTasks(tasks);
  renderTasks();
  updateStats();
}

/* ── Delete task ─────────────────────────────── */
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks(tasks);
  renderTasks();
  updateStats();
  showToast('Task removed.', 'info');
}

/* ── Filter ──────────────────────────────────── */
filterTabs?.forEach(tab => {
  tab.addEventListener('click', () => {
    filterTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    activeFilter = tab.dataset.filter;
    renderTasks();
  });
});

function getFilteredTasks() {
  switch (activeFilter) {
    case 'active':    return tasks.filter(t => !t.completed);
    case 'completed': return tasks.filter(t =>  t.completed);
    case 'overdue':   return tasks.filter(t => !t.completed && isOverdue(t.due));
    default:          return tasks;
  }
}

/* ── Render task list ────────────────────────── */
function renderTasks() {
  if (!taskList) return;
  const filtered = getFilteredTasks();

  if (!filtered.length) {
    taskList.innerHTML = `
      <div class="task-empty">
        <i class="fa-regular fa-clipboard"></i>
        <p>${activeFilter === 'completed'
          ? 'No completed tasks yet — keep going!'
          : activeFilter === 'overdue'
            ? 'No overdue tasks. Great job staying on top of things!'
            : 'No tasks here. Add one above to get started.'}</p>
      </div>`;
    return;
  }

  taskList.innerHTML = filtered.map(task => {
    const overdue   = !task.completed && isOverdue(task.due);
    const dateLabel = formatDate(task.due);

    return `
    <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
      <div class="priority-dot ${task.priority}" title="Priority: ${task.priority}"></div>
      <button class="task-checkbox ${task.completed ? 'checked' : ''}"
              onclick="toggleComplete('${task.id}')"
              title="${task.completed ? 'Mark incomplete' : 'Mark complete'}">
        ${task.completed ? '<i class="fa-solid fa-check"></i>' : ''}
      </button>
      <div class="task-body">
        <div class="task-title">${escHtml(task.title)}</div>
        <div class="task-meta">
          <span class="task-course"><i class="fa-solid fa-book-open" style="font-size:.65rem;margin-right:.2rem"></i>${escHtml(task.course)}</span>
          ${task.due ? `<span class="task-due ${overdue ? 'overdue' : ''}">
            <i class="fa-regular fa-clock" style="font-size:.65rem;margin-right:.2rem"></i>${dateLabel}
          </span>` : ''}
          <span class="badge ${task.priority === 'high' ? '' : task.priority === 'low' ? 'badge-success' : 'badge-accent'}"
                style="font-size:.7rem;padding:.15rem .5rem">${task.priority}</span>
        </div>
      </div>
      <div class="task-actions">
        <button class="btn-complete" onclick="toggleComplete('${task.id}')"
                title="${task.completed ? 'Undo' : 'Complete'}">
          <i class="fa-solid ${task.completed ? 'fa-rotate-left' : 'fa-check'}"></i>
        </button>
        <button class="btn-delete" onclick="deleteTask('${task.id}')" title="Delete">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>`;
  }).join('');
}

/* ── Update stats ────────────────────────────── */
function updateStats() {
  const total     = tasks.length;
  const done      = tasks.filter(t =>  t.completed).length;
  const pending   = tasks.filter(t => !t.completed).length;
  const overdue   = tasks.filter(t => !t.completed && isOverdue(t.due)).length;
  const pct       = total ? Math.round((done / total) * 100) : 0;

  if (statTotal)   statTotal.textContent   = total;
  if (statPending) statPending.textContent = pending;
  if (statDone)    statDone.textContent    = done;
  if (statOverdue) statOverdue.textContent = overdue;

  if (progressFill)  progressFill.style.width = pct + '%';
  if (progressLabel) progressLabel.textContent = `${pct}% complete`;
}

/* ── Helpers ─────────────────────────────────── */
function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function shake(el) {
  el.style.animation = 'none';
  el.offsetHeight; // reflow
  el.style.animation = 'shake .3s ease';
  el.addEventListener('animationend', () => el.style.animation = '', { once: true });
  el.focus();
}

/* ── Toast ───────────────────────────────────── */
function showToast(message, type = 'success') {
  let toast = document.getElementById('plannerToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'plannerToast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-info';
  toast.innerHTML = `<i class="fa-solid ${icon}"></i> ${message}`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// Inject shake keyframe
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%,100%{ transform:translateX(0); }
    20%{ transform:translateX(-6px); }
    40%{ transform:translateX(6px); }
    60%{ transform:translateX(-4px); }
    80%{ transform:translateX(4px); }
  }
`;
document.head.appendChild(style);

/* ── Init ────────────────────────────────────── */
renderTasks();
updateStats();
