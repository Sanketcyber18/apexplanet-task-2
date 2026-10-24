// Sanket Sharma | ApexPlanet Task 2
// Contact form validation, responsive navigation, and dynamic task board.

const contactForm = document.querySelector("#contactForm");
const fullName = document.querySelector("#fullName");
const email = document.querySelector("#email");
const subject = document.querySelector("#subject");
const message = document.querySelector("#message");
const consent = document.querySelector("#consent");
const formSuccess = document.querySelector("#formSuccess");
const charCount = document.querySelector("#charCount");

const errorFields = {
    fullName: document.querySelector("#nameError"),
    email: document.querySelector("#emailError"),
    subject: document.querySelector("#subjectError"),
    message: document.querySelector("#messageError"),
    consent: document.querySelector("#consentError")
};

function showFieldError(field, errorElement, text) {
    errorElement.textContent = text;
    field.classList.toggle("invalid", Boolean(text));
    field.setAttribute("aria-invalid", String(Boolean(text)));
}

function validateContactForm() {
    let isValid = true;
    const nameValue = fullName.value.trim();
    const emailValue = email.value.trim();
    const messageValue = message.value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    const checks = [
        [fullName, errorFields.fullName, nameValue.length >= 2 ? "" : "Please enter at least 2 characters."],
        [email, errorFields.email, emailPattern.test(emailValue) ? "" : "Enter a valid email address."],
        [subject, errorFields.subject, subject.value ? "" : "Please choose a topic."],
        [message, errorFields.message, messageValue.length >= 10 ? "" : "Message must be at least 10 characters."]
    ];

    checks.forEach(([field, errorElement, errorText]) => {
        showFieldError(field, errorElement, errorText);
        if (errorText) isValid = false;
    });

    errorFields.consent.textContent = consent.checked ? "" : "Please confirm before continuing.";
    if (!consent.checked) isValid = false;
    return isValid;
}

contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    formSuccess.hidden = true;

    if (validateContactForm()) {
        formSuccess.hidden = false;
        contactForm.reset();
        charCount.textContent = "0";
        document.querySelectorAll(".invalid").forEach((field) => {
            field.classList.remove("invalid");
            field.setAttribute("aria-invalid", "false");
        });
    }
});

message.addEventListener("input", () => {
    charCount.textContent = message.value.length;
    if (message.value.trim().length >= 10) showFieldError(message, errorFields.message, "");
});

[fullName, email, subject].forEach((field) => {
    field.addEventListener("input", () => {
        formSuccess.hidden = true;
        if (field === fullName && field.value.trim().length >= 2) showFieldError(field, errorFields.fullName, "");
        if (field === email && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(field.value.trim())) showFieldError(field, errorFields.email, "");
        if (field === subject && field.value) showFieldError(field, errorFields.subject, "");
    });
});

// Mobile navigation menu.
const menuToggle = document.querySelector("#menuToggle");
const navLinks = document.querySelector("#navLinks");

menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.textContent = isOpen ? "×" : "☰";
});

navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.textContent = "☰";
    });
});

// Task board data is saved locally in this browser.
const taskForm = document.querySelector("#taskForm");
const taskInput = document.querySelector("#taskInput");
const taskPriority = document.querySelector("#taskPriority");
const taskList = document.querySelector("#taskList");
const emptyState = document.querySelector("#emptyState");
const clearCompleted = document.querySelector("#clearCompleted");
const filterButtons = document.querySelectorAll(".filter-button");

let activeFilter = "all";
let tasks = loadTasks();

function loadTasks() {
    try {
        const savedTasks = JSON.parse(localStorage.getItem("sanketConnectlyTasks"));
        return Array.isArray(savedTasks) ? savedTasks : [];
    } catch (error) {
        return [];
    }
}

function saveTasks() {
    try {
        localStorage.setItem("sanketConnectlyTasks", JSON.stringify(tasks));
    } catch (error) {
        console.warn("Tasks could not be saved in this browser.", error);
    }
}

function createTask(text, priority) {
    return {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        text,
        priority,
        completed: false,
        createdAt: new Date().toLocaleDateString("en-IN", {
            day: "numeric", month: "short", year: "numeric"
        })
    };
}

function updateCounters() {
    const completedCount = tasks.filter((task) => task.completed).length;
    const activeCount = tasks.length - completedCount;

    document.querySelector("#allCount").textContent = tasks.length;
    document.querySelector("#activeCount").textContent = activeCount;
    document.querySelector("#completedCount").textContent = completedCount;
    document.querySelector("#taskProgressText").textContent = `${completedCount} of ${tasks.length} completed`;

    const progress = tasks.length ? (completedCount / tasks.length) * 100 : 0;
    document.querySelector("#progressFill").style.width = `${progress}%`;
}

function renderTasks() {
    taskList.replaceChildren();

    const visibleTasks = tasks.filter((task) => {
        if (activeFilter === "active") return !task.completed;
        if (activeFilter === "completed") return task.completed;
        return true;
    });

    visibleTasks.forEach((task) => {
        const item = document.createElement("li");
        item.className = `task-item${task.completed ? " done" : ""}`;

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-check";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", `Mark ${task.text} as ${task.completed ? "not completed" : "completed"}`);
        checkbox.addEventListener("change", () => {
            task.completed = checkbox.checked;
            saveTasks();
            renderTasks();
        });

        const content = document.createElement("div");
        content.className = "task-content";
        const title = document.createElement("span");
        title.className = "task-title";
        title.textContent = task.text;
        const meta = document.createElement("span");
        meta.className = "task-meta";
        meta.textContent = `Added ${task.createdAt}`;
        content.append(title, meta);

        const priorityBadge = document.createElement("span");
        priorityBadge.className = `priority ${task.priority}`;
        priorityBadge.textContent = task.priority === "high" ? "High" : task.priority === "low" ? "Low" : "Normal";

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-task";
        deleteButton.textContent = "×";
        deleteButton.setAttribute("aria-label", `Delete task: ${task.text}`);
        deleteButton.addEventListener("click", () => {
            tasks = tasks.filter((currentTask) => currentTask.id !== task.id);
            saveTasks();
            renderTasks();
        });

        item.append(checkbox, content, priorityBadge, deleteButton);
        taskList.append(item);
    });

    emptyState.hidden = visibleTasks.length > 0;
    updateCounters();
}

taskForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = taskInput.value.trim();

    if (text.length < 2) {
        taskInput.setCustomValidity("Please enter at least 2 characters.");
        taskInput.reportValidity();
        taskInput.setCustomValidity("");
        return;
    }

    tasks.unshift(createTask(text, taskPriority.value));
    saveTasks();
    taskForm.reset();
    taskInput.focus();
    renderTasks();
});

filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        activeFilter = button.dataset.filter;
        filterButtons.forEach((filter) => filter.classList.toggle("active", filter === button));
        renderTasks();
    });
});

clearCompleted.addEventListener("click", () => {
    tasks = tasks.filter((task) => !task.completed);
    saveTasks();
    renderTasks();
});

renderTasks();
