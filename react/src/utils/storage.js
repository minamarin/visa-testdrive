//this code is the persistence layer of your Todo app. It makes your tasks survive a page refresh by saving them in the browser’s localStorage. 

const KEY = "react.todo.items";

export function loadTodos() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveTodos(items) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {}
}