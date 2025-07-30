import React, { useState, useMemo } from "react";
import "./App.css";

// Category/tag demo seed data (could be loaded from backend)
const INITIAL_CATEGORIES = ["All", "Work", "Personal", "Ideas", "Archive"];
const DEMO_NOTES = [
  {
    id: 1,
    title: "Welcome to Notes",
    content: "This is a sample note. You can edit or delete it.",
    category: "All",
  },
  {
    id: 2,
    title: "Work Meeting",
    content: "Meeting about project X next Tuesday at 10am.",
    category: "Work",
  },
  {
    id: 3,
    title: "Grocery List",
    content: "Milk, eggs, bread, bananas.",
    category: "Personal",
  },
  {
    id: 4,
    title: "App Idea",
    content: "Build a simple note organizer using React.",
    category: "Ideas",
  },
];

function generateId(notes) {
  return (
    notes.reduce((max, n) => (n.id > max ? n.id : max), 0) + 1
  );
}

// PUBLIC_INTERFACE
function NotesApp() {
  // State management
  const [notes, setNotes] = useState([...DEMO_NOTES]);
  const [selectedNoteId, setSelectedNoteId] = useState(
    DEMO_NOTES.length ? DEMO_NOTES[0].id : null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [search, setSearch] = useState("");
  const [sidebarCategory, setSidebarCategory] = useState("All");

  // For editor form
  const selectedNote = notes.find((n) => n.id === selectedNoteId);
  const [editState, setEditState] = useState({
    title: "",
    content: "",
    category: "All",
  });

  // Derived: filtered notes for search and current category
  const notesFiltered = useMemo(() => {
    let filtered = notes;
    if (sidebarCategory && sidebarCategory !== "All") {
      filtered = filtered.filter((n) => n.category === sidebarCategory);
    }
    if (search.trim()) {
      const lq = search.trim().toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(lq) ||
          n.content.toLowerCase().includes(lq)
      );
    }
    return filtered;
  }, [notes, search, sidebarCategory]);

  // CRUD Actions

  // PUBLIC_INTERFACE
  function handleNewNote() {
    setIsEditing(true);
    setEditState({
      title: "",
      content: "",
      category: "All",
    });
    setSelectedNoteId(null);
  }

  // PUBLIC_INTERFACE
  function handleEditNote(note) {
    setIsEditing(true);
    setEditState({
      title: note.title,
      content: note.content,
      category: note.category,
    });
    setSelectedNoteId(note.id);
  }

  // PUBLIC_INTERFACE
  function handleSaveNote(e) {
    e.preventDefault();
    if (!editState.title.trim() || !editState.content.trim()) {
      alert("Title and content cannot be empty.");
      return;
    }
    if (selectedNoteId) {
      // Edit existing
      setNotes((prev) =>
        prev.map((n) =>
          n.id === selectedNoteId
            ? {
                ...n,
                ...editState,
              }
            : n
        )
      );
      setIsEditing(false);
    } else {
      // New
      const newNote = {
        id: generateId(notes),
        ...editState,
      };
      setNotes((prev) => [newNote, ...prev]);
      setSelectedNoteId(newNote.id);
      setIsEditing(false);
    }
  }

  // PUBLIC_INTERFACE
  function handleDeleteNote(noteId) {
    if (
      // eslint-disable-next-line no-restricted-globals
      window.confirm("Delete this note? This cannot be undone.")
    ) {
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      if (selectedNoteId === noteId) {
        // Select another note if possible
        const remaining = notes.filter((n) => n.id !== noteId);
        setSelectedNoteId(remaining.length ? remaining[0].id : null);
      }
      setIsEditing(false);
    }
  }

  // Handle selecting a note from list
  function handleSelectNote(note) {
    setSelectedNoteId(note.id);
    setIsEditing(false);
  }

  // Sidebar: Category/tags
  const allCategories = Array.from(
    new Set(["All", ...notes.map((n) => n.category), ...INITIAL_CATEGORIES])
  );

  // Handle sidebar navigation
  function handleSidebarCategory(ctg) {
    setSidebarCategory(ctg);
    setSelectedNoteId(null);
    setIsEditing(false);
  }

  // Minimalistic, palette-based styling
  // (see App.css for main color variables, we'll inject new vars below)
  React.useEffect(() => {
    document.documentElement.style.setProperty("--color-primary", "#1976d2");
    document.documentElement.style.setProperty("--color-secondary", "#424242");
    document.documentElement.style.setProperty("--color-accent", "#ff9800");
    // Override CSS light theme for required colors
    document.documentElement.style.setProperty("--bg-primary", "#fafcff");
    document.documentElement.style.setProperty("--bg-secondary", "#f5f6f9");
    document.documentElement.style.setProperty("--border-color", "#e9ecef");
    document.documentElement.style.setProperty("--text-primary", "#202020");
    document.documentElement.style.setProperty("--button-bg", "#1976d2");
    document.documentElement.style.setProperty("--button-accent", "#ff9800");
    document.documentElement.style.setProperty("--button-secondary", "#424242");
  }, []);

  return (
    <div className="NotesApp__root" data-theme="light">
      <div className="NotesApp__container">
        {/* Sidebar */}
        <aside className="NotesApp__sidebar">
          <div className="NotesApp__sidebarHeader">Categories</div>
          <nav className="NotesApp__sidebarNav">
            {allCategories.map((ctg) => (
              <button
                key={ctg}
                className={
                  "NotesApp__sidebarBtn" +
                  (sidebarCategory === ctg ? " active" : "")
                }
                onClick={() => handleSidebarCategory(ctg)}
                style={{
                  borderLeftColor:
                    sidebarCategory === ctg
                      ? "var(--color-primary)"
                      : "transparent",
                }}
              >
                {ctg}
              </button>
            ))}
          </nav>
          <div className="NotesApp__sidebarFooter">
            <button
              className="NotesApp__newBtn"
              onClick={handleNewNote}
              title="Create new note"
            >
              ＋ New Note
            </button>
          </div>
        </aside>
        {/* Main area */}
        <main className="NotesApp__main">
          <div className="NotesApp__topbar">
            <input
              className="NotesApp__search"
              type="text"
              placeholder="Search notes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <section className="NotesApp__contentArea">
            <div className="NotesApp__notesList">
              {notesFiltered.length === 0 ? (
                <div className="NotesApp__notesListEmpty">
                  No notes found.
                </div>
              ) : (
                notesFiltered.map((note) => (
                  <div
                    key={note.id}
                    className={
                      "NotesApp__noteListItem" +
                      (selectedNoteId === note.id ? " selected" : "")
                    }
                    onClick={() => handleSelectNote(note)}
                  >
                    <div className="NotesApp__noteListTitle">
                      {note.title}
                    </div>
                    <div className="NotesApp__noteListCat">
                      {note.category}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="NotesApp__editor">
              {/* Editor for create/edit */}
              {isEditing ? (
                <form
                  className="NotesApp__editorForm"
                  onSubmit={handleSaveNote}
                  autoComplete="off"
                >
                  <input
                    className="NotesApp__editorTitle"
                    type="text"
                    placeholder="Note Title"
                    value={editState.title}
                    autoFocus
                    onChange={(e) =>
                      setEditState((s) => ({
                        ...s,
                        title: e.target.value,
                      }))
                    }
                  />
                  <select
                    className="NotesApp__editorCategory"
                    value={editState.category}
                    onChange={(e) =>
                      setEditState((s) => ({
                        ...s,
                        category: e.target.value,
                      }))
                    }
                  >
                    {allCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <textarea
                    className="NotesApp__editorTextarea"
                    placeholder="Write your note…"
                    rows={10}
                    value={editState.content}
                    onChange={(e) =>
                      setEditState((s) => ({
                        ...s,
                        content: e.target.value,
                      }))
                    }
                  />
                  <div className="NotesApp__editorActions">
                    <button
                      type="submit"
                      className="NotesApp__actionBtn primary"
                      style={{
                        background: "var(--button-bg)",
                      }}
                    >
                      Save
                    </button>
                    {selectedNoteId && (
                      <button
                        type="button"
                        className="NotesApp__actionBtn accent"
                        onClick={() => handleDeleteNote(selectedNoteId)}
                        style={{
                          background: "var(--button-accent)",
                        }}
                      >
                        Delete
                      </button>
                    )}
                    <button
                      type="button"
                      className="NotesApp__actionBtn secondary"
                      onClick={() => setIsEditing(false)}
                      style={{
                        background: "var(--button-secondary)",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : selectedNote ? (
                <div className="NotesApp__viewer">
                  <div className="NotesApp__viewerHeader">
                    <span className="NotesApp__viewerTitle">
                      {selectedNote.title}
                    </span>
                    <span className="NotesApp__viewerCat">
                      {selectedNote.category}
                    </span>
                  </div>
                  <div className="NotesApp__viewerContent">
                    {selectedNote.content.split("\n").map((l, i) => (
                      <div key={i}>{l}</div>
                    ))}
                  </div>
                  <div className="NotesApp__viewerActions">
                    <button
                      className="NotesApp__actionBtn primary"
                      style={{
                        background: "var(--button-bg)",
                      }}
                      onClick={() => handleEditNote(selectedNote)}
                    >
                      Edit
                    </button>
                    <button
                      className="NotesApp__actionBtn accent"
                      style={{
                        background: "var(--button-accent)",
                      }}
                      onClick={() => handleDeleteNote(selectedNote.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <div className="NotesApp__emptyState">
                  <span>Select a note or create a new one.</span>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default NotesApp;
