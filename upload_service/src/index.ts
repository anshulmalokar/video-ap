import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import upload_router from "./router/uploadRouter";

dotenv.config();
const PORT = process.env.PORT || 8000;
const app = express();
app.use(express.json());
app.use(
  cors({
    allowedHeaders: ["*"],
    origin: "*",
  })
);
app.use('/upload',upload_router);
app.listen(PORT, () => {
  console.log(`Server started at ${PORT}`);
});
