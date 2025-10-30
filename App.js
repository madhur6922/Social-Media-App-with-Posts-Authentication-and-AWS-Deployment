import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    if (token) {
      axios.get("http://localhost:5000/api/posts", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setPosts(res.data))
      .catch(err => console.error(err));
    }
  }, [token]);

  const addPost = () => {
    axios.post("http://localhost:5000/api/posts", { content }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setPosts([...posts, res.data]))
    .catch(err => console.error(err));
    setContent("");
  };

  return (
    <div style={{ textAlign: "center", marginTop: 50 }}>
      <h1>🌍 Social Media App</h1>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share your thoughts..."
      />
      <br/>
      <button onClick={addPost}>Post</button>

      <ul style={{ listStyle: "none" }}>
        {posts.map(post => (
          <li key={post._id}>
            <strong>{post.author}</strong>: {post.content}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
