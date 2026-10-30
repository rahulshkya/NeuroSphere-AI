import { useEffect, useState, type FormEvent } from "react";

type Project = {
  _id: string;
  name: string;
  description?: string;
};

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token")
  );

  async function loadProjects() {
    const res = await fetch("http://localhost:4000/api/projects");
    const data = await res.json();
    setProjects(data);
  }

  useEffect(() => {
    loadProjects();
  }, []);

  async function handleSignup() {
    const res = await fetch("http://localhost:4000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name: authName }),
    });
    const data = await res.json();
    if (!res.ok) {
      setAuthMessage(data.error?.message || "Signup failed");
      return;
    }
    setAuthMessage("Signup ho gaya! Ab login karo.");
  }

  async function handleLogin() {
    const res = await fetch("http://localhost:4000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setAuthMessage(data.error?.message || "Login failed");
      return;
    }
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setAuthMessage("Login ho gaya!");
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setToken(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("http://localhost:4000/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, description }),
    });
    if (!res.ok) {
      alert("Project banane me error — login kiya hua hai?");
      return;
    }
    setName("");
    setDescription("");
    loadProjects();
  }

  return (
    <div>
      <h1>NeuroSphere AI - Projects</h1>
      <h2>Welcome to the NeuroSphere AI Projects page!</h2>

      {!token ? (
        <div>
          <h3>Login / Signup</h3>
          <input
            placeholder="Name (sirf signup ke liye)"
            value={authName}
            onChange={(e) => setAuthName(e.target.value)}
          />
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleSignup}>Signup</button>
          <button onClick={handleLogin}>Login</button>
          {authMessage && <p>{authMessage}</p>}
        </div>
      ) : (
        <div>
          <button onClick={handleLogout}>Logout</button>
          <form onSubmit={handleSubmit}>
            <input
              placeholder="Project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <button type="submit">Create Project</button>
          </form>
          <ul>
            {projects.map((p) => (
              <li key={p._id}>
                {p.name} — {p.description}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
