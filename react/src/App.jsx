import React, { useEffect, useMemo, useRef, useState } from "react";
import LiveRegion from "./components/LiveRegion.jsx";
import Modal from "./components/Modal.jsx";
import { loadTodos, saveTodos } from "./utils/storage.js";
import { Button } from "@visa/nova-react";

const FILTERS = {
  all: () => true,
  active: (t) => !t.completed,
  completed: (t) => t.completed,
};

export default function App() {
  const [todos, setTodos] = useState(() => loadTodos());
  const [filter, setFilter] = useState("all");
  const [input, setInput] = useState("");
  const [announce, setAnnounce] = useState("");
  const [isClearOpen, setClearOpen] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  const visible = useMemo(() => {
    return todos.filter(FILTERS[filter]);
  }, [todos, filter]);

  function addTodoFromInput() {
    const text = input.trim();
    if (!text) return;

    const next = [
      ...todos,
      { id: crypto.randomUUID(), text, completed: false },
    ];

    setTodos(next);
    setInput("");
    setAnnounce(`Added “${text}”.`);
    inputRef.current?.focus();
  }

  function onSubmit(e) {
    e.preventDefault();
    addTodoFromInput();
  }

  function toggle(id) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }

  function remove(id) {
    const t = todos.find((x) => x.id === id);
    setTodos((prev) => prev.filter((t) => t.id !== id));
    setAnnounce(`Deleted “${t?.text ?? "item"}”.`);
  }

  function update(id, nextText) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, text: nextText } : t))
    );
    setAnnounce(`Edited item.`);
  }

  function clearCompleted() {
    setTodos((prev) => prev.filter((t) => !t.completed));
    setAnnounce("Cleared completed items.");
    setClearOpen(false);
  }

  return (
    <div className="app">
      <a className="skip-link" href="#main">Skip to main content</a>

      <header className="app-header" role="banner">
        <span className="v-typography-display-1">React ToDo List</span>
      </header>

      <main id="main" tabIndex={-1}>
        <section aria-labelledby="todo-title" className="card">
          <span className="v-typography-headline-1" id="todo-title">Todos</span>

          <form className="add-row" onSubmit={onSubmit}>
            <label htmlFor="new-todo" className="sr-only">Add task</label>

            <input
              id="new-todo"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Add a task and press Enter"
              aria-describedby="add-hint"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTodoFromInput();
                }
              }}
            />

            <Button type="submit">Add</Button>

            <div id="add-hint" className="hint">
              Press Enter to add. Tasks are saved locally.
            </div>
          </form>

          <div className="row">
            <span className="sr-only" id="filter-label">Filter tasks</span>

            <div role="group" aria-labelledby="filter-label" className="filters">
              {["all", "active", "completed"].map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`v-button v-button-secondary chip ${filter === f ? "selected" : ""}`}
                  aria-pressed={filter === f}
                  onClick={() => setFilter(f)}
                >
                  {f[0].toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="v-button v-button-secondary tertiary"
              onClick={() => setClearOpen(true)}
              disabled={!todos.some((t) => t.completed)}
            >
              Clear completed
            </button>
          </div>

          <ul className="list" aria-live="polite">
            {visible.map((t) => (
              <li key={t.id} className="li">
                <TodoItem
                  todo={t}
                  onToggle={() => toggle(t.id)}
                  onDelete={() => remove(t.id)}
                  onEdit={(text) => update(t.id, text)}
                />
              </li>
            ))}
            {visible.length === 0 && (
              <li className="empty">No items in this view.</li>
            )}
          </ul>
        </section>
      </main>

      <LiveRegion message={announce} />

      {isClearOpen && (
        <Modal
          titleId="clear-title"
          onClose={() => setClearOpen(false)}
          onConfirm={clearCompleted}
        >
          <h3 id="clear-title">Clear all completed?</h3>
          <p>This action will remove all completed items.</p>
        </Modal>
      )}
    </div>
  );
}

function TodoItem({ todo, onToggle, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.text);
  const editRef = useRef(null);

  useEffect(() => {
    if (editing) editRef.current?.focus();
  }, [editing]);

  return (
    <div className="item">
      <label className="checkbox">
        <input
          type="checkbox"
          className="v-checkbox"
          checked={todo.completed}
          onChange={onToggle}
          aria-checked={todo.completed}
          onKeyDown={(e) => {
            if (e.key === " " || e.key === "Spacebar") {
              e.preventDefault();
              onToggle();
            }
          }}
        />
        <span className={todo.completed ? "done" : ""}>{todo.text}</span>
      </label>

      <div className="item-actions">
        {!editing ? (
          <>
            <button
              type="button"
              className="v-button v-button-secondary v-alternate"
              onClick={() => setEditing(true)}
            >
              Edit
            </button>
            <button
              type="button"
              className="v-button v-button-destructive v-button-secondary"
              onClick={onDelete}
            >
              Delete
            </button>
          </>
        ) : (
          <div className="edit-row">
            <label htmlFor={`edit-${todo.id}`} className="sr-only">
              Edit task
            </label>

            <input
              id={`edit-${todo.id}`}
              ref={editRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onEdit(draft.trim() || todo.text);
                  setEditing(false);
                } else if (e.key === "Escape") {
                  setDraft(todo.text);
                  setEditing(false);
                }
              }}
            />

            <button
              type="button"
              className="v-button v-button-secondary v-alternate"
              onClick={() => {
                onEdit(draft.trim() || todo.text);
                setEditing(false);
              }}
            >
              Save
            </button>
            <button
              type="button"
              className="v-button v-button-destructive v-button-secondary"
              onClick={() => {
                setDraft(todo.text);
                setEditing(false);
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}