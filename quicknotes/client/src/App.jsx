
import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "http://localhost:3000/api/notes";

function App() {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    try {
      const response = await axios.get(API_URL);
      setNotes(response.data);
      setError("");
    } catch (error) {
      console.log("Error fetching notes:", error);
      setError("Could not load notes. Please check your server.");
    } finally {
      setLoading(false);
    }
  }

  async function addNote() {
    if (!title.trim()) return;

    try {
      const response = await axios.post(API_URL, {
        title: title.trim(),
      });

      setNotes((previousNotes) => [...previousNotes, response.data]);
      setTitle("");
      setError("");
    } catch (error) {
      console.log("Error adding note:", error);
      setError("Could not save your note. Please try again.");
    }
  }

  async function deleteNote(id) {
    try {
      await axios.delete(`${API_URL}/${id}`);

      setNotes((previousNotes) =>
        previousNotes.filter((note) => note.id !== id)
      );

      setError("");
    } catch (error) {
      console.log("Error deleting note:", error);
      setError("Could not delete this note. Please try again.");
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    addNote();
  }

  return (
    <div className="app">
      <header className="topbar">
        <a className="brand" href="/">
          <span className="brand-icon">Q</span>
          <span>QuickNotes</span>
        </a>
        <span className="topbar-label">PERSONAL WORKSPACE</span>
      </header>

      <main className="main-content">
        <section className="hero">
          <span className="eyebrow">YOUR SPACE. YOUR IDEAS.</span>
          <h1>Your thoughts, organized.</h1>
          <p>
            A simple place to save your ideas, plans, and reminders.
          </p>
        </section>

        <section className="composer">
          <div className="section-heading">
            <h2>Create a note  </h2>
            <p>What's on your mind today?</p>
          </div>

          <form onSubmit={handleSubmit} className="note-form">
            <input
              type="text"
              placeholder="Write a note title..."
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              aria-label="Note title"
            />
            <button type="submit" className="add-button">
              <span>+</span> Add Note
            </button>
          </form>
        </section>

        <section className="notes-section">
          <div className="notes-heading">
            <div>
              <h2>Your notes</h2>
              <p>All your saved thoughts in one place.</p>
            </div>
            <span className="note-count">
              {notes.length} {notes.length === 1 ? "note" : "notes"}
            </span>
          </div>

          {error && <p className="status-message error">{error}</p>}

          {loading ? (
            <p className="status-message">Loading your notes...</p>
          ) : notes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✎</div>
              <h3>No notes yet</h3>
              <p>Add your first note using the box above.</p>
            </div>
          ) : (
            <div className="notes-grid">
              {notes.map((note) => (
                <article className="note-card" key={note.id}>
                  <div className="note-card-top">
                    <span className="note-icon">N</span>
                    <button
                      className="delete-button"
                      type="button"
                      onClick={() => deleteNote(note.id)}
                      aria-label={`Delete ${note.title}`}
                      title="Delete note"
                    >
                      Delete
                    </button>
                  </div>
                  <h3>{note.title}</h3>
                  <p className="note-card-caption">Saved in QuickNotes</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        Made for your ideas <span>♥</span>
      </footer>
    </div>
  );
}

export default App;
