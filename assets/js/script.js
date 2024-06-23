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
const taskDisplayEl = $("#task-display");

// Todo: create a function to generate a unique task id
function generateTaskId(event) {
  return crypto.randomUUID();
}

// Todo: create a function to create a task card
function createTaskCard(task) {
  const taskCard = $("<div>")
    .addClass("card project-card my-3 draggable")
    .attr("data-task-id", task.id);
  const cardHeader = $("<div>").addClass("card-header h4").text(task.name);
  const cardBody = $("<div>").addClass("card-body");
  const cardDescription = $("<p>").addClass("card-text").text(task.description);
  const cardDueDate = $("<p>").addClass("card-text").text(task.dueDate);
  const cardDeleteBtn = $("<button>")
    .addClass("btn btn-danger delete")
    .text("Delete")
    .attr("data-task-id", task.id);

  //When delete button is pressed, do handledeletetask function
  cardDeleteBtn.on("click", handleDeleteTask);

  if (task.dueDate && task.status !== "done") {
    const now = dayjs();
    const taskDueDate = dayjs(task.dueDate, "DD/MM/YYYY");

    //Different colors for each card depeneding on it's due date.
    if (now.isSame(taskDueDate, "day")) {
      taskCard.addClass("bg-warning text-white");
    } else if (now.isAfter(taskDueDate)) {
      taskCard.addClass("bg-danger text-white");
      cardDeleteBtn.addClass("border-light");
    }
  }
  //Append created elements to card
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

  //Append cards to each section depending on their status, "to-do," "in-progress," or "done.
  for (let task of tasks) {
    if (task.status === "to-do") {
      todoList.append(createTaskCard(task));
    } else if (task.status === "in-progress") {
      inProgressList.append(createTaskCard(task));
    } else if (task.status === "done") {
      doneList.append(createTaskCard(task));
    }
  }

  // Makes cards draggable and changes opacity when you are dragging them
  $(".draggable").draggable({
    opacity: 0.8,
    zIndex: 50,

    helper: function (e) {
      const original = $(e.target).hasClass("ui-draggable")
        ? $(e.target)
        : $(e.target).closest(".ui-draggable");

      return original.clone().css({
        width: original.outerWidth(),
      });
    },
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

// Saves tasks to storage as a string
function saveTasksToStorage(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

//Hides form modal when called
function closeModal() {
  modal.modal("hide");
}

//Adding Task function
function handleAddTask(event) {
  event.preventDefault();

  //Calls generate task id function
  let taskId = generateTaskId(event);

  const taskName = taskNameInputEl.val().trim();
  const taskDueDate = taskDueDateInputEl.val();
  const taskDescription = taskDescriptionInputEl.val();

  //creates object of inputs from form and the random id that was generated.
  const newTask = {
    id: taskId,
    name: taskName,
    dueDate: taskDueDate,
    description: taskDescription,
    status: "to-do",
  };

  //pushes new task to array of all tasks
  const tasks = readTasksFromStorage();
  tasks.push(newTask);

  saveTasksToStorage(tasks);

  renderTaskList();

  //clears input values after submitting
  taskNameInputEl.val("");
  taskDueDateInputEl.val("");
  taskDescriptionInputEl.val("");

  closeModal();
}

// Todo: create a function to handle deleting a task
function handleDeleteTask() {
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
  const taskNum = ui.draggable[0].dataset.taskId;
  const newStatus = event.target.id;

  //Changes status of the card when it is dropped into a new section.
  for (let task of tasks) {
    if (task.id === taskNum) {
      task.status = newStatus;
    }
  }
  //saves the current task card list to storage with updated status.
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTaskList();
}

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker

taskFormEl.on("submit", handleAddTask);

//Closes modal when clicking "x" in the corner
closeButtonEl.click(closeModal);

// taskDisplayEl.on("click", ".btn-delete-task", handleDeleteTask);

$(document).ready(function () {
  renderTaskList();

  //Makes due date a date picker with month / eyar
  taskDueDateInputEl.datepicker({
    changeMonth: true,
    changeYear: true,
  });

  // Makes status lanes droppable
  $(".lane").droppable({
    accept: ".draggable",
    drop: handleDrop,
    activeClass: "ui-state-highlight",
  });
});
