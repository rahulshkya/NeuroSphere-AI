import express from "express";
import { config } from "./config";
import morgan from "morgan";
import { connectDB } from "./db";
import cors from "cors";
import {Project} from "./models/Project";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "./models/User";
import { authMiddleware } from "./middleware/auth";



const app = express();

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

app.get("/healthz", (req, res) => {
  res.json({ status: "ok service is running", service: "api" });
});


await connectDB();

app.post("/api/projects",authMiddleware,async (req,res,next)=>{
  try{
    const {name, description} = req.body ?? {};
    if(!name){
      return res.status(400)
      .json({error:{code:"BAD_REQUEST",message:"Project name is required"}});
    }
  
    const project = new Project({
      name,
      description,
    });
    await project.save();

    res.status(201).json(project.toObject());
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

app.post("/api/auth/signup",async (req,res,next)=>{
  try{
    const {email,password,name} = req.body ?? {};
    if(!email || !password){
      return res.status(400).json({
        error:{code:"Bad request" , message:"Email and password are required"}
      });
    }
    const existing = await User.findOne({email});
    if (existing){
      return res.status(409).json({
        error:{code:"CONFLICT",message:"email already registered"}
      });
    }
    const passwordHash=await bcrypt.hash(password,10);
    const user = await User.create({email,passwordHash,name});

    res.status(201).json({
      _id:user._id,
      email:user.email,
      name:user.name
    });
  }catch(err){
    next(err);
  }
});

app.post("/api/auth/login",async (req,res,next)=>{
  try{
    const {email,password} = req.body ?? {};
    if(!email||!password){
      return res.status(400).json({
        error:{code:"BAD_REQUEST",message:"email and password are required"}
      });
    }
    const user =await User.findOne({email});
    if(!user){
      return res.status(401).json({
        error:{code:"UNAUTHORIZED",message:"Invalid email or password"}
      });
    }
    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if(!passwordMatches){
      return res.status(401).json({
        error:{code:"UNAUTHORIZED",message:"Invalid email or password"}
      });
    }
    const token = jwt.sign({userId:user._id},config.jwtSecret,{expiresIn:"7d"});
    res.json({
      token,
      user:{_id:user._id,email:user.email,name:user.name},
    });
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
