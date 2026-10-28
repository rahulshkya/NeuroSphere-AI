import {useEffect,useState} from "react";

type Project={
  _id:string;
  name:string;
  description?:string;
  createdAt:string;
}

export default function App(){
    const [projects,setProjects] = useState<Project[]>([]);
    const [name,setName] = useState("");
    const [description,setDescription] = useState("");

    async function loadProjects(){
       const res = await fetch("http://localhost:4000/api/projects");
       const data = await res.json();
       setProjects(data);
    }

    useEffect(()=>{
      loadProjects();
    },[]);
    
    async function handleSubmit(e:React.FormEvent){
      e.preventDefault();
      if(!name.trim()) return;
      const res = await fetch("http://localhost:4000/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, description }), 
      });
      const data = await res.json();
      setProjects([data, ...projects]);
      setName("");
      setDescription("");
      loadProjects();
    }

    return(
      <div style={{maxWidth : 600, margin:"2rem auto" , fontFamily: "Arial, sans-serif"}}>
        <h3>NeuroSphere AI - Projects</h3>
        <p>Welcome to the NeuroSphere AI Projects page!</p>

        <form onSubmit={handleSubmit}
        style={{display:"flex", flexDirection:"column", gap:"1rem", marginBottom:"2rem"}}>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project name"
            />
            <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            />
            <button type="submit">Create project</button>
        </form>
        <ul>
        {projects.map((p) => (
        <li key={p._id}>
        <strong>{p.name}</strong>
        {p.description ? ` — ${p.description}` : ""}
        </li>
        ))}
        </ul>
      </div>
    );
   
}