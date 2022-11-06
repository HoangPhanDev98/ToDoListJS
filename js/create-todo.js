function isMatchStatus(todoElement, filterStatus) {
  if (!filterStatus) return true;
  return filterStatus === "all" || todoElement.dataset.status === filterStatus;
}

function isMatchSearch(todoElement, searchTerm) {
  if (!todoElement) return false;
  if (searchTerm === "") return true;

  const titleElement = todoElement.querySelector("p.todo__title");
  return titleElement.textContent
    .toLowerCase()
    .includes(searchTerm.toLowerCase());
}

function isMatch(todoElement, params) {
  if (!params) return true;
  if (!params.get("searchTerm") && !params.get("status")) return true;
  if (!params.get("searchTerm") && params.get("status")) {
    return isMatchStatus(todoElement, params.get("status"));
  } else if (params.get("searchTerm") && !params.get("status")) {
    return isMatchSearch(todoElement, params.get("searchTerm"));
  } else if (params.get("searchTerm") && params.get("status")) {
    return (
      isMatchSearch(todoElement, params.get("searchTerm")) &&
      isMatchStatus(todoElement, params.get("status"))
    );
  }
}

function createTodoElement(todo, params) {
  if (!todo) return;

  // find template
  const todoTemplate = document.getElementById("todoTemplate");
  if (!todoTemplate) return;

  // clone li element
  const todoElement = todoTemplate.content.querySelector("li").cloneNode(true);
  if (!todoElement) return;
  todoElement.dataset.id = todo.id;
  todoElement.dataset.status = todo.status;

  // update
  const todoTitle = todoElement.querySelector("p.todo__title");
  if (!todoTitle) return;
  todoTitle.textContent = todo.title;

  // check if we should show it or not
  todoElement.hidden = !isMatch(todoElement, params);

  // event
  // mark-as-done button
  const markAsDoneButton = todoElement.querySelector("button.mark-as-done");
  if (markAsDoneButton) {
    markAsDoneButton.addEventListener("click", function () {
      const newStatus =
        todoElement.dataset.status === "pending" ? "completed" : "pending";
      // save from local storage
      const todoList = getTodoList();
      const index = todoList.findIndex((x) => x.id === todo.id);
      todoList[index].status = newStatus;
      localStorage.setItem("todo_list", JSON.stringify(todoList));

      // save from dom
      todoElement.dataset.status = newStatus;

      const newAlertClass =
        newStatus === "pending" ? "alert-secondary" : "alert-success";
      divElement.classList.remove("alert-secondary", "alert-success");
      divElement.classList.add(newAlertClass);

      const newButtonText = newStatus === "pending" ? "Finish" : "Reset";
      const newButtonColor =
        newStatus === "pending" ? "btn-success" : "btn-secondary";
      markAsDoneButton.textContent = newButtonText;
      markAsDoneButton.classList.remove("btn-secondary", "btn-success");
      markAsDoneButton.classList.add(newButtonColor);
    });
  }

  // remove button
  const removeButton = todoElement.querySelector("button.remove");
  if (removeButton) {
    removeButton.addEventListener("click", function () {
      // remove from local storage
      const todoList = getTodoList();
      const newTodoList = todoList.filter((x) => x.id !== todo.id);
      localStorage.setItem("todo_list", JSON.stringify(newTodoList));

      // remove from dom
      todoElement.remove();
    });
  }

  // edit button
  const editButton = todoElement.querySelector("button.edit");
  if (editButton) {
    editButton.addEventListener("click", () => {
      // get lasted todoList
      const todoList = getTodoList();
      const lastedTodoList = todoList.find((x) => x.id === todo.id);

      populateTodoForm(lastedTodoList);
    });
  }

  const currentStatus = todoElement.dataset.status;
  const divElement = todoElement.querySelector("div.todo");

  // alert
  const alertClass =
    currentStatus === "pending" ? "alert-secondary" : "alert-success";
  divElement.classList.remove("alert-secondary", "alert-success");
  divElement.classList.add(alertClass);

  // button
  const buttonText = currentStatus === "pending" ? "Finish" : "Reset";
  const buttonColor =
    currentStatus === "pending" ? "btn-success" : "btn-secondary";
  markAsDoneButton.textContent = buttonText;
  markAsDoneButton.classList.remove("btn-secondary", "btn-success");
  markAsDoneButton.classList.add(buttonColor);

  return todoElement;
}

function populateTodoForm(todo) {
  // query todo form
  const todoForm = document.getElementById("todoFormId");
  // dataset.id = todo.id
  if (todoForm) {
    todoForm.dataset.id = todo.id;
  }
  // set values todo form
  const todoInput = todoForm.querySelector("#todoText");
  if (todoInput) {
    todoInput.value = todo.title;
  }

  const todoCheckInput = todoForm.querySelector("#todoStatus");
  if (todoCheckInput) {
    todo.status === "pending"
      ? (todoCheckInput.checked = false)
      : (todoCheckInput.checked = true);
  }
  // set todoText input
}

function renderTodoList(todoList, ulElementId, params) {
  if (!Array.isArray(todoList) || todoList.length === 0) return;

  if (!ulElementId) return;
  const ulElement = document.getElementById(ulElementId);

  for (const todo of todoList) {
    const liElement = createTodoElement(todo, params);

    ulElement.appendChild(liElement);
  }
}

function getTodoList() {
  try {
    return JSON.parse(localStorage.getItem("todo_list")) || [];
  } catch {
    return [];
  }
}

function handleTodoFormSubmit(event) {
  event.preventDefault();

  // get value
  const todoForm = document.getElementById("todoFormId");
  if (!todoForm) return;
  const todoTextInput = todoFormId.querySelector("input#todoText").value;
  if (!todoTextInput) return;

  const todoCheckboxInput = todoFormId.querySelector("input#todoStatus");
  const todoStatus =
    todoCheckboxInput.checked === false ? "pending" : "completed";

  const isEdit = Boolean(todoForm.dataset.id);

  if (isEdit) {
    // find current todo
    const todoList = getTodoList();
    const index = todoList.findIndex(
      (x) => x.id.toString() === todoForm.dataset.id
    );
    if (index < 0) return;
    // update content
    todoList[index].title = todoTextInput;
    todoList[index].status = todoStatus;
    // save
    localStorage.setItem("todo_list", JSON.stringify(todoList));
    // apply DOM changes
    const todoElement = document.querySelector(
      `ul#todoList > li[data-id = "${todoForm.dataset.id}"]`
    );
    if (!todoElement) return;
    const todoTitle = todoElement.querySelector("p.todo__title");
    if (!todoTitle) return;
    todoTitle.textContent = todoTextInput;
  } else {
    const newTodoList = {
      id: Date.now(),
      title: todoTextInput,
      status: todoStatus,
    };

    const todoList = getTodoList();
    todoList.push(newTodoList);
    localStorage.setItem("todo_list", JSON.stringify(todoList));

    // apply dom
    const newLiElement = createTodoElement(newTodoList);
    const ulElement = document.getElementById("todoList");
    if (!ulElement) return;
    ulElement.appendChild(newLiElement);
  }

  // reset

  todoForm.reset();
}

(() => {
  const params = new URLSearchParams(window.location.search);

  const todoList = getTodoList();

  renderTodoList(todoList, "todoList", params);

  // register submit event for todo form
  const todoForm = document.getElementById("todoFormId");
  if (todoForm) {
    todoForm.addEventListener("submit", handleTodoFormSubmit);
  }
})();
