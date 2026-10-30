import "dotenv/config";



function required(name:string):string{
    const value = process.env[name];
    if(!value){
        throw new Error(`Missing required env var: ${name}`);

    }
    return value;
}

const port  = Number(required("API_PORT"));

if(Number.isNaN(port)){
    throw new Error(`API_PORT must be a number, got : ${process.env.API_PORT}`);
}
export const config ={
    port,nodeEnv: process.env.NODE_ENV || "development",
    mongoDBURi:required("MONGODB_URI"),
    redisURL:required("REDIS_URL"),
    jwtSecret: required("JWT_SECRET"),
};

