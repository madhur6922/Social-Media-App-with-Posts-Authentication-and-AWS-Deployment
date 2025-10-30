const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log(err));

// User Schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String
});
const User = mongoose.model("User", userSchema);

// Post Schema
const postSchema = new mongoose.Schema({
  author: String,
  content: String,
  date: { type: Date, default: Date.now }
});
const Post = mongoose.model("Post", postSchema);

// Middleware for token verification
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access denied" });
  jwt.verify(token, "secretkey", (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
};

// Routes
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  const user = new User({ username, password });
  await user.save();
  res.json({ message: "User Registered" });
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ username: user.username }, "secretkey", { expiresIn: "1h" });
  res.json({ token });
});

app.get("/api/posts", verifyToken, async (req, res) => {
  const posts = await Post.find();
  res.json(posts);
});

app.post("/api/posts", verifyToken, async (req, res) => {
  const post = new Post({
    author: req.user.username,
    content: req.body.content
  });
  await post.save();
  res.json(post);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
