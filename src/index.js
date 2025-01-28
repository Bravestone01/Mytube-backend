// mongo db connection setup way 2
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import {app} from "./app.js";

dotenv.config();



connectDB()
.then(()=>{
    app.listen(process.env.PORT, ()=>{
        console.log(`SERVER RUNNING ON PORT: ${process.env.PORT}`);   
    })
})
.catch((error)=>{
    console.error("MONGODB CONNECTION ERROR:", error)
}
)








// mogono db connection setup way 1
// import dotenv from "dotenv";
// import mongoose from "mongoose";
// import { DB_NAME } from "./constants.js";
// import express from "express";

// dotenv.config();


// const app = express()

// (async () => {
//     try {
//        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//        app.on("error", (error)=>{
//         console.error("SERVER ERROR: ", error)
//         throw error
//        })

//        app.listen(process.env.PORT, ()=>{
//         console.log(`SERVER RUNNING ON PORT ${process.env.PORT}`)
//        })
//     } catch (error) {
//         console.error("ERROR", error)
//         throw error   
//     }


// })()