import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: ["POST", "GET"],
  }),
);

app.use(express.json({ limit: "50kb" }));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true, limit: "50kb" }));
app.use(cookieParser());

// Route Import

import userRouter from "./routes/user.route.js";

// Router Declaration
app.use("/api/v1/users", userRouter);

export { app };
