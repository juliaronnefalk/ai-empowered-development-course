import { VibeKanbanWebCompanion } from 'vibe-kanban-web-companion';
import { format, parseISO, isToday, isTomorrow, differenceInDays, startOfDay, isBefore } from 'date-fns';

// Todos array (Feature 1)
let todos = [];
let nextId = 1;

// Current filter (Feature 2)
let currentFilter = 'all';

// Current sort (Feature 3: Due dates)
let currentSort = 'due-date'; // 'due-date' or 'none'

// localStorage key
const STORAGE_KEY = 'todos_app_data';

document.addEventListener('DOMContentLoaded', () => {
    init();
    initVibeKanban();
});

function init() {
    // Load todos from localStorage
    loadTodosFromStorage();

    // Wire up add button
    const addBtn = document.getElementById('addBtn');
    const todoInput = document.getElementById('todoInput');
    const dueDateInput = document.getElementById('dueDateInput');

    addBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo();
    });

    // Wire up filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => setFilter(btn.dataset.filter));
    });

    // Wire up sort buttons
    const sortButtons = document.querySelectorAll('.sort-btn');
    sortButtons.forEach(btn => {
        btn.addEventListener('click', () => setSort(btn.dataset.sort));
    });

    renderTodos();
}

function initVibeKanban() {
    const companion = new VibeKanbanWebCompanion();
    companion.render(document.body);
}

// Feature 1: Add, toggle, delete todos
function addTodo() {
    const input = document.getElementById('todoInput');
    const dueDateInput = document.getElementById('dueDateInput');
    const text = input.value.trim();

    if (text === '') return;

    todos.push({
        id: nextId++,
        text: text,
        completed: false,
        dueDate: dueDateInput.value ? dueDateInput.value : null
    });

    input.value = '';
    dueDateInput.value = '';
    saveTodosToStorage();
    renderTodos();
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodosToStorage();
        renderTodos();
    }
}

function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    saveTodosToStorage();
    renderTodos();
}

// Feature 1: Render todos
function renderTodos() {
    const todoList = document.getElementById('todoList');
    let displayTodos = getFilteredTodos();
    displayTodos = getSortedTodos(displayTodos);

    todoList.innerHTML = '';

    displayTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = 'todo-item';
        if (todo.completed) li.classList.add('completed');

        // Add due date status classes
        if (todo.dueDate) {
            const dueDate = parseISO(todo.dueDate);
            const today = startOfDay(new Date());
            const dueDateStart = startOfDay(dueDate);

            if (isBefore(dueDateStart, today) && !todo.completed) {
                li.classList.add('overdue');
            } else if (isToday(dueDate)) {
                li.classList.add('due-today');
            } else if (isTomorrow(dueDate)) {
                li.classList.add('due-tomorrow');
            }
        }

        const dueDateText = todo.dueDate ? formatDueDate(todo.dueDate) : '';

        li.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
            <div class="todo-content">
                <span class="todo-text">${escapeHtml(todo.text)}</span>
                ${dueDateText ? `<span class="todo-due-date">${dueDateText}</span>` : ''}
            </div>
            <button class="todo-delete">Delete</button>
        `;

        li.querySelector('.todo-checkbox').addEventListener('change', () => toggleTodo(todo.id));
        li.querySelector('.todo-delete').addEventListener('click', () => deleteTodo(todo.id));

        todoList.appendChild(li);
    });
}

// Feature 2: Filter todos based on current filter
function getFilteredTodos() {
    if (currentFilter === 'active') {
        return todos.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        return todos.filter(t => t.completed);
    }
    return todos; // 'all'
}

// Feature 2: Set filter and update UI
function setFilter(filter) {
    currentFilter = filter;

    // Update button styling
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        }
    });

    renderTodos();
}

// Feature 3: Sort todos by due date (upcoming first)
function getSortedTodos(todosToSort) {
    if (currentSort !== 'due-date') return todosToSort;

    return [...todosToSort].sort((a, b) => {
        // Todos without due dates go to the bottom
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;

        // Compare due dates (earlier dates first)
        const dateA = parseISO(a.dueDate);
        const dateB = parseISO(b.dueDate);
        return dateA.getTime() - dateB.getTime();
    });
}

// Feature 3: Set sort method and update UI
function setSort(sort) {
    currentSort = sort;

    // Update button styling
    const sortButtons = document.querySelectorAll('.sort-btn');
    sortButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.sort === sort) {
            btn.classList.add('active');
        }
    });

    renderTodos();
}

// Feature 3: Format due date for display
function formatDueDate(dateString) {
    try {
        const date = parseISO(dateString);

        if (isToday(date)) {
            return 'Today';
        } else if (isTomorrow(date)) {
            return 'Tomorrow';
        } else {
            // For other dates, show abbreviated format: "Jan 25"
            return format(date, 'MMM d');
        }
    } catch (error) {
        return '';
    }
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// localStorage functions
function saveTodosToStorage() {
    const data = {
        todos: todos,
        nextId: nextId
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadTodosFromStorage() {
    const data = localStorage.getItem(STORAGE_KEY);

    if (data) {
        try {
            const parsed = JSON.parse(data);
            todos = parsed.todos || [];
            nextId = parsed.nextId || 1;
        } catch (error) {
            console.error('Failed to load todos from localStorage:', error);
            todos = [];
            nextId = 1;
        }
    } else {
        todos = [];
        nextId = 1;
    }
}
