import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "http://localhost:3000/api";
const TOKEN_KEY = "quicknotes_token";
const USERNAME_KEY = "quicknotes_username";

function App() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [username, setUsername] = useState(
    () => localStorage.getItem(USERNAME_KEY) || "",
  );
  const [screen, setScreen] = useState("welcome");
  const [formUsername, setFormUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    async function fetchNotes() {
      try {
        const response = await axios.get(`${API_URL}/notes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotes(response.data);
        setError("");
      } catch (requestError) {
        if (requestError.response?.status === 401) {
          logOut();
          return;
        }
        setError("Could not load notes. Please check your server and try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchNotes();
  }, [token]);

  function logOut() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
    setToken("");
    setUsername("");
    setNotes([]);
    setLoading(false);
    setTitle("");
    setError("");
    setScreen("welcome");
  }

  function saveLogin(response) {
    localStorage.setItem(TOKEN_KEY, response.data.token);
    localStorage.setItem(USERNAME_KEY, response.data.user.username);
    setLoading(true);
    setToken(response.data.token);
    setUsername(response.data.user.username);
    setFormUsername("");
    setPassword("");
    setConfirmPassword("");
    setAuthError("");
  }

  async function submitAuthForm(event) {
    event.preventDefault();
    setAuthError("");

    const cleanUsername = formUsername.trim();
    if (!cleanUsername || !password) {
      setAuthError("Please fill in every field.");
      return;
    }

    if (screen === "register") {
      if (password.length < 8) {
        setAuthError("Your password must be at least 8 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setAuthError("The passwords do not match.");
        return;
      }
    }

    setIsRegistering(true);

    try {
      const endpoint = screen === "register" ? "register" : "login";
      const response = await axios.post(`${API_URL}/auth/${endpoint}`, {
        username: cleanUsername,
        password,
      });
      saveLogin(response);
    } catch (requestError) {
      setAuthError(
        requestError.response?.data?.error ||
          "Could not connect to the server. Please try again.",
      );
    } finally {
      setIsRegistering(false);
    }
  }

  async function addNote() {
    if (!title.trim()) return;

    try {
      const response = await axios.post(
        `${API_URL}/notes`,
        { title: title.trim() },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setNotes((previousNotes) => [...previousNotes, response.data]);
      setTitle("");
      setError("");
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        logOut();
        return;
      }
      setError(requestError.response?.data?.error || "Could not save your note.");
    }
  }

  async function deleteNote(id) {
    try {
      await axios.delete(`${API_URL}/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotes((previousNotes) => previousNotes.filter((note) => note.id !== id));
      setError("");
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        logOut();
        return;
      }
      setError(
        requestError.response?.data?.error || "Could not delete this note.",
      );
    }
  }

  function handleNoteSubmit(event) {
    event.preventDefault();
    addNote();
  }

  function showAuthScreen(nextScreen) {
    setScreen(nextScreen);
    setAuthError("");
    setPassword("");
    setConfirmPassword("");
  }

  if (!token) {
    return (
      <div className="auth-page">
        <header className="auth-brand">
          <span className="brand-icon">Q</span>
          <span>QuickNotes</span>
        </header>

        <main className="auth-main">
          <section className="auth-card">
            <div className="auth-icon" aria-hidden="true">
              ✎
            </div>
            {screen === "welcome" ? (
              <>
                <p className="auth-eyebrow">A LITTLE SPACE FOR YOUR IDEAS</p>
                <h1>Notes that go where you do.</h1>
                <p className="auth-description">
                  Keep your thoughts organized in your own private workspace.
                </p>
                <div className="auth-actions">
                  <button
                    className="primary-button"
                    onClick={() => showAuthScreen("register")}
                    type="button"
                  >
                    Create Account
                  </button>
                  <button
                    className="secondary-button"
                    onClick={() => showAuthScreen("login")}
                    type="button"
                  >
                    Login
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="auth-eyebrow">
                  {screen === "register" ? "GET STARTED" : "WELCOME BACK"}
                </p>
                <h1>
                  {screen === "register" ? "Create your account" : "Log in"}
                </h1>
                <p className="auth-description">
                  {screen === "register"
                    ? "Choose a username and password to keep your notes private."
                    : "Log in to open your QuickNotes workspace."}
                </p>

                <form className="auth-form" onSubmit={submitAuthForm}>
                  <label htmlFor="username">Username</label>
                  <input
                    autoComplete="username"
                    id="username"
                    maxLength={50}
                    onChange={(event) => setFormUsername(event.target.value)}
                    required
                    value={formUsername}
                  />

                  <label htmlFor="password">
                    {screen === "register" ? "New Password" : "Password"}
                  </label>
                  <input
                    autoComplete={
                      screen === "register" ? "new-password" : "current-password"
                    }
                    id="password"
                    minLength={screen === "register" ? 8 : undefined}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    type="password"
                    value={password}
                  />

                  {screen === "register" && (
                    <>
                      <label htmlFor="confirm-password">Confirm Password</label>
                      <input
                        autoComplete="new-password"
                        id="confirm-password"
                        onChange={(event) =>
                          setConfirmPassword(event.target.value)
                        }
                        required
                        type="password"
                        value={confirmPassword}
                      />
                    </>
                  )}

                  {authError && (
                    <p className="form-error" role="alert">
                      {authError}
                    </p>
                  )}
                  <button
                    className="primary-button"
                    disabled={isRegistering}
                    type="submit"
                  >
                    {isRegistering
                      ? "Please wait..."
                      : screen === "register"
                        ? "Create Account"
                        : "Login"}
                  </button>
                </form>

                <p className="auth-switch">
                  {screen === "register"
                    ? "Already have an account?"
                    : "New to QuickNotes?"}{" "}
                  <button
                    className="text-button"
                    onClick={() =>
                      showAuthScreen(
                        screen === "register" ? "login" : "register",
                      )
                    }
                    type="button"
                  >
                    {screen === "register" ? "Login" : "Create Account"}
                  </button>
                </p>
              </>
            )}
          </section>
        </main>
        <footer className="auth-footer">Your ideas, in a space of your own.</footer>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="topbar">
        <a className="brand" href="/">
          <span className="brand-icon">Q</span>
          <span>QuickNotes</span>
        </a>
        <div className="account-actions">
          <span className="topbar-label">Hi, {username}</span>
          <button className="logout-button" onClick={logOut} type="button">
            Log out
          </button>
        </div>
      </header>

      <main className="main-content">
        <section className="hero">
          <span className="eyebrow">YOUR SPACE. YOUR IDEAS.</span>
          <h1>Your thoughts, organized.</h1>
          <p>A simple place to save your ideas, plans, and reminders.</p>
        </section>

        <section className="composer">
          <div className="section-heading">
            <h2>Create a note</h2>
            <p>What's on your mind today?</p>
          </div>

          <form onSubmit={handleNoteSubmit} className="note-form">
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
