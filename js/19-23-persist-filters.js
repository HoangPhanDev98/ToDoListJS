function getAllTodoElements() {
  return document.querySelectorAll("ul#todoList > li");
}

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
  if(!params) return;
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

function initSearchInput(params) {
  const searchInput = document.getElementById("searchTerm");
  if (!searchInput) return;

  if (params.get("searchTerm")) {
    searchInput.value = params.get("searchTerm");
  }

  searchInput.addEventListener("input", function () {
    handleFilterChange("searchTerm", searchInput.value);
  });
}

function handleFilterChange(filterName, filterValue) {
  // update query params
  const url = new URL(window.location);
  url.searchParams.set(filterName, filterValue);
  history.pushState({}, "", url);

  const todoElementList = getAllTodoElements();
  if (!todoElementList) return;

  for (const todoElement of todoElementList) {
    if (!todoElement) return;
    const needToShow = isMatch(todoElement, url.searchParams);
    todoElement.hidden = !needToShow;
  }
}

function initFilterStatus(params) {
  const filterStatusSelect = document.getElementById("filterStatus");
  if (!filterStatusSelect) return;

  if (params.get("status")) {
    filterStatusSelect.value = params.get("status");
  }

  filterStatusSelect.addEventListener("change", function () {
    handleFilterChange("status", filterStatusSelect.value);
  });
}

//Main
(() => {
  // get query params object
  const params = new URLSearchParams(window.location.search);

  initSearchInput(params);
  initFilterStatus(params);
})();
