import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

import dmRouter from "./server/routes/dm";
import chatRouter from "./server/routes/room";
import userRouter from "./server/routes/user";

export const express_app = express();

const corsOptions = {
  origin: `http://localhost:3000`,
  methods: "GET,PUT,POST,DELETE,PATCH",
  credentials: true,
};

express_app.use(cors(corsOptions));
express_app.use(cookieParser());
express_app.use(express.json());
express_app.use("/user", userRouter);
express_app.use("/chat", chatRouter);
express_app.use("/dm", dmRouter);
