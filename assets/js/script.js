// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks"));
let nextId = JSON.parse(localStorage.getItem("nextId"));
const taskNameInputEl = $("#task-name-input");
const taskDueDateInputEl = $("#task-due-date");
const taskDescriptionInputEl = $("#task-description");
const taskFormEl = $("#task-form");
const closeButtonEl = $("#close");
const taskSubmitEl = $("#add-task-close");
const modal = $("#formModal");
const lanes = $(".lane");
const taskDisplayEl = $("#task-display");

// Todo: create a function to generate a unique task id
function generateTaskId(event) {
  return crypto.randomUUID();
}

// Todo: create a function to create a task card
function createTaskCard(task) {
  const taskCard = $("<div>")
    .addClass("draggable")
    .attr("data-task-id", task.id);
  const cardHeader = $("<div>").addClass("card-header h4").text(task.name);
  const cardBody = $("<div>").addClass("card-body");
  const cardDescription = $("<p>").addClass("card-text").text(task.description);
  const cardDueDate = $("<p>").addClass("card-text").text(task.dueDate);
  const cardDeleteBtn = $("<button>")
    .addClass("btn btn-danger delete")
    .text("Delete")
    .attr("data-task-id", task.id);
  cardDeleteBtn.on("click", handleDeleteTask);

  //   cardDeleteBtn.on("click", handleDeleteTask);

  if (task.dueDate && task.status !== "done") {
    const now = dayjs();
    const taskDueDate = dayjs(task.dueDate, "DD/MM/YYYY");

    if (now.isSame(taskDueDate, "day")) {
      taskCard.addClass("bg-warning text-white");
    } else if (now.isAfter(taskDueDate)) {
      taskCard.addClass("bg-danger text-white");
      cardDeleteBtn.addClass("border-light");
    }
  }
  cardBody.append(cardDescription, cardDueDate, cardDeleteBtn);
  taskCard.append(cardHeader, cardBody);
  return taskCard;
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
  const tasks = readTasksFromStorage();

  const todoList = $("#todo-cards");
  todoList.empty();

  const inProgressList = $("#in-progress-cards");
  inProgressList.empty();

  const doneList = $("#done-cards");
  doneList.empty();

  for (let task of tasks) {
    if (task.status === "to-do") {
      todoList.append(createTaskCard(task));
    } else if (task.status === "in-progress") {
      inProgressList.append(createTaskCard(task));
    } else if (task.status === "done") {
      doneList.append(createTaskCard(task));
    }
  }

  $(".draggable").draggable({
    opacity: 0.8,
    zIndex: 100,
  });
}

// Todo: create a function to handle adding a new task
function readTasksFromStorage() {
  let tasks = JSON.parse(localStorage.getItem("tasks"));
  if (!tasks) {
    tasks = [];
  }
  return tasks;
}

function saveTasksToStorage(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function closeModal() {
  modal.modal("hide");
}

function handleAddTask(event) {
  event.preventDefault();
  let taskId = generateTaskId(event);

  const taskName = taskNameInputEl.val().trim();
  const taskDueDate = taskDueDateInputEl.val();
  const taskDescription = taskDescriptionInputEl.val();

  const newTask = {
    id: taskId,
    name: taskName,
    dueDate: taskDueDate,
    description: taskDescription,
    status: "to-do",
  };
  console.log(newTask);

  const tasks = readTasksFromStorage();
  tasks.push(newTask);

  saveTasksToStorage(tasks);

  renderTaskList();

  taskNameInputEl.val("");
  taskDueDateInputEl.val("");
  taskDescriptionInputEl.val("");

  closeModal();
}

// Todo: create a function to handle deleting a task
function handleDeleteTask(event) {
  const taskId = $(this).attr("data-task-id");
  const tasks = readTasksFromStorage();

  tasks.forEach((task) => {
    if (task.id === taskId) {
      tasks.splice(tasks.indexOf(task), 1);
    }
  });

  saveTasksToStorage(tasks);
  renderTaskList();
}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  const tasks = readTasksFromStorage();
  const taskId = ui.draggable[0].dataset.taskId;
  const newStatus = event.target.id;

  for (let task of tasks) {
    if (task.id === taskId) {
      task.status === newStatus;
    }
  }

  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTaskList();
}

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {});

taskFormEl.on("submit", handleAddTask);
closeButtonEl.click(closeModal);

// taskDisplayEl.on("click", ".btn-delete-task", handleDeleteTask);

$(document).ready(function () {
  renderTaskList();

  taskDueDateInputEl.datepicker({
    changeMonth: true,
    changeYear: true,
  });

  lanes.droppable({
    accept: ".draggable",
    drop: handleDrop,
  });
});
