const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const port = 3000;
app.use(express.json());
app.use(cors());

const db = new Pool({
  user: "postgres",
  host: "localhost",
  database: "quicknotes",
  password: "dikshant",
  port: 5432,
});

db.connect()
  .then(() => console.log("PostgreSQL Connected!!"))
  .catch((err) => console.log("Database connection error: ", err.message));


app.get("/", (req, res) => {
  res.send("QuickNotes server is running!");
});


app.get("/api/notes", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM notes ORDER BY id ASC"
    );

    res.json(result.rows);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});


app.post("/api/notes", async (req, res) => {
  try {
    const newNotes = req.body.title;

    const result = await db.query(
      "INSERT INTO notes (title) VALUES ($1) RETURNING *",
      [newNotes]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Failed to save note" });
  }
});


app.delete("/api/notes/:id", async (req, res) => {
  try {
    const result = await db.query(
      "DELETE FROM notes WHERE id = $1 RETURNING *",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Failed to delete note" });
  }
});


app.listen(port, () => {
  console.log(`Server Running on Port ${port}`);
  console.log(`http://localhost:${port}`);
});
