import express from "express";
import { config } from "./config";
import morgan from "morgan";
import { connectDB } from "./db";
import cors from "cors";
import {Project} from "./models/Project";


const app = express();

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

app.get("/healthz", (req, res) => {
  res.json({ status: "ok service is running", service: "api" });
});


await connectDB();

app.post("/api/projects",async (req,res,next)=>{
  try{
    if(!req.body.name){
      return res.status(400)
      .json({error:{code:"BAD_REQUEST",message:"Project name is required"}});
    }
    const project = new Project({
      name:req.body.name,
      description:req.body.description,
    });
    await project.save();

    res.status(201).json(project);
  }
  catch(err){
    next(err);
  }
});

app.get("/api/projects",async (req,res,next)=>{
    try{
      const projects = await Project.find().sort({createdAt:-1});
      res.json(projects);
    }catch(err){
      next(err);
    }
});


app.use((req,res)=>{
  res.status(404).json({
    error:{code : "NOT_FOUND" , message:`Route ${req.method} ${req.path} not found`},
  });
  
});

app.use((err:Error,req:express.Request,res:express.Response,next:express.NextFunction)=>{
  console.error(err);
  res.status(500).json({
  error: { code: "INTERNAL_SERVER_ERROR", message: "Something went wrong" }
  })
});

app.listen(config.port, () => {
  console.log(`API service is running on port ${config.port} (env: ${config.nodeEnv})`);
});

