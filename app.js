// Import Packages
import express from "express";
import cookieParser from "cookie-parser";
import { config } from "dotenv"; config();
import cors from "cors"
import { rateLimit } from 'express-rate-limit'

// Import Modules
import Listen from "./Modules/Listen.js";

// Import Config Files
import Config from "./Configs/Config.js"

// Import Handlers
import DatabaseHandler from "./Handlers/Database.js";
import CrashHandler from "./Handlers/CrashHandler.js";

// Import Routes
import User from "./Routes/User.js"
import Docs from "./Routes/Docs.js"

// Configure rate limit
const limiter = rateLimit({
	windowMs: 2 * 60 * 1000, // 1 minutes
	limit: 10, // Limit each IP to 2 requests per `window` (here, per 1 minutes).
	standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
    message: {
        Data: "شما فقط 10 بار در 2 دقیقه میتوانید کد تایید دریافت کنید."
    }
})

// Port Setting
const Port = Config.Port || 3001 || 3002

// Main Code
const app = express()

// Start Crash Handler
await CrashHandler.Load()

// Connect to Database
await DatabaseHandler.Start()

// Use and Support JSON Responses
app.use(express.json())

// Parse Cookies
app.use(cookieParser())

// Using CORS Headers
app.use(cors())

// Deploy Api Routes
app.use(`/api/${Config.ApiVersion}/user`, limiter, User)

// Deploy Swagger
app.use(`/api/${Config.ApiVersion}`, Docs)

// GET Status Of API Started or Not
app.get(`/api/${Config.ApiVersion}/status`, (req, res) => {
    res.send({
        Status: "Running"
    });
})

// Run API on Port
Listen(app, Port)