import mongoose from "mongoose";
import { config } from "./config";

export async function connectDB(){
    await mongoose.connect(config.mongoDBURi);
    console.log("Connected to MongoDB");
}