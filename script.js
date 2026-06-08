/**
 * To Do List - script.js
 * Fitur: tambah, hapus, tandai selesai, filter, hapus semua selesai
 * Data disimpan ke localStorage agar tidak hilang saat refresh
 */

// ===========================
// State & Initialization
// ===========================

/** @type {{ id: number, text: string, completed: boolean }[]} */
let tasks = [];
let currentFilter = 'all';

// Load tasks from localStorage when page loads
document.addEventListener('DOMContentLoaded', () => {
  loadFromStorage();
  renderTasks();

  // Allow adding task by pressing Enter
  const input = document.getElementById('taskInput');
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTask();
  });
});

// ===========================
// Storage Helpers
// ===========================

/** Save current tasks array to localStorage */
function saveToStorage() {
  localStorage.setItem('todoTasks', JSON.stringify(tasks));
}

/** Load tasks from localStorage */
function loadFromStorage() {
  const stored = localStorage.getItem('todoTasks');
  tasks = stored ? JSON.parse(stored) : [];
}

// ===========================
// Core Task Functions
// ===========================

/**
 * Add a new task from the input field.
 * Validates input, creates a task object, and re-renders the list.
 */
function addTask() {
  const input = document.getElementById('taskInput');
  const text = input.value.trim();

  if (!text) {
    shakeInput(input);
    return;
  }

  const newTask = {
    id: Date.now(),        // unique ID based on timestamp
    text: text,
    completed: false,
  };

  tasks.unshift(newTask); // add to the beginning of the list
  saveToStorage();
  renderTasks();

  input.value = '';
  input.focus();
}

/**
 * Toggle the completed state of a task by its ID.
 * @param {number} id - Task ID
 */
function toggleTask(id) {
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveToStorage();
  renderTasks();
}

/**
 * Remove a task by its ID.
 * @param {number} id - Task ID
 */
function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveToStorage();
  renderTasks();
}

/**
 * Remove all completed tasks from the list.
 */
function clearCompleted() {
  const completedCount = tasks.filter((t) => t.completed).length;
  if (completedCount === 0) return;

  if (confirm(`Hapus ${completedCount} tugas yang sudah selesai?`)) {
    tasks = tasks.filter((task) => !task.completed);
    saveToStorage();
    renderTasks();
  }
}

// ===========================
// Filter Function
// ===========================

/**
 * Set active filter and re-render the task list.
 * @param {'all'|'active'|'completed'} filter
 * @param {HTMLElement} btn - The clicked filter button
 */
function filterTasks(filter, btn) {
  currentFilter = filter;

  // Update active state on filter buttons
  document.querySelectorAll('.filter-btn').forEach((b) =>
    b.classList.remove('active')
  );
  btn.classList.add('active');

  renderTasks();
}

// ===========================
// Render Function
// ===========================

/**
 * Render the task list based on the current filter,
 * update counters, summary text, and empty state visibility.
 */
function renderTasks() {
  const list = document.getElementById('taskList');
  const emptyState = document.getElementById('emptyState');
  const footerActions = document.getElementById('footerActions');
  const taskSummary = document.getElementById('taskSummary');

  // Filter tasks based on current tab
  const filteredTasks = tasks.filter((task) => {
    if (currentFilter === 'active') return !task.completed;
    if (currentFilter === 'completed') return task.completed;
    return true; // 'all'
  });

  // Build list HTML
  if (filteredTasks.length === 0) {
    list.innerHTML = '';
    emptyState.classList.add('visible');
  } else {
    emptyState.classList.remove('visible');
    list.innerHTML = filteredTasks.map(createTaskHTML).join('');
  }

  // Update counters on filter tabs
  const total = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const activeCount = total - completedCount;

  document.getElementById('countAll').textContent = total;
  document.getElementById('countActive').textContent = activeCount;
  document.getElementById('countCompleted').textContent = completedCount;

  // Update footer summary
  footerActions.style.display = total > 0 ? 'flex' : 'none';
  taskSummary.textContent =
    activeCount > 0
      ? `${activeCount} tugas tersisa`
      : total > 0
      ? 'Semua tugas selesai! 🎉'
      : '';
}

/**
 * Generate the HTML string for a single task item.
 * @param {{ id: number, text: string, completed: boolean }} task
 * @returns {string} HTML string
 */
function createTaskHTML(task) {
  const completedClass = task.completed ? 'completed' : '';
  const checkIcon = task.completed ? '<i class="fas fa-check"></i>' : '';

  return `
    <li class="task-item ${completedClass}" id="task-${task.id}">
      <button
        class="task-checkbox"
        onclick="toggleTask(${task.id})"
        title="${task.completed ? 'Tandai belum selesai' : 'Tandai selesai'}"
        aria-label="${task.completed ? 'Tandai belum selesai' : 'Tandai selesai'}"
      >
        ${checkIcon}
      </button>
      <span class="task-text">${escapeHTML(task.text)}</span>
      <button
        class="delete-btn"
        onclick="deleteTask(${task.id})"
        title="Hapus tugas"
        aria-label="Hapus tugas"
      >
        <i class="fas fa-times"></i>
      </button>
    </li>
  `;
}

// ===========================
// Utility Functions
// ===========================

/**
 * Escape HTML special characters to prevent XSS.
 * @param {string} str
 * @returns {string}
 */
function escapeHTML(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

/**
 * Shake animation feedback when input is empty.
 * @param {HTMLElement} input
 */
function shakeInput(input) {
  input.style.transition = 'transform 0.1s';
  const parent = input.closest('.input-wrapper');
  parent.style.borderColor = '#ef4444';
  parent.style.boxShadow = '0 0 0 4px rgba(239,68,68,0.12)';

  let count = 0;
  const shake = setInterval(() => {
    parent.style.transform = count % 2 === 0 ? 'translateX(6px)' : 'translateX(-6px)';
    count++;
    if (count > 5) {
      clearInterval(shake);
      parent.style.transform = 'translateX(0)';
      setTimeout(() => {
        parent.style.borderColor = '';
        parent.style.boxShadow = '';
      }, 600);
    }
  }, 60);

  input.focus();
}
