const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/user.model.js");
const Note = require("./models/note.model.js");
const path = require('path')

dotenv.config(); 

const app = express();
const PORT = process.env.PORT || 8000;




mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./utilities");

app.use(express.json());
// app.use(cors({ origin: "*" }));

const allowedOrigins = [
  "http://localhost:8000", // For local development
  "https://notes-application-sigma.vercel.app", // Your deployed frontend URL
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
}));


app.post("/create-account", async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ error: "Please enter all the fields" });
  }

  const isUserExist = await User.findOne({ email });

  if (isUserExist) {
    return res.json({
      error: true,
      message: "User already exists",
    });
  }

  const user = new User({ fullName, email, password });

  await user.save();

  // Create JWT with userId only
  const accessToken = jwt.sign(
    { userId: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "60m", // Token expiration time
    }
  );

  return res.json({
    error: false,
    user,
    message: "User created successfully",
    accessToken,
  });
});


app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Please enter all the fields" });
  }

  const userInfo = await User.findOne({ email });

  if (!userInfo) {
    return res.status(400).json({ error: "User not found" });
  }

  if (userInfo.password !== password) {
    return res.status(400).json({ error: "Incorrect password" });
  }

  // Create JWT with userId only
  const accessToken = jwt.sign(
    { userId: userInfo._id },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "60m", // Token expiration time
    }
  );

  console.log("login successful");
  

  return res.json({
    error: false,
    userInfo,
    message: "User logged in successfully",
    accessToken,
  });
});


app.get("/get-user", authenticateToken, async (req, res) => {
  const { userId } = req.user;

  try {
    const isUser = await User.findOne({ _id: userId });

    if (!isUser) {
      return res.status(401).json({ error: "Unauthorized, user not found" });
    }

    return res.json({
      user: {  
        fullName: isUser.fullName,
        email: isUser.email,
        _id: isUser._id, 
        createdOn: isUser.createdOn
      }
    });
  } catch (error) {
    console.error("Error retrieving user:", error); 
    return res.status(500).json({ error: "Internal server error" });
  }
});


app.post("/add-note", authenticateToken, async (req, res) => {
  const { title, content, tags } = req.body;
  const { userId } = req.user; // Extract userId from req.user

  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  if (!content) {
    return res.status(400).json({ error: "Content is required" });
  }

  try {
    const note = new Note({
      title,
      content,
      tags: tags || [],
      userId: userId, // Set userId from token
    });

    await note.save(); // Save the note

    return res.json({
      message: "Note added successfully",
      note,
      error: false,
    });
  } catch (err) {
    console.error("Error saving note:", err); // Log the error for debugging
    return res.status(500).json({
      error: true,
      message: "Internal server error",
    });
  }
});

app.put("/edit-note/:noteId", authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;
  const { title, content, tags, isPinned } = req.body;
  const { userId } = req.user;

  if (!title && !content && !tags) {
    return res
      .status(400)
      .json({ error: true, message: "no changes provided" });
  }

  try {
    const note = await Note.findOne({ _id: noteId, userId });

    if (!note) {
      return res.status(400).json({ error: true, message: "note not founddd" });
    }

    if (title) note.title = title;
    if (content) note.content = content;
    if (tags) note.tags = tags;
    if (isPinned) note.isPinned = isPinned;

    await note.save();

    return res.json({
      error: false,
      note,
      message: "Note updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal server Error",
    });
  }
});

app.get("/get-all-notes", authenticateToken, async (req, res) => {
  const { userId } = req.user;

  try {
    const notes = await Note.find({ userId }).sort({ isPinned: -1 });

    return res.json({
      error: false,
      notes,
      message: "all notes retrieved succesfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "internal server error",
    });
  }
});

app.delete("/delete-note/:noteId", authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;
  const { userId } = req.user;

  try {
    const note = await Note.findOne({ _id: noteId, userId });

    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }

    await Note.deleteOne({ _id: noteId, userId });

    return res.json({
      error: false,
      message: "note deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

app.put("/update-ispinned/:noteId", authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;
  const { isPinned } = req.body;
  const { userId } = req.user;

  try {
    const note = await Note.findOne({ _id: noteId, userId });

    if (!note) {
      return res.status(400).json({ error: true, message: "note not founddd" });
    }

    note.isPinned = isPinned;

    await note.save();

    return res.json({
      error: false,
      note,
      message: "Note updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal server Error",
    });
  }
});


app.get("/search-notes", authenticateToken, async (req, res) => {
  const {userId} = req.user
  const {query} = req.query

  if(!query) {
    return res 
      .status(400)
      .json({error: true, message: "Search query is required"})
  }

  try {
    const matchingNotes = await Note.find({
      userId: userId,
      $or: [
        {title: { $regex: new RegExp(query, "i") }},
        {content: { $regex: new RegExp(query, "i") }}
      ]
    })

    return res.status(200).json({error: false, notes: matchingNotes})
  }catch(error) {
    return res
      .status(500)
      .json({
        error: true, message: "Internal server error"
      })
  }
})

if(process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (req, res) => {  
    res.sendFile(path.resolve(__dirname, "../frontend", "dist", "index.html"));
  });
}

app.listen(PORT, () => {
  console.log("Server started at http://localhost:" + PORT);
});

module.exports = app;
